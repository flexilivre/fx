/**
 * Display list of component
 * Create only visible components
 * Destroy / create new components on scroll
 * Display one or more components per line
 * Adapt size and number of components with width of line
 * 
 * Parameters :
 * maxElementsPerRow : number of element per row. If set to "auto", set as many elements as possible. Default value : 4
 * maxRowHeight : maximum row height. Default value 150 pixels
 * scrollOnNew : scroll automatically on new element. Default value : false
 * renderers : object of renderers for each data type. Example : { Sticker : renderers.StickerRendered, Background : renderers.BackgroundRenderer }]
 * hasOnlyUnique : if objects to display are unique, set this property true in order to gain performance.
 */
fx.ns("fx.components", class VerticalGridDynamic extends fx.Component {

    constructor(parameters)
    {
        super(parameters && parameters.data ? parameters.data : []);

        //parameters = (parameters instanceof Array || parameters instanceof fx.ModelArray) ? {} : parameters;
        
        this.filter = (parameters && parameters.filter) ? parameters.filter : null;

        this._maxElementsPerRow = (parameters && parameters.maxElementsPerRow) ? parameters.maxElementsPerRow : null;
        this._elementWidth = (parameters && parameters.elementWidth) ? parameters.elementWidth : 0;
        this._elementHeight = (parameters && parameters.elementHeight) ? parameters.elementHeight : 0;
        this._maxRowHeight = (parameters && parameters.maxRowHeight) ? parameters.maxRowHeight : 150;
        this._scrollOnNew = (parameters && parameters.scrollOnNew) ? parameters.scrollOnNew : false;
        this._scrollBarWidth = fx.graphics.scrollbarWidth();
        this._renderers = (parameters && parameters.renderers) ? parameters.renderers : [];
        this._childEffect = (parameters && parameters.childEffect !== undefined) ? parameters.childEffect : "";
        this._newChildEffect = (parameters && parameters.newChildEffect !== undefined) ? parameters.newChildEffect : "";
        this._marginBottom = (parameters && parameters.marginBottom !== undefined) ? parameters.marginBottom : 50;
        
        this._containerWidth = (parameters && parameters.containerWidth !== undefined) ? parameters.containerWidth : "100%";
        this._containerHeight = (parameters && parameters.containerHeight !== undefined) ? parameters.containerHeight : "100%";
        this._containerTop = (parameters && parameters.containerTop !== undefined) ? parameters.containerTop : 0;
        this._containerLeft = (parameters && parameters.containerLeft !== undefined) ? parameters.containerLeft : 0;

        this.headerComponent = (parameters && parameters.headerComponent !== undefined) ? parameters.headerComponent : null;

        // allow to have tiles with same size
        this._tilesSameSize = (parameters && parameters.tilesSameSize !== undefined) ? parameters.tilesSameSize : false;

        this._hasOnlyUnique = (parameters && parameters.hasOnlyUnique) ? parameters.hasOnlyUnique : false;

        this._onScrollHandler = this._onScroll.bind(this);
        this._manageNewItemsHandler = this._manageNewItems.bind(this);
        this._enableScrollHandler = this._enableScroll.bind(this);

        this._labelIDS = {};

        this._newItems = {};

        
    }

    get maxElementsPerRow()
    {
        return this._maxElementsPerRow;
    }

    set maxElementsPerRow(val)
    {
        this._maxElementsPerRow = val;
        this._update();
    }

    get maxRowHeight()
    {
        return this._maxRowHeight;
    }

    set maxRowHeight(val)
    {
        this._maxRowHeight = val;
        this._update();
    }

    get renderers()
    {
        return this._renderers;
    }

    set renders(val)
    {
        this._renderers = val;
        if (this.initialized)
            this._update();
    }

    get childEffect()
    {
        return this._childEffect;
    }

    get newChildEffect()
    {
        return this._newChildEffect;
    }


    get headerComponent()
    {
        return this._headerComponent;
    }

    set headerComponent(val)
    {
        if (this._headerComponent)
            this.off("resized", this.onHeaderComponentResized, this._headerComponent.component);
        
        this._headerComponent = val;

        if (this._headerComponent)
            this.on("resized", this.onHeaderComponentResized, this._headerComponent.component);
    }

    scrollTop()
    {
        if (this.node)
            this.node.scrollTop = 0;
    }

    scrollToElement(element)
    {
        let top;
        for (let i = 0; i < this._structure.length; i++)
        {
            let row = this._structure[i];
            if (row.items)
            {
                for (let j = 0; j < row.items.length; j++)
                {
                    let item = row.items[j];
                    if (item.element == element)
                    {
                        top = row.top;
                        break;
                    }
                }
                if (top)
                    break;
            }
        }

        if (top)
        {
            this.node.scrollTop = top;
        }
    }

   
    
    /*************************** overrides ********************/

    onReady()
    {
        super.onReady();

        this.on("scroll", this.onScroll);
        this.on("click", this.onClick);
    }

    onDisplayUpdated()
    {
        this.delay(this._updateDisplay, 500);
    }

    _updateDisplay()
    {
        if (!this._structure)
            this._estimateStructure();

        if (!this._structure || this._structure.totalHeight < this.realHeight)
            this.container.css("height", "100%");
        else
            this.container.css("height", this._structure.totalHeight + this._marginBottom);


        this._calculateVisibleRows();
        this._updateVisibleRenderers();        
    }

    
    //
    onDataUpdated(action)
	{
        if (!this.initialized)
            return;

        /*if (this.filter && action.type != "init")
            this.filter.refresh();*/

        // When new Items are added one per one quickly, it could be very CPU intensive to recalculate everything, and not confortable for user to see all items replaced
        // so this code here allows to update grid every second, and scroll on first element of the wave (we set 5 secondes of each wave)
        if (action.type == "addItem" /*&& action.data.length === undefined*/)
        {
            // we store all new items here, so we can apply special effect when added
            //if (action.items.length > 0)
            //{
                for(let i = 0; i < action.items.length; i++)
                    this._newItems[action.items[i].id] = action.items[i];
            //}
            /*else
                this._newItems[action.data.id] = action.data;*/

            // let's store the first element, so we scroll to this element
            if (!this._newItems.first)
                this._newItems.first = action.items[0];//(action.data.length > 0) ? action.data[0] : action.data;
            
            // let's update grid in one second
            if (!this._newItemsTimer)
                this._newItemsTimer = setTimeout( this._manageNewItemsHandler, action.all ? 0 : 1000);

            this.delay(this._enableScroll, 5000);
        }
        else
        {
            if (action.type == "init")
                this.container.removeAllChild(true);
                
            this.delay(this._update, 50);
        }
            

    }

    onHeaderComponentResized()
    {
        this.container.css({"top" : this._containerTop + (this._headerComponent ? this._headerComponent.viewport.top + (this._headerComponent.component.realHeight ? this._headerComponent.component.realHeight : this._headerComponent.viewport.height) : 0) });
    }

    forceUpdate()
    {
        this.delay(this._update, 50);
    }

    _manageNewItems()
    {
        this._estimateStructure();
        
        if (this._canScroll && this._scrollOnNew && !this._scrollToNewElementDisabled)
        {
            this.scrollToElement( this._newItems.first );
            this._scrollToNewElementDisabled = true;
        }
        else
        {
            this._calculateVisibleRows();
            this._updateVisibleRenderers(false);
        }

        this._newItemsTimer = null;

        if (this.waiting)
        {
            this.waiting.destroy();
            this.waiting = null;
        }
        
    }

    _enableScroll()
    {
        this._scrollToNewElementDisabled = false;
        this._newItems.first = null;
    }
   

    _clearScrollOnNewTimer()
    {
        this._scrollOnNewTimer = null;
    }

    create()
    {
        super.create();

        if (this._headerComponent)
            this.addChild(this._headerComponent.component, this._headerComponent.viewport);

        this.container = new fx.components.Box("container");
        this.addChild(this.container, {top:this._containerTop + (this._headerComponent ? this._headerComponent.viewport.top + this._headerComponent.viewport.height : 0), left : this._containerLeft, width : this._containerWidth, height:this._containerHeight});
    }

    /***************************** PRIVATE *********************/
    _update(scroll)
    {
        if (fx.dom.parent(this.node, ".disabled"))
            return;

        this._estimateStructure();
        this._calculateVisibleRows();
        this._updateVisibleRenderers(false);
    }


    _estimateStructure()
    {
         this._structure = [];
         
         this._previousData = [];
         let data = this.data instanceof fx.ModelArray ? this.data.toArray() : this.data;
         let hasOnlyUnique = this._hasOnlyUnique;//false;//true;//data.hasOnlyUnique();
         let top = 0;
         let totalHeight = 0;
         let newHeight;

         for(let i = 0; i < data.length; i++)
         {
             let element = data[i];
             if (element.deleted)
                continue;

             this._previousData.push( element );
             
             if (element.type == "label")
             {
                element.id = element.id || Utils.newID();
                this._structure.push( { item : {id : element.id , element : element} , height : fx.components.DefaultRenderer.HEIGHT() , top : top} );
                top += Math.floor(fx.components.DefaultRenderer.HEIGHT() );
                totalHeight += fx.components.DefaultRenderer.HEIGHT();
             }
             else
             {
                let row = this._structure[this._structure.length-1];
                 
                let newWidth = this.maxRowHeight * Number(this._elementWidth ? this._elementWidth : element.width) / Number(this._elementHeight ? this._elementHeight : element.height);
                newHeight = this.maxRowHeight;

                if (this._tilesSameSize && this._structure._firstRow)
                    newWidth = this._structure._firstRow.sizes[0];

                // check if last row is items row
                if (!row || !row.items || row.height < this.maxRowHeight * 0.8 || ((this.maxElementsPerRow == "auto" && newWidth > row.remainingWidth) || (row.items.length == this.maxElementsPerRow)))
                {
                    row = {items : [], sizes : [], remainingWidth : this.container.realWidth - this._scrollBarWidth, height : this.maxRowHeight, top : top};
                    top += Math.floor(row.height);
                    totalHeight += row.height;
                    
                    this._structure.push( row );

                    if (!this._structure._firstRow)
                        this._structure._firstRow = row;
                }

                if (newWidth > row.remainingWidth)
                {
                    if (row.items.length == 0)  // Only one item 
                    {
                        newWidth = row.remainingWidth;
                        newHeight = Number(this._elementHeight ? this._elementHeight : element.height) * row.remainingWidth / Number(this._elementWidth ? this._elementWidth : element.width);

                        row.items.push( {id :  (hasOnlyUnique && !row.items.find({id : element.id})) ? element.id : Utils.newID() , element : element} );
                        row.sizes.push(newWidth);

                        row.remainingWidth = 0;

                        top -= Math.floor(row.height);
                        totalHeight -= row.height;
                        row.height = newHeight;
                        top += Math.floor(row.height);
                        totalHeight += row.height;
                    }
                    else // resize other elements height
                    {
                        row.items.push( {id :  (hasOnlyUnique && !row.items.find({id : element.id})) ? element.id : Utils.newID() , element : element} );
                        
                        // calculate first totalWidth
                        let _totalWidth = 0;

                        for (let j = 0; j < row.items.length; j++)
                            _totalWidth += ( row.height * Number(this._elementWidth ? this._elementWidth : row.items[j].element.width) / Number(this._elementHeight ? this._elementHeight : row.items[j].element.height) );

                        newHeight = (this.container.realWidth - this._scrollBarWidth) * row.height / _totalWidth;

                        // calculate with for each element
                        for (let j = 0; j < row.items.length; j++)
                            row.sizes[j] = ( row.height * Number(this._elementWidth ? this._elementWidth : row.items[j].element.width) / Number(this._elementHeight ? this._elementHeight : row.items[j].element.height) ) / _totalWidth * (this.container.realWidth - this._scrollBarWidth);
                     
                        row.remainingWidth = 0;
                        top -= Math.floor(row.height);
                        totalHeight -= row.height;
                        row.height = newHeight;
                        top += Math.floor(row.height);
                        totalHeight += row.height;

                        
                    }
                }
                else
                {
                    row.items.push( {id : (hasOnlyUnique && !row.items.find({id : element.id}))  ? element.id : Utils.newID() , element : element} );
                    row.sizes.push(newWidth);

                    top -= Math.floor(row.height);
                    totalHeight -= row.height;
                    row.height = newHeight;
                    top += Math.floor(row.height);
                    totalHeight += row.height;
                    row.remainingWidth = row.remainingWidth - newWidth;
                }
                
             }

             
         }

        //calculate total height
        this._structure.totalHeight = totalHeight;

        this._canScroll = this._structure.totalHeight > this.realHeight;

        if (this._canScroll)
            this.container.css("height", this._structure.totalHeight + this._marginBottom);
        else
            this.container.css("height", "100%");
    }


    _calculateVisibleRows()
    {
        if (!this._structure) return;

        this._visibleRows = { rows : [], items : []};
        let offset = this._headerComponent ? this._headerComponent.viewport.height + this._headerComponent.viewport.top : 0;
        let bottom = offset;
        for (let i = 0; i < this._structure.length; i++)
        {
            let row = this._structure[i];
            
            if (row.top + offset >= (this.node.scrollTop - this.maxRowHeight ) && row.top + offset <= this.node.scrollTop  + this.node.clientHeight +  this.maxRowHeight  )
            {
                this._visibleRows.rows.push( row );
                this._visibleRows.items = this._visibleRows.items.concat( row.item ? row.item : row.items);
            }
            
            bottom += row.height;
        }

        let vscrollBarVisible = (this.node.scrollHeight > this.node.clientHeight);
        
        if ( vscrollBarVisible && this.data.more && this.node.scrollTop + this.node.clientHeight >= (Math.floor(bottom) - 100) && !this.waiting)
        {
            this.trigger("more");

            if (!this.waiting)
            {
                if (fx.assets.loader)
                    this.waiting = new fx.components.Image({data : fx.assets.loader, className : "waiting"});
                else
                    this.waiting = new fx.components.Text({text : "Chargement ...", className : "waiting"});

                this.addChild( this.waiting, {top : bottom, left : 0, height : 50, width:"100%"});
            }
        }
    }


    _updateVisibleRenderers(scroll)
    {
        if (!this._visibleRows) return;
        
        let childs = this.container.getChilds();
        let toRemove = [];
        let currentRenderers = {};

       // supprimer ceux qui ne sont pas visibles
       for (let i = 0; i < childs.length; i++)
       {
            let child = childs[i];
            if ( !this._visibleRows.items.find({id : child.dataid}) )
                toRemove.push( child );
            else
                currentRenderers[child.dataid] = child;    
       }

       while (toRemove.length > 0)
            this._removeChild(toRemove.pop(), scroll);
           
       
       // ajouter les nouveaux
       for (let i = 0; i < this._visibleRows.items.length; i++)
       {
            let item = this._visibleRows.items[i];
            if (!currentRenderers[item.id])
            {
                let child, renderer;

                if (this._renderers && item.element)
                    renderer = this._renderers[Object.getPrototypeOf(item.element).constructor.name];
                
                if (!renderer)
                    renderer = fx.components.DefaultRenderer;

                child = new renderer( item.element );
                child.dataid = item.id;
                child.addClass("Renderer");
                
                if (this._scrollToNewElementDisabled)
                {
                    if (this._newItems[item.element.id])
                    {
                        child.effect = this.newChildEffect;// this.childEffect;
                        delete this._newItems[item.element.id];
                    }
                    else
                        child.effect = "";
                }
                else
                if (scroll)
                    child.effect = "";
                else
                {
                    if (child instanceof fx.components.DefaultRenderer)
                        child.effect = "";
                    else
                        child.effect = this.childEffect;
                } 
                
                this._addChild( child );
                currentRenderers[item.id] = child;
            }
            else
                currentRenderers[item.id].effect = "";
       }

       // position && effect on new items
       for (let i = 0; i < this._visibleRows.rows.length; i++)
       {
            let row = this._visibleRows.rows[i];
            if (row.item)
            {
                currentRenderers[row.item.id].viewport( {width : "100%", height: row.height, top : row.top, left : 0} );
            }
            else
            {
                let left = 0;
                for (let j = 0; j < row.items.length; j++)
                {
                    let item = row.items[j];
                    currentRenderers[item.id].viewport( {width : row.sizes[j], height: row.height, top : row.top, left : left} );
                    left += Math.floor(row.sizes[j]);
                }
            }
       }
       
   
    }


    _addChild(child)
    {
        this.container.addChild( child );
    }

    _removeChild(child, scoll)
    {
        if (scoll)
            child.destroy();
        else
            child.hideDestroy();
    }


    // We override this function, so grid is updated even when a component is updated and not only when list of components is updated
    /*_dataUpdated(e)
	{
	    this.onDataUpdated(e.action);
	}*/
    
    /********************* Events ********************/

    onScroll(e)
    {
        if (this.globalyVisible)
            this._onScroll();
    }

    _onScroll()
    {
        this._calculateVisibleRows();
        this._updateVisibleRenderers(true);
    }


    onClick(e)
    {
        let found = null;
        for (let prop in this._renderers)
        {
            let renderer = this._renderers[prop];
            let elt = fx.dom.parent(e.target, "." + renderer.name)
            if (elt)
            {
                found = elt;
                break;
            }
        }

        if (found)
        {
            let component = this.data.find({id : found.getAttribute("data-id")});   
            this.trigger("selected", component);
        }
    }
});