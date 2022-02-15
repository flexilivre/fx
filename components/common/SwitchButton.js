fx.ns("fx.components", class SwitchButton extends fx.Component {

	constructor(parameters){

		super(parameters ? parameters.data : null);

		this.classname = (parameters && parameters.className) ? parameters.className : "";
		this._switched = parameters && parameters.value ? parameters.value : null;

	}

	get switched()
	{
		return this._switched;
	}

	set switched(val)
	{
		this._switched = val;
		this.toggleClass("switched", this._switched);
	}

	onReady()
	{
		super.onReady();

		if (this.classname)
			this.addClass(this.classname);
		
		if (this.switched)
			this.addClass('switched');

		// this.on("click", this.onClick, this.find(".shape"));
		this.on("click", this.onClick);
	}
	
	destroy(){
		super.destroy();
		this.clickCallback = null;
	}

	render(){
		return '<div class="container"><div class="switch"><div class="dot">' + fx.assets.checkmark.render() + '</div></div></div>';
	}

	onClick(e)
	{
		this.switched = !this.switched;

		this.trigger("changed", this.switched);
	}
});