fx.ns("fx.components", class VScrollBar extends fx.Component {

    constructor(data) 
    {
        super(data);

    }

    onReady() 
    {
        super.onReady();
        
        this.on("mousedown", this.onMouseDown, window);
        this.on("mousemove", this.onMouseMove, window);
        this.on("mouseup", this.onMouseUp, window);
        this.on("blur", this.onMouseUp, window);
    }

    scrollPosition(val, animate, noevent)
    {
        if (val)
        {
            if (!this.thumb)
                return;

            this.thumb._viewport.top = Math.min(Math.max(val, 0), this.realHeight - this.thumb.realHeight);
            
            if (animate !== false)
                this.thumb.addClass("animated");

            this.thumb.css({top: this.thumb._viewport.top });
            
            if (!noevent)
                this.trigger("moved", {position:this.thumb._viewport.top, animated : animate !== false});

            
        }
        else
            return this.thumb ? this.thumb._viewport.top : 0;
    }

    create()
    {
        super.create();

        this.thumb = new fx.components.Box("thumb");
        this.addChild( this.thumb, {top:0, left:0, width:"100%", height:0})
    }

    /*refresh(height) {
        this.thumb.viewport({height:height, width:"100%", top: this.scrollPosition(), left : 0});
    }*/

   

    onMouseDown(event) 
    {
        if (event.target == this.node)
        {
            let top = event.pageY - this.thumb.realHeight/2;
            this.thumb._viewport.top = Math.min(Math.max(top, 0), this.realHeight - this.thumb.realHeight);

            this.thumb.addClass("animated");
            this.thumb.css({top: this.thumb._viewport.top });

            event.stopImmediatePropagation();
    
            this.trigger("moved", {position:this.thumb._viewport.top, animated : true});
            
        }
        else
        if (event.target != this.thumb.node)
            return;

        this.mouseDown = true;
        this.mouseUp = false;
        this.mouseMove = false;
        this.offset = event.pageY - this.thumb._viewport.top;
    }

    onMouseMove(event) {

        if (this.mouseDown)
        {
            this.mouseDown = false;
            this.mouseUp = false;
            this.mouseMove = true;
        }
        else
        {
            if (event.target == this.thumb.node || event.target == this.node)
                event.stopImmediatePropagation();
        }

        if (!this.mouseMove) return;

        let top = event.pageY - this.offset;

        this.thumb._viewport.top = Math.min(Math.max(top, 0), this.realHeight - this.thumb.realHeight);
        
        this.thumb.removeClass("animated");
        this.thumb.css({top: this.thumb._viewport.top });

        event.stopImmediatePropagation();

        this.trigger("moved", {position:this.thumb._viewport.top, animated : false});
    }

    onMouseUp(event) {
        this.mouseDown = false;
        this.mouseUp = true;
        this.mouseMove = false;
    }
    
});