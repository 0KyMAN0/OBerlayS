OBerlayS.Logo = function(oberlays, input){

    const self = this;

    const settings = (names, inputs, _default, nulls) => oberlays.settings_get(names, inputs, _default, input, nulls);

    const construct = () => {};

    this.build = input => {

        if(!input)
            input = {};
        else if(input.substr)
            input = {source : input};

        const hash = input.id || input.hash || oberlays.hash();
        let text = settings("text", input);

        if(text && text.push)
            text = text.join("");

        return `<img class="logo ` + hash + (" " + (input.class || "")).trim() + `" src="` + settings(["source", "src", "image", "logo"], input) + `"` + (text ? ` alt="` + text + `"` : ``) + ` />`;
    };

    construct();

};
