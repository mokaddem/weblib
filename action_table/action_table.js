class ActionTable {
	constructor(options) {
		this.__globalCounter = 0;
		this.options = options;
		this.container = options.container;
		this.header = options.header;
		this.header.push("Action");
		this.row_num = this.header.length;
		this.data = options.data == undefined ? [] : options.data;
		this.control_items = options.control_items;
		this.__create_table();
	}

	__get_uniq_index() {
		this.__globalCounter++;
		return this.__globalCounter-1;
	}

	add_row(row) {
		this.data.push(row);
		this.__add_row(row);
	}

	delete_row(row_id) {
		var elem = document.getElementById(row_id);
		elem.outerHTML = "";
	}

	__create_table() {
		this.form = document.createElement('form');
		this.table = document.createElement('table');
		this.table.classList.add("table", "table-bordered");
		this.thead = document.createElement('thead');
		this.tbody = document.createElement('tbody');
		var trHead = document.createElement('tr');
		for (var col of this.header) {
			var th = document.createElement('th');
			th.innerHTML = col;
			trHead.appendChild(th);
		}
		this.thead.appendChild(trHead);

		this.__add_control_row();

		for (var row of this.data) {
			this.__add_row(row);
		}
		this.table.appendChild(this.thead);
		this.table.appendChild(this.tbody);
		this.form.appendChild(this.table);
		this.container.appendChild(this.form);
	}

	__add_row(row) {
		var tr = document.createElement('tr');
		tr.id = "tr_" + this.__get_uniq_index();
		for (var col of row) {
			var td = document.createElement('td');
			td.innerHTML = col;
			tr.appendChild(td);
		}
		this.__add_action_button(tr);
		this.tbody.appendChild(tr);
	}

	__add_control_row() {
		var tr = document.createElement('tr');
		for (var item of this.control_items) {
			var td = document.createElement('td');
			var item = this.__add_control_item(item);
			td.appendChild(item);
			tr.appendChild(td);
		}
		var td = document.createElement('td');
		var btn = document.createElement('button');
		btn.classList.add("btn", "btn-primary");
		btn.innerHTML = "Add";
		btn.type = "button";

		var that = this;
		btn.addEventListener("click", function(evt) {
			var data = [];
			for (var elem of that.form.elements) {
				if (elem.classList.contains('form-group')) {
					data.push(elem.value);
				}
			}
			that.add_row(data);
		});

		td.appendChild(btn);
		tr.appendChild(td);
		this.thead.appendChild(tr);
	}

	__add_control_item(options) {
		var item;
		switch(options.DOMType) {
			case "select":
				item = this.__create_select(options.item_options);
				break;
			case "input":
				item = this.__create_input(options.item_options);
				break;
			default:
				break;
		}
		return item;
	}

	__add_action_button(tr) {
		var td = document.createElement('td');
		var btn = document.createElement('button');
		btn.classList.add("btn", "btn-danger");
		btn.innerHTML = "X";
		btn.type = "button";
		btn.setAttribute('rowID', tr.id);
		var that = this;
		btn.addEventListener("click", function(evt) {
			that.delete_row(this.getAttribute('rowID'));
		});
		td.appendChild(btn);
		tr.appendChild(td);
	}

	__create_input(options) {
		var input = document.createElement('input');
		input.classList.add("form-group");
		input.id = 'actionTable_controlSelect_'+this.__get_uniq_index();
		return input;
	}

	__create_select(select_options) {
		var select = document.createElement('select');
		select.classList.add("form-group");
		select.id = 'actionTable_controlSelect_'+this.__get_uniq_index();
		select.style.width = "100%";
		this.__add_options_to_select(select, select_options.options);
		if(select_options.default !== undefined) {
			select.value = select_options.default;
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
}
