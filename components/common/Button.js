fx.ns("fx.components", class Button extends fx.Component {

	constructor(parameters){

		super(parameters ? parameters.data : null);

		this._label = (typeof parameters == "string") ? parameters : ( (parameters && parameters.label) ? parameters.label : "" );
		this.classname = (parameters && parameters.className) ? parameters.className : "";
		this.clickCallback = parameters ? parameters.click : null;
		this.type = parameters ? parameters.type : null; // borderOnly / filled
		this.icon = parameters ? parameters.icon : false;
		this.iconPosition = parameters ? parameters.iconPosition : "";
		this._disabled = (parameters ? parameters.disabled : false) || false;

		if (parameters && parameters.toolTip)
			this.toolTip = parameters.toolTip;
		
		if (parameters && parameters.title)
			this.title = parameters.title;
		
		this.dom = fx.get("dom");
	}

	get label()
	{
		return this._label;
	}

	set label(val)
	{
		this._label = val;

		this.update(true);
	}

	get disabled()
	{
		return this._disabled;
	}

	set disabled(val)
	{
		this._disabled = val;
		
		this._updateDisabled();
	}

	onReady()
	{
		super.onReady();

		if (this.classname)
			this.addClass(this.classname);

		if (this.type)
			this.addClass(this.type);

		this._updateDisabled();

		this.on("click", this.onClick, this.find(".shape"));

		this.on("click", this._onClick);
	}

	
	destroy(){
		super.destroy();
		this.clickCallback = null;
	}

	render()
	{
		let icon = (this.icon ? this.icon.render("button-icon " + (this.iconPosition == "right" ? "right" : "left")) : '');

		let html = '<div class="shape ' + (this.disabled ? "dsiabled" : "") + '">';

		if (this.iconPosition != "right" ) 
			html += icon;

		html += '<span class="text">' + this._label + '</span>';
		
		if (this.iconPosition == "right" ) 
			html += icon;

		html += '</div>';
		
		return html;
	}

	_onClick(e)
	{
		if (this.disabled)
			e.stopPropagation();
	}

	onClick(e)
	{
		if (this.disabled)
			e.stopPropagation();
		else
		if (this.clickCallback)
			this.clickCallback(e, this.data);
	}

	_updateDisabled()
	{
		this.toggleClass("disabled", this.disabled);
	}
});