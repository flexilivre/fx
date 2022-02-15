/**
 * This model saver collects only Create, Update and Delete actions from models defined in models packages.
 * And sends those actions to server by post ajax request.
 * save function has to be called with object defining url for ajax request. Example : this.save({url : "https://www.myserver.com/api"})
 * A post call is done is 2 parameters :
 * - action = "save" 
 * - updates : array of json objects will all data about each update (CREATE, UPDATE, DELETE)
 */
fx.ns("fx", class CrudSaver extends fx.ModelSaver {

    constructor(model, MAXUPDATES)
    {
        super(model);

        this._MAX_UPDATES = MAXUPDATES ? MAXUPDATES : 1000;
    }

    handle(action)
    {
        // if model was not defined in models package, we don't save it
        if (!action.model || action.model._m == "Model" || !action.model._m)
            return;

        // For saving, we store only those actions : update / create / delete
        if ( action.type == "update" ||  action.type == "create" || action.type == "delete" )
            super.handle(action);

    }

    cancel()
    {
        if (this._currentCall)
        {
            this._currentCall.xhr.abort();
            this._currentCall = null;
        }
    }

    reset(full)
    {
        this._saving = false;

        if (full)
            this._lastUpdates = [];
        else
        {
            for (let i = 0; i < this.lastUpdates.length; i++)
                this.lastUpdates[i].forSaving = false;
        }
    }

    /**
     * Override this function to implement saving of your model.
     * @param {Object} options 
     */
    save(options)
	{
        if (!options)
            options = {};

        if (this._saving && !options.force)
            return;

        this._saving = true;

        let updates = this._prepareUpdatesForSending(options.force);

        if (updates.length == 0)
        {
            this.delay(this.onSaved);   
        }
        else
        {   
            let data = { 
                            action:"save", 
                            updates : updates
                        };

            if (this.model.saveParams)
                Object.assign(data, this.model.saveParams);

            if (options.params)
                Object.assign(data, options.params);
            
            this._currentCall = this.post( options.url, data, this.onSaved, options );
        }
    
    }
    
	onSaved(data)
	{
        this._saving = false;
        this._currentCall = null;
        
        if (!data) data = {};

		if (!data.error)
		{
            // Server must send back dictionnary with new IDS => data["oldid"] = "newid";
			// In order to update all id, best strategy is to  navigate last updates sent to server
			if (Object.keys(data).length > 0)
			{
				for (let i = 0; i < this.lastUpdates.length; i++)
				{
					if ( this.lastUpdates[i].model && data[ this.lastUpdates[i].model.id ] )
						this.lastUpdates[i].model.id = data[ this.lastUpdates[i].model.id ];
				}
            }
            
            // if no error, we must remove all action flagged forSaving from lastUpdates
            this._lastUpdates = this.lastUpdates.filter(function(action){ return !action.forSaving; });
		}
		else
		{
            // if error, we must unflag all action flagged forSaving from lastUpdates
            // so those actions can be sent again to server if needed.
            // Let's also save them on localStorage later, or find a solution to recover book updates
            
            for (let i = 0; i < this.lastUpdates.length; i++)
                this.lastUpdates[i].forSaving = false;
		}
        
        this.model.onSaved(data);
    }

    _prepareUpdatesForSending(force)
    {
        let updates = [], numUpdates = 0;
        for (let i = 0; i < this.lastUpdates.length && (numUpdates < this._MAX_UPDATES || force); i++)
        {
            let action = this.lastUpdates[i];
            
		    updates.push( {  
                                type    : action.type, 
                                _m      : action.model._m, 
                                id      : action.model.id,
                                data    : (action.type == "delete") ? undefined : ((action.type == "update") ? action.data : action.model.JSON) 
                            } );

            action.forSaving = true;

            numUpdates++;
        }

        
            
        return updates;
    }

});