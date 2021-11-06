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

const actions = {
    ecac_acesso_gov_certificate: {
        dom: {
            query: () => {
                return document.title;
            }
        },
        cookies: {
            domains: ["receita.fazenda.gov.br", "acesso.gov.br"],
        },
        redirect: true,
    }
};

// Runs only at extension instalation / refresh.
let action = {};

function alert(title, message) {
    chrome.notifications.create("contadorCloudCookies", {
        type:'basic',
        iconUrl: "icon.png",
        message: message,
        title: title,
        requireInteraction: true
    });
}

function dom(done) {
    const query = action.dom.query;
    const tabId = action.tab.id;
    //const query = () => document.querySelector('iframe[data-hcaptcha-response]').getAttribute('data-hcaptcha-response');
    chrome.scripting.executeScript({target: {tabId: tabId}, func: query}, queryResult => done(queryResult));
}

function cookies(done) {
    const domains = action.cookies.domains;
    let jar = {};
    domains.forEach((domain, index, domains) => {
        chrome.cookies.getAll({ domain: domain }, cookies => {
            jar[domain] = cookies;
            isLastDomain = index === domains.length - 1;
            if (isLastDomain)
                done(jar);
        });
    });
}

function send(body) {
    const tabId = action.tab.id;
    console.log(body);
    console.log(action);

    /*fetch(apiHost + '/' + endPoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    .then(response => response.json())
    .then(data => {
        this.postData = data;
    })
    .catch((error) => {
        console.log('Error:', error);
    });*/

    action = {};
    //chrome.tabs.update(tabId, {"url": apiHost});
}

function remove(cookies) {
    console.log(cookies);
    console.log("from remove");

    //chrome.cookies.remove({url: "https://cav.receita.fazenda.gov.br", name: "ASP.NET_SessionId"});
    //chrome.cookies.remove({url: "https://cav.receita.fazenda.gov.br/autenticacao/login/govbrsso", name: "ECAC_NONCE_GOVBR"});
}

function execute() {
    const hasAction = JSON.stringify(action) !== JSON.stringify({});

    if (!hasAction) // TODO: issue a notification when triggered by the user.
        return;

    const hasDom = action.hasOwnProperty('dom');
    if (hasDom) {
        dom(items => {
            cookies(jar => {
                send({dom: items, cookies: jar});
            });
        });
        return;
    }
    cookies(jar => {
        send({dom: false, cookies: jar});
    });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        //const redirect = (action.hasOwnProperty('redirect') ? action.redirect : false);

        chrome.cookies.get({ url: "https://abc.net.au", name: "ABC_LD" }, cookie => {
            action = actions["ecac_acesso_gov_certificate"];
            action.tab = {id: tabId, url: tab.url};

        });
    }
})

chrome.action.onClicked.addListener(tab => {
    execute();
});

chrome.contextMenus.onClicked.addListener(((info, tab) => {
    execute();
}));

chrome.runtime.onStartup.addListener(contextMenu);
chrome.runtime.onInstalled.addListener(contextMenu);
