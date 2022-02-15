/**
 * IconButton constructor
 * @constructor fx.components.IconButton
 */
/*
fx.ns("fx.components", class IconButton extends fx.components.Button {
	
	constructor(parameters){
		super(parameters);

		this.asset = parameters ? parameters.icon : null;
		
		if (Utils.typeEqual(this.asset, "string"))
			this.asset = new fx.Asset(this.asset);

		//this.label = parameters ? parameters.label : null;
		this.classname = parameters ? parameters.className : null;
		this.filled = parameters ? parameters.filled : null;
		this.labelPosition = parameters ? parameters.labelPosition : "bottom";
		this.iconWidth = parameters ? parameters.iconWidth : 0;
		this.iconHeight = parameters ? parameters.iconHeight : 0;
	}

	onReady(){
		
		super.onReady();

		if (this.filled)
			this.addClass("filled");

		if (this.classname)
			this.addClass(this.classname);

		this.addClass(this.labelPosition);

	}

	resize()
	{
		if (!this.initialized)
			return;

		super.resize();

		if (!this.shape)
		{
			this.shape = this.find(".shape");
			this.icon = this.find(".icon");
			this.labelComponent = this.find(".label");
		}
		
		this.css(this.shape,  {width : this.measuredWidth(), height : this.realWidth - (parseInt(this.css(this.shape, "border-left-width")) + parseInt(this.css(this.shape, "border-top-width")) ) });
		
		if (!this.iconWidth)
			this.css(this.icon,  {"max-width" : this.measuredWidth() / 2});
		else
			this.css(this.icon,  {"width" : this.iconWidth, "max-width" : "unset"});
			

		if (!this.iconHeight)
			this.css(this.icon,  {"max-height" : this.realHeight / 2});
		else
			this.css(this.icon,  {"height" : this.iconHeight, "max-height" : "unset"});

		if (this.labelComponent && this.labelPosition == "right")
			this.css(this.labelComponent, {top : ( this.measuredHeight(this.shape) - this.measuredHeight(this.labelComponent) ) / 2 , 
									left : this.measuredWidth() + 10});	
	}

	render(){			
		let html = '';

		html += '<div class="shape">';
		
		if (this.asset)
			html += this.asset.render("icon");

		html += '</div>';

		if (this.label)
			html += '<div class="label">' + this.label + '</div>';

		return html;
	}

});*/