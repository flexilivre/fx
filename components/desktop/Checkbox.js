fx.ns("fx.components", class Checkbox extends fx.Component {

    constructor(parameters)
    {
        super();

        this._label = parameters && parameters.label ? parameters.label : null;
        this._value = parameters && parameters.value ? parameters.value : null;
    }


    get value()
    {
        if (this.initialized)
            return this.find(".input").checked
        else
            return this._value;
    }

    set value(val)
    {
        this._value = val;

        if (this.initialized)
            this.find(".input").checked = this._value;
    }

    
    enable()
    {
        super.enable();
        this.find(".input").disabled = false;
    }

    disable()
    {
        super.disable();
        this.find(".input").disabled = true;
    }

    render()
    {
		return (this._label ? ('<div class="label">' + this._label + '</div>') : '') + '<input class="input" type="checkbox"' + (this.value ? "CHECKED" : "")+ '>';
    }

    onReady()
    {
        this.on("click", this._onClick);
        this.on("click", this._onInputClick, this.find(".input"));
    }


    _onClick(e)
    {
        if (fx.dom.parent(e.target, this.find(".label")))
        {
            this.value = !this.value;
            this.trigger("changed", this.value);
        }
            
    }

    _onInputClick(e)
    {
        this.trigger("changed", this.value);
    }
});