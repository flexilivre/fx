fx.ns("fx", class DataHandler extends fx.EventDispatcher {

    constructor(data)
    {
        super();

		this._listenedData = [];

		this._autoDelete = true;

		this._initialized = false;

		this.data = data;
	
	}
	
	get initialized(){
		return this._initialized;
	}

    get filter()
	{
		return this._filter;
	}

	set filter(val)
	{
		if (this._filter)
			this.off("updated", this._filterUpdated, this._filter)

		this._filter = val;

		if (this._filter)
		{
			this._filter.data = this._data;
			this.on("updated", this._filterUpdated, this._filter)
		}
		
		if (this.initialized)
			this.onDataUpdated(new fx.Action("update"));
    }
    
    get data()
	{
		if (this._filter)
			return this._filter.data;
		else
			return this._data;
	}

	
	set data(val)
	{
		//if (val && !( val instanceof fx.Model) && typeof val == "object") // TODO : To improve so we can just give any kind of data to a dataHandler (String, Boolean, Array, Object)
		//	val = new fx.Model(val);

		if (val == this._data)
			return;

		if (this._data instanceof fx.Model)
		{
			this.off("updated", this._dataUpdated, this._data);
			this.off("event", this._dataEvent, this._data);
		}

		this._data = val;

		if (this._data && this._data instanceof fx.Model)
		{
			this.on("updated", this._dataUpdated, this._data);
			this.on("event", this._dataEvent, this._data);
		}

		if (this._data && this._filter)
		{
			this._filter.data = this._data;
			this.on("updated", this._filterUpdated, this._filter)
		}

		if (this.initialized && this.data instanceof fx.Model) 
			this.onDataUpdated(new fx.Action("init", null, this.data));	
	}

    /**
	 * Disable/enable automatic deletion of component when model is deleted
	 */
	get autoDelete()
	{
		return this._autoDelete;
	}

	set autoDelete(val)
	{
		this._autoDelete = val;
    }

     /**
	 * To Override when need to apply specific update on data change
	 * @param {fx.Action} action 
	 */
	onDataUpdated(action)
	{
		
    }

    onDataEvent(event) {};

    /**
	 * To override if you want to know that a [sub]child was updated
	 * @param {fx.Action} action 
	 */
	onChildUpdated(action)
	{

	}
	
	init()
	{
		this._initialized = true;
	}

    listenUpdates( data, listen )
	{
		listen = (listen === undefined) ? true : listen;
		
		if (listen)
		{
			if (this._listenedData.indexOf( data ) == -1)
			{
				this._listenedData.push( data );
				if (!this.data || !this.data.hasValue( data ))
				{
					this.on("updated", this._dataUpdated, data);
					if (!data.isChildOf( this.data ) )
						this.on("event", this._dataEvent, data);
				}
			}
		}
		else
		{
			let index = this._listenedData.indexOf( data );
			if (index != -1)
			{
				if (!this.data || !this.data.hasValue( data ))
				{
					this.off("updated", this._dataUpdated, this._listenedData[index]);
					if (!data.isChildOf( this.data ) )
						this.off("event", this._dataEvent, this._listenedData[index]);
				}
				this._listenedData.splice(index, 1);
			}
		}
    }

    _dataUpdated(e)
	{
		if (this.destroyed || !this._listenedData)
			return;

		if (e.action.model == this._data || this._listenedData.indexOf( e.action.model ) != -1)
		{
			if (this.filter && e.action.model instanceof fx.ModelArray)
				this.filter.refresh();
				
			if (e.action.type == "delete" && e.action.model == this._data && this.autoDelete)
				this.hideDestroy();
			else
			if (e.action.updates.length > 0 || e.action.tag)
				this.onDataUpdated(e.action);
		}
		else
			this.onChildUpdated(e.action);
	}
	
	hideDestroy()
	{
		this.destroy();
	}

    _dataEvent(e)
	{
		this.onDataEvent(e.detail.event);
    }
    
    _filterUpdated(e)
	{
		this.onDataUpdated(new fx.Action("update"));
	}
    

});