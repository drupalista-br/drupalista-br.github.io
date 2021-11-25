const botHosts = {remote: "https://api.contador.cloud", local: "https://localhost:8000"};
const contextMenu = () => {
    // TODO: use update and remove.
    chrome.contextMenus.create({
        "id": id,
        "title": title,
        "documentUrlPatterns": [
            "http://*/*",
            "https://*/*"
        ]
    });
};
const reset = () => {
    body = {hasError: false};
    action = null;
};
let body;
let action;
let actionsList = null;

checkVersion();
reset();

function checkVersion() {
    // TODO:
    // * set a LAST_CHECK cookie at api.contador.cloud with
    //   5 days expiration date ( test to make sure the cookie
    //   get destroyed after it has expired ).
    // * if cookie is not there then check for new version.
    // * issue a notification alert linking to the blog page
    //   containing instructions on how to proceed the extension
    //   refreshing.
}

function actions() {
    if (actionsList) return actionsList;

    // TODO: load it from github.
    return actionsList = {
        ecac_acesso_gov_certificate: {
            "cav.receita.fazenda.gov.br": {
                onUserTrigger: {
                    methods: {
                        alert: ["Proximo Passo", "Clique no botão \"Entrar com gov.br\"."]
                    }
                },
                onPageLoad: {
                    methods: {
                        dom: () => {return {name: 'test1', value: document.title};}
                    }
                }
            },
            "sso.acesso.gov.br": {
                onPageLoad: {
                    methods: {
                        // () => document.querySelector('iframe[data-hcaptcha-response]').getAttribute('data-hcaptcha-response');
                        dom: () => {return {name: 'test2', value: document.title};}
                    },
                    send: true
                }
            }
        },
        ecac_alternar_procurador: {
            "cav.receita.fazenda.gov.br": {
                onPageLoad: {
                    methods: {
                        dom: () => {return document.title;}
                    }
                }
            }
        }
    };
}

function alert(title, message, interation = true) {
    chrome.notifications.create("contadorCloudCookiesAlert", {
        type:'basic',
        iconUrl: "icon.png",
        message: message,
        title: title,
        requireInteraction: interation
    });
}

function dom(query) {
    const tabId = action.current.tabId;
    const result = {method: "dom", return: {}};

    return chrome.scripting.executeScript({target: {tabId: tabId}, func: query}).then(frames => {
        frames.forEach(frame => {
            if (!frame.result) return;

            result.return[frame.result.name] = frame.result.value;
        });
        return result;
    });
}

function eat(cookies, domain = null) {
    let url;
    cookies.forEach(cookie => {
        cookieDomain = domain ?? cookie.domain;
        url = "https://" + cookieDomain + cookie.path;
        chrome.cookies.remove({url: url, name: cookie.name});
    });
}

function getCookies() {
    const domains = action.domains;
    const jar = [];

    domains.forEach(domain => {
        jar.push(chrome.cookies.getAll({ domain: domain }).then(cookies => {
            eat(cookies, domain);
            return {method: "getCookies", return: {domain: domain, cookies: cookies}};
        }));
    });
    return jar;
}

/**
 * Example:
    const cookies = [
        {
            domain: "cav.receita.fazenda.gov.br",
            name: "teste",
            value: "teste value",
            path: "/",
            url: "https://cav.receita.fazenda.gov.br"
        }
    ]
*/
function setCookies(cookies) {
    const promises = [];
    cookies.forEach(cookie => promises.push(chrome.cookies.set(cookie).then(result => result)));
    return promises;
}

/**
 * Action ends here.
 * It will always redirect back to contador.cloud
 * either to its local or remote enviroment.
 */
function redirect(to, tabId) {
    reset();
    chrome.tabs.update(tabId, {"url": to});
}

function send(body) {
    fetch(action.endPoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    .then(response => response.json())
    .then(data => {})
    .catch((error) => {
        // console.log("Error:", error);
        // TODO:
        // Url encode error and add it to action.redirectTo
        // as a query string.
    });

    redirect(action.redirectTo, action.current.tabId);
}

function runAction(triggeredBy) {
    const Alert = action.current?.triggers[triggeredBy]?.methods?.alert;
    const Send = action.current?.triggers[triggeredBy]?.send;
    const Dom = action.current?.triggers[triggeredBy]?.methods?.dom;
    const promises = [];

    if (msg = Alert)
        alert(...msg);

    if (query = Dom)
        promises.push(dom(query));

    if (Send)
        getCookies().forEach(promise => promises.push(promise));

    if (promises.length) {
        Promise.all(promises)
        .then(results => {
            results.forEach(result => {
                if (!body.hasOwnProperty(result.method))
                    return body[result.method] = [result.return];

                body[result.method].push(result.return);
            });

            if (Send)
                send(body);
        })
        .catch(error => {
            // TODO: Send error to the endpoint.
            console.log(error);
        });
    }
}

/**
 * Executes on every page load. All of them.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete') return;

    const url = new URL(tab.url);
    const isBotHost = () => {
        const index = Object.values(botHosts).indexOf('https://' + url.host);
        if (index === -1) return;

        return Object.keys(botHosts)[index]; // remote or local
    };
    const inject = () => {
        const botHasInject = {
            name: "botHasInject",
            domain: "api.contador.cloud",
            path: "/",
            url: "https://api.contador.cloud",
        };
        const starting = inject => {
            const cookies = [
                Object.assign(inject.cookie, {
                    name: "botInject",
                    value: JSON.stringify(inject.cookieValue),
                    path: "/",
                }),
                Object.assign(botHasInject, {value: inject.cookie.url})
            ];

            return Promise.all(setCookies(cookies)).then(result => result);
        };
        const inCourse = url => {
            return Promise.all([
                chrome.cookies.get({name: "botInject", url: url})
                .then(cookie => {
                    const cookieValue = JSON.parse(cookie.value);
                    const hasAction = () => {
                        for (const where in cookieValue) {
                            if (tab.url.includes(where))
                                return cookieValue[where];
                        }
                    };
                    const endsHere = action => {
                        const endsHere = action?.endsHere ?? true;
                        const cookies = [Object.assign(botHasInject, {value: ""})]
                        if (endsHere)
                            Promise.all(setCookies(cookies)).then(result => result);
                    };
                    if (action = hasAction()) {
                        endsHere(action);
                        return true;
                    }
                })
            ]).then(result => result);
        };

        return Promise.all([
            chrome.cookies.get({name: "botHasInject", url: "https://api.contador.cloud"})
            .then(cookie => {
                const hasAction = () => {
                    const botInjectUrl = cookie?.value;
                    // See example at the end of this file.
                    const inject = JSON.parse(url.searchParams.get("botInject"));
                    if (inject)
                        return starting(inject);

                    if (botInjectUrl)
                        return inCourse(botInjectUrl);
                };

                if (hasAction())
                    return chrome.scripting.executeScript({target: {tabId: tabId}, files: ['inject.js']});
            })
        ]);
    };
    const onPageLoad = () => {
        // Example: botAction={"name":"ecac_acesso_gov_certificate","host":"local","uri":"uriValue"}
        //          gotta be url encoded otherwise chrome has issue with it.
        const domain = url.hostname;
        const botAction = JSON.parse(url.searchParams.get("botAction"));
        const hasAction = () => {
            const onPageLoad = () => {
                if (!botAction) return;

                const domains = Object.keys(actions()[botAction.name]);
                action = {
                    name: botAction.name,
                    current: {triggers: actions()[botAction.name][domain]},
                    redirectTo: botHosts[botAction.host] + "/" + botAction.uri,
                    endPoint: botHosts[botAction.host] + "/browser",
                    domains: domains,
                    urls: {[domain]: [tab.url]},
                    cycle: {current: 0, of: domains.length},
                    body: {}
                };
                return true;
            };
            const inCourse = () => {
                if (!action) return;

                const addCurrentUrl = () => {
                    if (action.urls.hasOwnProperty(domain))
                        return action.urls[domain].push(tab.url);

                    action.urls[domain] = [tab.url];
                };
                action.previous = action.current;
                action.current = {triggers: actions()[action.name][domain]};
                addCurrentUrl();

                return true;
            };
            if (onPageLoad() || inCourse()) return true;
        };
        const hasError = () => {
            const error = {hasError: true, type: [], action: action};
            const overShot = () => {
                if (action.cycle.current > action.cycle.of)
                    return error.type.push("overShot");
            };
            const inTheWrongPlace = () => {
                if(!actions()[action.name].hasOwnProperty(domain))
                    return error.type.push("inTheWrongPlace");
            };

            if (overShot() || inTheWrongPlace())
                return error;
        };

        if (hasAction()) {
            action.cycle.current += 1;
            action.current.tabId = tabId;
            action.current.url = tab.url;
            action.current.domain = domain;

            if (error = hasError())
                return send(error);

            runAction("onPageLoad");
        }
    };

    if (isBotHost()) return;

    inject().then(isInject => isInject[0] ?? onPageLoad());
});

function onUserTrigger() {
    if (!action)
        return alert("Contador.Cloud", "Nada a ser feito.");

    runAction("onUserTrigger");
}

// From extensions icon at the right end of the address bar.
chrome.action.onClicked.addListener(tab => onUserTrigger());
// When right clicking on the web page.
chrome.contextMenus.onClicked.addListener((info, tab) => onUserTrigger());

/**
 * Examples:
 *
 * botInject query paramter:
 *
let botInject = {
    cookie: {
        domain: "receita.fazenda.gov.br",
        url: "https://receita.fazenda.gov.br"
    },
    cookieValue: {
        "https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp?cpf": {
            endsHere: false,
            actions: [{
                name: "observe",
                method: "node",
                args: [{
                    name: "form",
                    method: "submit",
                    args: [{id: "theForm"}],
                    datasetHolder: "hcaptchaResponse",
                    options: {attributeOldValue: true},
                }]
            }]
        },
        "https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/ConsultaPublicaExibir.asp": {
            domain: "receita.fazenda.gov.br", // needed for cookie eating.
            actions: [{
                name: "node",
                method: "get",
                args: ["selector test"],
            }]
        }
    }
};
*/