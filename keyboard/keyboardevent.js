fx.ns("fx", class KeyboardEvent extends fx.Event {

    constructor(type, originalEvent)
    {
        super(type);

        this._originalEvent = originalEvent;
    }

  
    get originalEvent()
    {
        return this._originalEvent;
    }

    cancel()
    {
        this.preventDefault();
        this.stopPropagation();
    }

    preventDefault()
    {
        if (this._originalEvent)
            this._originalEvent.preventDefault();
    }

    stopPropagation()
    {
        if (this._originalEvent)
            this._originalEvent.stopPropagation();

        super.stopPropagation();
    }

});