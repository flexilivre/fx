fx.ns("fx.components", class Scrollable extends fx.Component 
{
    /**
     * Constructor
     * @param {*} data 
     * @param {*} direction : "horizontal" / "vertical"
     * @param {*} type : "absolute" / "relative" . if content of scrollable if composed of absolute positionned elements, scroll configuration is not the same
     */
    constructor(data, direction, type) 
    {
        super(data);

        this._childsToAdd = [];
        this._scrollDirection = ( (typeof data == "string") ? data : direction) || "vertical";
        this._scrollType = ((typeof data == "string" ) ? direction : type) || "absolute"; 
    }

    get scrollHeight()
    {
        return this.scrollableContent ? this.scrollableContent.scrollHeight : this.realHeight;
    }
  
    get canScrollTop()
    {
        return this.scrollPosition > 0;
    }

    get canScrollBottom()
    {
        return this.scrollPosition < this.scrollHeight;
    }


    get scrollWidth()
    {
        return this.scrollableContent ? this.scrollableContent.scrollWidth : this.realWidth;
    }

    get scrollTop()
    {
        return this.scrollableContent ? this.scrollableContent.scrollTop : 0;
    }

    set scrollTop(val)
    {
        if (this.scrollableContent)
            this.scrollableContent.scrollTop = val;
    }

    get scrollLeft()
    {
        return this.scrollableContent ? this.scrollableContent.scrollLeft : 0;
    }

    set scrollLeft(val)
    {
        if (this.scrollableContent)
            this.scrollableContent.scrollLeft = val;
    }

  
    get canScrollLeft()
    {
        return this.scrollPosition > 0;
    }

    get canScrollRight()
    {
        return this.scrollPosition < this.scrollWidth;
    }

    get scrollPosition()
    {
        return this.scrollableContent ? this.scrollableContent.scrollPosition : 0;
    }

    
    get scrollDirection()
    {
        return this._scrollDirection;
    }

    set scrollDirection(val)
    {
        this._scrollDirection = val;
        
        if (this.initialized)
            this.scrollableContent.scrollDirection = this.scrollDirection;
    }

    

    onReady() 
    {
        super.onReady();

        this.on("scrollChanged", this.onScrollChanged, this.scrollableContent );     
           
        this._initScroll();

    }

     
    create() 
    {
        super.create();

        this.scrollableContent = new fx.components.ScrollableContent(this.scrollDirection, this._scrollType);

        super.addChild(this.scrollableContent, {top:0, left:0, width: (this._scrollType == "absolute") ? "100%" : "max-content", height:"100%"});

        for(let i = 0; i < this._childsToAdd.length; i++)
            this.scrollableContent.addChild(this._childsToAdd[i].child, this._childsToAdd[i].viewport, this._childsToAdd[i].effect, this._childsToAdd[i].position);
    }

    addChild(child, viewport, effect, position)
    {
        if (!this.scrollableContent)
             this._childsToAdd.push({child:child, viewport:viewport, effect:effect, position:position})
        else
            this.scrollableContent.addChild(child, viewport, effect, position);
    }

    
    removeChild(child, destroy)
    {
        if (this.scrollableContent)
            this.scrollableContent.removeChild(child, destroy);
    }

    removeAllChild(destroy)
    {
        if (this.scrollableContent)
            this.scrollableContent.removeAllChild(destroy);
    }

    moveChildBefore( child1, child2 )
	{
        if (this.scrollableContent)
        this.scrollableContent.moveChildBefore( child1, child2 );
	}

	moveChildAfter(child1, child2) 
	{
        if (this.scrollableContent)
        this.scrollableContent.moveChildAfter( child1, child2 );
	}

    getChild(id)
    {
        if (this.scrollableContent)
            return this.scrollableContent.getChild(id);
    }

    getChilds()
    {
        if (this.scrollableContent)
            return this.scrollableContent.getChilds();
        else
            return [];
    }

    scroll(position, animate, direction)
    {
        if (this.scrollableContent)
            this.scrollableContent.scroll(position, animate, direction);
    }

    scrollToBottom(animate)
    {
        this.scrollableContent.scroll(this.scrollHeight, animate, "vertical");
    }

    scrollToTop(animate)
    {
        this.scrollableContent.scroll(0, animate, "vertical");
    }

    showScroll(val)
    {
        let cssProp = this.scrollDirection == "horizontal" ? "overflow-x" : "overflow-y";
        let scrollObject = (this._scrollType == "absolute") ? this.scrollableContent : this;
        
        if (val)
            scrollObject.css(cssProp, "scroll");
        else
            scrollObject.css(cssProp, "hidden");        
    }

    _initScroll()
    {
        if (this._scrollType == "relative")
        {
            let cssProp = (this.scrollDirection == "horizontal") ? "overflow-x" : "overflow-y";
            this.css(cssProp, "auto");

            if (this.scrollDirection == "horizontal" && this.scrollableContent.realWidth < this.realWidth)
                this.scrollableContent.left("center");
        }        
    }

    onScrollChanged(e)
    {
        this.trigger("scrollChanged");
    }
    
    destroy()
    {    
        super.destroy();
        this._childsToAdd = null;
    }
});