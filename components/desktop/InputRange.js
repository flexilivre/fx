fx.ns("fx.components", class InputRange extends fx.components.Input {

    constructor(data)
    {
        super(data);

        this.min = data && data.min !== undefined ? data.min : 0;
        this.max = data && data.max !== undefined ? data.max : 10;
    }

    get value()
    {
        if (this.initialized)
            return this.find(".input").value;

        return 0;
    }

    set value(val)
    {
        this._value = Number(val);

        if (this.initialized)
            this.find(".input").value = this._value;
    }

    get min()
    {
        return this._min || 0;
    }

    set min(val)
    {
        this._min = val;

        this._update();
    }

    get max()
    {
        return this._max || 10;
    }

    set max(val)
    {
        this._max = val;

        this._update();
    }

    get step()
    {
        return this._step || 1;
    }

    set step(val)
    {
        this._step = val;

        this._update();
    }

    onReady()
    {
        let input = this.find("input");
        this.on("input", this.onChange, input);
        //this.on("change", this.onChange, input); // IE10 : but not supported on fx
    }

    onChange(e)
    {
        this.trigger("changed", this.value);
    }

    render()
    {
		return '<input class="input" type="range" min="' + this.min + '" max="' + this.max + '" value="' + this._value + '" ' + (this._name ? ('name= "' + this._name + '"') : '') + '>';
    }
});