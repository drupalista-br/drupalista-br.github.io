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
        node: action => {
            // See https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
            (new MutationObserver(mutations => {
                for(const mutation of mutations) {
                    dataset = mutation.target.dataset[action.datasetHolder];
                    if (dataset)
                        actions[action.name][action.method](...action.args);
                }
            }))
            .observe(document.querySelector('iframe[data-hcaptcha-response = ""]'), action.options);
        }
    },
    node: {
        get: selector => console.log(selector)
    }
}

//document.querySelector(selector)
const getActions = () => {
    const inject = JSON.parse(botcookies.get("botInject"));
    const eat = cookie => cookie?.endsHere ?? true;
    let cookie;

    for (const where in inject) {
        cookie = inject[where];
        if (eat(cookie))
            botcookies.eat("botInject", "." + cookie.domain);

        if (window.location.href.includes(where))
            return cookie.actions;
    }
}

if (Actions = getActions())
    Actions.forEach(action => actions[action.name][action.method](...action.args));
