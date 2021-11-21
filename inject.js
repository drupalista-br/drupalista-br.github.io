const cookies = {
    eat: name => document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/",
    get: (name, eat = true) => {
        let result;
        document.cookie.split(";").forEach(cookie => {
            cookie = cookie.split("=");
            if (cookie[0].trim() === name) {
                result = cookie[1];
                if (eat)
                    cookies.eat(name);
            }
        });
        return result;
    }
};

const classes = {
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
    }
}

const actions = () => {
    const where = cookies.get("bot-where", false);
    if (window.location.href.includes(where)) {
        cookies.eat("bot-where");
        return JSON.parse(cookies.get("bot-actions"));
    }
}

if (Actions = actions())
    Actions.forEach(action => classes[action.name][action.method](...action.args))
