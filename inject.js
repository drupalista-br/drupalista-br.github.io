let botJobs;
let token;
const botcookies = {
    eat: (name, domain) => document.cookie = name + "=; domain=" + domain + "; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/",
    get: name => {
        let value;
        document.cookie.split(";").forEach(cookie => {
            if (value) return;

            cookie = cookie.split("=");
            if (cookie[0].trim() === name)
                value = cookie[1];
        });

        return value;
    }
};
const actions = {
    send: body => {
        console.log(body);
    },
    getJobs: async name => {
        const url = "https://raw.githubusercontent.com/drupalista-br/drupalista-br.github.io/json/inject/" + name + ".json";
        const response = await fetch(url);
        return response.json();
    },
    formFillUp: fields => {
        const tag = field => field.tag ?? "input";
        const tagId = field => field.tagId ?? "id";
        const valueId = field => field.valueId ?? "value";
        fields.forEach(field => {
            document.querySelector(`${tag(field)}[${tagId(field)} = "${field.id}"]`)
            .setAttribute(valueId(field), field.value);
        });
    },
    formSubmit: form => {
        const tagId = form => form.tagId ?? "id";
        document.querySelector(`form[${tagId(form)} = "${form.id}"]`).submit();
    },
    nodeObserve: (element, action) => {
        // See https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
        (new MutationObserver(mutations => {
            for(const mutation of mutations) {
                dataset = mutation.target.dataset[element.datasetHolder];
                if (dataset) {
                    action.args.push(dataset);
                    actions[action.name](...action.args);
                }
            }
        }))
        .observe(document.querySelector(element.selector), element.options);
    },
    nodeGet: (selector, action = null) => {
        const node = document.querySelector(selector);
        if (action) {
            action.args.push(node);
            return actions[action.name](...action.args);
        }
        return node;
    }
};
const botInject = () => {
    const botInject = botcookies.get("botInject").split("|");
    botJobs = botInject[0];
    token = botInject[1];
}
botInject();
actions.getJobs(botJobs).then(jobs => {
    jobs.forEach(job => {
        if (window.location.href.includes(job.url))
            actions[job.action.name](...job.action.args);
    });
});
