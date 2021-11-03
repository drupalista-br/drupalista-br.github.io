let apiHost = 'https://api.contador.cloud:8000';
let post = body => {
    fetch(apiHost + '/cookies', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })
    .then(response => response.json())
    .then(data => {
        remove(data);
    })
    .catch((error) => {
        console.log('Error:', error);
    });
};

let remove = cookies => {
    console.log(cookies);
    console.log("from remove");

    //chrome.cookies.remove({url: "https://cav.receita.fazenda.gov.br", name: "ASP.NET_SessionId"});
    //chrome.cookies.remove({url: "https://cav.receita.fazenda.gov.br/autenticacao/login/govbrsso", name: "ECAC_NONCE_GOVBR"});
};

let action = tab => {
    let domains = ["receita.fazenda.gov.br", "acesso.gov.br"];
    let body = [];
    domains.forEach((domain, index, domains) => {
        chrome.cookies.getAll({ domain: domain }, cookies => {
            body.push(cookies);
            isLastDomain = index === domains.length - 1;
            if (isLastDomain)
                post(body);
        });
    }, body);

    chrome.tabs.update(tab.id, {"url": apiHost});
};

let contextMenu = () => {
    chrome.contextMenus.create({
        "id": "contadorCloudCookies",
        "title": "Contador.Cloud Cookies",
        "documentUrlPatterns": [
            "http://*/*",
            "https://*/*"
        ]
    });
};

chrome.action.onClicked.addListener(tab => {
    action(tab);
});

chrome.contextMenus.onClicked.addListener(((info, tab) => {
    action(tab);
}));

chrome.runtime.onStartup.addListener(contextMenu);
chrome.runtime.onInstalled.addListener(contextMenu);
