fx.ns("fx.components", class VerticalList extends fx.Component {

    constructor(parameters) 
    {
        super();
        
        this.data = (parameters && parameters.items) ? parameters.items : [];
        this._selected = (parameters && parameters.selected !== undefined) ? parameters.selected : null;
        this._maxHeight = (parameters && parameters.maxHeight) ? parameters.maxHeight : 300;

        /*if (this.data instanceof fx.Model)
            this.listenUpdates( this.data );*/

        this._resized = true;
	}

    onReady()
    {
        super.onReady();
        
        this.on("click", this.onClick);
        this.on("mousewheel", this.onMouseWheel, this);
    }

    get selected(){
        return this._selected;
    }

    set selected(val){

        let target = this.find('[data=' + val + ']');

        if (target)
        {
            this._selected = val;

            this.removeClass(this.find(".selected"), "selected");
            this.addClass( target , "selected" );
        }
    }

    updateDisplay()
	{
		super.updateDisplay();
	}


    resize()
    {
        super.resize();
       
        if (this._resized)
            this._resize();
    }

    _resize()
    {
        let height = 0;
        let items = this.find(".item");
        if (items && items.length)
        {
            for (let i = 0; i < items.length; i++)
                height += fx.dom.outerHeight( items[i] );
        
            this._realHeight = Math.min(this._maxHeight, height);

            this.css({ height : this._realHeight});
        }

        this._resized = false;
    }

    render()
    {
        let html = "<ul class='items'>";

        for (let i = 0; i < this.data.length; i++)
        {
            if(this.data instanceof fx.ModelArray && this.data.getItemAt(i).empty)
            {
                html += "<li class='item empty";

                let item = this.data.getItemAt(i);

                html += "' data='" + item.id + "'><div class='overlay empty'></div>"
            }
            else
            {
                html += "<li class='item ";
                
                let item = (this.data instanceof fx.ModelArray) ? this.data.getItemAt(i) : this.data[i];
    
                if (this._selected == (item.id || item))
                    html += " selected";
    
                html += "' data='" + (item.id || item) + "'><div class='overlay'></div>"
    
                if (item.thumb)
                    html += "<img src='" + item.thumb + "'></li>";
                else
                if (item.label)
                    html += item.label;
                else
                if (item.name)
                    html += item.name;
                else
                    html += item;
            }

        }

        html += "</ul>";

        return html;
    }

    onClick(event)
    {
        let target = fx.dom.parent(event.target, ".item");
        if (target)
        {
            this.removeClass(this.find(".selected"), "selected");
            this.addClass( target , "selected" );

            let item = this.data.find({id : target.getAttribute("data") });
            if (!item)
                item = target.innerText;

            this.trigger("selected", item);

            event.preventDefault();
        }
    }

    onMouseWheel(e)
    {
        e.stopPropagation();
    }


    onChildUpdated(action)
    {
        //this._needRender = true;
        //this.update();
    }

    onDataUpdated()
    {
        this._resized = true;
    }
    
});
