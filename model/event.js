fx.ns("fx", class Event  extends fx.Disposable {

    constructor(type, data, model)
    {
        super();
        
        this._type = type;
        this._data = data;
        this._model = model;
        this._handled = false;
    }

    get type()
    {
        return this._type;
    }

    get data()
    {
        return this._data;
    }

    get detail()
    {
        return this._data;
    }

    get model()
    {
        return this._model;
    }

    get handled()
    {
        return this._handled;
    }

    cancel()
    {
        this.stopPropagation();
        if (this.data.stopPropagation)
            this.data.stopPropagation()
        
        if (this.data.preventDefault)
            this.data.preventDefault()
    }
    
    stopPropagation()
    {
        this._handled = true;
    }
});