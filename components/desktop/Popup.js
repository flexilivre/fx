fx.ns("fx.components", class Popup extends fx.Component{

    constructor(data)
    {
        super(data || fx.get("model") );
        this.effect = "fade";

        this.destroyHandler = this.destroy.bind(this);

        this._contentWidth = 500;
        this._contentHeight = 500;
        this._showClose = false;
        this.closeOnClickBehind = true;
        this._modal = true;
        this._options = {modal : true, top:"center", left : "center", leftArrow : false};

        this._closeOnClickBehindActive = false;
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
        return this._showClose;
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

    /******************************** Actions *****************************/

    close()
    {
        if (this._contentContainer)
        {
            this._contentContainer.addClass("up");
            this.hide( this.destroyHandler);
        }

        this.trigger("closed");
    }

    /******************************** Overrides *****************************/

    onReady()
    {
        super.onReady();

        //this.on("click", this.onClick);
        this.on("mousedown", this.onClick);
        this.on("ESCAPE", this.onClose, fx.keyboard);

        this.delay( this._setCloseOnClickBehindActive, 500);
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
        super.addChild(this._contentContainer, {width: this._contentWidth, height: this._contentHeight, top: this.options.top, left:this.options.left});

        if (this.options.leftArrow)
            this._contentContainer.addChild(new fx.components.Box("leftArrow"), {width:0, height:0, top:"center", left:-10});

        
        this._addClose();
    }

    _addClose()
    {
        if (!this.closeBtn && this.showClose)
        {
            this.closeBtn = new fx.components.IconButton({icon:fx.assets.ExitIcon, className : "close", filled : false});
            this._contentContainer.addChild(this.closeBtn, {width:30, height:30, right:10, top : 10});
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



    loading(val, text, style)
	{
		if (val)
        {
			if (this._loading)
				return;

			if (!this._loaderComponent)
			{
				if (fx.assets.loader)
				{
					this._loaderComponent = new fx.components.Box();

					if (text)
					{
						this._loaderComponent = new fx.components.Box();
						let vbox = new fx.components.VBox({className:"inner"});
						vbox.addChild(new fx.components.Image(fx.assets.loader), {width : 50, height : 50});
						vbox.addChild(new fx.components.Text(text) );
						this._loaderComponent.addChild(vbox, {width:"100%", height:80, top:"center", left:"center"});
					}
					else
					{
						this._loaderComponent.addChild(new fx.components.Image(fx.assets.loader), {width:50, height:50, top:"center", left:"center"} );
					}
						
				}
				else
					this._loaderComponent.addChild(new fx.components.Text(text ? text : "Chargement..."), {width:50, height:50, top:"center", left:"center"} );
					
				this.addClass("__loading");
				this._loaderComponent.addClass("loading");
				if (style)
					this._loaderComponent.addClass(style);
			}
                
			this._contentContainer.addClass("_loading");
			
            super.addChild(this._loaderComponent, {width:200, height:200, top : "center", left : "center"});
        }
        else
        {
			if (!this._loading)
				return;

			this._contentContainer.removeClass("_loading");
					
			this.delay(this._removeLoading, 1000);

            if (this._loaderComponent)
                super.removeChild(this._loaderComponent);
				
			this._loaderComponent.destroy();
			this._loaderComponent = null;
		}
		
		this._loading = val;

		this._updateLoadingScale();
	}


    /******************************** Events *****************************/

    onClick(e)
    {
        if (!this._closeOnClickBehindActive || !this.closeOnClickBehind) return;

        //e.target.parentNode : Fix for a strange bug occuring on ColorPicker throwing an event with event.target containing a div.color with no parent
        if ( e.target.parentNode && ( !fx.dom.parent(e.target, this._contentContainer) || fx.dom.parent(e.target, this.closeBtn) ))
            this.onClose(true);
       
    }

    onClose(clickedOutSide)
    {
        this.close()
    }

    // ---- privates

    _setCloseOnClickBehindActive()
    {
        this._closeOnClickBehindActive = true;
    }

  
});
