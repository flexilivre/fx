/*
fx.ns("fx.components", class HScrollableContent extends fx.Component {

    constructor(data) 
    {
        super(data);
    }


    onReady()
    {
        super.onReady();

        this.on("scroll", this.onScroll);
    }

    onScroll(e)
    {
        this.trigger("scrollChanged");
    }

    get scrollWidth()
    {
        return this.node ? this.node.scrollWidth : this.realWidth;
    }

    get scrollLeft()
    {
        return this.node ? this.node.scrollLeft : 0;
    }

    set scrollLeft(val)
    {
        if (this.node)
            this.node.scrollLeft = val;
    }
  
    scroll(position, animated)
    {
        if (position == this.node.scrollLeft)
            return;

        if (animated)
        {
            fx.dom.stop(this.node, true, false);
            fx.dom.animate(this.node, {scrollLeft : position}, 250);     
        }
        else
            this.node.scrollLeft = position;
            
    }

    moveChildBefore( child1, child2 )
	{
        let index = this._childs.indexOf( child1 );
        this._childs.splice(index, 1);
        index = this._childs.indexOf( child2 );
        this._childs.splice(index, 0, child1);
	
		this.node.insertBefore( child1.node, child2.node);
	}

	moveChildAfter(child1, child2) 
	{
        let index = this._childs.indexOf( child1 );
        this._childs.splice(index, 1);
        index = this._childs.indexOf( child2 );
        index++;
        this._childs.splice(index, 0, child1);

		this.node.insertBefore( child1.node, child2.node.nextSibling);

	}

});
*/