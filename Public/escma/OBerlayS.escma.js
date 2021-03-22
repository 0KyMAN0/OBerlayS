OBerlayS = function(input){

    const self = this,
          default_settings = {
              nulls : true,
              default_value : null,
              autostart : true,
              position : "body",
              frames_per_second : 24,
              preload_timeout : 2000,
              ajax_timeout : 2000,
              default_settings_file : "json/OBerlayS.settings.json",
              license : [
                  "© 2021-2022 CopyLeft.",
                  "<a href=\"https://www.gnu.org/licenses/gpl-3.0.txt\" target=\"_blank\" title=\"GPLv3\">",
                      "<img src=\"https://www.gnu.org/graphics/gplv3-127x51.png\" alt=\"GPLv3\" />",
                  "</a>",
                  "Developed by KyMAN."
              ],
              default_i18n_files : "json/OBerlayS.i18n.english.json",
              default_text : "",
              default_language : "english",
              default_class : "oberlays",
              application : "OBerlayS",
              hash_alphabet : "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
              hash_length : 11,
              object_name : "oberlays",
              cells : 20,
              //logo : "https://cdn.local/images/KyMAN_Logo.png",
              logo : "file:///C:/Users/migue/Documents/KyMAN_Logo.png"
          },
          custom_settings = {},
          threads = [],
          i18n_sentences = {},
          hashes = [],
          screen = {x : 0, y : 0};
    let started = false,
        threads_l = 0,
        thread = null,
        language = null,
        screen_change_thread = null;

    let license = this.license;
    let logo = this.logo;

    let item_self = this.item_self = document;
    let hash_self = this.hash_self;
    let object_name = this.object_name;

    const default_value = (_default, nulls) => {
        if(_default !== undefined && (nulls || _default !== null))
            return _default;
        return default_settings.default_value;
    };

    this.settings_get = (names, inputs, _default, input, nulls) => {

        if(typeof nulls != "boolean")
            nulls = input && typeof input.nulls == "boolean" ? input.nulls : default_settings.nulls;

        if(!names)
            return default_value(_default, nulls);

        if(!names.push)
            names = [names];

        const l = names.length;

        if(inputs){
            if(!inputs.push)
                inputs = [inputs];
            for(let j = 0, m = inputs.length; j < m; j ++)
                for(let i = 0; i < l; i ++)
                    if(inputs[j][names[i]] !== undefined && (nulls || inputs[j][names[i]] !== null))
                        return inputs[j][names[i]];
        };
        if(input)
            for(let i = 0; i < l; i ++)
                if(input[names[i]] !== undefined && (nulls || input[names[i]] !== null))
                    return input[names[i]];
        if(custom_settings)
            for(let i = 0; i < l; i ++)
                if(custom_settings[names[i]] !== undefined && (nulls || custom_settings[names[i]] !== null))
                    return custom_settings[names[i]];
        for(let i = 0; i < l; i ++)
            if(default_settings[names[i]] !== undefined && (nulls || default_settings[names[i]] !== null))
                return default_settings[names[i]];
        return default_value(_default, nulls);
    };

    const settings = (names, inputs, _default, nulls) => self.settings_get(names, inputs, _default, input, nulls);

    const construct = () => {

        object_name = self.object_name = settings("object_name");

        if(settings("autostart"))
            self.start();

    };

    const threads_function = () => {threads.forEach(thread => {if(thread)thread();});};

    const threads_add = this.threads_add = method => {
        if(typeof method != "function")
            return null;

        let i = 0;

        for(; i < threads_l; i ++)
            if(!threads[i])
                break;

        threads[i] = method;
        threads_l = threads.length;

        return i;
    };

    const threads_remove = this.threads_remove = i => {

        if(!isNaN(i) && threads[i])
            threads[i] = null;

    };

    const threads_start = this.threads_start = (frames_per_second) => {

        if(thread === null)
            thread = setInterval(threads_function, settings("frames_per_second", frames_per_second ? {frames_per_second : frames_per_second} : null));

    };

    const threads_stop = this.threads_stop = () => {

        if(thread === null)
            return;

        clearInterval(thread);
        thread = null;

    };

    const preload = this.preload = (selector, callback) => {
        if(typeof callback != "function")
            return;
        if(!selector){
            callback(null, false);
            return;
        };
        if(!selector.substr){
            callback(selector, false);
            return;
        };

        try{
            item_self.querySelector(selector);
        }catch(exception){
            callback(null, false);
            return;
        };

        const date = Date.now(),
              timeout = settings("preload_timeout");
        let preload = threads_add(() => {

            const item = item_self.querySelector(selector);

            if(item){
                threads_remove(preload);
                callback(item, true);
            }else if(Date.now() - date > timeout){
                threads_remove(preload);
                callback(null, true);
            };

        });

    };

    const load_file = this.load_file = (file, callback) => {

        let ended = false;
        const ajax = new XMLHttpRequest(),
              timeout = settings("ajax_timeout"),
              date = Date.now(),
              end = error => {
                  if(ended)
                      return;
                  ended = true;
                  if(typeof callback == "function")
                      callback(ajax.response, ajax.status, ajax.readyState, ajax.readyState == 4 && ((ajax.status >= 200 && ajax.status < 300) || [301, 304].includes(ajax.status)), error);
              };

        ajax.open("get", file, true);
        ajax.timeout = timeout;
        ajax.onreadystatechange = () => {
            if(ended)
                return;
            if(ajax.readyState == 4)
                end("OK");
            else if(Date.now() - date > timeout)
                end("FORCED_TIMEOUT");
        };
        ajax.send(null);

        ajax.ontimeout = () => end("TIMEOUT");
        ajax.onabort = () => end("ABORTED");
        ajax.onerror = () => end("ERROR");

        return ajax;
    };

    const add_custom_settings = new_settings => {
        if(!new_settings)
            return;

        if(new_settings.substr)
            new_settings = JSON.parse(new_settings);

        if(new_settings)
            for(const key in new_settings)
                if(custom_settings[key] === undefined)
                    custom_settings[key] = new_settings[key];

    };

    const load_custom_settings = (i, files, callback) => {

        if(i >= files.length){
            if(typeof callback == "function")
                callback();
            return;
        };

        load_file(files[i], response => {
            add_custom_settings(response);
            load_custom_settings(i + 1, files, callback);
        });

    };

    const add_custom_i18n = new_i18n => {
        if(!new_i18n)
            return;

        if(new_i18n.substr)
            new_i18n = JSON.parse(new_i18n);

        if(new_i18n)
            for(const language in new_i18n){
                if(!i18n_sentences[language])
                    i18n_sentences[language] = {};
                for(const key in new_i18n[language])
                    if(i18n_sentences[language][language] === undefined)
                        i18n_sentences[language][key] = new_i18n[language][key];
            };

    };

    const load_custom_i18n = (i, files, callback) => {

        if(!files)
            files = [];
        else if(!files.push)
            files = [files];

        if(i >= files.length){
            if(typeof callback == "function")
                callback();
            return;
        };

        load_file(files[i], response => {
            add_custom_i18n(response);
            load_custom_i18n(i + 1, files, callback);
        });

    };

    const null_or_undefined = this.null_or_undefined = value => value === undefined || value === null;

    const i18n_default = (names, _default) => {
        if(!null_or_undefined(_default))
            return _default;
        if(names)
            for(let i = 0, l = names; i < l; i ++)
                if(names[i])
                    return names[i];
        return settings("default_text");
    };

    const language_change = this.language_change = new_language => {

        if(new_language && new_language != language && i18n_sentences[new_language])
            language = new_language;

    };

    const i18n = this.i18n = (names, _default) => {
        if(!names)
            return i18n_default(null, _default);

        if(!names.push)
            names = [names];

        const l = names.length;

        if(language && i18n_sentences[language])
            for(let i = 0; i < l; i ++)
                if(i18n_sentences[language][names[i]] !== undefined)
                    return i18n_sentences[language][names[i]];

        const default_language = settings("default_language");

        if(language && i18n_sentences[default_language])
            for(let i = 0; i < l; i ++)
                if(i18n_sentences[default_language][names[i]] !== undefined)
                    return i18n_sentences[default_language][names[i]];
        for(const current_language in i18n_sentences)
            for(let i = 0; i < l; i ++)
                if(i18n_sentences[current_language][names[i]] !== undefined)
                    return i18n_sentences[current_language][names[i]];
        return i18n_default(names, _default);
    };

    const hash = this.hash = () => {

        let hash,
            alphabet = settings("hash_alphabet");
        const length = settings("hash_length");

        if(!alphabet.length)
            alphabet = ("" + alphabet).split("");

        const l = alphabet.length;

        do{
            hash = "";
            while((hash += alphabet[Math.random() * l >> 0]).length < length);
        }while(
            hashes.includes(hash) ||
            /^\d/.test(hash) ||
            document.querySelector("#" + hash + ",." + hash + ",[name=" + hash + "]")
        );
        hashes.push(hash);

        return hash;
    };

    const screen_change_event = () => {

        if(screen.x == item_self.offsetWidth && screen.y == item_self.offsetHeight)
            return;

        screen.x = item_self.offsetWidth;
        screen.y = item_self.offsetHeight;

        item_self.style.fontSize = (screen[screen.x < screen.y ? "x" : "y"] / Number(item_self.getAttribute("data-cells"))) + "px";

    };

    this.start = () => {

        if(started)
            return;
        started = true;

        threads_start();

        load_file(settings("default_settings_file"), response => {
            add_custom_settings(response);

            let settings_files = settings("settings_files");

            if(!settings_files)
                settings_files = [];
            else if(!settings_files.push)
                settings_files = [settings_files];

            load_custom_settings(0, settings_files, () => {

                load_custom_i18n(0, settings("i18n_files"), () => {
                    load_custom_i18n(0, settings("default_i18n_files"), () => {

                        preload(settings("position"), position => {

                            if(!position){
                                console.error(i18n("position_error", "Position not found."));
                                return;
                            };

                            license = self.license = new OBerlayS.License(self, input && input.license ? input.license : null);
                            logo = self.logo = new OBerlayS.Logo(self, input && input.logo ? input.logo : null);

                            item_self = self.item_self = position.appendChild(document.createElement("div"));

                            item_self.setAttribute("id", hash_self = self.hash_self = hash());
                            item_self.setAttribute("data-hash", hash_self);
                            item_self.setAttribute("class", (settings("default_class") + " " + hash_self + " " + (settings(["class", "classes"]) || "")).trim());
                            item_self.setAttribute("data-application", settings("application"));
                            item_self.setAttribute("data-cells", settings("cells"));

                            screen_change_thread = threads_add(screen_change_event);

                            item_self.innerHTML = (`
                                ` + self.license.build() + `
                                ` + self.logo.build() + `
                            `);

                        });

                    });
                });

            });

        });

    };

    construct();

};
