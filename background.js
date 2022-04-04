// https://stackoverflow.com/a/37576787/859837 | Using async/await with a forEach loop
//   async / await does not wort in .forEach
//   it gotta be either for...of or .map
const state = {urls: []};
const endPoint = () => state.queryParam.endPoint ?? "remote";
const request = (repo, name) => {
    // https://github.com/drupalista-br/drupalista-br.github.io/tree/[repo]
    return {url: "https://raw.githubusercontent.com/drupalista-br/drupalista-br.github.io/" + repo + "/" + name};
};
const actions = {
    fetch: async (request, type = 'json') => {
        var Return;
        var data = {};
        const api = () => {
            const body = {
                state: state,
                request: request,
            };
            return {method: 'POST', body: JSON.stringify(body)};
        };
        if (request.api) {
            request.url = state.endPoint + "/browser";
            data = api();
        }

        await fetch(request.url, data)
            .then(response => response[type]())
            .then(content => Return = content);

        return Return;
    },
    cookies: {
        getAll: async domains => {
            const jar = {};
            await Promise.all(domains.map(async domain => {
                await chrome.cookies.getAll({ domain: domain }).then(cookies => {
                    jar[domain] = cookies;
                })
            }));
            return jar;
        },
        deleteAll: async domains => {
            var Return = {};
            const url = cookie => {
                if (cookie.domain.charAt(0) === ".")
                    cookie.domain = cookie.domain.replace(".", "");

                return "https://" + cookie.domain + cookie.path;
            };
            await actions.cookies.getAll(domains).then(async jar => {
                await Promise.all(domains.map(async domain => {
                    for (const cookie of jar[domain]) {
                        await chrome.cookies.remove({url: url(cookie), name: cookie.name}).then(cookie => {
                            // cookie contains only name, storeId and url.
                            if (Array.isArray(Return[domain]))
                                return Return[domain].push(cookie);

                            Return[domain] = [cookie];
                        });
                    }
                }));
            });
            return Return;
        },
        send: async domains => {
            var Return;
            await actions.cookies.getAll(domains).then(async jar => {
                const request = {api: true, jar: jar};
                await actions.fetch(request).then(content => Return = content);
            });
            return Return;
        }
    },
    css: files => {
        files.map(file => {
            actions.fetch(request('css', file + ".css"), 'text').then(css => {
                chrome.scripting.insertCSS({
                    target: {tabId: state.tabId},
                    css: css,
                });
            });
        });
    },
    redirect: to => {
        return chrome.tabs.update(state.tabId, {"url": to});
    }
};
const action = path => {
    var action = actions;
    return path.split('.').reduce((action, key) => action?.[key], action);
};
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const url = new URL(tab.url);
    const setStateQueryParam = () => {
        state.queryParam = {
            job: url.searchParams.get("botJob"),
            inject: url.searchParams.has("botInject"),
            gfk: url.searchParams.get("botGfk"),
            token: url.searchParams.get("botToken"),
            endPoint: url.searchParams.get("botEndPoint")
        };
    };
    const isInject = () => {
        if (!state.cookie) return;

        chrome.cookies.set({
            domain: url.hostname,
            name: "botInject",
            value: state.cookie,
            path: "/",
            url: url.protocol + "//" + url.hostname
        });
        return chrome.scripting.executeScript({target: {tabId: tabId}, files: ['inject.js']});
    };
    const tabStatus = () => {
        const neededStatus = url.searchParams.get("botTabStatus") ?? 'loading';
        if (changeInfo.status === neededStatus)
            return true;
    };
    const starting = () => {
        const setState = (tasks, endPoints) => {
            const cookieValue = () => {
                const value = () => state.queryParam.job + "|" + state.queryParam.gfk + "|" + state.queryParam.token + "|" + endPoint();
                if (state.queryParam.inject)
                    return value();
            };
            state.urls.push(tab.url);
            state.gfk = state.queryParam.gfk;
            state.token = state.queryParam.token;
            state.job = state.queryParam.job;
            state.tasks = [...tasks];
            state.endPoint = endPoints[endPoint()];
            state.cookie = cookieValue();
        };
        if (state.queryParam.job) {
            actions.fetch(request('json', 'endPoints.json')).then(endPoints => {
                actions.fetch(request('json', state.queryParam.job + '.json')).then(tasks => {
                    setState(tasks, endPoints);
                    state.tasks.shift();
                    if (isInject()) return;

                    tasks[0].actions.map(task => action(task.name)(...task.args));
                });
            });
            return true;
        }
    };
    const onCourse = () => {
        if (state.tasks.length === 0) return;
        if (tab.url.includes(state.tasks[0].url)) {
            const tasks = [...state.tasks[0].actions];
            state.urls.push(tab.url);
            state.tasks.shift();

            if (isInject()) return;

            tasks.map(task => action(task.name)(...task.args));
        }
    };
    if (!tabStatus()) return;

    state.tabId = tabId;
    setStateQueryParam();
    if (starting()) return;

    onCourse();
});

/*
== Cookies Ecac ===
https://cav.receita.fazenda.gov.br/autenticacao/login?botJob=ecac_acesso_gov_certificate&botGfk=gfk&botToken=token&botEndPoint=local

*/