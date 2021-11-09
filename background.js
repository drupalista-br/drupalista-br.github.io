const botHosts = {remote: "https://api.contador.cloud", local: "https://localhost:8000"};
const contextMenu = () => {
    chrome.contextMenus.create({
        "id": "contadorCloudCookies",
        "title": "Contador.Cloud Cookies",
        "documentUrlPatterns": [
            "http://*/*",
            "https://*/*"
        ]
    });
};
let actionsList = null;
let action = null;
checkVersion();

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
                }
            },
            "sso.acesso.gov.br": {
                onPageLoad: {
                    /*methods: {
                        dom: [
                            // () => document.querySelector('iframe[data-hcaptcha-response]').getAttribute('data-hcaptcha-response');
                            () => {return document.title;}
                        ],
                    },*/
                    send: true
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

function dom(queries, done) {
    const tabId = action.current.tabId;
    const results = {};
    queries.forEach((query, index, queries) => {
        chrome.scripting.executeScript({target: {tabId: tabId}, func: query}, result => {
            results[index] = result;
            isLastQuery = index === queries.length - 1;
            if (isLastQuery)
                done(results);
        });
    });
}

function cookies(done) {
    const jar = {};
    const domains = action.domains;
    const eat = (domain, cookies) => {
        let url;
        cookies.forEach((cookie) => {
            url = "https://" + domain + cookie.path;
            chrome.cookies.remove({url: url, name: cookie.name});
        });
    };

    domains.forEach((domain, index, domains) => {
        chrome.cookies.getAll({ domain: domain }, cookies => {
            jar[domain] = cookies;
            isLastDomain = index === domains.length - 1;
            eat(domain, cookies); // 🍪👹

            if (isLastDomain)
                done(jar);
        });
    });
}

/**
 * Action ends here.
 * It will always redirect back to contador.cloud
 * either to its local or remote enviroment.
 */
function redirect(to, tabId) {
    action = null;
    chrome.tabs.update(tabId, {"url": to});
}

function send(body) {
    fetch(action.endPoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    //.then(response => response.json())
    //.then(data => {})
    .catch((error) => {
        // console.log("Error:", error);
        // TODO:
        // Url encode error and add it to action.redirectTo
        // as a query string.
    });

    redirect(action.redirectTo, action.current.tabId);
}

function runActions(triggeredBy) {
    const hasDom = action.current?.triggers[triggeredBy]?.methods?.dom;
    const hasAlert = action.current?.triggers[triggeredBy]?.methods?.alert;
    const endsHere = action.current?.triggers[triggeredBy]?.send;
    const sendToBot = (items = false) => {
        cookies(jar => {
            send({hasError: false, dom: items, cookies: jar, urls: action.urls});
        });
    };

    /**
     * Alert is gonna be placed only when the action
     * ends elsewhere so the alert is an instruction
     * on how to proceed in case the user triggers it
     * before they should,
     *
     * Nontheless I placed the endsHere for cases which the
     * current page is actually where the action really ends
     * and there is something we should tell the
     * user before moving on.
     */
    if (message = hasAlert) {
        alert(...message);

        if (!endsHere) return;
    }

    if (queries = hasDom)
        return dom(queries, items => sendToBot(items));

    sendToBot();
}

/**
 * Executes on every page load. All of them.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete') return;

    const url = new URL(tab.url);
    // Example: botAction={"name":"ecac_acesso_gov_certificate","host":"local","uri":"uriValue"}
    //          gotta be url encoded otherwise chrome has issue with it.
    const newAction = JSON.parse(url.searchParams.get("botAction"));
    const sendToBot = () => action?.current?.triggers?.onPageLoad?.send;
    const hasError = () => {
        if (!action) return false;

        const error = {hasError: true, type: [], action: action};
        const overShot = () => {
            if (action.cycle.current > action.cycle.of) {
                error.type.push("overShot");
                return true;
            }

            return false;
        };
        const inTheWrongPlace = () => {
            if(!actions()[action.name].hasOwnProperty(domain)) {
                error.type.push("inTheWrongPlace");
                return true;
            }

            return false;
        };

        if (overShot() || inTheWrongPlace())
            return error;

        return false;
    };
    const hasAction = () => {
        const domain = url.host;

        if (newAction) {
            const domains = Object.keys(actions()[newAction.name]);

            action = {
                name: newAction.name,
                current: {triggers: actions()[newAction.name][domain]},
                redirectTo: botHosts[newAction.host] + "/" + newAction.uri,
                endPoint: botHosts[newAction.host] + "/chrome",
                domains: domains,
                urls: {[domain]: [tab.url]},
                cycle: {current: 0, of: domains.length}
            };
            return true;
        }

        // Previous page load action hasn't ended as yet.
        if (action) {
            const addCurrentUrl = () => {
                if (action.urls.hasOwnProperty(domain))
                    return action.urls[domain].push(tab.url);

                action.urls[domain] = [tab.url];
            };
            action.previous = action.current;
            action.current = {triggers: actions()[action.name][domain]};
            addCurrentUrl();

            return true;
        }
        return false;
    };

    if (hasAction()) {
        action.cycle.current += 1;
        action.current.tabId = tabId;
        action.current.url = tab.url;
    }

    if (error = hasError())
        return send(error);

    if (sendToBot())
        runActions("onPageLoad");
});

function onUserTrigger() {
    if (!action)
        return alert("Contado.Cloud", "Nada a ser feito.");

    runActions("onUserTrigger");
}

// From extensions icon at the right end of the address bar.
chrome.action.onClicked.addListener(tab => onUserTrigger());
// When right clicking on the web page.
chrome.contextMenus.onClicked.addListener((info, tab) => onUserTrigger());

chrome.runtime.onStartup.addListener(contextMenu);
chrome.runtime.onInstalled.addListener(contextMenu);
