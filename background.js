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
                        // () => document.querySelector('iframe[data-hcaptcha-response]').getAttribute('data-hcaptcha-response');
                        dom: [() => {return document.title;}],
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
    let results = {};
    let tabId = action.current.tabId;
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
    const domains = action.domains;
    const empty = jar => {
        console.log(jar);

        //chrome.cookies.remove({url: "https://cav.receita.fazenda.gov.br", name: "ASP.NET_SessionId"});
        //chrome.cookies.remove({url: "https://cav.receita.fazenda.gov.br/autenticacao/login/govbrsso", name: "ECAC_NONCE_GOVBR"});
    };
    let jar = {};

    domains.forEach((domain, index, domains) => {
        chrome.cookies.getAll({ domain: domain }, cookies => {
            jar[domain] = cookies;
            isLastDomain = index === domains.length - 1;
            if (isLastDomain) {
                empty(jar);
                done(jar);
            }
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
    console.log(body);
    /*fetch(apiHost + '/' + endPoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    //.then(response => response.json())
    //.then(data => {})
    .catch((error) => {
        console.log("Error:", error);
        alert("Error:", error);
    });*/

    redirect(action.redirectTo, action.current.tabId);
}

function runActions(triggeredBy) {
    const hasDom = action.current?.triggers[triggeredBy]?.methods?.dom;
    const hasAlert = action.current?.triggers[triggeredBy]?.methods?.alert;
    const endsHere = action.current?.triggers[triggeredBy]?.send;
    const sendToBot = (items = false) => {
        cookies(jar => {
            send({dom: items, cookies: jar, urls: action.urls});
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
     * user before going ahead finishing the action.
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
    // Example: contadorCloud={"action":"ecac_acesso_gov_certificate","host":"local","uri":"test"}
    //          gotta be url encoded otherwise chrome has issue with it.
    const bot = JSON.parse(url.searchParams.get("contadorCloud"));
    const sendToBot = () => action?.current?.triggers?.onPageLoad?.send;
    const hasAction = () => {
        // New action beggins.
        if (bot) {
            action = {
                name: bot.action,
                current: {triggers: actions()[bot.action][url.host]},
                redirectTo: botHosts[bot.host] + "/" + bot.uri,
                domains: Object.keys(actions()[bot.action]),
                urls: {[url.host]: [tab.url]},
            };
            return true;
        }

        // Action has began on a page load before this one.
        if (action) {
            if (!actions()[action.name].hasOwnProperty(url.host)) {
                alert("Atividade NÃO corresponde ao website " + url.host, "Caso o problema persista, entre em contado conosco ( Contador.Cloud ).");
                redirect(action.redirectTo, tabId);
                return false;
            }

            action.current = {triggers: actions()[action.name][url.host]};
            if (action.urls.hasOwnProperty(url.host)) {
                action.urls[url.host].push(tab.url);
                return true;
            }

            action.urls[url.host] = [tab.url];
            return true;
        }
        return false;
    };

    if (hasAction())
        action.current.tabId = tabId;

    if (sendToBot())
        runActions("onPageLoad");
});

function onUserTrigger() {
    if (!action)
        return alert("Contado.Cloud", "Nada a ser feito.");

    runActions("onUserTrigger");
}

/**
 * User action triggered via extension menu located at
 * the right end of the address bar.
 */
chrome.action.onClicked.addListener(tab => onUserTrigger());
/**
 * User action triggered when right clicking on the web page.
 */
chrome.contextMenus.onClicked.addListener((info, tab) => onUserTrigger());
/**
 * Inserts this module into the pop up list available when right
 * clicking on the web page.
 */
chrome.runtime.onStartup.addListener(contextMenu);
chrome.runtime.onInstalled.addListener(contextMenu);
