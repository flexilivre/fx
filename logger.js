fx.ns("fx", class Logger {
    
    constructor()
    {
        this._mode = Utils.getURLParam("mode"); // TODO : code different modes (silent, verbose, strict)
        this._silentConsole =  {log: () => {}, warn: () => {}, error: () => {} };
    }

    get console()
    {
        if (console && this._mode == "")
            return console;
        else
            return this._silentConsole;
    }

    warning(message)
    {
        if (window.TrackJS && typeof TrackJS.track == "function")
            TrackJS.track(message);
        else
            this.console.warn(message);
    }

    info(message)
    {
        if (window.TrackJS && typeof TrackJS.track == "function")
            TrackJS.track(message);
        else
            this.console.log(message);
    }

    error(message)
    {
        if (window.TrackJS && typeof TrackJS.track == "function")
            TrackJS.track(message);
        else
            this.console.error(message);
    }

    

});