fx.ns("fx.extends", class BlobLoader {

    constructor()
    {
        this._loadcallback;
        this._loadurl;
        this._xmlHTTP;
        this._completedPercentage;
        this._events = new fx.EventDispatcher(),
        this._onXMLHttpLoadedHandler = this._onXMLHttpLoaded.bind(this);
        this._onXMLHttpProgressHandler = this._onXMLHttpProgress.bind(this);
        this._onXMLHttpLoadStartHandler = this._onXMLHttpLoadStart.bind(this);
        this._onXMLHttpLoadEndHandler = this._onXMLHttpLoadEnd.bind(this);
        this._onXMLHttpErrorHandler = this._onXMLHttpError.bind(this);
        this._onReadyStateChangeHandler = this._onReadyStateChange.bind(this);
    }
   
    // -- PUBLIC FUNCTIONS


    get blob()
    {
        return this._blob;
    }

    on(event, callback)
    {
        this._events.on(event, callback);
    }

    off(event, callback)
    {
        this._events.off(event, callback);
    }


    load( url, callback) 
    {
        this.src = url;

        this._loadcallback = callback;
        this._loadurl = url;
    
        this._xmlHTTP = new XMLHttpRequest();
        this._xmlHTTP.onload = this._onXMLHttpLoadedHandler;
        this._xmlHTTP.onprogress = this._onXMLHttpProgressHandler;
        this._xmlHTTP.onloadstart = this._onXMLHttpLoadStartHandler;
        this._xmlHTTP.onloadend = this._onXMLHttpLoadEndHandler;
        this._xmlHTTP.onerror = this._onXMLHttpErrorHandler;
        this._xmlHTTP.onreadystatechange = this._onReadyStateChangeHandler;

        this._completedPercentage = 0;

        try
        {
            this._xmlHTTP.open('GET', this._loadurl, true);
            this._xmlHTTP.responseType = 'arraybuffer';
            this._xmlHTTP.send();
        }
        catch(e)
        {
            this._events.trigger(Image.ERROR);
            this._xmlHTTP = null;
        }

        return this._xmlHTTP;
    }

    destroy()
    {
        this.stop();
        if (this._blob)
            (window.URL || window.webkitURL).revokeObjectURL( this._blob );
        this._blob = null;
    }

    stop()
    {
        if (this._xmlHTTP)
        {
            this._xmlHTTP.onload = null;
            this._xmlHTTP.onprogress = null;
            this._xmlHTTP.onloadstart = null;
            this._xmlHTTP.onloadend = null;
            this._xmlHTTP.onerror = null;
            this._xmlHTTP.onreadystatechange = null;
            this._xmlHTTP.abort();

            this._clean();
        }
            
    }


    // --- PRIVATES FUNCTIONS

    _clean()
    {
        this._loadcallback = null;
        this._loadurl = null;
        this._xmlHTTP = null;
    }

    _onXMLHttpLoaded( e ) 
    {
        if (!this._xmlHTTP) 
            return;

        let h = this._xmlHTTP.getAllResponseHeaders(),
            m = h.match( /^Content-Type\:\s*(.*?)$/mi),
            mimeType;

        if (m && m[ 1 ])
            mimeType = m[ 1 ];
        else
            mimeType = 'image/jpg';
        
        try
        {
            let blob = new Blob( [ this._xmlHTTP.response ], { type: mimeType } );
            
            this._blob = (window.URL || window.webkitURL).createObjectURL( blob );

            if ( this._loadcallback ) this._loadcallback();

            this._events.trigger(Image.LOADED);

        }
        catch(e) // Unsufficient memory
        {
            this._events.trigger(Image.MEMORY_PROBLEM);
        }

        this._clean();
    };

    _onXMLHttpProgress( e ) 
    {
        if ( e.lengthComputable ) 
        {
            let actualProgress = parseInt(( e.loaded / e.total ) * 100);
            if (actualProgress != this._completedPercentage) 
            {
                this._completedPercentage = actualProgress;
                this._events.trigger({type:Image.PROGRESS, data :{loaded : e.loaded, total : e.total, percentage : this._completedPercentage} });
            }
        }
    };

    _onXMLHttpLoadStart() 
    {
        this._completedPercentage = 0;
        this._events.trigger(Image.LOAD_START);
    }

    _onXMLHttpLoadEnd() 
    {
        this._completedPercentage = 100;
        this._events.trigger(Image.LOAD_END);
    
    };

    _onXMLHttpError()
    {
        this._events.trigger(Image.ERROR);
        
        this._clean();
    }

    _onReadyStateChange(oEvent) 
    {
        if (this._xmlHTTP.readyState === 4) 
        {
            if (this._xmlHTTP.status === 404 || this._xmlHTTP.status === 500) 
            {
                this._events.trigger({type : Image.ERROR, data : this._loadurl});
                this._clean();
            }
        }
    }

   
});
