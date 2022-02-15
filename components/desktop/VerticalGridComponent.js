/**
 * VerticalGridComponent
 * @constructor fx.components.VerticalGridComponent
 * @param {object} dom DOM
 * @param {object} parameters columns/cellrenderer
 */
/*
fx.ns("fx.components", class VerticalGridComponent extends fx.Component {

	constructor(parameters) {
		super(parameters);

		this.columns = (parameters && parameters.columns) ? parameters.columns : 2;
		this.renderer = (parameters && parameters.renderer) ? parameters.renderer : fx.components.DefaultRenderer;
		this.data = (parameters && parameters.data ? parameters.data : []);
	}

	
	create(){
		super.create();
		this.myLazyLoad = new LazyLoad({ container: this.node });     
	}

	enable(){
		super.enable();
	}

	refresh(){
		
		if (!this.initialized)
			return;

		//var data = this.data();

		this.removeAllChild(true);

		if (!this.data)
			return;

		let width =  (100 / this.columns) * 0.95, cellWidth, data = this.data;

		for (let index = 0; index < data.length; index++)
		{	
			let item = data[index],
				r;

			if (item.type == "label")
			{
				cellWidth = 100;
				r = new fx.components.DefaultRenderer(item);
			}
			else
			{
				cellWidth = width;
				r = new this.renderer(item);
			}

			this.addChild(r, {width : cellWidth + "%", height : r.defaultHeight() });


			r.addClass("Renderer");
			r.show();
		}

		this.myLazyLoad.update();
	
	}

	destroy(){
		super.destroy();
	}

	itemRender (r){
		this.renderer = r;
	}
});

*/