/**
 * Wrapper on Quilljs : https://github.com/quilljs/quill
 */
fx.ns("fx.components", class TextEditor extends fx.EventDispatcher {

    constructor(container, defaultStyle, fonts)
    {
        super();

        this.fonts = fonts;

        this.MIN_FONT_SIZE = 4;
        this.MAX_FONT_SIZE = 49;

        if (!Quill._configured)
            this._configure();
            
        this._editor = new Quill(container, {  formats: ['bold','italic','size','font', 'align', 'color'], // we use a format white list for copy and paste
                                                modules: 
                                                { 
                                                    //lineheightfix: true ,
                                                    //maxlength : {value : 1000},
                                                    history: { delay: 100, maxStack: 100, userOnly: true }
                                                },
                                            });

        // disable tab because it doesn't have same size on firefox / chrome
        if (this._editor.keyboard && this._editor.keyboard.bindings && this._editor.keyboard.bindings[9])
            this._editor.keyboard.bindings[9].unshift({ key: 9, handler: function () {return false;}});

        this._active = false;

        this._onSelectionChangeHandler = this._onSelectionChange.bind(this);
        this._onTextChangeHandler = this._onTextChange.bind(this);
        this._onEditorChangeHandler = this._onEditorChange.bind(this);
        
        
        this._textChangedEnabled = true;
        this._lastSelectionStyle = {};

        this._editor.on("selection-change", this._onSelectionChangeHandler);
        this._editor.on("text-change", this._onTextChangeHandler);
        this._editor.on("editor-change", this._onEditorChangeHandler);
        
        this._editor.enable(false);

        this.setDefaultStyle(defaultStyle);

        // we set this._initialized to true only after some delay in order to avoid 
        // the first "text-change" event which is not usefull
        this.delay(this._editorInitialized, 250);

        this.Delta = Quill.import('delta');
     
    }

    _editorInitialized()
    {
        this._initialized = true;
    }

    get innerHTML()
    {
        return this._editor.root.innerHTML;
    }

    get active()
    {
        return this._active;
    }

    set active(val)
    {
        if (!this._editor)
            return;

        this._active = (val === true);

        this._disableTextChange(true);
        this._editor.enable( this._active );

        if (this._active)
            this._editor.focus();
        else
            this._editor.blur();
    }

    get content()
    {
        return this._editor.getContents();
    }

    set content(val)
    {
        this._editor.setContents(val);
    }

    get selection()
    {
        if (!this.active && this._editor)
            return { index : 0, length : this.textLength, noselection : true };
        else
        {
            let selection;
            try 
            {
                selection = this.currentSelection && this.currentSelection.length > 0 ? this.currentSelection : (this._editor ? this._editor.getSelection("silent") : null); //  this._editor.getSelection("silent") used everytime creates a problem for copy/paste
            } 
            catch(e) { } // Fix safari  "The index is not in the allowed range" on getBounds
            
            return selection ? selection : { index : 0, length : 0, noselection : true };
        }
            
    }

    css(properties)
    {
        fx.dom.css(this._editor.root, properties);
    }

    setHTML(val)
    {
        this._disableTextChange(true);

        this._editor.root.innerHTML = val;
    }
    
    _disableTextChange(disable)
    {
        if (disable)
        {
            this._textChangedEnabled = false;
            this.delay( this._disableTextChange, 100);
        }
        else
            this._textChangedEnabled = true;
    }
    
    get empty()
    {
        if (!this._editor)
            return;

        let text = (this._editor && this._editor.root) ? this._editor.root.innerText : this._editor.getText();

        return text.trim().length === 0 || (text.length == 1 && text == '\n');    
    }

    get textLength()
    {
        if (!this._editor)
            return;

        let text = (this._editor && this._editor.root) ? this._editor.root.innerText : this._editor.getText();

        return (text.length == 1 && text == '\n') ? 0 : text.length;  
    }

    /**
     * Each of getter/setter returns or update the current selection
     * If not current selection, the whole line is selected
     */
    get fontFamily()
    {
        let selection = this.selection;
        
        if (selection && this._editor)
        {
            let format = this._editor.getFormat( selection );
            if (format.font instanceof Array)
                return format.font[0];

            return format.font;
        }
        else
            return "";
    }

    set fontFamily(val)
    {
        // TODO : check that val is part of listed fonts
        if (this.selection.noselection)
            this._editor.formatText( this.selection.index, this.selection.length, 'font' , val);
        else
            this._editor.format('font' , val);
    }

    get allFontFamilies()
    {
        let deltas = this._editor.getContents();
        let families = [];
        for (let i = 0; i < deltas.ops.length; i++)
        {
            let op = deltas.ops[i];
            if (op.attributes && op.attributes.font && !families.find(op.attributes.font))
                families.push(op.attributes.font);
        }
        
        return families;
    }

    get currentFontFamilies()
    {
        let families = [];
        let selection = this.selection;
        
        if (selection && this._editor)
        {
            let deltas = this._editor.getContents(selection);
            for (let i = 0; i < deltas.ops.length; i++)
            {
                let op = deltas.ops[i];
                if (op.attributes && op.attributes.font && !families.find(op.attributes.font))
                    families.push(op.attributes.font);
            }
        }

        if (families.length == 0 && this.fontFamily)
            families.push(this.fontFamily);

        return families;
    }

    get bold()
    {
        let selection = this.selection;

        if (selection && this._editor)
        {
            let format = this._editor.getFormat( selection );
            if (format.bold instanceof Array)
                return format.bold[0];

            return format.bold;
        }
        else
            return false;
    }

    set bold(val)
    {
        if (val == "!")
            val = !this.bold;

        //this._editor.format('bold' , val === true);
        if (this.selection.noselection)
            this._editor.formatText(this.selection.index, this.selection.length, 'bold' , val === true);
        else
            this._editor.format('bold' , val === true);
    }

    get italic()
    {
        //let selection = this._editor.getSelection("silent");
        let selection = this.selection;

        if (selection && this._editor)
        {
            let format = this._editor.getFormat( selection );
            if (format.italic instanceof Array)
                return format.italic[0];

            return format.italic;
        }
        else 
            return false;
    }

    set italic(val)
    {
        if (val == "!")
            val = !this.italic;

        if (this.selection.noselection)
            this._editor.formatText(this.selection.index, this.selection.length, 'italic' , val === true);
        else
            this._editor.format('italic' , val === true);
    }

    get align()
    {
        //let selection = this._editor.getSelection("silent");
        let selection = this.selection;

        if (selection && this._editor)
        {
            let format = this._editor.getFormat( selection );
            return format.align;
        }
        else
            return "";
    }

    set align(val)
    {
        if (this.selection.noselection)
            //this._editor.formatText(this.selection.index, this.selection.length, 'align' , val );
            this._editor.formatLine(this.selection.index, this.selection.length, 'align' , val );
        else
            this._editor.format('align' , val );
    }

    get size()
    {
        //let selection = this._editor.getSelection("silent");
        let selection = this.selection;

        if (selection && this._editor)
        {
            let format = this._editor.getFormat( selection );
            if (format.size instanceof Array)
                return format.size[0];
            
            return format.size;
        }
        else
            return 0;
    }

    set size(val)
    {
        if (val == "+")
        {
            this._increaseSize();
        }
        else
        if (val == "-")
        {
            this._decreaseSize();
        }
        else
        {
            if (this.selection.noselection)
                this._editor.formatText(this.selection.index, this.selection.length, 'size' , parseInt(val) + "px" );
            else
                this._editor.format('size' , parseInt(val) + "px" );
        }
    }

    get color()
    {
        let selection = this.selection;

        if (selection && this._editor)
        {
            let format = this._editor.getFormat( selection );
            if (format.color instanceof Array)
                return format.color[0];

            return format.color;
        }
        else
            return "#000";
    }

    set color(val)
    {
        if (this.selection.noselection)
            this._editor.formatText(this.selection.index, this.selection.length, 'color', val );
        else
            this._editor.format('color', val );
    }

    /**
     * Set focus on editor
     */
    focus(options)
    {
        this._editor.focus(options);
    }

    /**
     * Selects the whole line and returns the selection
     */
    selectAll()
    {
        this._editor.setSelection(0, this._editor.getLength(), "silent");
    }

    unSelectAll()
    {
        this._editor.setSelection(null, "silent");
        
        //this.delay( this._removeSelection,250 );
        this._removeSelection();
    }

    undo()
    {
        this._editor.history.undo();
    }

    redo()
    {
        this._editor.history.redo();
    }

    _removeSelection()
    {
        if (document.selection)
            document.selection.empty()
        else
            window.getSelection().removeAllRanges();
    }
    
    /**
     * Applies default style to editor (font-size, text-color, etc...)
     * @param {object} defaultStyle 
     */
    setDefaultStyle(defaultStyle, force)
    {
        if (defaultStyle)
            this._defaultStyle = defaultStyle;
        
        if (this.empty && this._defaultStyle)
        {
            //fx.dom.css(this._editor.root, this._defaultStyle);

            if (this._defaultStyle["font-family"] && this._defaultStyle["font-family"] != this.fontFamily)
                this._editor.format('font' , this._defaultStyle["font-family"], "silent" );

            if (this._defaultStyle["font-size"] && this._defaultStyle["font-size"] != this.size)
                this._editor.format('size' , parseInt(this._defaultStyle["font-size"]) + "px", "silent" );

            if (this._defaultStyle["color"] && this._defaultStyle["color"] != this.color)
                this._editor.format('color', this._defaultStyle["color"] , "silent");

            if (this._defaultStyle["text-align"] && this._defaultStyle["text-align"] != this.align)
                this._editor.format('align' , this._defaultStyle["text-align"], "silent" );

            if (this._defaultStyle["bold"] && this._defaultStyle["bold"] != this.bold)
                this._editor.format('bold' , this._defaultStyle["bold"], "silent" );

            if (this._defaultStyle["italic"] && this._defaultStyle["italic"] != this.align)
                this._editor.format('italic' , this._defaultStyle["italic"], "silent" );
        }
        else
        {
            //fx.dom.css(this._editor.root, {"font-family":"unset", "text-align":"unset", "font-size":"unset", "color":"unset"});
        }

        if (force)
            fx.dom.css(this._editor.root, {"font-family":this._defaultStyle["font-family"] ? this._defaultStyle["font-family"] : "Open Sans", 
                                            "text-align": this._defaultStyle["text-align"]  ? this._defaultStyle["text-align"]  : "left", 
                                            "font-size": this._defaultStyle["font-size"] ? this._defaultStyle["font-size"] : "6px", 
                                            "color":this._defaultStyle["color"] ? this._defaultStyle["color"] : "#000"});
        else
            fx.dom.css(this._editor.root, {"font-family":"Open Sans", "text-align":"left", "font-size":"6px", "color":"#000"});
    }

    // ------------------------- OVERRIDE ---------------------//
    destroy()
    {
        super.destroy();

        this._editor.off("selection-change", this._onSelectionChangeHandler);
        this._editor.off("text-change", this._onTextChangeHandler);
        this._editor.off("editor-change", this._onEditorChangeHandler);
        

        this._onSelectionChangeHandler = null;
        this._onTextChangeHandler = null;
        this._onEditorChangeHandler = null;
        

        this._editor.enable(false);

        this._editor = null;
    }
   

    // -------------------------- PRIVATE -----------------------//
    _configure()
    {
        // We set list of font sizes here
        let Size = Quill.import('attributors/style/size');
        Size.whitelist = [];

        for (let i = this.MIN_FONT_SIZE; i <=this.MAX_FONT_SIZE; i++)
            Size.whitelist.push(i + "px");

        Quill.register(Size, true);


        // We add fonts here
        let Font = Quill.import('attributors/style/font');
        let fonts = this.fonts;

        Font.whitelist = [];        

        for (let i = 0; i < fonts.length; i++)
            Font.whitelist.push(fonts.getItemAt(i).name);

        Quill.register(Font, true);

        Quill.register(Quill.import('attributors/style/align'), true);
        
    }

    _increaseSize()
    {
        // calculate the highest value and increments
        
        let selection = this.selection;

        if (selection)
        {
            // in case nothing is selected, we select pre
            if (selection.length == 0 && this._currentSize)
            {
                this._currentSize = Math.min(this.MAX_FONT_SIZE,(this._currentSize+1))
                if (this.selection.noselection)
                    this._editor.formatText(0, this.selection.length, 'size' , this._currentSize + "px" );
                else
                    this._editor.format('size' , this._currentSize + "px" );
                return;
            }
            
            let index = selection.length ? selection.index : (selection.index-1);
            let length = selection.length ? selection.length : 1;
            let highest = null;
            if (index == 0 && length == 0) // TODO : check next ?
                return;

            if (index > 0 || length > 0) 
            {
                let deltas = this._editor.getContents(index, length);
                
                for (let i = 0; i < deltas.ops.length; i++)
                {
                    let op = deltas.ops[i];
                    if (op.attributes && op.attributes.size)
                        highest = highest ? Math.max(highest, parseInt(op.attributes.size) ) : parseInt(op.attributes.size);
                }
            }

            if (!highest)
            {
                let defaultSize = this._getEditorDefaultValue("font-size");
                if (defaultSize)
                    highest = parseInt( defaultSize );
            }

            if (highest)
            {
                this._currentSize = Math.min(this.MAX_FONT_SIZE,(highest+1))
                if (this.selection.noselection)
                    this._editor.formatText(index, length, 'size' , this._currentSize + "px" );
                else
                    this._editor.format('size' , this._currentSize + "px" );
            }

            
        }
    }

    _decreaseSize()
    {
        // calculate the lowest value and increments

        let selection = this.selection;

        if (selection)
        {
            // in case nothing is selected, we select pre
            if (selection.length == 0 && this._currentSize)
            {
                this._currentSize = Math.min(this.MAX_FONT_SIZE,(this._currentSize-1))
                if (this.selection.noselection)
                    this._editor.formatText(0, this.selection.length, 'size' , this._currentSize + "px" );
                else
                    this._editor.format('size' , this._currentSize + "px" );
                return;
            }

            let index = selection.length ? selection.index : 0;
            let length = selection.length ? selection.length : this._editor.getLength();
            let lowest = null;

            if (index > 0 || length > 0) 
            {
                let deltas = this._editor.getContents(index, length);
                
                for (let i = 0; i < deltas.ops.length; i++)
                {
                    let op = deltas.ops[i];
                    if (op.attributes && op.attributes.size)
                        lowest = lowest ? Math.min(lowest, parseInt(op.attributes.size) ) : parseInt(op.attributes.size);
                }
            }

            if (!lowest)
            {
                let defaultSize = this._getEditorDefaultValue("font-size");
                if (defaultSize)
                    lowest = parseInt( defaultSize );
            }

            this._currentSize = Math.max(this.MIN_FONT_SIZE,(lowest-1))
            if (this.selection.noselection)
                this._editor.formatText(index, length, 'size' , this._currentSize + "px" );
            else
                this._editor.format('size' , this._currentSize + "px" );
        }
    }

    _getEditorDefaultValue(name)
    {
        // first we check inline styles on editor
        let value = fx.dom.css(this._editor.root, name);
        if (value)
            return value;

        // then we check style set on stylesheet
        let computStyle = window.getComputedStyle( this._editor.root );
        
        if (computStyle)
            return computStyle.getPropertyValue( name );
        
        return null;
    }


    _onSelectionChange(e)
    {
        this.currentSelection = e;
        this.trigger("selection-change", e);
    }
    
    _onTextChange(e)
    {
        this.delay(this.__onTextChanged, 10); // trick to avoid too much recursion on firefox
    }
    
    _onEditorChange(e)
    {
        if (e == "text-change")
            this.delay(this.__onTextChanged, 10);  // trick to avoid too much recursion on firefox
        else
        {
            this._lastSelectionStyle = {
                "font-family" : this.fontFamily ? this.fontFamily : this._lastSelectionStyle["font-family"], 
                "bold" : this.bold || this._lastSelectionStyle["bold"], 
                "italic" : this.italic || this._lastSelectionStyle["italic"], 
                "text-align" : this.align ? this.align : this._lastSelectionStyle["text-align"], 
                "font-size" : this.size ? this.size : this._lastSelectionStyle["font-size"],
                "color" : this.color ? this.color : this._lastSelectionStyle["color"]
            };

            this.trigger("editor-change", e);
        }
    }

    __onTextChanged()
    {
        if (this._initialized && this._textChangedEnabled)
            this.trigger("text-change");
        
        if (this.empty)
            this._defaultStyle = this._lastSelectionStyle;

        this.setDefaultStyle();
    }

    
    
});