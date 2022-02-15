/**
 * Select
 * @constructor fx.components.Select
 * @param {object} this.dom DOM
 * @param {object} parameters Select parameters 
 */
fx.ns("fx.components", class VerticalSelect extends fx.Component {

	constructor(parameters) 
	{
        super();
        
        this._items = parameters && parameters.items ? parameters.items : [];
        this._selectedItem = parameters && parameters.selectedItem ? parameters.selectedItem : null;
        this._notifyFirstSelect = parameters && parameters.notifyFirstSelect !== undefined ? parameters.notifyFirstSelect : true;

        this._labelRenderer = parameters && parameters.labelRenderer ? parameters.labelRenderer : null;
	
		this.upIcon = (parameters && parameters.upIcon) ? parameters.upIcon : '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 284.929 284.929" xml:space="preserve"><g><path class="inner" d="M282.082,76.511l-14.274-14.273c-1.902-1.906-4.093-2.856-6.57-2.856c-2.471,0-4.661,0.95-6.563,2.856L142.466,174.441   L30.262,62.241c-1.903-1.906-4.093-2.856-6.567-2.856c-2.475,0-4.665,0.95-6.567,2.856L2.856,76.515C0.95,78.417,0,80.607,0,83.082   c0,2.473,0.953,4.663,2.856,6.565l133.043,133.046c1.902,1.903,4.093,2.854,6.567,2.854s4.661-0.951,6.562-2.854L282.082,89.647   c1.902-1.903,2.847-4.093,2.847-6.565C284.929,80.607,283.984,78.417,282.082,76.511z"></path></g></svg>';
        this.downIcon = (parameters && parameters.downIcon) ? parameters.downIcon : '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 284.929 284.929" xml:space="preserve"><g><path class="inner" d="M282.082,76.511l-14.274-14.273c-1.902-1.906-4.093-2.856-6.57-2.856c-2.471,0-4.661,0.95-6.563,2.856L142.466,174.441   L30.262,62.241c-1.903-1.906-4.093-2.856-6.567-2.856c-2.475,0-4.665,0.95-6.567,2.856L2.856,76.515C0.95,78.417,0,80.607,0,83.082   c0,2.473,0.953,4.663,2.856,6.565l133.043,133.046c1.902,1.903,4.093,2.854,6.567,2.854s4.661-0.951,6.562-2.854L282.082,89.647   c1.902-1.903,2.847-4.093,2.847-6.565C284.929,80.607,283.984,78.417,282.082,76.511z"></path></g></svg>';

        if (Utils.typeEqual(this.downIcon, "string"))
            this.downIcon = new fx.Asset(this.downIcon);
        
        if (this._items instanceof fx.Model)
            this.listenUpdates( this._items );
        
    }

    get items()
    {
        if (!this._items)
            this._items = [];
        
        return this._items;
    }

    set items(val)
    {
        this._items = val;

        this._updateState();
    }

    get selectedItem()
	{
        if (!this._selectedItem && this.items.length > 0)
            return this.items.getItemAt(0);
        else
            return this._selectedItem;
    }

    set selectedItem(val)
    {
        this._selectedItem = val;
    }

    get selectedLabel()
    {
        return (this.selectedItem ? (this.selectedItem.toString ? this.selectedItem.toString() : this.selectedItem) : "" )
    }
    

    create()
    {
        this.label = new fx.components.Text({className : "label"});
        this.icon = new fx.components.Image({data : this.downIcon, assetClassName : "icon"});
        
        this.addChild(this.label);
        this.addChild(this.icon, { width: 15, height: 15, right: 15, top: 11});

        this.verticalList = new fx.components.VerticalList({items: this.items, selected : this.selectedItem });
        this.verticalList.visibleAtStart = false;
        this.verticalList.effect = "vslide";
        let margin = parseInt(this.css("margin")) / 2;
        if (isNaN(margin))
            margin = 0;
        this.addChild(this.verticalList, {top : this.measuredHeight(false) - margin, left : 0, width : "100%"});
    }
    
    onClick(e)
	{
        super.onClick(e);
    }

	onReady() 
	{
        super.onReady();
        
        this.on("click", this.onClick, window);
        this.on("selected", this.onSelected, this.verticalList);

        this._downIcon = this.find(".icon");

        this._updateState();
        this._updateLabel();

        if (this._notifyFirstSelect)
            this.delay( this._notifySelect,10 );
    }

    _updateState()
    {
        if (!this._items || this._items.length == 0)
            this.disable();
        else
            this.enable();
    }

    _notifySelect()
    {
        if (this.selectedItem)
            this.trigger("selected", this.selectedItem);
    }
    
    onClick(e)
    {
        if (!this._items || this._items.length == 0)
            return;

        let list = fx.dom.parent(e.target, ".VerticalList") 
        if (list && list == this.verticalList.node)
            return;

        let select = fx.dom.parent(e.target, ".VerticalSelect") 
        if (select == this.node)
        {
            if (this.verticalList.visible)
                this.verticalList.hide();
            else
                this.verticalList.show();
        }
        else
        if (this.verticalList.visible)
            this.verticalList.hide();

        this._updateIcon();
    }

    onSelected(e)
    {
        this.find(".label").innerHTML = e.detail.toString ? e.detail.toString() : e.detail;
        this._selectedItem = e.detail;
        this.verticalList.hide();
        this._updateIcon();

        this.trigger("selected", this.selectedItem)
    }

    _updateIcon()
    {
        this.toggleClass(this._downIcon, "rotate", this.verticalList.visible);
    }

    /*render()
    {
        return "<div class='label'>" +  (this.selectedItem ? (this.selectedItem.toString ? this.selectedItem.toString() : this.selectedItem) : "" ) + "</div>" + this.downIcon.render("icon");
    }*/


    onDataUpdated(action)
    {
        this._updateLabel();
        this._updateState();
    }

    onChildUpdated(action)
    {
        this._updateLabel();
        this._updateState();
    }


    _updateLabel()
    {
        this.label.text = this._labelRenderer ? this._labelRenderer(this.selectedItem) : this.selectedLabel;
    }


});