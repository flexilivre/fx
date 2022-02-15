fx.ns("fx.components", class TabBarVertical extends fx.Component {

	constructor(parameters) {
		super(parameters);

		this.tabs = [];
		this.currentTab;
		this.onTabClickHandler;
		this.defaultHeight = 70;

		let tabButtons = parameters.tabs ? parameters.tabs : parameters;

		if (tabButtons)
		{
			for (let index = 0; index < tabButtons.length; index++)
			{
				let obj = tabButtons[index];
				let tab = { id : (obj.id ?  obj.id : Utils.newID()), 
							label : obj.label, 
							data : obj.data,
							asset : Utils.typeEqual(obj.image, "string") ? new fx.Asset(obj.image) : obj.image }
				
				this.tabs.push( tab );
			}
		}

		this.dom = fx.get("dom");
	}
	
	onReady()
	{
		super.onReady();
		this.on("click", this.onTabClick, this.find(".tab"));
	}


	destroy(){
		super.destroy();

		this.tabs = null;
		this.currentTab = null;
		this.onTabClickHandler = null;
	}

	render(){
		let html = "";

		// this div is used to show which tab is active, and animate the active tab
		html += '<div class="selected_tab_background"></div>';

		html += '<ul class="tabs">';

		for (let i = 0; i < this.tabs.length; i++){
			let tab = this.tabs[i];
			html += '<li class="tab" id="' + tab.id + '">' + ( tab.asset ? tab.asset.render('tab-image') : "" ) + '<div class="tab-label">' + tab.label+ '</div></li>';
		}

		html += '</ul>';
		return html;
	}

	selectTab(tab){

		if (!Utils.typeEqual(tab, "object"))
			tab = this.getTab(tab);

		if (tab && tab.id)
		{
			this.removeClass(".active", "active");
			this.addClass(tab.id, "active");
			this.css(".selected_tab_background", {	top : this.childPosition(tab.id).top,
													height : this.defaultHeight, 
													width : this.realWidth });
			this.trigger("tabchanged", {tab : tab})				
		}
		else	
		{
            //fx.throwError("Can not select given tab");
            fx.log.error("Can not select given tab");
		}
	}

	resize(){
		super.resize();

		let tabs = this.find(".tab");
        //let tabHeight = Math.max( this.defaultHeight, this.measuredHeight() / tabs.length );
        let tabHeight = this.defaultHeight;
		for (let i = 0; i < tabs.length; i++)
			this.css(tabs[i], {height : tabHeight, top : tabHeight * i });
		
	}

	position(){
		super.position();
	
	}

	getTab(id){
		let tab;
		for (let i = 0; i < this.tabs.length; i++)
		{
			if (this.tabs[i].id == id)
			{
				tab = this.tabs[i];
				break;
			}
		}
		return tab;
	}

	onTabClick(event){
		this.selectTab(event.currentTarget.getAttribute("id"));
	}
});
