fx.ns("fx.components", class TabPanelsHorizontal extends fx.Component 
{
    constructor(parameters) 
    {
		super(parameters);
		this.panels = [], 
		this.currentPanel,
		
		this.tabBarHeight = (parameters && parameters.tabbarheight) ? parameters.tabbarheight : 65;
		this.tabBarWidth = (parameters && parameters.tabbarwidth) ? parameters.tabbarwidth : "95%";
	}

	get open()
	{
		return this.currentPanel != null;
	}

	onReady()
	{
		super.onReady();

		this.on("tabchanged", this.onTabChanged, this.tabBar);

		this.tabBar.show(); // TODO : it's only to fix bug on calculating size
	}

	create(){
		super.create();

		this.tabBar = new fx.components.TabBarHorizontal({tabs : this.panels});
		
		this.addChild(this.tabBar, {bottom:10, left:"center", width:this.tabBarWidth, height:this.tabBarHeight});

		return this;
	}



	addPanel(label, img, panel, showNumber)
	{
		this.panels.push({id : Utils.newID(), label : label, image: img, panel : panel, showNumber : showNumber, component : null, index : this.panels.length});
	}
	
	selectTab (panel){

		let tab = this.getTab(panel);

		if (tab)
			this.tabBar.selectTab(tab.id);
	}

	getTab(panel)
	{
		let elt;
		for (let i = 0; i < this.panels.length; i++)
		{
			if (this.panels[i].panel == panel)
			{
				elt = this.panels[i];
				break;
			}
		}
		return elt;
	}

	setNumber(panel, number)
	{
		let tab = this.getTab(panel);
		this.tabBar.setNumber(tab.id, number);
	}

	onTabChanged(event){

		let selectedPanel = (event.detail && event.detail.tab) ? this.panels.find({"id" : event.detail.tab.id}) : null;
		
        if (!selectedPanel)
        {
            this.hidePanel()
            return;
        }

		if (!this.hasChild(selectedPanel.component))
		{
			selectedPanel.component = new fx.components.Box("panel");
			
			let header = this._getHeader(selectedPanel)
			selectedPanel.component.addChild( header, {top : 0, left : 0, width : "100%", height : 35});
			selectedPanel.component.addChild( selectedPanel.panel , { top:35, left:0, width:"100%", height : "fill"});

			this.addChild(selectedPanel.component, {top:0, left:0, width:"100%", height: fx.dom.height(window) /*- this.realHeight - this.tabBar.bottom()*/ });

			this.on("close", this.hidePanel, selectedPanel.panel);
			this.on("click", this.onTabChanged, header);
		}
		
		if (this.currentPanel)
		{
			selectedPanel.component.addClass("noanimate");
			selectedPanel.component.addClass("show-bottom");
			//selectedPanel.component.updateDisplay();	
			this.currentPanel.component.removeClass("show-bottom");
		}
		else
			this.delay( this._showPanel, 0 )	
			
        this.currentPanel = selectedPanel;

        this.trigger("changed");

	}

	hidePanel()
	{
		if (this.currentPanel)
		{
			this.currentPanel.component.removeClass("noanimate");
			this.currentPanel.component.removeClass("show-bottom");        
		}
			
		this.tabBar.unSelectTab();
			
		this.currentPanel = null;
		
		this.trigger("changed");

		
	}

	_showPanel()
    {
		if (this.currentPanel)
			this.currentPanel.component.addClass("show-bottom");

		//this.currentPanel.component.updateDisplay();
		
	}
	
	_getHeader(panel)
	{
		let box = new fx.components.Box("header");

		box.addChild( new fx.components.Text(panel.label), {width : "100%", height : "100%", left : 0, top:0});
		box.addChild( new fx.components.IconButton( {icon: fx.get("assets").ExitIcon, className : "exit"}), {width : 30, height : 30, right : 10, top:10} );
		
		return box;
	}
	
	


    
	
});