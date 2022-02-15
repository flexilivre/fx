/**
 * fx.Model is the base class for any data that would be used in a graphical component.
 * By using objects encapsulated in an fx.Model class (or in any inherited class), graphical component will be updated automatically when data is updated.
 * Any object mutation will create an action that will be propagated through all parent up to the top most object.
 * This allow to be able to monitor any data update at any level of the application. 
 * It allows also to make different graphical component communicate easily (not need of a global EventEmitter or of some cascading events / callbacks)
 * 
 * It inherits from fx.Service, so it has access to all functions to get data from remote sources (AJAX), or local sources (Cookies, LocalStorage, ...).
 * 
 * It mains functions :
 * 
 * - update(name, data) :   A model can not be updated directly. All it's properties are ready only.
 *                              This function is the lone way to update a model property.
 *                              All ui components encapsulating this model will be updated if model is updated (render() function will be called, or update() for fx.Component )
 *                              Reserved names : "delete", "addItem", "empty", "insertItem"
 * 
 *                              name can be omitted, =Example : 
 *                                  > this.data.update({height:100, width:50, left:170});
 *                                  > this.data.update("resize", {height:100, width:50});
 * 
 *	                            If model handles the mutation, and action is created with all details, and an event is dispatch from this model.
 *                              This event will be dispatched from parent to parent, up to the top.
 *                              Any fx.Component ensapsulating this model will be notified and updated.
 * 
 *  - prop(name, value) : add a property that will not propagate it's updates.
 *   
 * In case it's an array :
 * 
 * - getItemAt(index)
 * - length
 * 
 * 
 */
fx.ns("fx", class Model extends fx.Service {
    
    constructor(data, options)
    {
        super();

        // properties array is used to store all data coming from remote model
        // we will use this property to extract those data when it comes to send
        // anything to server.
        this._properties = [];
        this._propertiesNotBinded = [];
        
        this._parentModel = null;
        this._parentProperty = null;
        this._queueEvents = [];
        this._modified = null;

        this._storedParentModelUpdates = [];

        //this._dispatchParentHandler = this._dispatchParent.bind(this);
        
        this._saver = (options && options.saver) ? new options.saver(this) : null;
        
        this.on("updated", this._onUpdated );
        this.on("event", this._onDataEvent );

        this.init(data);   


        // When a model is created, it's still not linked to main model
        // so we store "create" event until it's connected.
        if (Utils.isID(this.id)) // created manually
            this._storedParentModelUpdates.push({type:"updated", action : new fx.Action("create", null, this)});
        
        // Let's enable history here
        if (options && options.history)
            this.history = new options.history(this);
            
            
    }

    /**************************** GETTERS ****************************/

    /**
     * In order to save a model, you have to assign it a saver. See fx.ModelSaver to see an example of remote CRUD saver.
     * By default fx.ModelSaver is used when save() function is called.
     */
    get saver()
    {
        return this._saver;
    }

    set saver(val)
    {
        if (typeof val == "function")
            this._saver = new val(this);
        else
            this._saver = val;
    }

   
    
    get modified()
    {
        // if _modified was never set, we use saver data to know if model was updated
        return (this.saver ? this.saver.lastUpdates.length > 0 : this._modified);
    }

    set modified(val)
    {
        this._modified = val;
    }

    /**
     * Returns Model class. It's either defined by property "_m", if not we just use class name.
     */
    get modelClass()
    {
        return this._m || Object.getPrototypeOf(this).constructor.name
    }

    /**
     * Override this getter in order to add param to save ajax call
     */
    get saveParams()
    {   
        return {};
    }

    /**
     * This getter has to be overrided when Model needs some defaults values (for example values not sent by database of not set)
     */
    get defaults()
    {
        return {};
    }

    get propertiesNotStorable()
    {
        return [];
    }

     /**
     * Returns a JSON version of the Model. Used mostly for Ajax requests
     */
    get JSON()
    {   
        if (this._properties)
        {
            let json = {};
            let propertiesNotStorable = this.propertiesNotStorable.concat(["_m"]);
            for (let i = 0; i < this._properties.length; i++)
            {
                if (propertiesNotStorable.indexOf(this._properties[i]) == -1) 
                    json[ this._properties[i] ] = (this[ this._properties[i] ] instanceof fx.Model) ? this[ this._properties[i] ].JSON : this[ this._properties[i] ];
            }
        
            return json;
        }
    }


    get parent()
    {
        if (this._parentModel instanceof fx.ModelArray)
            return this._parentModel.parentModel;
        
        return this.parentModel;
    }

    get parentModel()
    {
        return this._parentModel;
    }

    set parentModel(val)
    {
        this._parentModel = val;
        this._dispatchStoredParentModelEvents();
    }

    get parentProperty()
    {
        return this._parentProperty;
    }

    set parentProperty(val)
    {
        this._parentProperty = val;
    }
    

    
    /**************************** EVENTS TO OVERRIDE ****************************/

     /**
     * Override this function if you want to be notified everytime model and it's childs are updated.
     * You must always call parent function in order to get parent notified also.
     * @param {fx.Action} action fx.Action object with all details about what update.
     */
    onUpdated(action)
    {
       
    }

    /**
     * Override this function if you want to be notified everytime an event is dispatch on model.
     * 
     * @param {object} e event
     */
    onDataEvent(e)
    {
        
    }

    // TODO : if photo was deleted while uploading, and save is called, save everything before this action only. Next save will save the rest
    // because photoid is still not received, and delete on backoffice won't be possible.
    save(options)
	{
        if (!options)
            options = {};
            
        if (!options.url)
            options.url = this.endpoint;
        
        if (this.saver)
            this.saver.save(options);
    }
    
    /**
     * Override this function is you want to add some special behaviour when model is saved
     * @param {Object} data 
     */
	onSaved(data)
	{
    }

    

    /**************************** PUBLIC FUNCTIONS ****************************/

    init(data)
    {
        if (!data) return;

        // first we remove all already set properties (binded and not)
        for(let i = 0; i < this._properties.length; i++)
            delete this[this._properties[i]];

        for(let i = 0; i < this._propertiesNotBinded.length; i++)
            delete this[this._propertiesNotBinded[i]];

        this._properties = [];
        this._propertiesNotBinded = [];
        
        // in case data has no id, let's create one (in fx, every element has to have an ID)
        // and if not type given in raw model throught "_m" property, let's set class name.
        
        let props = {   
                        id : data.id || Utils.newID(), 
                        _m : data._m || this.modelClass 
                    };

        this._map( Object.assign({}, props, this.defaults, data) /*{...props, ...this.defaults, ...data }*/ );
         
        
        if (!this._m)
            this._setProperty("_m", this.modelClass);

        this.trigger({type:"updated", action : new fx.Action("init", this, this)});
    }

   
    /**
     * Dispatch an event wich will be propagated from parent to parent. Usefull when you want to make component using same model or on same model hierarchy communicate together.
     * @param {string} event event tag
     * @param {Object} parameters sent with event
     * @param {Number} delay in miliseconds before to send event
     */
    event(type, data, delay)
    {
        this.triggerDelay({type:"event", event : new fx.Event(type,  data, this) }, delay);
    }
   
    /**
     * If name given and data given, and data doesn't match any model property, let's disptach to parent unhandled
     * @param {string} name  given as a tag for the mutation. Usefull when you want to optimize you graphical update, with this tag you can decide to update only a specific part. And since mutation action will be propagated to parents, parents can use this tag in order to start some other mutations.
     * @param {object} params object with each property and value
     */
    update(tag, data)
    {
        let history = false;
        if (tag instanceof fx.Action)
        {
            let action = tag;
            // undo
            if (data === true)
                data = Utils.clone(action.previous);
            else // redo
                data = Utils.clone(action.data);
            
            tag = action.tag;
            
            history = true;
        }
        else
        {
            // Check parameter
            if (!data)
            {
                /*if (typeof tag != "object")
                    throw new Error("Wrong parameter in mutate() function");*/
                
                if (tag && typeof tag == "object")
                {
                    data = tag;
                    tag = "";
                }
            }
            else
            {
                if (typeof tag == "object" && typeof data == "object" && data.history !== undefined)
                {
                    history = data.history;
                    data = tag;
                    tag = "";
                }
                else
                if (typeof tag != "string" || typeof data != "object")
                    throw new Error("Wrong parameters in update() function");
            }
        }

        let handled = false;
        
        // let's first see if data match any property in actual model
        // otherwise let call parent mutate function
        let previous = {};
        let properties = [];
        //let same = true;
        for(let property in data)
        {
            
            // if same value, we continue
            //if (data[property] == this[property])
            //    continue;

            // store previous value, will be needed for rollback
            
            previous[property] = this[property];

            //same = same && (previous[property] == data[property]);
            this._setProperty(property, data[property] );

            properties.push(property);

            handled = true;
        }
    
        if (handled || tag)
        {
            let action = new fx.Action("update", data, this, tag);
            action.properties = properties;
            action.previous = previous;
            action.json = this.JSON;
            action.history = history;
            //action.same = same;
            
            this.trigger({type:"updated", action : action});
        }
      
        
    }

    undo(action)
    {
        if (action.type == "create")
            this.delete(true);
        else
        if (action.type == "delete")
        {
            this.trigger({type:"updated", action : new fx.Action("create", null, this, null, true)});
            this._deleted = false;
        }
        else
            this.update(action, true);
    }

    redo(action)
    {
        if (action.type == "create")
        {
            this.trigger({type:"updated", action : new fx.Action("create", null, this, null, true)});
            this._deleted = false;
        }
        else
        if (action.type == "delete")
            this.delete(true);
        else
            this.update(action, false);
    }


    /**
     * When deleting a model, there is 3 cases :
     * - model is part of an array, so we need to remove it from parent array
     * - model is not part of an array, so if it has a parent model, we just set null to it's parent corresponding property.
     * - model has not parent
     */
    delete(history)
    {
        // let's delete properties
        for(let i = 0; i < this._propertiesNotBinded.length; i++)
            delete this[this._propertiesNotBinded[i]];

            
        this._deleted = true;
        this.trigger({type:"updated", action : new fx.Action("delete", null, this, null, history)});
        
    }


    get deleted()
    {
        return this._deleted;
    }

    /**
     * Check if model contain the given value (go through all properties, and find if one of them is equal to the given value)
     * @param {Object} value 
     */
    hasValue(value)
    {
        let keys = Object.keys(this), has = false;
        for (let i = 0; i < keys.length; i++)
        {
            if (this[keys[i]] == value)
            {
                has = true;
                break;
            }
        }
        
        return has;
        //return Object.values( this ).indexOf( value ) != -1;
    }

    /**
     * Adds a property to the model that will not trigger any update event.
     * This function is to be used when we need to link model to an object that is not part of it's properties.
     * This property won't be considered as part of model properties, so it won't be sent to backoffice for saving.
     * @param {String} name 
     * @param {Object} value 
     */
    prop(name, value)
    {
        // if property already exist, we don't add it.
        if (this._properties.indexOf(name) != -1) 
            return;

        if (this._propertiesNotBinded.indexOf(name) == -1)
            this._propertiesNotBinded.push(name);

        this[name] = value;
    }

    /**
     * Adds a property to the model that will trigger any update event
     * @param {String} name 
     * @param {*} value 
     */
    set(name, value)
    {
        this._setProperty(name, this._createModel( value, name ));   
    }


    isChildOf(parent)
    {
        let isChildOf = false;
        let element = this;
        while (!isChildOf && element)
        {
            isChildOf = (element == parent);
            element = element.parent;
        }
        return isChildOf;   
    }

    /**************************** PRIVATE FUNCTIONS ****************************/
   
    _map(data)
    {
        let properties = Object.keys( data );

        for (let i = 0 ; i < properties.length; i++)
        {
            let property = properties[i];
            
            if (property == "_parentModel" || property == "_m" || data[property] instanceof fx.Component)
                continue;
            
            this._setProperty(property, this._createModel( data[property], property )  );   
        }
    }

    /**
     * Creates and returns an fx.Model instance of the given data, and set this model as it's parent model.
     */
    _createModel(data, property)
    {
        let obj;

        if (data === null || typeof data != "object")
            obj = data;
        else
        if (data instanceof fx.Model)
            obj = data;
        else
        if (data["_m"] && models[ data["_m"]  ] ) 
            obj = new models[ data["_m"] ]( data );
        else
        if (data instanceof Array)
            obj = new fx.ModelArray( data );
        else
        if (data != null && typeof data == "object")
            obj = new fx.Model( data );

        if (obj instanceof fx.Model)
        {
            obj.parentModel = this;
            obj.parentProperty = property;
        }

        return obj;
    }

    /**
     * Create a read only property on model, and set it with given value.
     */
    _setProperty(key, value)
    {
        // we define this property only once
        if (!this.hasOwnProperty(key))
        {
            if (this._properties.indexOf(key) == -1)
                this._properties.push(key);

            Object.defineProperty(this, key, {
                                                get : function() { return this["_" + key]; }, 
                                                set : function(value) { 

                                                    if (!this.hasOwnProperty(key))
                                                    {
                                                        fx.log.error("Direct mutation on non existing property : " + key);
                                                    }
                                                    else
                                                    {
                                                        if (this["_" + key] == value)
                                                            return;

                                                        let previous = {};
                                                        previous[key] = this["_" + key];
                                                        this["_" + key] = value;

                                                        // in case update is made directly, we disptach an action to let know update happened
                                                        let data = {};
                                                        data[key] = value;
                                                        let action = new fx.Action("update", data, this);
                                                        action.properties.push(key);
                                                        action.previous = previous;
                                                        action.json = this.JSON;
                                            
                                                        this.trigger({type:"updated", action : action});
                                                    
                                                    }
                                                },
                                                enumerable : true,
                                                configurable : true
                                            }); 
        } 
        else 
        if(this._propertiesNotBinded.indexOf(key) != -1) // created with prop
            this[key] = value
        
        // we set the property
        this["_" + key] = value;
    }

    _onUpdated(e)
    {
       
        this.onUpdated(e.action);

        // actions are propagated until we reach the top model
        if (this.parentModel)
            this._dispatchParent(e);
        else
        if (!this.saver)
            this._storedParentModelUpdates.push( e );
            
        if (this.saver)
            this.saver.handle(e.action);
        
         // in case of delete we cut the link with parent (in order to avoid any memory leak)
         if (e.action && e.action.type == "delete" && this == e.action.model)
            this.parentModel = null;
    }

    _onDataEvent(e)
    {
        this.onDataEvent(e.detail.event);

        if (!e.detail.event.handled)
            this._dispatchParent(e);
    }

    _dispatchParent(e)
    {
        if (this.parentModel)
            this.parentModel.trigger(e);
    }

    _dispatchStoredParentModelEvents()
    {
        if (this.parentModel)
        {
            let update;
            while( update = this._storedParentModelUpdates.shift())
                this.parentModel.trigger(update);
        }
    }

 
    // TODO : Is it usefull to make Model destroyable ?
    //destroy()
    //{
    //    super.destroy();
    //    this._saver.destroy();
    //}


});