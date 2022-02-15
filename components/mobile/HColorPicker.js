fx.ns("fx.components", class HColorPicker extends fx.Component {

    constructor(parameters)
    {
        super();

        this.BOX_COLOR_HEIGHT = 25;
        this.BOX_COLOR_WIDTH = 25;

        this.defaultColorsVisible = true;

        this._lastColors = (parameters && parameters.lastColors) ? parameters.lastColors : ["#000"];
        this._currentColor = (parameters && parameters.currentColor) ? parameters.currentColor : (this._lastColors.length > 0 ? this._lastColors[this._lastColors.length - 1] : "ffffff");
        this._showOpacity = (parameters && parameters.showOpacity) ? parameters.showOpacity : false;

        this._pickerColor = "#000";

        this._opacity = 0;
        
        this._defaultColors = [  "#FFFFFF", "#F2F2F2", "#D8D8D8", "#BFBFBF", "#A5A5A5", "#7F7F7F",
                                "#000000", "#7F7F7F", "#727272", "#515151", "#303030", "#0F0F0F",
                                "#FF0000", "#FFCCCC", "#FF9999", "#FF6666", "#BF0000", "#7F0000",
                                "#FF8800", "#FFE7CC", "#FFCF99", "#FFB766", "#BF6600", "#7F4400",
                                "#8B4513", "#E7D9CF", "#D0B4A0", "#B98F71", "#68330E", "#452209",
                                "#FFFF00", "#FFFFCC", "#FFFF99", "#FFFF66", "#BFBF00", "#7F7F00",
                                "#008000", "#CCE5CC", "#99CC99", "#66B266", "#006000", "#004000",
                                "#0000FF", "#CCCCFF", "#9999FF", "#6666FF", "#0000BF", "#00007F",
                                "#8800FF", "#E7CCFF", "#CF99FF", "#B766FF", "#6600BF", "#44007F",
                                "#FF69B4", "#FFE1F0", "#FFC3E1", "#FFA5D2", "#BF4E87", "#7F345A",
                                "#008080", "#CCE5E5", "#99CCCC", "#66B2B2", "#006060", "#004040",
                                "#00FF00", "#CCFFCC", "#99FF99", "#66FF66", "#00BF00", "#007F00"  ];
    }

    updateLastColors()
    {
        if (this.recentContainer)
        {
            this.recentContainer.css("display", this._lastColors.length > 0 ? "inline-block" : "none" );
            this.setColors(this.lastColorsContainer, this._lastColors, 7);
        }
    }

    get lastColors()
    {
        return this._lastColors;
    }

    set lastColors(val)
    {
        this._lastColors = val;
    }

    get defaultColors()
    {
        return this._defaultColors;
    }

    set defaultColors(val)
    {
        this._defaultColors = val;
    }

    get currentColor()
    {
        return this._currentColor;
    }

    set currentColor(val)
    {
        let color = tinycolor(val);

        this._currentColor = color.toRgbString();

        color = color.setAlpha(1 - this._opacity).toRgbString();

        this.trigger("selected", color);

        this.updateLastColors();
    }

    get pickerColor()
    {
        if (!this._pickerColor)
            this._pickerColor = this.currentColor;

        return this._pickerColor;
    }

    set pickerColor(val)
    {
        this._pickerColor = tinycolor(val).toRgbString();
        this.updateDisplayColor();
    }


    get opacityLabel()
    {
        return this.opacityValue + "%";
    }

    get opacityValue()
    {
        return parseInt((1 - this._opacity) * 100);
    }


    create()
    {
        super.create();

        let hbox = new fx.components.HBox();

        /*this.colorbox = new fx.components.Image({data : fx.get("assets").paletteIcon, className :"colorbox"} );
        hbox.addChild( this.colorbox, {width : 50, height : 50});*/

        this.recentContainer = new fx.components.Box("lastColors");

        //let labelRecent = new fx.components.Text("Couleurs Récentes");
        //this.recentContainer.addChild(labelRecent, {top : 0, left : 5});

        this.lastColorsContainer = new fx.components.Box("lastColorsContainer");
        this.recentContainer.addChild(this.lastColorsContainer, {top : 5, left : 0});

        hbox.addChild(this.recentContainer, {height : 70});


        let allContainer = new fx.components.Box();
        //let allRecent = new fx.components.Text("Palette couleurs");
        //allContainer.addChild(allRecent, {top : 0, left : 5});

        this.allColorsContainer = new fx.components.Box("allColorsContainer");
        allContainer.addChild(this.allColorsContainer, {top : 5, left : 0});

        hbox.addChild(allContainer, {height : 70});

        this.addChild( hbox, {top : 0, left : 0});

        this.setColors(this.allColorsContainer, this._defaultColors);
    }

    onReady()
    {
        super.onReady();

        this.on("click", this._onClick);

        this.updateLastColors();
    }

    setColors(container, colors, max)
    {
        container.removeAllChild(true);

        for(let i = 0; i < colors.length && (max === undefined || --max > 0); i++)
        {
            let color = colors.getItemAt(i);

            if (color instanceof fx.Model)
                color = color.color;

            let outerBox = new fx.components.Box("outerBox");
            outerBox.addChild( new fx.components.Box("color", {"background-color" : color}) )

            container.addChild( outerBox );
        }
    }


    _onClick(e)
    {
        if (fx.dom.parent(e.target, ".color"))
            this.trigger("selected", fx.dom.css(e.target, "background-color"));
        /*else
        if (fx.dom.parent(e.target, ".colorbox"))
            this._toggleCustomColorPicker();*/
        
    }


    //------------------- color box ----------------//
    /*_toggleCustomColorPicker()
    {
        this._customColorPickerVisible = !this._customColorPickerVisible;

        if (this._customColorPickerVisible)
            this._showCustomColorPicker();
        else
            this._customColorPicker.hide();
    }

    _showCustomColorPicker()
    {
        if (!this._customColorPicker)
        {
            this._customColorPicker = new fx.components.Box("CustomColorPicker");
            this.addChild(this._customColorPicker, {width : "100%", height : "100%", top : 0, left : 0});

            this.closeButton = new fx.components.Button({className : "close", label : "Fermer"});
                this.colorPickerContainer.addChild(this.closeButton, {top:-35, right:5});
        }

        this._customColorPicker.show();
    }*/

    
});