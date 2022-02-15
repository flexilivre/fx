/**
 * IconButton constructor
 * @constructor fx.components.IconButton
 */

fx.ns("fx.components", class IconButton extends fx.components.Button {
	
	constructor(parameters){
		super(parameters);

		this.asset = parameters ? parameters.icon : null;
		
		if (Utils.typeEqual(this.asset, "string"))
			this.asset = new fx.Asset(this.asset);

		this.classname = parameters ? parameters.className : null;
		this.filled = parameters ? parameters.filled : null;
		this.iconRatio = parameters && parameters.iconRatio ? parameters.iconRatio : 0.50;

		this._textMargin = parameters && parameters.textMargin ? parameters.textMargin : 10;

		this._DEFAULT_SIZE = 100;
		
	}

	get shapeComponent()
	{
		if (!this._shapeComponent)
			this._shapeComponent = this.find(".circle");

		return this._shapeComponent;
	}

	get iconComponent()
	{
		if (!this._iconComponent)
			this._iconComponent = this.find(".icon");

		return this._iconComponent;
	}

	get labelComponent()
	{
		if (!this._labelComponent)
			this._labelComponent = this.find(".label");

		return this._labelComponent;
	}

	onReady(){
		
		if (this.classname)
			this.addClass(this.classname);

		if (this.filled)
			this.addClass("filled");

		this.on("click", this.onClick);
	}

	resize()
	{
		if (!this.initialized)
			return;

		let height = parseInt(this._viewport.height);
		let width = parseInt(this._viewport.width);
		if (isNaN(height) && isNaN(width))
		{
			height = this._DEFAULT_SIZE;
			width = this._DEFAULT_SIZE;
		}
		else
		if (isNaN(height))
			height = width;
		else
		if (isNaN(width))
			width = height;

		this._viewport.height = height;
		this._viewport.width = width;

		super.resize();

		if (this.label)
		{
			height -= parseInt(fx.dom.css(this.labelComponent, "font-size")) /*fx.dom.outerHeight(this.labelComponent)*/ + this._textMargin;
			width -= parseInt(fx.dom.css(this.labelComponent, "font-size")) /*fx.dom.outerHeight(this.labelComponent)*/ + this._textMargin;
		}

		this._circleWidth = width;
		this._circleHeight = height;
		this._iconWidth = width * this.iconRatio;
		this._iconHeight = height * this.iconRatio;

		fx.dom.css(this.shapeComponent, {width : this._circleWidth, height : this._circleHeight});
		fx.dom.css(this.iconComponent, {width : this._iconWidth, height : this._iconHeight});
		fx.dom.css(this.labelComponent, {width : "100%"});
	}

	position()
	{
		super.position();

		if (!this.initialized)
			return;

		fx.dom.css(this.shapeComponent, {left : (this.realWidth - this._circleWidth) / 2, top : 0});

		fx.dom.css(this.iconComponent, {left : (this._circleWidth - this._iconWidth) / 2, 
										top : (this._circleHeight - this._iconHeight) / 2});
			
		if (this.labelComponent)
			fx.dom.css(this.labelComponent, {top : this._circleHeight + this._textMargin, left : 0});
		
	}

	render()
	{			
		let html = '';

		if (this.asset)
			html += '<div class="circle">' + this.asset.render("icon") + '</div>';
	
		if (this.label)
			html += '<div class="label">' + this.label + '</div>';

		return html;
	}

});