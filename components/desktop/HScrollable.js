/*fx.ns("fx.components", class HScrollable extends fx.Component 
{
    constructor(data) 
    {
        super(data);

        this._childsToAdd = [];
    }

    get scrollWidth()
    {
        return this.scrollableContent ? this.scrollableContent.scrollHeight : this.realHeight;
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
        return this.scrollableContent.scrollLeft;
    }


    onReady() 
    {
        super.onReady();

        this.on("scrollChanged", this.onScrollChanged, this.scrollableContent );

        if (this._childsToAdd.length > 0)
            for (let i = 0; i < this._childsToAdd.length; i++)
                this.addChild(this._childsToAdd[i].child, this._childsToAdd[i].viewport, this._childsToAdd[i].effect, this._childsToAdd[i].position);
    }

     
    create() 
    {
        super.create();

        this.scrollableContent = new fx.components.HScrollableContent();

        super.addChild(this.scrollableContent, {top:0, left:0, width:"max-content", height:"100%"});      
    }

    
    addChild(child, viewport, effect, position){
        if (this.scrollableContent)
            this.scrollableContent.addChild(child, viewport, effect, position);
        else
            this._childsToAdd.push({child : child, viewport : viewport, effect : effect, position : position});
    }

    removeChild(child){
        this.scrollableContent.removeChild(child);
    }

    removeAllChild(destroy){
        this.scrollableContent.removeAllChild(destroy);
    }

    moveChildBefore( child1, child2 )
	{
        this.scrollableContent.moveChildBefore( child1, child2 );
	}

	moveChildAfter(child1, child2) 
	{
        this.scrollableContent.moveChildAfter( child1, child2 );
	}

    getChilds(){
        return this.scrollableContent.getChilds();
    }

    scroll(position, animate)
    {
        let newPosition;
        if (typeof position == "string")
            newPosition = this.scrollPosition + parseInt(position);
        else
            newPosition = position;

        this.scrollableContent.scroll(newPosition, animate);
    }

    showScroll(val)
    {
        if (val)
            this.scrollableContent.css("overflow-x", "scroll");
        else
            this.scrollableContent.css("overflow-x", "hidden");        
    }


    onScrollChanged(e)
    {
        this.trigger("scrollChanged");
    }
    
    destroy(){
        
        super.destroy();
        
    }
});*/