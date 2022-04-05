// https://stackoverflow.com/a/37576787/859837 | Using async/await with a forEach loop
//   async / await does not wort in .forEach
//   it gotta be either for...of or .map
const state = {urls: [], tasks: []};
const endPoint = () => state.queryParam.endPoint ?? "remote";
const ghUrl = (filename, repo = 'json') => {
    // https://github.com/drupalista-br/drupalista-br.github.io/tree/[repo]
    return "https://raw.githubusercontent.com/drupalista-br/drupalista-br.github.io/" + repo + "/" + filename + "." + repo;
};
const http = {
    api: data => {
        const url = state.endPoint + "/browser";
        const body = {
            state: state,
            data: data,
        };
        fetch(url, {method: 'POST', body: JSON.stringify(body)})
            .then(response => response.json())
            .then(tasks => {
                var chain = null;
                tasks.map(task => chain = action(task, chain));
            });
    },
    gh: (url, type = 'json') => {
        return fetch(url)
            .then(response => response[type]())
            .then(content => content);
    }
};
const actions = {
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
            const url = cookie => {
                if (cookie.domain.charAt(0) === ".")
                    cookie.domain = cookie.domain.replace(".", "");

                return "https://" + cookie.domain + cookie.path;
            };
            actions.cookies.getAll(domains).then(jar => {
                domains.map(domain => {
                    jar[domain].map(cookie => chrome.cookies.remove({url: url(cookie), name: cookie.name}));
                });
            });
        },
        set: async jar => jar.map(cookie => chrome.cookies.set(cookie)),
        send: async domains => actions.cookies.getAll(domains).then(jar => http.api(jar))
    },
    css: async files => {
        files.map(file => {
            http.gh(ghUrl(file, 'css'), 'text').then(css => {
                chrome.scripting.insertCSS({
                    target: {tabId: state.tabId},
                    css: css,
                });
            });
        });
    },
    alert: async message => {
        chrome.notifications.create('bót.online', {
            message: message,
            type: 'basic',
            requireInteraction: false,
            title: 'Bót.Online',
            iconUrl: 'https://raw.githubusercontent.com/drupalista-br/drupalista-br.github.io/browser/icon.png'
        });
    },
    redirect: async to => chrome.tabs.update(state.tabId, {"url": to})
};
const action = (task, chain) => {
    const get = path => {
        var action = actions;
        return path.split('.').reduce((action, key) => action?.[key], action);
    };
    if (chain)
        return chain.then(result => get(task.name)(...task.args));

    return get(task.name)(...task.args);
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
            http.gh(ghUrl('endPoints')).then(endPoints => {
                http.gh(ghUrl(state.queryParam.job)).then(tasks => {
                    setState(tasks, endPoints);
                    state.tasks.shift();

                    if (isInject()) return;

                    var chain = null;
                    tasks[0].actions.map(task => chain = action(task, chain));
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

            var chain = null;
            tasks.map(task => chain = action(task, chain));
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