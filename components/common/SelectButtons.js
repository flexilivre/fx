fx.ns("fx.components", class SelectButtons extends fx.Component {

	constructor(parameters) 
	{
        super();

        this._items = parameters && parameters.items ? parameters.items : [];
        this._selectedIndex = parameters && parameters.selectedIndex ? parameters.selectedIndex : 0;
        this._className = parameters ? parameters.className : "";
    }
    
    get selectedItem()
	{
        if (this.items)
            return this.items[this._selectedIndex];
    }
    
    set selectedItem(val)
	{
        let index = this.items.indexOf( val );
        if (index != -1)
        {
            this._selectedIndex = index;
            this._selectButton(index);
        }
	}

    get selectedIndex()
    {
        return this._selectedIndex;
    }

    set selectedIndex(val)
    {
        if (val >= 0 && val < this.items.length)
        {
            this._selectedIndex = val;
            this._selectButton(val);
        }
            
    }

    get items()
    {
        return this._items;
    }

    create()
	{
        super.create();

        this.container = new fx.components.HBox("buttons");

        for (let i = 0; i < this.items.length; i++)
        {
            let btn = new fx.components.Button({className : i == this.selectedIndex ? "active" : "", label : this.items[i].label, type : "borderOnly"})
            this.items[i].__id = btn.id;
            this.container.addChild( btn );
        }
          
        this.addChild( this.container, {height:40, left:0, top : 0})
	}


	onReady() 
	{
        super.onReady();

        this.addClass( this._className );

        this.on("click", this._onClick);
    }
    
    _onClick(e)
    {
        // if e.target contain active do nothing;
        if(fx.dom.parent(e.target, ".active"))
            return;
        
        let btn = fx.dom.parent(e.target, ".Button");

        if (btn)
        {
            for (let i = 0; i < this.items.length; i++)
            {
                if(this.items[i].__id == btn.getAttribute("id"))
                {
                    this._selectButton( i );
                    break;
                }
            }
        }
    }


    _selectButton(index)
    {
        if (!this.initialized)
            return;

        let buttons = this.container.getChilds();
        for (let i=0; i < buttons.length; i++)
            buttons[i].removeClass('active');

        let btn = this.container.getChild( this.items[index].__id);

        btn.addClass("active");

        this._selectedIndex = index;

        this.trigger("changed", this.selectedItem);
    }


});