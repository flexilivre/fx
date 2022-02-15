fx.ns("fx.components", class TabBarHorizontal extends fx.Component {

	constructor(parameters) {
		super(parameters);

		this.tabs = [];
		this.currentTab;
		this.onTabClickHandler;
		this.defaultWidth = 50;

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
	}
	
	onReady()
	{
		super.onReady();
		this.on("click", this.onTabClick, this.find(".tab"));
	}

	onDataUpdated(action)
	{
		
	}

	destroy(){
		super.destroy();

		this.tabs = null;
		this.currentTab = null;
		this.onTabClickHandler = null;
	}

	render(){
		let html = '<div class="bar">';

		// this div is used to show which tab is active, and animate the active tab
		html += '<div class="selected_tab_background"></div>';

		html += '<ul class="tabs">';

		for (let i = 0; i < this.tabs.length; i++){
			let tab = this.tabs[i];
			html += '<li class="tab" id="' + tab.id + '">' + ( tab.asset ? tab.asset.render('tab-image') : "" ) + '<div class="tab-label">' + tab.label+ '</div></li>';
		}

		html += '</ul></div>';
		return html;
	}

	selectTab(tab){

		if (!Utils.typeEqual(tab, "object"))
			tab = this.getTab(tab);

		if (tab && tab.id)
		{
			this.removeClass(".active", "active");
			this.addClass(tab.id, "active");
			this.css(".selected_tab_background", {	left : this.childPosition(tab.id).left,
													width : fx.dom.outerWidth("#" + tab.id), 
													/*height : this.realHeight*/ });
			this.trigger("tabchanged", {tab : tab})				
		}
		else	
		{
			fx.throwError("Can not select given tab");
		}
	}

	resize(){
		super.resize();

		let tabs = this.find(".tab");
		if (tabs)
		{
			let tabWidth = Math.max( this.defaultWidth, this.measuredWidth() / tabs.length );
			for (let i = 0; i < tabs.length; i++)
				this.css(tabs[i], {with : tabWidth, left : tabWidth * i });
		}
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
