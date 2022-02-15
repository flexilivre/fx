/**
 * Box
 * @constructor fx.components.Box
 * @param {object} dom DOM
 */
fx.ns("fx.components", class Box extends fx.Component {

	constructor(data, css)
	{
		super(data);

		
		this.classname = (data && typeof data == "string") ? data : (!data || !data.className) ? "" :data.className;
		if (typeof data == "string")
			this.classname = data;

		this._css = css
	}

	get content()
	{
		return this.node.innerHTML;
	}

	set content(val)
	{
		if (this.node)
			this.node.innerHTML = val;
		else
			this._content = val;
	}

	init()
	{
		super.init();

		if (this._content)
			this.content = this._content;
	}

	onReady()
	{
		super.onReady();

		if (this.classname)
			this.addClass(this.classname);

		if (this._css)
			this.css(this._css);
	}

});