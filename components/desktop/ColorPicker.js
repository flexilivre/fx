fx.ns("fx.components", class ColorPicker extends fx.Component {

	constructor(parameters){

        super();

        this.BOX_COLOR_HEIGHT = 25;
        this.BOX_COLOR_WIDTH = 29;

        this.customColorsVisible = false;

        this._lastColors = (parameters && parameters.lastColors) ? parameters.lastColors : ["#000"];
        this._currentColor = (parameters && parameters.currentColor) ? parameters.currentColor : (this._lastColors.length > 0 ? this._lastColors[this._lastColors.length - 1] : "ffffff");
        this._showOpacity = (parameters && parameters.showOpacity) ? parameters.showOpacity : false;

        this._pickerColor = "#000";

        this._opacity = 0;
        
        this._defaultColors = [  ["#FFFFFF", "#f4f4f4", "#dddddd", "#c7c7c6", "#b0b0af", "#999a99"],
                                ["#1d1e1b", "#838382", "#6c6c6b", "#575658", "#3f3f3e", "#292927"],
                                ["#f70000", "#ffbec3", "#ff8993", "#ff4054", "#cf0014", "#9f0028"],
                                ["#fc4e00", "#ffd5bf", "#ffaa7e", "#fd6b07", "#cf4100", "#973100"],
                                ["#844c18", "#e1d3c7", "#c2a68f", "#9d714a", "#613710", "#472814"],
                                ["#ffee00", "#fffbaf", "#fff987", "#fff542", "#cece00", "#939400"],
                                ["#009c28", "#bbe9d0", "#6cd09d", "#19bf79", "#00ab4e", "#00692d"],
                                ["#302b88", "#c6c7e0", "#9b9ac7", "#5d5aa4", "#4e4c9b", "#2c2160"],
                                ["#8d2c90", "#e3cae3", "#c693c6", "#b778b8", "#a04ea1", "#701988"],
                                ["#fb0880", "#ffcfe9", "#ff77c1", "#ff48ae", "#ff0d9a", "#b7045f"],
                                ["#00a1e9", "#b9e9fa", "#77d6f7", "#00bef1", "#0094ca", "#0071be"],
                                ["#00b05e", "#caeedc", "#90dcb8", "#59cc98", "#2c936a", "#28785d"]  ];

        this.on("updated", this.updateLastColors, this._lastColors);
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

        if (this._opacity > 0)
            color = color.setAlpha(1 - this._opacity).toRgbString();
        else
            color = this._currentColor;
        
        if (this.initialized)
        {
            this.trigger("selected", color);

            this.updateLastColors();
        }
    }

    get pickerColor()
    {
        if (!this._pickerColor)
            this._pickerColor = this.currentColor;

        return this._pickerColor;
    }

    set pickerColor(val)
    {
        this._pickerColor = tinycolor(val).toHexString();
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

   
    onReady()
    {
        super.onReady();

        this.on("click", this.onClick);

        this.on("mousedown", this.onMouseDown);
        this.on("mousemove", this.onMouseMove);
        this.on("mouseup", this.onMouseUp, window);
        this.on("keyup", this.onKeyUp, this.find(".input.hexaColor") );
        
        this.updateDisplayColor();
        this.updateGradientColorPicker();

        if (this._showOpacity)
            this.on("input", this._opacityUpdated, this.find(".opacityInput"));

        this._colorPicker = this.find(".colorPicker");
        this._colorPickerCursor = this.find(".colorPickerCursor");

        this._brightnessPicker = this.find(".brightnessPicker");
        this._brightnessPickerCursor = this.find(".brightnessPickerCursor");
    }

    _opacityUpdated()
    {
        this._opacity = 1 - (this.find(".opacityInput").valueAsNumber / 100);

        this.find(".opacityValue").innerHTML = this.opacityLabel;
     
        if (!this.customColorsVisible)
            this.currentColor = this._currentColor;
        
    }

    render()
    {
        let html = "";

        /// ------------ header 
        html += '<div class="header">';

        html += '<div class="colorPickerButton hover" title="Palette / Couleurs">';

        html += '<img class="custom" src="assets/icons/colorpicker/custom-color.png" >';
        html += '<svg class="palette" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">',
        html += '<g transform="translate(-67 -19)">',
        html += '<g transform="translate(67 19)">',
        html += '<circle cx="10" cy="10" r="10" fill="#e2e7ee"/>',
        html += '</g>',
        html += '<g transform="translate(70.636 22.636)">',
        html += '<circle cx="2.5" cy="2.5" r="2.5" transform="translate(0.364 0.364)" fill="#ffc600"/>',
        html += '<circle cx="2.5" cy="2.5" r="2.5" transform="translate(0.364 7.364)" fill="#ea67a2"/>',
        html += '<circle cx="2.5" cy="2.5" r="2.5" transform="translate(7.364 0.364)" fill="#f29104"/>',
        html += '<circle cx="2.5" cy="2.5" r="2.5" transform="translate(7.364 7.364)" fill="#72b4c9"/>',
        html += '</g>',
        html += '</g>',
        html += '</svg>',

        html += '</div>';

        html += '<div class="noColorButton hover" title="Supprimer la couleur">';
        html += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">',
        html += '<g fill="none" stroke="#f26b6b" stroke-width="1">',
        html += '<circle cx="10" cy="10" r="10" stroke="none"/>',
        html += '<circle cx="10" cy="10" r="9.5" fill="none"/>',
        html += '</g>',
        html += '<line x1="9" y2="9" transform="translate(5.5 5.5)" fill="none" stroke="#f26b6b" stroke-linecap="round" stroke-width="2"/>',
        html += '</svg>',
        html += '</div>';

        html += '<div class="lastColors">';
        html += this.updateLastColors(true);
        html +='</div>';

        html += '</div>';

        //----- Colors Panel START
        html += '<div class="colorsPanel">';

        //----- first panel : Default colors
        html += '<div class="defaultColors">';
        html += '<div class="colors">';

        let xPos = 7.5, yPos = 7.5;
        for(let i = 0; i < this.defaultColors.length; i++)
        {
            let row = this.defaultColors[i];

            for(let j = 0; j < row.length; j++)
            {
                let color = row[j];

                html += '<div class="color hover" data="' + color + '" style="background-color:' + color + ';top:' + yPos + 'px;left:' + xPos + 'px"></div>';

                yPos += 23;
            }

            xPos += 24.5;
            yPos = 7.5;
        }

        html += '</div>';
        html += '</div>';

        //----- second panel : custom color

        html += '<div class="customColors">';

        html += '<div class="input" maxlength="7">';
        html += '<input title="Entrez le code hexadécimal de votre couleur et appuyez sur Entrée" class="hexaColor" type="text">';
        html += '<button class="button">OK</button>';
        html += '</div>';
        
        html += '<div class="colorPickerContainer"><div class="colorPickerCursor"></div><canvas class="colorPicker" width="165" height="25"></canvas></div>'; // color
        html += '<div class="brightnessPickerContainer"><div class="brightnessPickerCursor"></div><canvas class="brightnessPicker" width="292" height="112.5" ></canvas></div>'; // brightness

        html += '<div class="colorDisplay"></div>'

        //html += '<div class="colorPickerButton">';
        //html += '<img src="assets/icons/colorpicker/palette.png">';
        html += '</div>';

        html += '</div>';

        //----- Colors Panel END

        html += '</div>';

        // ------- opacity footer

        if (this._showOpacity)
        {
            html += '<div class="opacityControl">';
            html += '<span class="title">Transparence</span>';
            html += '<input type="range" class="opacityInput" min="0" max="100" value="' + this.opacityValue + '"/>'; 
            html += '<span class="opacityValue">' + this.opacityLabel + '</span>'
            html += '</div>';
        }

        return html;
    }

    resize()
    {
        this._realWidth = 315;
        this._realHeight = this._showOpacity ? 240 : 205;
        this.css({ width : this._realWidth, height : this._realHeight});
    }

    show()
    {
        super.show();

        if (this.node)
        {
            let childs = this.node.children;
            for(let i = 0; i < childs.length; i++)
                fx.dom.removeClass(childs[i], "hidden");
        }

        this.customColorsVisible = false;
        this.updateVisiblePanel()
    }

    hide()
    {
        super.hide();
        
        if (this.node)
        {
            let childs = this.node.children;
            for(let i = 0; i < childs.length; i++)
                fx.dom.addClass(childs[i], "hidden");
        }
    }

    destroy()
    {
        super.destroy();
    }

    onClick(event)
    {
        let colorElement = fx.dom.parent(event.target, ".color");
        
        if (colorElement)
        {
            this.currentColor = colorElement.getAttribute("data");
        }
        else
        if (fx.dom.parent(event.target, ".colorPickerButton"))
        {
            this.customColorsVisible = !this.customColorsVisible;
            this.updateVisiblePanel();
        }
        else
        if (fx.dom.parent(event.target, ".noColorButton"))
        {
            this.currentColor = "rgba(0,0,0,0)";
        }
        else
        if (fx.dom.parent(event.target, ".button"))
        {
            this.currentColor = this.pickerColor;
        }

        event.preventDefault();
    }

    updateVisiblePanel()
    {
        if (this.customColorsVisible)
        {
            fx.dom.addClass(this.find(".customColors"), "shown");
            fx.dom.addClass(this.find(".colorPickerButton"), "custom");
        }
        else
        {
            fx.dom.removeClass(this.find(".customColors"), "shown");
            fx.dom.removeClass(this.find(".colorPickerButton"), "custom");

            this.updateColorPickerPanel();
        }

    }

    updateDisplayColor()
    {
        this.css(this.find(".colorDisplay"), {"background-color": this.pickerColor});
        this.find("input.hexaColor").value = this.pickerColor;

        this.css(this.find("input.hexaColor"), {'background-color': this.pickerColor, 'color': tinycolor(this.pickerColor).isDark() ? "#fff" : "#000"});

    }

    updateLastColors(inject)
    {
        let html = '', xPos = 0, count = 0;
        for(let i = 0; i < this.lastColors.length && ++count < 9; i++)
        {
            let color = this.lastColors.getItemAt(i);

            if (color instanceof fx.Model)
                color = color.color;

            html += '<div class="color hover" data="' + color + '" style="background-color:' + color + ';top:' + 0 + 'px;left:' + xPos + 'px"></div>';
            xPos += this.BOX_COLOR_WIDTH;
        }

        if (inject === true)
            return html;
        else
            this.find(".lastColors").innerHTML = html;
    }

    updateColorPickerPanel()
    {
        if (!this.colorPickerDrawed)
        {
            let canvas = this.find(".colorPicker");
            let ctx = canvas.getContext("2d");

            let img = new Image();
            img.onload = function(){
                ctx.drawImage( this, 0, 0, canvas.width, canvas.height);
            }
            img.src = "assets/icons/colorpicker/gradient.jpg";
            
            this.colorPickerDrawed = true;
        }
    }

    updateGradientColorPicker()
    {
        let canvas = this.find(".brightnessPicker");
        let  ctx = canvas.getContext("2d");
        let my_gradient = ctx.createLinearGradient(0,0,canvas.width, 0);
        my_gradient.addColorStop(0,"rgb(0,0,0)");
        my_gradient.addColorStop(0.3,this.pickerColor);
        my_gradient.addColorStop(1,"#ffffff");
        ctx.fillStyle=my_gradient;
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }

    onMouseDown(e)
    {
        if (fx.dom.parent(e.target, ".colorPickerContainer"))
        {
            //this.movetarget = "colorPickerContainer";
            this.movetarget = this._colorPicker;// this.find(".colorPicker");
        }
        else
        if (fx.dom.parent(e.target, ".brightnessPickerContainer"))
        {
            //this.movetarget = "brightnessPicker";
            this.movetarget = this._brightnessPicker;//this.find(".brightnessPicker");
        }

        this.onMouseMove(e);
    }
    
    onMouseMove(e)
    {
        if (!this.movetarget) return;

        if (fx.dom.parent(e.target, ".colorPickerContainer"))
        {
            let canvas = this.movetarget;//fx.dom.parent(e.target, ".colorPicker");
            let  mousePos = this.getMousePos(canvas, e);
            if(mousePos !== null && mousePos.x >= 0 && mousePos.x <= canvas.width)
            {
                let ctx = canvas.getContext("2d");
                let imageData = ctx.getImageData(mousePos.x, mousePos.y, 1,1);
                let color = 'rgb(' + imageData.data[0] + ',' + imageData.data[1] + ',' + imageData.data[2] + ')';
                
                this.pickerColor = color;

                this.updateGradientColorPicker();

                let pickerPos = mousePos.x - fx.dom.outerWidth(this._colorPickerCursor)/2;
                pickerPos = Math.min(Math.max(pickerPos, 0), canvas.width - fx.dom.outerWidth(this._colorPickerCursor));
                fx.dom.css(this._colorPickerCursor, { left : pickerPos });
            }
        }
        else
        if (fx.dom.parent(e.target, ".brightnessPickerContainer"))
        {
            let canvas = this.movetarget;//fx.dom.parent(e.target, ".brightnessPicker");
            let  mousePos = this.getMousePos(canvas, e);
            if(mousePos !== null && mousePos.x >= 0 && mousePos.x <= canvas.width && mousePos.y >= 0 && mousePos.y <= canvas.height)
            {
                let ctx = canvas.getContext("2d");
                let imageData = ctx.getImageData(mousePos.x, mousePos.y, 1,1);
                let color = 'rgb(' + imageData.data[0] + ',' + imageData.data[1] + ',' + imageData.data[2] + ')';
                
                this.pickerColor = color;

                let pickerPosX = mousePos.x - fx.dom.outerWidth(this._brightnessPickerCursor)/2;
                pickerPosX = Math.min(Math.max(pickerPosX, 0), canvas.width - fx.dom.outerWidth(this._brightnessPickerCursor));

                let pickerPosY = mousePos.y - fx.dom.outerHeight(this._brightnessPickerCursor)/2;
                pickerPosY = Math.min(Math.max(pickerPosY, 0), canvas.height - fx.dom.outerHeight(this._brightnessPickerCursor));

                fx.dom.css(this._brightnessPickerCursor, { left : pickerPosX, top : pickerPosY });
            }
        }
    }
    

    onMouseUp(e)
    {
        if (this.movetarget)
            this.movetarget = null;
    }

    onKeyUp(e)
    {
        if (e.keyCode == 13) // enter
        {
            this.currentColor = this.pickerColor;
            return;
        }

        let val = e.target.value;
        
        if (val.indexOf("#") != 0)
        {
            val.replace(new RegExp("#", 'g'), "");
            val = "#" + val;
        }
        
        while (val.length < 7)
            val += "0";
        
        this._pickerColor = tinycolor(val).toRgbString();

        this.updateGradientColorPicker();
        this.css(this.find(".colorDisplay"), {"background-color": this.pickerColor});        
    }

    getMousePos(canvas, evt)
    {
        let rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

  

});