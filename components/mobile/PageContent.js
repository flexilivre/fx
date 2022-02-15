fx.ns("fx.components", class PageContent extends fx.Component {

	constructor(parameters) {
		super(parameters);
	}

	create(){
		super.create();
		this.addChild(new fx.components.Content(), {top:"center", left:"center", width : "100%", height:500} );
	}

	content(){
		return "";
	}

});


fx.ns("fx.components", class Content extends fx.Component {

	constructor(parameters) {
		super(parameters);
	}

	render (){
		return Utils.typeEqual( this.parent.content, "function") ? this.parent.content() : "";
	}
});