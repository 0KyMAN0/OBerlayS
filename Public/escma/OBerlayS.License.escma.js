OBerlayS.License = function(oberlays, input){

    const self = this;

    const settings = (names, inputs, _default, nulls) => oberlays.settings_get(names, inputs, _default, input, nulls);

    const construct = () => {};

    this.build = input => {

        if(!input)
            input = {};
        else if(input.substr)
            input = {license : input};

        const hash = input.id || input.hash || oberlays.hash();
        let text = settings("license", input);

        if(text.push)
            text = text.join("");

        return `<div class="license ` + hash + (" " + (input.class || "")).trim() + `">` + text + `</div>`;
    };

    construct();

};
