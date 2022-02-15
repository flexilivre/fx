fx.ns("fx.components", class ScrollableContent extends fx.Component {

    constructor(direction, type) 
    {
        super();

        this.scrollDirection = direction;
        this.scrollType = type || "absolute";
    }

    onReady()
    {
        super.onReady();

        this.on("scroll", this.onScroll);

        this._updateDirection();
    }

    onScroll(e)
    {
        this.trigger("scrollChanged");
    }

    get scrollHeight()
    {
        return this.node ? this.node.scrollHeight : this.realHeight;
    }

    get scrollTop()
    {
        return this.node ? this.node.scrollTop : 0;
    }

    set scrollTop(val)
    {
        if (this.node)
            this.node.scrollTop = val;
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


    get scrollPosition()
    {
        return this.scrollDirection == "vertical" ? this.scrollTop : this.scrollLeft;
    }

    get scrollDirection()
    {
        return this._scrollDirection;
    }

    set scrollDirection(val)
    {
        this._scrollDirection = val;
     
        this._updateDirection();
    }

    _updateDirection()
    {
        if (!this.initialized)
            return;

        if (this.scrollType == "absolute")
        {
            if (this.scrollDirection == "vertical")
            {
                this.css("overflow-y", "scroll");
                this.css("overflow-x", "hidden");
            }
            else
            if (this.scrollDirection == "horizontal")
            {
                this.css("overflow-x", "scroll");
                this.css("overflow-y", "hidden");
            }
            else
            {
                this.css("overflow-y", "hidden");
                this.css("overflow-x", "hidden");
            }
        }
    }
    
  
    scroll(position, animated, direction)
    {
        let newPosition = (typeof position == "string") ? (this.scrollPosition + parseInt(position)) : position;

        direction = direction || this.scrollDirection;

        if (!direction) return;
        
        let property = (direction == "vertical") ? "scrollTop" : "scrollLeft";
        
        if (newPosition == this.node[property])
            return;
        
        if (animated)
        {
            if (fx.browser.isSafari && fx.browser.isTouchDevice)
            {
                this._SmoothHorizontalScrolling(this.node, newPosition, 250, property);
                return;
            }
            else
                this.css("scroll-behavior", "smooth");
        }
        else
            this.css("scroll-behavior", "auto");
            
       this.node[property] = newPosition;    
    }

    // Safari doesn't handle "scroll-behavior" : "smooth", so need javascript below to handle it
    _SmoothHorizontalScrolling(element, pos, time, property) {
        let currentPos = element[property],
            start = null;

        if(time == null) time = 500;

        pos = +pos, time = +time;

        window.requestAnimationFrame(function step(currentTime) 
        {
            start = !start ? currentTime : start;

            let progress = currentTime - start,
                progressivePos;

            if (currentPos < pos) 
            {
                progressivePos = ((pos - currentPos) * progress / time) + currentPos;
            } 
            else 
            {
                progressivePos = currentPos - ((currentPos - pos) * progress / time);                
            }

            if (property == "scrollTop")
                element.scrollTo(0,progressivePos);
            else
                element.scrollTo(progressivePos, 0);
            

            if (progress < time) 
            {
                window.requestAnimationFrame(step);
            } 
            else 
            {
                if (property == "scrollTop")
                    element.scrollTo(0, pos);
                else
                    element.scrollTo(pos, 0);
            }
        });
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
