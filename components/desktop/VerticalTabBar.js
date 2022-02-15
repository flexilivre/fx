/*fx.ns("fx.components", class VerticalTabBar extends fx.components.TabBar {

	constructor(data) {
		super(data);

		this.defaultHeight = 20;
	}

	selectTab(tab){

		if (!Utils.typeEqual(tab, "object"))
			tab = this.getTab(tab);

		if (tab && tab.id)
		{
			this.removeClass(".active", "active");
			this.addClass(tab.id, "active");
			this.css(".selected_tab_background", {top : this.childPosition(tab.id).top });
			this.trigger("tabchanged", {tab : tab})				
		}
		else	
		{
			fx.throwError("Can not select given tab");
		}
	}

	resize(alone){
		super.resize(alone);

		let tabs = this.find(".tab"),
            top = 0, 
            tabHeight,
            
            maxWidth = 0,
            maxWidth2 = 0;

        for (let i = 0; i < tabs.length; i++)
        {
            tabHeight = fx.dom.outerHeight(tabs[i]);
            this.css(tabs[i], {top : top, left : 0});
            top += tabHeight + 5;

            maxWidth = Math.max( parseInt(fx.dom.css(tabs[i], "border-width"))*2  +  fx.dom.outerWidth(tabs[i]), maxWidth);
            maxWidth2 = Math.max( parseInt(fx.dom.width(tabs[i])) + parseInt(fx.dom.css(tabs[i], "border-width"))*2  , maxWidth2);
        }

        this.css(tabs, {width : maxWidth2 });
        
        this.css(this.find(".selected_tab_background"), {width : maxWidth, height : tabHeight});

        this.css({"height": top});
        
		
	}

});
*/