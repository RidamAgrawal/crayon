
class select2 {
    label = 'test';
    options = ['1', '2', '3'];
    _value = new Set();
    get value() {
        return Array.from(this._value);
    }
    set value(values) {
        if (Array.isArray(values)) {
            const newValues = new Set(values);
            newValues.forEach(value=>{
                if(this.options.includes(value) && !this._value.has(value)){
                    this.toggleValue(value);
                }
            });
            this._value.forEach(value=>{
                if(!newValues.has(value)){
                    this.toggleValue(value);
                }
            })
            this._value = newValues;
        }
        this._emitChange();
    }
    onChangeCallbacks = new Set();
    holder = null;
    listElement = null;
    constructor(label, options) {
        if (typeof label == 'string' && Array.isArray(options)) {
            this.label = label;
            this.options = [...new Set(options)];
            this.filteredOptions = options;
        }
        this.focusSelect = this.focusSelect.bind(this);
        this.focusOutSelect = this.focusOutSelect.bind(this);
        this.filterOptions = this.filterOptions.bind(this);
    }

    createSelect2() {
        const mainContainer = document.createElement('div');
        this.holder = document.createElement('div');
        this.holder.classList.add('holder', this.label + "holder");
        this.holder.addEventListener('click', this.focusSelect);

        const holderInput = document.createElement('input');
        holderInput.type = 'text';
        holderInput.id = this.label;
        holderInput.placeholder = "";
        holderInput.addEventListener('focusout', this.focusOutSelect);
        holderInput.addEventListener('input', this.filterOptions);

        this.holder.appendChild(holderInput);

        const chipsHolder = document.createElement('div');
        chipsHolder.classList.add('chipsHolder');

        this.holder.appendChild(chipsHolder);
        mainContainer.appendChild(this.holder);

        const holderLabel = document.createElement('label');
        holderLabel.setAttribute('for', this.label);
        holderLabel.textContent = this.label;

        mainContainer.appendChild(holderLabel);

        this.listElement = document.createElement('ul');
        this.listElement.classList.add('select', 'hide');

        const listBody = document.createElement('div');
        this.options.forEach((option, index) => listBody.appendChild(this.createOption(option, index)));

        this.listElement.appendChild(listBody);
        mainContainer.appendChild(this.listElement);

        return mainContainer;
    }

    focusSelect(event) {
        const inputEle = this.holder.querySelector('input');
        if (event.target?.dataset[inputEle.id] !== undefined) {
            const chipLabel = event.target.dataset[inputEle.id];
            this.toggleValue(chipLabel);
            return;
        }
        this.holder.classList.add('focused');
        inputEle.focus();
    }

    focusOutSelect(event) {
        const inputEle = event.target;
        if (event.relatedTarget?.dataset[inputEle.id] !== undefined) {
            const chipLabel = event.relatedTarget.dataset[inputEle.id];
            this.toggleValue(chipLabel);
            inputEle.focus();
            return;
        }
        this.holder.classList.remove('focused');
        this.setInputElementsValue("");
    }

    filterOptions(event) {
        const searchString = event.target?.value?.toLowerCase();
        const optionsContainer = this.listElement.children[0];
        Array.from(optionsContainer.children)
            .forEach((option) => {
                if (option?.dataset[this.label]?.toLowerCase()?.includes(searchString)) {
                    option.classList.remove('hide');
                }
                else {
                    option.classList.add('hide');
                }
            })
    }

    createOption(label, index) {
        const listTag = document.createElement('li');
        listTag.tabIndex = index;
        listTag.textContent = label;
        listTag.setAttribute(`data-${this.label}`, label);
        return listTag;
    }

    toggleOption(optionLabel) {
        Array.from(this.listElement.children[0].children)
            .forEach(option => {
                if (option.dataset[this.label] && option.dataset[this.label] == optionLabel) {
                    option.classList.toggle('hide');
                }
            })
    }

    createChip(label) {
        const selectedFilter = document.createElement('div');
        selectedFilter.classList.add('selectedFilter', toValidClassName(label));
        const chipLabel = document.createElement('span');
        chipLabel.textContent = label;
        selectedFilter.appendChild(chipLabel);

        const svgNS = "http://www.w3.org/2000/closeIcon";
        const closeIcon = document.createElementNS(svgNS, "closeIcon");

        // Set SVG attributes
        closeIcon.setAttribute("height", "16px");
        closeIcon.setAttribute("viewBox", "0 -960 960 960");
        closeIcon.setAttribute("width", "16px");
        closeIcon.setAttribute("fill", "#424242");
        closeIcon.setAttribute("tabindex", 0);
        // Set dynamic attribute as in your example
        closeIcon.setAttribute(`data-${this.label}`, label);

        // Create the path element in SVG namespace
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute(`data-${this.label}`, label);
        path.setAttribute("d", "m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z");

        // Append path to SVG, and SVG to container
        closeIcon.appendChild(path);
        selectedFilter.appendChild(closeIcon);
        return selectedFilter;
    }

    toggleChip(chipLabel) {
        const chipsHolder = this.holder.querySelector('.chipsHolder');
        const targetChip = chipsHolder.querySelector('.' + toValidClassName(chipLabel));
        if (targetChip) {
            targetChip.classList.toggle('hide');
        }
        else {
            chipsHolder.appendChild(this.createChip(chipLabel));
        }
    }

    toggleValue(option) {
        this.toggleOption(option);
        this.toggleChip(option);
        if (this._value.has(option)) { this._value.delete(option); }
        else { this._value.add(option); }
        
        if (this._value.size > 0) { this.holder.classList.add('floatLabel'); }
        else { this.holder.classList.remove('floatLabel'); }
        this._emitChange();
    }

    setInputElementsValue(searchString) {
        const inputEle = this.holder.querySelector('input');
        inputEle.value = '';
        inputEle.dispatchEvent(new Event('input', { bubbles: true }));
    }

    onChange(callback) {
        this.onChangeCallbacks.add(callback);
    }

    offChange(callback) {
        this.onChangeCallbacks.delete(callback);
    }

    _emitChange() {
        for (const cb of this.onChangeCallbacks) {
            cb(this.value);
        }
    }
    
}
