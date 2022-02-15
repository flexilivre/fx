fx.ns("fx", class Disposable {

    constructor()
    {
        this._destroyed = false;
    }

    get destroyed()
    {
        return this._destroyed;
    }

    
    /*get className()
    {
		return Object.getPrototypeOf(this).constructor.name
    }*/

    get __objects()
    {
        if (!fx.get("objects"))
            fx.set("objects", {});

        return fx.get("objects");
    }

    register()
    {
        this.__objects[this.id] = this;
    }

    unregister()
    {
        if (this.__objects[this.id])
            delete this.__objects[this.id];
    }
    
    destroy()
    {
        this._destroyed = true;
        
        this.unregister();

        fx.Disposable.free(this);
    }

    /**
     * In javascript, garbadge collector deletes all objects not linked anymore to objects still in use.
     * In order to avoid memory easy leaks, all Disposable object will be automatically cleaned from all their "links" to other objects.
     * In order to not use too much of CPU for that process, we just create a list of object to free. And then every second we clean that list.
     * @param {Object} obj 
     */
    static free(obj)
    {
        if (obj)
        {
            if (fx.Disposable._freeTimer)
                clearTimeout(fx.Disposable._freeTimer);
            
            if (!fx.Disposable._freeList)
                fx.Disposable._freeList = [];
            
            fx.Disposable._freeList.push(obj);
            fx.Disposable._freeTimer = setTimeout(fx.Disposable.free, 1000);
        }
        else
        {
            if (fx.Disposable._freeList)
            {
                let obj;
                while (obj = fx.Disposable._freeList.pop())
                    for(var property in obj)
                        delete obj[property];// = null;   
            }

            fx.Disposable._freeTimer = null;
        }
    }

    
});