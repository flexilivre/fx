fx.ns("fx.components", class Popup extends fx.Component{

    constructor(data)
    {
        super(data|| fx.get("model") );
        this.effect = "scale";

        this.destroyHandler = this.destroy.bind(this);

        this._showClose = true;
        this._modal = true;
        this._options = {modal : true, top:0, left : 0, width : "100%", height:"100%", leftArrow : false};

        this._showSpeed = 0.4;
        this._defaultTimeout = 10;
    }


    /******************************** Parameters *****************************/

    get options()
    {
        return this._options;
    }

    set options(val)
    {
        if (val === undefined)
            return;

        for(let property in this._options)
        {
            if (val[property] !== undefined)
                this._options[property] = val[property];
        }
    }

    get modal()
    {
        return this._options.modal;
    }

    set modal(val)
    {
        this._options.modal = val;
    }

    get showClose()
    {
        return this._showClose && !this.partial;
    }

    set showClose(val)
    {
        this._showClose = val;
        if (this.initialized)
            this._addClose();
    }

    get contentWidth()
    {
        return this._contentWidth;
    }

    set contentWidth(val)
    {
        this._contentWidth = val;

        if (this.initialized)
        {
            this._contentContainer.width(val);
            this.updateDisplay();
        }
    }

    get contentHeight()
    {
        return this._contentHeight;
    }

    set contentHeight(val)
    {
        this._contentHeight = val;

        if (this.initialized)
        {
            this._contentContainer.height(val);
            this.updateDisplay();
        }
    }


    get contentContainer()
    {
        return this._contentContainer;
    }

    get partial()
    {
        return this._partial;
    }

    set partial(val)
    {
        this._partial = val;
    }

    /******************************** Actions *****************************/

    close()
    {
        if (this._contentContainer)
        {
            if (!this.partial)
                this._contentContainer.addClass("up");

            this.hide( this.destroyHandler)
        }

        this.trigger("closed");
    }

    /******************************** Overrides *****************************/

    onReady()
    {
        super.onReady();

        this.on("click", this.onClick);
    }

    onClose(clickedOutSide)
    {
        this.close()
    }
    

    create()
    {
        super.create();

        if (this.modal)
        {
            this.overlay = new fx.components.Box("overlay");
            super.addChild(this.overlay, {width:"100%", height:"100%", top:0, left:0});
        }

        
        this._contentContainer = new fx.components.Box("content");
        super.addChild(this._contentContainer, {width: "100%", height: this.partial ? "fill" : "100%", top: this.partial ? 50 : 0, left:0});

        if (this.partial)
        {
            this.effect = "";
            this.addClass("partial");
        }
        else
            this.addClass("full");
        
        if (this.options.leftArrow)
            //this._contentContainer.addChild(new fx.components.Box("leftArrow"), {width:0, height:0, top:"center", left:-10});
            super.addChild(new fx.components.Box("leftArrow"), {width:0, height:0, top:"center", left:-10});


        this._addClose();


    }

    _addClose()
    {
        if (this.showClose)
        {
            if (!this.closeBtn)
            {
                this.closeBtn = new fx.components.IconButton({icon:fx.assets.ExitIcon, className : "close", filled : false});
                //this._contentContainer.addChild(this.closeBtn, {width:30, height:30, right:5, top : 5});
                super.addChild(this.closeBtn, {width:30, height:30, right:10, top : 10});
            }
        }
        else
        {
            if (this.closeBtn)
            {
                this.removeChild( this.closeBtn );
                this.closeBtn = null;
            }
        }
    }

    addChild(child, viewport)
    {
        this._contentContainer.addChild(child, viewport);
    }

    removeChild(child)
    {
        this._contentContainer.removeChild(child);
    }



    destroy()
    {
        super.destroy();

        this.destroyHandler = null;
        
    }


    /******************************** Events *****************************/

    onClick(e)
    {
        //e.target.parentNode : Fix for a strange bug occuring on ColorPicker throwing an event with event.target containing a div.color with no parent
        if ( e.target.parentNode && ( !fx.dom.parent(e.target, this._contentContainer) || fx.dom.parent(e.target, this.closeBtn) ))
            this.onClose(true)
       
    }


    show(callback)
    {
        if (!this.partial)
        {
            super.show(callback);
            return;
        }

        
        this._showCallback = callback;

        this.updateDisplay();
        this.animating = true;
        this._visible = true;

        this.css({"visibility" : "visible", display:"block", opacity : 1});

        this.overlay.css({transition : "all " + this._showSpeed + "s", "opacity" : 1});
        this.contentContainer.css({"transition" : "none", transform : "translate(0px," + fx.graphics.screenSize().height + "px)"});

        this.delay( this._show1, this._defaultTimeout);
    }

    _show1()
    {
        this.contentContainer.css({transition : "all " + this._showSpeed + "s ", "transform" : "translate(0px,0px)"});

        this.delay( this._show2, this._showSpeed * 1000);
    }

    _show2()
    {
        this.animating = false;

        if (typeof this._showCallback == "function")
            this._showCallback();

        if (!this.enabled)
            this.enable();
           
		if (this.data &&  this.data instanceof fx.ModelArray)
           this.data.refresh();

        this._showCallback = null;
    }

    hide(callback)
    {
        if (!this.partial)
        {
            super.hide(callback);
            return;
        }

        this._hideCallback = callback;
        this.animating = true;
        this._visible = false;

        this.overlay.css({transition : "all " + this._showSpeed + "s", "opacity" : 0});
        this.contentContainer.css({"transition" : "none", transform : "translate(0px,0px)"});

        this.delay( this._hide1, this._defaultTimeout);
    }

    _hide1()
    {
        this.contentContainer.css( {transition : "all " + this._showSpeed + "s ", "transform" : "translate(0px," + fx.graphics.screenSize().height + "px)"});

        this.delay( this._hide2, this._showSpeed * 1000);

    }

    _hide2()
    {
        if (!this.contentContainer) return;

        this.css({"visibility" : "visible", display:"block"});
        this.contentContainer.css( {"transition" : "none"});
        this.animating = false;

        if (typeof this._hideCallback == "function")
            this._hideCallback();

        if (this.enabled)
			this.disable();

        this._hideCallback = null;
    }


    
  
});
