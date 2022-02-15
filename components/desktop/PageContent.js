fx.ns("fx.components", class PageContent extends fx.Component {

	constructor(parameters) {
		super(parameters);
	}

	create(){
		super.create();
		this.addChild(new fx.components.Content(), {top:"center", left:"center", width : 600, height:400} );
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