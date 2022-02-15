fx.ns("fx.components", class HBox extends fx.components.Box {

    constructor(data){
        super(data);
        this.align = (data && data.align) ? data.align : "left";

        this.dom = fx.get("dom");
    }

    onReady()
    {
        super.onReady();
        this.updateDisplay();
    }

    resize(){
        super.resize(true);

        let childs = this.getChilds();
        let viewport = this.viewport();
        
        if (!viewport.height) // --> highest child
        {
            let maxHeight = 0;
            for (let index = 0; index < childs.length; index++)
            {
                childs[index].resize();   
                let height = childs[index].realHeight;
                if (height > maxHeight)
                    maxHeight = height;
            }

            this.css({height : maxHeight} );
        }

        if (!viewport.width) // --> 100%
        {
            //this.width("100%");
            this.css({width : "100%"} );
        }

        this.css("text-align" , this.align);
   
    }

    position() {
        super.position(true);

        // each child should be alignated to left
        let childs = this.getChilds();
        for (let index = 0; index < childs.length; index++)
        {
            if (childs[index].initialized)
            {
                this.css(childs[index].node, {position:"relative", display: (childs[index].node.style["display"] == "none" ? "none" : "inline-block") /*, float : this.align*/});
            }
        }

        
    }
});