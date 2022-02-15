fx.ns("fx.components", class Menu extends fx.Component {

    constructor(component, content) 
    {
        super();

        this._component = component;
        this._content = content;
    }

    get component()
    {
        return this._component;
    }
    
    get content()
    {
        return this._content;
    }


    /**
     * We override this function because the height has to be calculated depending on max width and total height of all elements
     */
    resize()
    {
        if (!this._initialized)
            return;

        let items = this.find(".item");
        if (!items.length)
            items = [items];

        if (!items)
            return;

        let height = 0;
        let width = 0;
        for (let i = 0; i < items.length; i++)
        {
            let item = items[i];

            if (fx.dom.hasClass(item, "separator"))
            {
                let margin = parseInt( fx.dom.css(item, "margin-top") ) + parseInt( fx.dom.css(item, "margin-bottom") );
                height += margin;
            }

            height += fx.dom.outerHeight( item );
            width = Math.max(width, fx.dom.outerWidth( item ) + 5 );
        }

        this._realWidth = width;
        this._realHeight = height;

        let container = this.find(".items");

        let padding = parseInt( fx.dom.css(container, "padding") );

        this._realWidth += 2*padding;
        this._realHeight += 2*padding;

        fx.dom.css(this.node, { width : this._realWidth, height : this._realHeight } );

        return this;
    }

    onReady()
    {
        super.onReady();
        this.on("mouseup", this._onClick);
    }

    render()
    {
        if (!this._content)
            return "";

        let html = "<ul class='items'>";

        for (let i = 0; i < this._content.length; i++)
         {
            let item = this._content[i];
            item.id = item.id || Utils.newID();

            if (item.label)
                html += "<li class='item' id='" + item.id + "'>" + item.label + "</li>";
            else
                html += "<li class='item separator'>";
        }

        html += "</ul>";

        return html;
    }

    
    _onClick(e)   
    {
        let uicomponent = fx.dom.parent(e.target, ".item");
        if (uicomponent)
        {
            let item = this._content.find({"id" : uicomponent.getAttribute("id")});
            if (item)
            {
                item.x = this.x;
                item.y = this.y;
                this._component.trigger("menu-action", item);
            }
        }
    }

});
