fx.ns("fx.components", class CheckList extends fx.Component {

	constructor(parameters)
	{
		super();

		this._items = parameters ? (parameters.items || ( parameters || [] ) ) : [];
		this._className = parameters ? parameters.className : "";
		this._selectedIndex = parameters ? parameters.selectedIndex || 0 : 0;
		
	}

	get selectedIndex()
	{
		return this._selectedIndex;
	}

	set selectedIndex(val)
	{
		this._selectedIndex = val;

		if (this.initialized)
			this._selectItem( this._selectedIndex );
	}

	get items()
	{
		return this._items;
	}

	render(){

		let html = '';

		for (let i = 0; i < this._items.length; i++)
		{
			let item = this._items[i];
			item.__id = item.id || Utils.newID();

			html +='<div id="' + item.__id + '" class="select-item';
			html += (i == this.selectedIndex) ? ' active' : '';
			html +='">';
			html +='<div class="filter">';
			html += this._items.getItemAt(i).label;
			html +='</div>';
			html += fx.assets.checkmark.render();
			html +='</div>';
		}

		return html;
	}

	onReady (){
		
		if (this._classname)
			this.addClass(this._classname);

		this.filters = this.find(".select-item");

		this.on("click", this.onSelect, this.filters);
	}

	onSelect(e)
	{
		// if e.target contain active do nothing;
        if(fx.dom.parent(e.target, ".active"))
			return;
		
		// set current item
		let selectItem = fx.dom.parent(e.target, ".select-item");

		if (selectItem)
		{
			for (let i = 0; i < this._items.length; i++)
			{
				if (this._items[i].__id == selectItem.getAttribute("id"))
				{
					this._selectItem(i);
					break;
				}
			}
		}
	}

	_selectItem(index)
	{
		let item = this.items[index];

		if (item)
		{
			this.removeClass(this.find(".active"), "active");
			this.addClass( this.find("[id=" + item.__id +"]") , "active");
			this._selectedIndex = index;
			this.trigger("changed", this.selectedIndex);
		}
	}
	
});