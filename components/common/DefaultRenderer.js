fx.ns("fx.components", class DefaultRenderer extends fx.Component {

	constructor(data) {
		super(data);
    }
    
	static HEIGHT()
	{	
		return  45;
	}


	render(){
		return ( (this.data && this.data.text) ? this.data.text : this.data );
	}

	defaultHeight(){
		return 20;
	}
});