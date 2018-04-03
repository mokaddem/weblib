class ContextualMenu {
    constructor(options) {
        this.options = options;
        this.trigger_container = options.trigger_container;
        this.bootstrap_popover = options.bootstrap_popover;
        this.items = {};
        this.__is_shown = false;
        this.__globalCounter = 0;

        if (this.bootstrap_popover) {
            if (typeof $.fn.popover != 'function') { // boostrap loaded
                console.log("Boostrap not loaded or does not support popover");
                this.menu = this.__create_menu_div();
            } else {
                this.menu = this.__create_menu_div_bootstrap_popover();
            }
        } else {
            this.menu = this.__create_menu_div();
        }

    }

    /* Addition */
    add_button(options) {
        this.__create_divider_if_needed('btn');
        var btn = this.__create_button(options);
        this.items[btn.id] = btn;
    }

    add_checkbox(options) {
        this.__create_divider_if_needed('checkbox');
        var checkbox = this.__create_checkbox(options);
        this.items[checkbox.id] = checkbox;
    }

    add_slider(options) {
        this.__create_divider_if_needed('slider');
        var slider = this.__create_slider(options);
        this.items[slider.id] = slider;
    }

    add_select(options) {
        this.__create_divider_if_needed('select');
        var select = this.__create_select(options);
        this.items[select.id] = select;
    }


    /* Manipulation */
    add_option(id, values) {
        var select = this.items[id];
        var selected_value = select.value;
        select.innerHTML = ""; // ensure uniqueness
        this.__add_options_to_select(select, values);
        select.value = selected_value;
    }


    /* Private */
    __get_uniq_index() {
        this.__globalCounter++;
        return this.__globalCounter-1;
    }

    __toggleMenu(x, y, hide) {
	var that = this;
        if(this.__is_shown || hide) {
            that.menu.style.visibility = 'hidden';
        } else {
            this.menu.style.left = x+'px';
            this.menu.style.top = y+'px';
            this.menu.style.visibility = 'visible';
        }
        this.__is_shown = !this.__is_shown;
    }

    __create_menu_div() {
        var div = document.createElement('div');
        div.classList.add("contextual-menu");
        div.classList.add("contextual-menu-styling");
        document.body.appendChild(div);
        // register on click for the trigger_container
        var that = this;
        this.trigger_container.addEventListener("click", function(evt) {
            //var offsetX = -(div.clientWidth/2);
            var offsetX = 0;
            var offsetY = 1;
            that.__toggleMenu(evt.pageX+offsetX, evt.pageY+offsetY);
        });
        return div;
    }

    __create_menu_div_bootstrap_popover() {
        var div = document.createElement('div');
        div.classList.add("contextual-menu");
        document.body.appendChild(div);
        var that = this;
        this.trigger_container.tabIndex = 0; // required for the popover focus feature
        $(this.trigger_container).popover({
            container: 'body',
            html: true,
            placement: "bottom",
            content: function () {return $(that.menu); }, // return contextual menu htlm
            trigger: "click",
            template: '<div class="popover" role="tooltip"><div class="arrow"></div></h3><div class="popover-content"></div></div>'
        })
        return div;
    }

    __create_divider_if_needed(context) {
        if (this.previous_context === undefined) {
            this.previous_context = context;
        } else if (this.previous_context != context) {
            this.__create_divider();
            this.previous_context = context;
        }
        return;
    }

    __create_button(options) {
        var btn = document.createElement('button');
        btn.classList.add("btn-dropdown", "btn", "btn-"+options.type);
        btn.id = options.id === undefined ? 'contextualMenu_'+this.__get_uniq_index() : options.id;
        if(options.tooltip !== undefined) {
            btn.title = options.tooltip;
        }
        var span = document.createElement('span');
        span.classList.add("fa", "fa-"+options.icon);
        btn.innerHTML = span.outerHTML + options.label;
        if(options.event !== undefined) {
            btn.addEventListener("click", function(evt) {
                options.event();
            });
        }
        this.menu.appendChild(btn);
        return btn;
    }

    __create_slider(options) {
        var div = document.createElement('div');
        var label = document.createElement('label');
        label.innerHTML = options.label+":";
        if(options.tooltip !== undefined) {
            label.title = options.tooltip;
        }
        var slider = document.createElement('input');
        slider.id = options.id === undefined ? 'contextualMenu_'+this.__get_uniq_index() : options.id;
        slider.type = "range";
        slider.min = options.min;
        slider.max = options.max;
        slider.value = options.value;
        slider.step = options.step;
        var slider_val = options.value == undefined ? 0 : options.value;
        slider.value = slider_val;
        var span = document.createElement('span');
        span.innerHTML = slider_val;
        span.id = slider.id + "_span";
        if(options.event !== undefined) {
            slider.addEventListener('input', function(evt) {
            	span.innerHTML = evt.target.value; // Update associated span
            	options.event(evt.target.value);
            });
        }
        div.appendChild(label);
        div.appendChild(span);
        if (options.applyButton !== undefined) {
            var button = document.createElement('button');
            button.innerHTML = "Apply";
            button.classList.add("btn");
            button.addEventListener("click", function(evt) { options.eventApply(slider.value); });
            div.appendChild(button);
        }
        div.appendChild(slider);
        this.menu.appendChild(div);
        return slider;
    }

    __create_checkbox(options) {
        var checkbox = document.createElement('input');
        var label = document.createElement('label');
        checkbox.id = options.id === undefined ? 'contextualMenu_'+this.__get_uniq_index() : options.id;
        checkbox.type = "checkbox";
        checkbox.checked = options.checked;
        if(options.tooltip !== undefined) {
            label.title = options.tooltip;
        }
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(options.label));
        label.addEventListener("change", function(evt) { options.event(evt.target.checked); });
        this.menu.appendChild(label);
	return checkbox;
    }

    __create_select(select_options) {
        var select = document.createElement('select');
        var label = document.createElement('label');
        label.innerHTML = select_options.label+":";
        label.title = select_options.tooltip;
        select.id = select_options.id === undefined ? 'contextualMenu_'+this.__get_uniq_index() : select_options.id;
        this.__add_options_to_select(select, select_options.options);
        if(select_options.default !== undefined) {
        	select.value = select_options.default;
        }
        this.menu.appendChild(label);
        this.menu.appendChild(select);
        if(select_options.event !== undefined) {
            select.addEventListener("change", function(evt) { select_options.event(evt.target.value); });
        }
        return select;
    }

    __add_options_to_select(select, options) {
        for(var value of options) {
            var option = document.createElement('option');
            option.value = value;
            option.innerHTML = value;
            select.appendChild(option);
        }
    }

    __create_divider() {
        var divider = document.createElement('li');
        divider.classList.add("contextual-menu-divider");
        this.menu.appendChild(divider);
    }
}
