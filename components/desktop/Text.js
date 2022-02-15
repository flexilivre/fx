fx.ns("fx.components", class Text extends fx.Component {

	constructor(parameters) {
		super();

		if (typeof parameters == "string")
			this._text = parameters;
		else
		{
			this._classname = parameters ? parameters.className : "";
			this._text = parameters ? parameters.text : "";
		}
	}

	onReady (){
		
		if (this._classname)
			this.addClass(this._classname);
	}

	get text()
	{
		return this._text;
	}

	set text(val)
	{
		this._text = val;
		this.refresh();
	}

	refresh()
	{
		if (this.node)
			this.node.innerHTML = this.render();
	}

	render(){
		return this._text !== undefined ? (this._text instanceof fx.Asset ? this._text.content : this._text) : "";
	}
	
});