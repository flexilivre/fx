fx.ns("fx.components", class ToolTip extends fx.EventDispatcher
{
    constructor()
    {
        super();

        this.on("blur", this.hide, window);
        this.on("mousemove", this.onMouseMove, window);
        this.on("mousedown", this.onMouseDown, window);
        this.on("mouseup", this.onMouseUp, window);
    }

    show(event, text, component)
    {
        if (text)
        {
            if (this._container)
            {
                if (this._container.text != text)
                    this._container.text = text;

                this._container.show();
                this._position(event, component);
            }
            else
            {
                this._container = new fx.components.Text({className : "ToolTip", text : text});
                this._container.init();
                this._position(event, component);
            }
        }
    }

    _position(e, component)
    {
        let style = component ? this._getToolTipStyle(component.id) : undefined;

        if (this._previousClass)
        {
            this._container.removeClass(this._previousClass);
            this._previousClass = "";
        }
        
        if (!style)
        {
            this._container._viewport = {};
            this._move(e.pageX + 10, e.pageY + 10);
        }
        else
        {
            if (style.class)
            {
                this._container.addClass(style.class);
                this._previousClass = style.class;
            }

            if (style.width)
                this._container._viewport.width = style.width;

            if (style.height)
                this._container._viewport.width = style.height;

            if (style.position)
            {
                let xPos, yPos;
                let position = fx.dom.offset(component.node);
                switch(style.position)
                {
                    case "left" : 
                        xPos = position.left - fx.dom.width(this._container.node) - (style.positionMargin || 10);
                        yPos = position.top + ( (fx.dom.height(component.node) - fx.dom.height(this._container.node)) / 2);
                        break;
                }

                this._move(xPos, yPos);
            }
            else
            {
                this._move(e.pageX + 10, e.pageY + 10);
            }
        }
    }

    _move(xPos, yPos)
    {
        if (xPos + this._container.node.clientWidth > fx.graphics.screenSize().width)
        xPos = fx.graphics.screenSize().width - this._container.node.clientWidth - 10;

        if (yPos + this._container.node.clientHeight > fx.graphics.screenSize().height)
            yPos = fx.graphics.screenSize().height - this._container.node.clientHeight - 10;

        if (yPos < 5)
            yPos = 5;

        if (xPos < 5)
            xPos = 5;

        this._container.move(xPos, yPos);
    }

    hide()
    {
        if (this._container)
        {
            this._container.text = "";
            this._container.hide();
        }
    }

    onMouseMove(event)
    {
        if (this._mouseDown) return ;

        let component = fx.dom.parent(event.target, ".Component"),
            toolTip = component ? this._getToolTip(component.id) /*component.getAttribute("toolTip") */: "";

        while (component && component != document.body && (toolTip !== false && !toolTip))
        {
            component = component.parentNode;
            if (component)
                toolTip = this._getToolTip(component.id);//component.getAttribute("toolTip");
        }

        if (typeof toolTip == "function")
            toolTip = toolTip();
        
        if (component && (toolTip = this._getToolTip(component.id)))
            this.show(event, toolTip, fx.get("objects")[component.id] );
        else
            this.hide();
    }

    _getToolTip(id)
    {
        return fx.get("objects")[id] ? fx.get("objects")[id].toolTip : "";   
    }

    _getToolTipStyle(id)
    {
        return fx.get("objects")[id] ? fx.get("objects")[id].toolTypeStyle : undefined;
    }

    onMouseDown(event)
    {
        this._mouseDown = true;

        this.hide();
    }

    onMouseUp(event)
    {
        this._mouseDown = false;
    }

});