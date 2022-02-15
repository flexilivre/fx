/**
 * This class is like an Interface to follow in order to code a saver for a model.
 */
fx.ns("fx", class ModelSaver extends fx.Service {

    constructor(model)
    {
        super();

        this._model = model;
        this._saving = false;

        this._lastUpdates = [];
    }

    /**
     * Return model to save
     */
    get model()
    {
         return this._model;
    }

    /**
     * Returns true is saving is going on, false if save already done.
     */
    get saving()
    {
        return this._saving;
    }

    /**
     * Returns last updates since last save
     */
    get lastUpdates()
    {
        return this._lastUpdates;
    }

    /**
     * Override this function if you want to filter actions to save.
     * @param {fx.Action} action 
     */
    handle(action)
    {
        action = action.clone();

        try {
            // filter properties not storable
            if (action.type == "update" && action.model && action.data)
            {
                let propertiesNotStorable = action.model.propertiesNotStorable.concat(["_m"]);
                    
                for(let i = 0; i < propertiesNotStorable.length; i++)
                {
                    let index = action.properties.indexOf( propertiesNotStorable[i] );
                    if (index != -1)
                    {
                        action.properties.removeAt(index);
                    
                        delete action.data[propertiesNotStorable[i]];
                        delete action.previous[propertiesNotStorable[i]];
                        delete action.json[propertiesNotStorable[i]];
                    }
                }

                if ( Object.keys(action.data).length == 0)
                        return;
                
            }
        } catch(e) {
            fx.log.error(e);
        }

        
        let lastAction = this._lastUpdates.last();
        if (lastAction && lastAction.type == "update" && lastAction.model == action.model && action.type == "update" ) // optimize updates of same component
        {
            lastAction.data = Object.assign({}, lastAction.data, action.data);
            lastAction.previous = Object.assign({}, action.previous, lastAction.previous);
            lastAction.properties = lastAction.properties.concat(action.properties).unique();
        }
        else
            this._lastUpdates.push( action );

    }

    /**
     * Override this function to implement saving (remote, local, etc...) 
     * By default this function just empties lastUpdates and calls _saved()
     * @param {Object} options 
     */
    save(options)
	{
        this._saving = true;
    }

    /**
     * When your model is saved, call this function in order in order to set properly saving property and let model know saving is finished.
     * @param {data} data 
     */
	onSaved(data)
	{
        this._saving = false;
        
        this.model.onSaved(data);	
    }

});