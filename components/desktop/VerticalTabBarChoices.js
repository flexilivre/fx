/*fx.ns("fx.components", class VerticalTabBarChoices extends fx.components.VerticalTabBar {

	constructor(data) {
		super(data);

        this.defaultHeight = 20;
        
        this.iconChecked = '<svg class="checked" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 30.59 24.352" xml:space="preserve"><path class="path" d="M29.421,1.952l-0.78-0.779C27.887,0.417,26.878,0,25.805,0c-1.074,0-2.082,0.417-2.838,1.174L11.031,13.109L7.623,9.703  C6.869,8.946,5.86,8.529,4.787,8.529c-1.075,0-2.083,0.418-2.839,1.176l-0.774,0.774c-1.564,1.565-1.564,4.11-0.002,5.674  l7.018,7.023c0.757,0.758,1.765,1.174,2.838,1.174c1.074,0,2.082-0.417,2.838-1.175L29.419,7.624  C30.98,6.059,30.98,3.515,29.421,1.952z M28.139,6.342L12.583,21.896c-0.428,0.428-0.991,0.642-1.556,0.642  c-0.563,0-1.128-0.214-1.556-0.642l-7.018-7.023c-0.854-0.854-0.854-2.255,0-3.11l0.777-0.777c0.427-0.428,0.992-0.644,1.556-0.644  s1.127,0.216,1.555,0.644l4.689,4.688L24.249,2.454c0.428-0.427,0.991-0.642,1.556-0.642c0.563,0,1.127,0.215,1.555,0.643  l0.779,0.777C28.992,4.086,28.992,5.487,28.139,6.342z"/></svg>';
    }
    
    render(){
		let html = "";
		
		html += '<div class="selected_tab_background"></div>';

		html += '<ul class="tabs">';

		for (let i = 0; i < this.tabs.length; i++){
			let tab = this.tabs[i];
			html += '<li class="tab" id="' + tab.id + '">' + ( tab.asset ? tab.asset.render('tab-image') : "" ) + '<div class="tab-label">' + tab.label+ '</div> ' + this.iconChecked + '</li>';
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
			this.css(".selected_tab_background", {top : this.childPosition(tab.id).top });
            this.trigger("tabchanged", {tab : tab})				
            
		}
		else	
		{
			fx.throwError("Can not select given tab");
		}
	}

	resize(){
		super.resize();

		let tabs = this.find(".tab"),
            top = 0, 
            tabHeight,
            
            maxWidth = 0,
            maxWidth2 = 0;

        for (let i = 0; i < tabs.length; i++)
        {
            tabHeight = fx.dom.outerHeight(tabs[i]) - parseInt(fx.dom.css(tabs[i], "border-width"))*2 ;
            this.css(tabs[i], {top : top, left : 0});
            top += tabHeight + 10;

            maxWidth = Math.max(  fx.dom.outerWidth(tabs[i]), maxWidth);
            maxWidth2 = Math.max( parseInt(fx.dom.width(tabs[i])) + parseInt(fx.dom.css(tabs[i], "border-width"))*2  , maxWidth2);
        }

        maxWidth += 20;
        maxWidth2 += 20;

        this.css(tabs, {width : maxWidth2 });
        
        this.css(this.find(".selected_tab_background"), {width : maxWidth, height : tabHeight});

        this.css({"height": top});
        
		
    }
    

    

});
*/