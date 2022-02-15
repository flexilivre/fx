fx.ns("fx", class ImageLoader extends fx.EventDispatcher{

    constructor()
    {
        super();

        this._onLoadHandler = this._onLoad.bind(this);
        this._onErrorHandler = this._onError.bind(this);
    }


    get blob()
    {
        return this._img ? this._img.src : null;
    }

    get width()
    {
        return this._img ? this._img.width : 0;
    }

    get height()
    {
        return this._img ? this._img.height : 0;
    }

    load(url)
    {
        if (!this._img)
            this._img = new Image();

        this._img.onload = this._onLoadHandler;
        this._img.onerror = this._onErrorHandler;

        this._img.src = url;

        this.trigger("loadstart");
    }


    _onLoad()
    {
        this.trigger("loaded");
    }

    _onError()
    {
        this.trigger("loaderror");
    }

    destroy()
    {
        super.destroy();

        this._img.onload = null;
        this._img.onerror = null;
        this._onLoadHandler = null
        this._onErrorHandler = null;
        this._img = null;
    }


});