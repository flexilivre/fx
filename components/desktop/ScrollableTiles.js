fx.ns("fx.components", class ScrollableTiles extends fx.components.Scrollable {
    
    constructor(parameters) {
        super("vertical");

        this.data = parameters && parameters.data ? parameters.data : null;
        this._renderers = parameters && parameters.renderers ? parameters.renderers : null;
        this._effect = parameters && parameters.effect ? parameters.effect : null;
    }

    update()
    {
        this._buildTiles();
    }

    onReady()
    {
        this.on("click", this._onClick, this.scrollable);
    }

    onDataUpdated(action)
    {
        if (this.initialized)
        {
            if (action.type == "removeItem" /*&& action.model == this.data*/)
            {
                // nothing to do
            }
            else
            {
                if (this.filter)
                    this.filter.refresh();

                this._buildTiles();
            }
        }
    }

    


    _onClick(e)
    {
        let childs = this.getChilds();
        for (let i = 0; i < childs.length; i++)
        {
            let element = fx.dom.parent(e.target, childs[i].node);
            if (element)
            {
                this.trigger("clicked", childs[i].data);
                break;
            }
        }
    }

    _buildTiles()
    {
        // TODO : to optimize like VerticalGridDynamic
        this.removeAllChild(true);

        for (let i = 0; i < this.data.length; i++)
        {
            let item = this.data.getItemAt(i);

            let renderer;
            if (this._renderers)
            {
                renderer = this._renderers[Object.getPrototypeOf(item).constructor.name];

                if (!renderer)
                {
                    fx.log.error("Renderer for " + Object.getPrototypeOf(item).constructor.name + " not found");
                    continue;
                }
            }
            else
                renderer = fx.components.DefaultRenderer;

            let tile = new renderer(item);
            
            this.addChild( tile );
        }
        
    }



});