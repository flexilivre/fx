fx.ns("fx.components", class TabsVertical extends fx.Component {

    constructor(parameters) 
    {
		super(parameters);
		this.panels = [], 
		this.onTabChangedHandler, 
		this.currentPanel,
		
		this.tabBarwidth = (parameters && parameters.tabbarwidth) ? parameters.tabbarwidth : 65;
	}

    onReady()
    {
		super.onReady();

		this.onTabChangedHandler = this.onTabChanged.bind(this);

		this.on("tabchanged", this.onTabChanged, this.tabBar);

		this.tabBar.show(); // TODO : it's only to fix bug on calculating size

		this.currentPanel = this.panels[0];
		this.selectTab(this.currentPanel.id);

	}

    create()
    {
		super.create();

		this.tabBar = new fx.components.TabBarVertical({tabs : this.panels});
		
		this.addChild(this.tabBar, {top:0, left:0, height:"100%", width:this.tabBarwidth});

		return this;
	}


    addTab(label, img, panel)
    {
		this.panels.push({id : Utils.newID(), label : label, image: img, panel : panel, index : this.panels.length});
	}
	
    selectTab(id)
    {
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
			
			this.addChild(selectedPanel.panel, {left:this.tabBar.realWidth, top:0, height:"100%", width: "fill" });
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

		selectedPanel.panel.updateDisplay();
		
		this.currentPanel = selectedPanel;
    }
    
    destroy() 
    {
		super.destroy();

		this.onTabChangedHandler = null;
		this.panels = null;
	}
	
});