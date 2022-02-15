fx.ns("fx.components", class ContextMenu extends fx.EventDispatcher{

    constructor()
    {
        super();

        this._registredComponents = [];

        this.on("mouseup", this._onMouseUp, window);
        this.on("contextmenu", this._onContextMenu, window);
    }

   
    register(component, menu)
    {
        this._registredComponents.push(component);
    }

    unregister(component)
    {
        this._registredComponents.remove(component);
    }


    _onMouseUp(e)
    {
        if (e.button != 0) return;
        
        this._removeMenu();
    }

    _onContextMenu(e)
    {
        this._removeMenu();

        // check for each registered component, if right click was on him
        let target;
        let components = this._sortComponentsByDepth();
        for (let i = 0; i < components.length; i++)
        {
            target = fx.dom.parent(e.target, "#" + components[i].id);

            if (target)
            {
                let contentMenu = components[i].contextMenu(e)
                if (contentMenu == false)
                    continue;

                if (contentMenu == "default")
                {
                    target = undefined;
                    break;
                }
                else
                {
                    this._menu = new fx.components.Menu(components[i], contentMenu);
                    this._menu.init();
                    this._menu.move(e.pageX, e.pageY);
                    break;
                }
            }
        
        }   

        if (target !== undefined && target !== null)
            e.preventDefault();
    }

    _removeMenu()
    {
        if (this._menu)
        {
            this._menu.destroy();
            this._menu = null;
        }
    }

    _sortComponentsByDepth()
    {
        for (let i = 0; i < this._registredComponents.length; i++)
        {
            let component = this._registredComponents[i];
            component.__depth = this._getDepth(component.node);
        }

        return this._registredComponents.sort( this._sortByDepth);
    }

    _getDepth(element, depth)
    {
        if (depth === undefined) depth = 0;
        
        if (element.parentNode)
            return this._getDepth(element.parentNode, ++depth)
        else
            return depth;
    }

    _sortByDepth(a, b)
    {
        if (a.__depth > b.__depth)
            return -1;
        if (a.__depth < b.__depth)
            return 1;
        
        return 0;
    }

});
