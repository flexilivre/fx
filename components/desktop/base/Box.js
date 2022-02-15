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

	onReady()
	{
		super.onReady();

		if (this.classname)
			this.addClass(this.classname);

		if (this._css)
			this.css(this._css);
	}

});