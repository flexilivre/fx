fx.ns("fx.components", class ColorPickerButton extends fx.components.HBox {

    constructor(parameters)
    {
        super();

        this.label = parameters ? parameters.label : null; 
        this.lastColor = ( parameters && parameters.lastColor ) ? parameters.lastColor : "#000";
        this.lastColors =  ( parameters && parameters.lastColors ) ? parameters.lastColors : ["#000000", "#7F7F7F", "#727272", "#515151", "#303030", "#0F0F0F"];
        this._showOpacity = parameters ? parameters.showOpacity : false; 
        this.direction = parameters ? parameters.direction : "bottom"; 
    }


    get currentColor()
    {
        if (this.colorPicker)
            return this.colorPicker.currentColor;

        return null;
    }

    set currentColor(val)
    {
        if (this.colorPicker)
            this.colorPicker.currentColor = val;
    }

    onReady()
    {
        super.onReady();

        this.on("click", this.onClick, window);
        this.on("selected", this.onSelected, this.colorPicker);

        this.updateButtonColor();
    }

    create()
    {
        super.create();

        if (this.label)
        {
            this.labelText = new fx.components.Text( {text : this.label, className : "label"} )
            this.addChild(this.labelText, {width:"auto", height : 30});
        }

        this.colorbox = new fx.components.Image({data : fx.get("assets").paletteIcon, className :"colorbox"} );
        //this.colorbox = new fx.components.Box("colorbox");
        this.addChild(this.colorbox, {width : 30, height : 30});

        this.colorPicker = new fx.components.ColorPicker({lastColors:this.lastColors, currentColor : this.lastColor, showOpacity : this._showOpacity});
        this.colorPicker.visibleAtStart = false;
        this.colorPicker.effect = (this.direction =="bottom") ? "vslide" : "fade";
        this.addChild(this.colorPicker, {top : this.direction =="bottom" ? 4 : -254, left : 2/*, width : 315, height:200*/});
        
    }

    selectionChanged()
    {
        //this.css(this.colorIcon, {fill : this.component[this.command.field] } );  
    }

    destroy()
    {
        super.destroy();
        
        this.colorPicker = null;
    }

    onClick(e)
    {
        if (!this.visible)
            return;

        let colorbox = fx.dom.parent(e.target, ".colorbox");
        let colorPicker = fx.dom.parent(e.target, ".ColorPicker");
        if (colorbox == this.colorbox.node)
        {
            if (this.colorPicker.visible)
                this.colorPicker.hide();
            else
                this.colorPicker.show();
        }
        else
        if (this.colorPicker.visible && colorPicker != this.colorPicker.node && e.target.parentNode)
            this.colorPicker.hide();

       
    }


    onSelected(event)
    {
        this.updateButtonColor(event.detail);
    }

    updateButtonColor(color)
    {
        this.lastColor = color || this.lastColor;
        
        //this.colorbox.css("background-color", this.lastColor);

        this.trigger("color", this.lastColor);
    }


});