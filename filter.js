fx.ns("fx", class Filter extends fx.EventDispatcher {

	constructor()
	{
		super();

		this._changed = false;
		this.transformedData = "";
	}

	get changed()
	{
		return this._changed;
	}
 
	get data()
	{
		if (this._changed)
		{
			this.transformedData = this.exec();
			this._changed = false;
		}

		return this.transformedData;
	}

	set data(val)
	{
		if (this.rawData)
		{
			if (this.rawData instanceof fx.Model)
				this.off("updated", this.refresh, this.rawData);
		}

		if (val)
		{
			if (val != this.rawData)
				this._changed = true;

			this.rawData = val;

			if (this.rawData instanceof fx.Model)
				this.on("updated", this.refresh, this.rawData);
		}
	}

	refresh()
	{
		this._changed = true;
	}

	exec()
	{
		return this.rawData;
	}

});
