fx.ns("fx.components", class Input extends fx.Component {

    constructor(parameters)
    {
        super();
        
        this._value = (parameters && parameters.value !== undefined) ? parameters.value : "";
        this._placeHolder = (parameters && parameters.placeHolder) ? parameters.placeHolder : "";
        this._name = (parameters && parameters.name) ? parameters.name : "";
        this._type = (parameters && parameters.type) ? parameters.type : "text";
        this._maxlength = (parameters && parameters.maxlength) ? parameters.maxlength : 0;
    }

    /**************************** Parameters / Constants ******************************/

    get value()
    {
        if (this.initialized)
            return this._normalize(this.find(".input").value);

        return this._normalize(this._value);
    }

    set value(val)
    {
        this._value = val;

        if (this.initialized)
            this.find(".input").value = val;
    }

    get placeHolder()
    {
        return this._placeHolder;
    }

    set placeHolder(val)
    {
        this._placeHolder = val;

        if (this.initialized)
            this.find(".input").setAttribute("placeHolder", val);
    }


    get input()
    {
        return this.find(".input");
    }

    /**************************** Overrides ******************************/

    onReady()
    {
        super.onReady();

        //this.on("keyup", this.onKeyPress, this.find(".input"));
        this.on("keyup", this.onKeyPress, this.find(".input"));
    }


    render()
    {
		return '<input class="input" type="' + this._type + '" ' + (this._maxlength ? ('maxlength="' + this._maxlength + '"') : '') + ' value="' + this.value + '" placeholder="' + this.placeHolder + '" ' + (this._name ? ('name= "' + this._name + '"') : '') + '>';
    }
    
    enable()
    {
        super.enable();
        this.find(".input").disabled = false;
    }

    disable()
    {
        super.disable();
        this.find(".input").disabled = true;
    }

    focus(positionAtEnd)
    {
        this._focus(positionAtEnd);
            
    }

    /**************************** Events ******************************/
    onKeyPress(e)
    {
        let handled = false;

        if (e.keyCode == 13)
        {
            this.trigger("enter");
            handled = true;
        }
        else
        if (e.keyCode == 27)
        {
            this.trigger("escape");
            handled = true;
        }
        else
        {
            if (this._value != this.find(".input").value)
            {
                this._value = this.find(".input").value;
                this.trigger("updated", e);
                handled = true;
            }
        }

        if (handled)
        {
            e.preventDefault();
            e.stopPropagation();
        }
            
    }



    _focus(positionAtEnd) 
    {
        if (!this.input)
            return;

        if (positionAtEnd)
        {
            var elemLen = this.input.value.length;
            // For IE Only
            if (document.selection) {
                // Set focus
                this.input.focus();
                // Use IE Ranges
                var oSel = document.selection.createRange();
                // Reset position to 0 & then set at end
                oSel.moveStart('character', -elemLen);
                oSel.moveStart('character', elemLen);
                oSel.moveEnd('character', 0);
                oSel.select();
            }
            else if (this.input.selectionStart || this.input.selectionStart == '0') {
                // Firefox/Chrome
                this.input.selectionStart = elemLen;
                this.input.selectionEnd = elemLen;
                this.input.focus();
            } // if
        } 
        else
        {
            var savedTabIndex = this.input.getAttribute('tabindex')
            this.input.setAttribute('tabindex', '-1')
            this.input.focus()
            this.input.setAttribute('tabindex', savedTabIndex)
        }
    }

    _normalize(val)
    {
        return Utils.isNumber(val) ? Number(val) : (val ? val : "");
    }


});