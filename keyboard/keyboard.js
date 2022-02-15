/**
 * This class handled keyword events
 * It's crossbrowser (max + windows)
 * It dispatches readable events like "CTRL+A", "RIGHT", "SPACE", "0", etc...
 * It come with original event, so it's possible to call preventDefault/StopPropagation
 **/

fx.ns("fx", class Keyboard extends fx.EventDispatcher {
    
    constructor()
    {
        super();

        this.on("keydown", this._onKeyDown, window);
        this.on("keyup", this._onKeyUp, window);
       
        this._keyCodes = {
            48 : "0",
            49 : "1",
            50 : "2",
            51 : "3",
            52 : "4",
            53 : "5",
            54 : "6",
            55 : "7",
            56 : "8",
            57 : "9",
            65 : "A",
            66 : "B",
            67 : "C",
            68 : "D",
            69 : "E",
            70 : "F",
            71 : "G",
            72 : "H",
            73 : "I",
            74 : "J",
            75 : "K",
            76 : "L",
            77 : "M",
            78 : "N",
            79 : "O",
            80 : "P",
            81 : "Q",
            82 : "R",
            83 : "S",
            84 : "T",
            85 : "U",
            86 : "V",
            87 : "W",
            88 : "X",
            89 : "Y",
            90 : "Z",
            9  : "TAB",
            13 : "ENTER",
            17 : "CTRL",
            16 : "SHIFT",
            18 : "ALT",
            8  : "BACKSPACE",
            27 : "ESCAPE",
            33 : "PAGEUP",
            34 : "PAGEDOWN",
            32 : "SPACE",
            35 : "END",
            36 : "HOME",
            37 : "LEFT",
            38 : "UP",
            39 : "RIGHT",
            40 : "DOWN",
            45 : "INSERT",
            46 : "DELETE",
            20 : "CAPSLOCK",
        };
    }

    _onKeyDown(e)
    {
        this._handleEvent(e , "DOWN");
    }

    _onKeyUp(e)
    {
        this._handleEvent(e , "UP");
    }
            
    _handleEvent(e, direction)
    {
        if (this._keyCodes[e.keyCode] != "ESCAPE" &&
            (   fx.dom.parent(e.target, "input") ||
                fx.dom.parent(e.target, "textarea") ||
                fx.dom.parent(e.target, "div[contenteditable=true]") ) )
        return;

        let eventCode = "";
        
        if (e.ctrlKey || e.metaKey)
            eventCode += "CTRL";
            
        if (e.shiftKey)
        {
            if (e.ctrlKey || e.metaKey)
                eventCode += "+";

            eventCode += "SHIFT";
        }
        
        if (direction == "UP" || (this._keyCodes[e.keyCode] != "CTRL" && this._keyCodes[e.keyCode] != "SHIFT"))
            eventCode += (eventCode == "" ? "" :  "+" ) + this._keyCodes[e.keyCode];

        if (eventCode)
        {
            if (direction == "UP")
                this.trigger( new fx.KeyboardEvent(eventCode, e) );

            this.trigger( new fx.KeyboardEvent(eventCode + "-" + direction, e) );
        }
    }


    /*_onKeyUp(e)
    {
        
    }*/

});