const botcookies = {
    eat: (name, domain) => document.cookie = name + "=; domain=" + domain + "; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/",
    get: name => {
        let value;
        document.cookie.split(";").forEach(cookie => {
            if (value) return;

            cookie = cookie.split("=");
            const equalSign = () => {
                const moreThanOne = (cookie.length - 1) > 1;

                if (moreThanOne)
                    throw "The botInject query parameter has one or more equal signs ( = ) in it. Replace them with double pipes ( || )";

                cookie[1] = cookie[1].replace(/\|\|/g, "=");
            };
            equalSign();

            if (cookie[0].trim() === name)
                value = cookie[1];
        });

        return value;
    }
};

const actions = {
    form: {
        fillUp: fields => {
            const tag = field => field.tag ?? "input";
            const tagId = field => field.tagId ?? "id";
            const valueId = field => field.valueId ?? "value";
            fields.forEach(field => {
                document.querySelector(`${tag(field)}[${tagId(field)} = "${field.id}"]`)
                .setAttribute(valueId(field), field.value);
            });
        },
        submit: form => {
            const tagId = form => form.tagId ?? "id";
            document.querySelector(`form[${tagId(form)} = "${form.id}"]`).submit();
        }
    },
    observe: {
        node: (element, action) => {
            // See https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
            (new MutationObserver(mutations => {
                for(const mutation of mutations) {
                    dataset = mutation.target.dataset[element.datasetHolder];
                    if (dataset)
                        actions[action.name][action.method](...action.args);
                }
            }))
            .observe(document.querySelector(element.selector), element.options);
        }
    },
    node: {
        get: (selector, action = null) => {
            const node = document.querySelector(selector);
            if (action)
                return actions[action.name][action.method](...action.args);

            actions.fetch.send(node);
        }
    },
    fetch: {
        send: body => {

        }
    }
}

const getActions = () => {
    const inject = JSON.parse(botcookies.get("botInject"));
    const endsHere = cookie => cookie?.endsHere ?? true;
    let cookie;

    for (const where in inject) {
        cookie = inject[where];
        if (endsHere(cookie))
            botcookies.eat("botInject", "." + cookie.domain);

        if (window.location.href.includes(where))
            return cookie.actions;
    }
}

try {
    if (Actions = getActions())
        Actions.forEach(action => actions[action.name][action.method](...action.args));
}
catch(err) {
    // TODO: Send error to endPoint.
    console.log(err);
}
