fx.ns("fx", class ErrorHandling extends fx.Service {

    constructor()
    {
        super();

        this._startApplicationTimeStamp = new Date();
        window.onerror = this._onError.bind(this);
    }

    get timestamp()
    {
        return (new Date() - this._startApplicationTimeStamp);
    }

    _onError(msg, url, line, column, error)
    {
        this.trigger("global-error", { msg : msg, url : url, line : line, column : column, error : error});
    }

    

});