fx.ns("fx.components", class TextArea extends fx.components.Input {

    constructor(parameters)
    {
        super(parameters);
    }

    render()
    {
        return '<textarea class="input" placeholder="' + this.placeHolder + '" ' + (this._name ? ('name= "' + this._name + '"') : '') + '>' + this.value + '</textarea>';
    }
    
});