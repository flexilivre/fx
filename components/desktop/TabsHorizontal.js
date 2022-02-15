fx.ns("fx.components", class TabsHorizontal extends fx.Component {

	constructor(parameters) {
		super(parameters);
		this.panels = [], 
		this.onTabChangedHandler, 
		this.currentPanel,
		
		this.tabBarHeight = (parameters && parameters.tabbarheight) ? parameters.tabbarheight : 75;
		this.tabBarWidth = (parameters && parameters.tabbarwidth) ? parameters.tabbarwidth : "100%";
	}

	onReady()
	{
		super.onReady();

		this.onTabChangedHandler = this.onTabChanged.bind(this);

		this.on("tabchanged", this.onTabChanged, this.tabBar);

		this.tabBar.show(); // TODO : it's only to fix bug on calculating size

		this.currentPanel = this.panels[0];
		if (this.currentPanel)
			this.selectTab(this.currentPanel.id);

	}

	create(){
		super.create();

		this.tabBar = new fx.components.TabBarHorizontal({tabs : this.panels});
		
		this.addChild(this.tabBar, {top:0, left:0, width: this.tabBarWidth, height:this.tabBarHeight});

		return this;
	}

	

	destroy() {
		super.destroy();

		this.onTabChangedHandler = null;
		this.panels = null;
	}

	addTab(label, img, panel){
		this.panels.push({id : Utils.newID(), label : label, image: img, panel : panel, index : this.panels.length});
	}
	
	selectTab (id){
		this.tabBar.selectTab(id);
	}

	onTabChanged(event){

		let selectedPanel = this.panels.find({"id" : event.detail.tab.id});
		
		if (!selectedPanel)
			return;

		if (!this.hasChild(selectedPanel.panel))
		{
			selectedPanel.panel.addClass("animate");
			selectedPanel.panel.addClass("hide-left");
			
			this.addChild(selectedPanel.panel, {top:this.tabBar.realHeight, left:0, width:"100%", height: "fill" });
		}
		
		if (this.currentPanel)
		{
			if (this.currentPanel.index < selectedPanel.index)
				this.currentPanel.panel.addClass("hide-left");
			else
				this.currentPanel.panel.addClass("hide-right");
				
			this.currentPanel.panel.hide();
				
		}

		selectedPanel.panel.removeClass("hide-left");
		selectedPanel.panel.removeClass("hide-right");

		selectedPanel.panel.show();

		//selectedPanel.panel.updateDisplay();
		
		this.currentPanel = selectedPanel;

		if (this.css("overflow") == "visible")
		{
			this.css({overflow : "hidden"});
			this.delay(this._setBackOverflow, 250);
		}
	}

	_setBackOverflow()
	{
		this.css({overflow : "visible"});
	}
	
});