/**
 * Select
 * @constructor fx.components.Select
 * @param {object} this.dom DOM
 * @param {object} parameters Select parameters 
 */
fx.ns("fx.components", class Select extends fx.Component {

	constructor(parameters) 
	{
		super(parameters && parameters.data ? parameters.data : parameters);
	
		this.side = "right";
		
		this.items = parameters ? (parameters.items || ( parameters || [] ) ) : [];
		this._className = parameters ? parameters.className : "";
		this.changedHandler = parameters ? parameters.changed : null;
		this.selectedIndex = parameters ? parameters.selectedIndex || 0 : 0;
		this.selectedValue = parameters ? parameters.selectedValue || 0 : 0;

		if (parameters && !parameters.selectedIndex && parameters.selectedValue)
		{
			for(let i = 0; i < this.items.length; i++)
			{
				if (this.items.getItemAt(i) == this.selectedValue)
				{
					this.selectedIndex = i;
					break;
				}
			}
		}

		this.leftIcon = (parameters && parameters.leftIcon) ? parameters.leftIcon : '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 284.929 284.929" xml:space="preserve"><g><path class="inner" d="M282.082,76.511l-14.274-14.273c-1.902-1.906-4.093-2.856-6.57-2.856c-2.471,0-4.661,0.95-6.563,2.856L142.466,174.441   L30.262,62.241c-1.903-1.906-4.093-2.856-6.567-2.856c-2.475,0-4.665,0.95-6.567,2.856L2.856,76.515C0.95,78.417,0,80.607,0,83.082   c0,2.473,0.953,4.663,2.856,6.565l133.043,133.046c1.902,1.903,4.093,2.854,6.567,2.854s4.661-0.951,6.562-2.854L282.082,89.647   c1.902-1.903,2.847-4.093,2.847-6.565C284.929,80.607,283.984,78.417,282.082,76.511z"></path></g></svg>';
		this.rightIcon = (parameters && parameters.rightIcon) ? parameters.rightIcon : '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 284.929 284.929" xml:space="preserve"><g><path class="inner" d="M282.082,76.511l-14.274-14.273c-1.902-1.906-4.093-2.856-6.57-2.856c-2.471,0-4.661,0.95-6.563,2.856L142.466,174.441   L30.262,62.241c-1.903-1.906-4.093-2.856-6.567-2.856c-2.475,0-4.665,0.95-6.567,2.856L2.856,76.515C0.95,78.417,0,80.607,0,83.082   c0,2.473,0.953,4.663,2.856,6.565l133.043,133.046c1.902,1.903,4.093,2.854,6.567,2.854s4.661-0.951,6.562-2.854L282.082,89.647   c1.902-1.903,2.847-4.093,2.847-6.565C284.929,80.607,283.984,78.417,282.082,76.511z"></path></g></svg>';

		if (Utils.typeEqual(this.leftIcon, "string"))
			this.leftIcon = new fx.Asset(this.leftIcon);

		if (Utils.typeEqual(this.rightIcon, "string"))
			this.rightIcon = new fx.Asset(this.rightIcon);

		//this.updatePositionHandler;
	
		this.selectedItemContainer;
		this.selectedItemInner;
		this.itemWidth;

		this.dom = fx.get("dom");
	}

	get selectedItem()
	{
		if (this.items && this.selectedIndex >= 0)	
			return this.items.getItemAt(this.selectedIndex);
	}

	onReady() 
	{
		super.onReady();

		this.selectedItemContainer = this.find(".selected-item");
		this.selectedItemInner = this.find(".selected-item .inner");

		this.arrows = this.find(".select-arrow");
		this.item = this.find(".selected-item");

		this.updatePosition();

		this.on("click", this.updatePosition, this.arrows);
		this.on("click", this.updatePosition, this.item);

		this.addClass( this._className );
	}


	
	onDisplayUpdated()
	{
		super.onDisplayUpdated();
		
		this.toFinishResize = false;

		
		let elements = this.find(".label");
		if (!elements)
			elements = [];
		else
		if (!elements.length)
			elements = [elements];

		let containerMaxWidth = this.measuredWidth() - 4 - 2 * (30 /*this.measuredWidth(".select-arrow")*/ + 20 ); // 4 -> border, 20 -> margin
		this.itemWidth = containerMaxWidth;//(containerMaxWidth > this.itemWidth ? this.itemWidth : containerMaxWidth) + 20;

		this.dom.css(this.find(".selected-item"), {"width" : this.itemWidth + "px"});
		this.dom.css(this.find(".inner"), {"width" : (this.itemWidth * elements.length) + "px"});
		this.dom.css(elements, {"width" : this.itemWidth + "px"});
	}

	select(item)
	{
		if (!this.items)
			return;

		let index = this.items.indexOf(item);

		if (index == -1)
			return;
		
		this.updatePosition(index);
	}
	updatePosition(index)
	{
		if (parseInt(index) == index) // integer
		{
			if (this.selectedIndex == index)
				return;

			if (index < this.items.length - 1 && index >= 0)
				this.selectedIndex = index;
		}
		else 
		if (index)
		{	
			let event = index;
			if (this.dom.hasClass(event.currentTarget, "selected-item"))
			{
				let offset = fx.graphics.globalToLocal( this.node, event.pageX, event.pageY );
				if (offset.x < (this.realWidth / 2))
					this.side = "left";
				else
					this.side = "right";
			}
			else
				this.side = "";
			
			if (this.dom.hasClass(event.currentTarget, "left") || this.side == "left")
			{
				if (this.selectedIndex == 0)
				return;

				this.selectedIndex--;
			}
			else
			if (this.dom.hasClass(event.currentTarget, "right") || this.side == "right")
			{
				if (this.selectedIndex == this.items.length - 1)
				return;

				this.selectedIndex++;
			}
			
		}

		this.css(this.selectedItemInner, {"left" :  this.itemWidth * (-this.selectedIndex)});		

		if (this.selectedIndex == this.items.length - 1)
			this.addClass(this.find(".right"), "disabled");
		else
			this.removeClass(this.find(".right"), "disabled");

		if (this.selectedIndex == 0)
			this.addClass(this.find(".left"), "disabled");
		else
			this.removeClass(this.find(".left"), "disabled");

		this.trigger("changed", this.items.getItemAt(this.selectedIndex));

		if (this.changedHandler)
			this.changedHandler(this.items.getItemAt(this.selectedIndex));
	}

	render(){

		let html = '';
		
		html +='<div class="select-btn">';
		html +='<div class="select-arrow left">';
		html += this.leftIcon.render("icon");
		html +='</div>';
		
		html +='<div class="selected-item">';
		html +='<div class="inner">';
		
		for (let i = 0; i < this.items.length; i++)
			html +='<div class="label">' + this.items.getItemAt(i).label + '</div>';
		
		html +='</div>';
		html +='</div>';

		html +='<div class="select-arrow right">';
		html += this.rightIcon.render("icon");
		html +='</div>';
		
		html +='</div>';

		return html;
	}
});