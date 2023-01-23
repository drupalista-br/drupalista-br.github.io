const state = {};
const actions = {
    send: async (body, action = null) => {
        body = {
            payload: body,
            job: state.job,
            gfk: state.gfk,
            token: state.token,
            taskIndex: state.taskIndex,
            inject: true
        };
        const url = state.endPoint + "/browser";
        const endPoint = await fetch(url, {method: 'POST', body: JSON.stringify(body)});
        endPoint.json().then(response => {
            if (action)
                return actions[action.name](...action.args);

            if (response.action)
                actions[response.action.name](...response.action.args);
        });
    },
    fetchJson: async name => {
        // https://github.com/drupalista-br/drupalista-br.github.io/tree/json
        const url = "https://raw.githubusercontent.com/drupalista-br/drupalista-br.github.io/json/" + name + ".json";
        const response = await fetch(url);
        return response.json();
    },
    getTasks: async job => actions.fetchJson("inject/" + job),
    getCookie: name => {
        let value;
        document.cookie.split(";").forEach(cookie => {
            if (value) return;

            cookie = cookie.split("=");
            if (cookie[0].trim() === name)
                value = cookie[1];
        });

        return value;
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
                    action.args[action.addArg](dataset);
                    actions[action.name](...action.args);
                }
            }
        }))
        .observe(document.querySelector(element.selector), element.options);
    },
    nodeGet: (selector, action = null) => {
        const node = document.querySelector(selector).outerHTML;
        if (action) {
            action.args[action.addArg](node);
            return actions[action.name](...action.args);
        }
        return node;
    },
    css: files => {
        files.forEach(file => {
            // https://github.com/drupalista-br/drupalista-br.github.io/tree/css
            const url = "https://raw.githubusercontent.com/drupalista-br/drupalista-br.github.io/css/inject" + file + ".css";
            fetch(url)
                .then(response => response.text())
                .then(css => {
                    const style = "<style>" + css + "</style>";
                    document.head.insertAdjacentHTML('beforeend', style);
                });
        });
    },
    redirect: to => window.location.href = to
};
actions.fetchJson("endPoints").then(endPoints => {
    const setState = () => {
        const cookie = actions.getCookie("botInject").split("|");
        state.job = cookie[0];
        state.gfk = cookie[1];
        state.token = cookie[2];
        state.endPoint = endPoints[cookie[3]];
    };
    setState();
    actions.getTasks(state.job).then(tasks => {
        tasks.forEach((task, index) => {
            if (window.location.href.includes(task.url)) {
                state.taskIndex = index;
                actions[task.action.name](...task.action.args);
            }
        });
    });
});