fx.ns("fx", class Action {

    constructor(type, data, model, tag, history)
    {
        this._type = type;
        this._data = data;
        this._model = model;
        this._tag = tag;
        this._history = history;
        
        this._json = {};
        this._previous = {};
        this._properties = [];
        this._timestamp = new Date();

        this._forSaving = false;
    }

    get type()
    {
        return this._type;
    }

    get tag()
    {
        return this._tag;
    }

    get data()
    {
        return this._data;
    }

    set data(val)
    {
        this._data = val;
    }

    get model()
    {
        return this._model;
    }

    set json(val)
    {
        this._json = val;
    }

    get json()
    {
        return this._json;
    }

    set previous(val)
    {
        this._previous = val;
    }

    get previous()
    {
        return this._previous;
    }

    set history(val)
    {
        this._history = val;
    }

    get history()
    {
        return this._history;
    }

    set properties(val)
    {
        this._properties = val;
    }

    get properties()
    {
        return this._properties;
    }

    get timestamp()
    {
        return this._timestamp;
    }

    set timestamp(val)
    {
        this._timestamp = val;
    }

    get forSaving()
    {
        return this._forSaving;
    }

    set forSaving(val)
    {
        this._forSaving = val;
    }
    

    get updates()
    {
        let updates = [];

        if (this.type == "update" && this.previous && this.data)
        {
            if (Object.keys(this.previous).length == Object.keys(this.data).length)
            {
                for (let prop in this.previous)
                {
                    if (this.previous[prop] != this.data[prop])
                    {
                        let update = {};
                        update[prop] = this.data[prop];
                        updates.push(update);
                    }
                }
            }
        }
        else
            updates.push(this.data);

        return updates;
    }

    clone()
    {
        let action = new Action();
		for (let property in this)
        {
            if (this[property])
            {
                if (this[property] instanceof Date)
                    action[property] = this[property];
                else
                if (this[property] instanceof Array)
                    action[property] = this[property].slice();
                else
                if (this[property] instanceof fx.Model)
                    action[property] = this[property];
                else
                if (typeof this[property] == "object")
                    action[property] =  Object.assign(Object.create(Object.getPrototypeOf(this[property])), this[property]);
                else
                    action[property] = this[property];
            }
        }

        return action;

        
    }
    
    impacts()
    {
        
        /*if (this.type == "init")
            return true;*/

        let impacts = false;
        for (let i = 0; i < arguments.length; i++)
        {
            if ( this.properties.indexOf(arguments[i]) != -1)
            {
                impacts = true;
                break;
            }
        }

        return impacts;
        
    }

    impactsOnly()
    {
        if (this.properties.length == 0)
            return false;

        let impacts = 0;
        for (let i = 0; i < arguments.length; i++)
        {
            if ( this.properties.indexOf(arguments[i]) != -1)
                impacts++;
        }

        return impacts == this.properties.length;
    }

    


    undo()
    {
        this.model.undo( this );
    }

    redo()
    {
        this.model.redo( this );
    }

});

// filter actions
// extract only need data