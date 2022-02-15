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
							asset : Utils.typeEqual(obj.image, "string") ? new fx.Asset(obj.image) : obj.image,
							showNumber : obj.showNumber }
				
				this.tabs.push( tab );
			}
		}
	}


	/************ OVERRIDES ***********/
	
	onReady()
	{
		super.onReady();
        this.on("tap", this.onTabClick, this.find(".tab"));
    
	}

	render()
	{
		let html = "";

		// this div is used to show which tab is active, and animate the active tab
		html += '<div class="selected_tab_background"></div>';

		html += '<ul class="tabs">';

		for (let i = 0; i < this.tabs.length; i++){
			let tab = this.tabs[i];
			//html += '<li class="tab" id="' + tab.id + '">' + (tab.showNumber ? '<div class="number"></div>' : '') + ( tab.asset ? tab.asset.render('tab-image') : "" ) + '<div class="tab-label">' + tab.label+ '</div></li>';
			html += '<li class="tab" id="' + tab.id + '"><div class="inner">' + (tab.showNumber ? '<div class="number"></div>' : '') + ( tab.asset ? tab.asset.render('tab-image') : "" ) + '<div class="tab-label">' + tab.label+ '</div></div></li>';
		}

		html += '</ul>';
		return html;
	}

	

	resize()
	{
		super.resize();

		let tabs = this.find(".tab");
		let tabWidth = Math.max( this.defaultWidth, this.measuredWidth() / tabs.length );
		if (tabs)
		{
			for (let i = 0; i < tabs.length; i++)
				this.css(tabs[i], {width : tabWidth, left : tabWidth * i });
		}

		let selectTab = this.find(".selected_tab_background");
		this.css(selectTab, {width : tabWidth, height : this.realHeight});
	}

	position()
	{
		super.position();
	
	}


	/************ Actions ***********/

	unSelectTab()
	{
		let tab = this.find(".active");
		this.removeClass(tab, "active");
		this.css(".selected_tab_background", {display:"none"});
		this.removeClass("active");
	}

	selectTab(tab)
	{

		if (!Utils.typeEqual(tab, "object"))
			tab = this.getTab(tab);

		if ( this.hasClass(tab.id, "active"))
		{
			this.removeClass(tab.id, "active");
			this.css(".selected_tab_background", {display:"none"});
			this.trigger("tabchanged", {tab : null})		
			this.removeClass("active");		
		}
		else
		if (tab && tab.id)
		{
			this.removeClass(this.find(".active"), "active");
			this.addClass(tab.id, "active");
			this.css(".selected_tab_background", {	left : this.childPosition(tab.id).left,
													display : "block"
													 });
			this.trigger("tabchanged", {tab : tab})				
			this.addClass("active");
		}

	}

	getTab(id)
	{
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


	setNumber(id, number)
	{
		let numberElement = this.find("#" + id + " .number");
		if (numberElement)
			numberElement.innerHTML = number;
	}


	/*********** Events ***********/

    onTabClick(event)
    {
        let tab = fx.dom.parent(event.target, ".tab");
        if (tab)        
		    this.selectTab(tab.getAttribute("id"));
	}
});
