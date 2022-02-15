/**
 * Override of Image component in order to support download with progress event with XMLHTTPRequest 2
 */
(function(){

    // EVENTS
    Image.LOADED = "loaded";
    Image.PROGRESS = "progress";
    Image.LOAD_START = "loadstart";
    Image.LOAD_END = "loadend";
    Image.ERROR = "loaderror";
    Image.MEMORY_PROBLEM = "memory";

    Image.prototype.on = function(event, callback){
        this.events().on(event, callback);
    };

    Image.prototype.off = function(event, callback){
        this.events().off(event, callback);
    };

    Image.prototype.trigger = function(event){
        this.events().trigger(event);
    };

    Image.prototype.events = function(){
        if (!this._events)
            this._events = new fx.EventDispatcher();

        return this._events;
    };


  
    Image.prototype.load = function( url, callback) 
    {
        this.callback = callback;
        this.url = url;

        if (this.url && (this.url.indexOf("data:image") == 0)) // base64 images loaded directly
        {
            this.trigger(Image.LOAD_START);

            this.onData64LoadedHandler = onData64Loaded.bind(this);
            this.addEventListener("load", this.onData64LoadedHandler);

            this.src = this.url;

            return null;
        }
        else
        {
            this.xmlHTTP = new XMLHttpRequest();

            this.onXMLHttpLoadedHandler = onXMLHttpLoaded.bind(this)
            this.xmlHTTP.onload = this.onXMLHttpLoadedHandler;

            this.onXMLHttpProgressHanlder = onXMLHttpProgress.bind(this);
            this.xmlHTTP.onprogress = this.onXMLHttpProgressHanlder;

            this.onXMLHttpLoadStartHandler = onXMLHttpLoadStart.bind(this);
            this.xmlHTTP.onloadstart = this.onXMLHttpLoadStartHandler

            this.onXMLHttpLoadEndHandler = onXMLHttpLoadEnd.bind(this);
            this.xmlHTTP.onloadend = this.onXMLHttpLoadEndHandler;

            this.onXMLHttpErrorHandler = onXMLHttpError.bind(this);
            this.xmlHTTP.onerror = this.onXMLHttpErrorHandler;

            this.onReadyStateChangeHandler = onReadyStateChange.bind(this);
            this.xmlHTTP.onreadystatechange = this.onReadyStateChangeHandler;

            this.completedPercentage = 0;

            try
            {
                this.xmlHTTP.open('GET', this.url, true);
                this.xmlHTTP.responseType = 'arraybuffer';
                this.xmlHTTP.send();
            }
            catch(e)
            {
                this.trigger(Image.ERROR);
                this.xmlHTTP = null;
            }

            return this.xmlHTTP;
        }

    };

    Image.prototype.destroy = function()
    {
        this.stop();

        if (this.src)
            (window.URL || window.webkitURL).revokeObjectURL( this.src );

        this.blob = null;
        this._events = null;
    };

    Image.prototype.stop = function()
    {
        if (this.xmlHTTP)
            this.xmlHTTP.abort();

        this._clean();    
    };

    Image.prototype._clean = function()
    {
        this.onData64LoadedHandler = null;
        this.onXMLHttpLoadedHandler = null;
        this.onXMLHttpProgressHanlder = null;
        this.onXMLHttpLoadStartHandler = null;
        this.onXMLHttpLoadEndHandler = null;
        this.onXMLHttpErrorHandler = null;
        this.onReadyStateChangeHandler = null;
        

        if (this.xmlHTTP)
        {
            this.xmlHTTP.onload = null;
            this.xmlHTTP.onprogress = null;
            this.xmlHTTP.onloadstart = null;
            this.xmlHTTP.onloadend = null;
            this.xmlHTTP.onerror = null;
            this.xmlHTTP.onreadystatechange = null;
            this.xmlHTTP = null;
        }

        this.callback = null;
        this.url = null;

    }

    function onXMLHttpLoaded( e ) 
    {
        if (!this.xmlHTTP) return;
        let h = this.xmlHTTP.getAllResponseHeaders(),
            m = h.match( /^Content-Type\:\s*(.*?)$/mi),
            mimeType;
        if (m && m[ 1 ])
            mimeType = m[ 1 ];
        else
            mimeType = 'image/jpg';
        
        try
        {
            let blob = new Blob( [ this.xmlHTTP.response ], { type: mimeType } );
            this.onload = onXMLHttpSrcLoaded.bind(this);
            this.blob = this.src = (window.URL || window.webkitURL).createObjectURL( blob );
        }
        catch(e) // Unsufficient memory
        {
            this.trigger(Image.ERROR);
            this.trigger(Image.MEMORY_PROBLEM);
            
            this._clean();
            //this.addEventListener("load", onXMLHttpSrcLoaded.bind(this));
            //this.src = url;
        }
    };

    function onXMLHttpSrcLoaded()
    {
        if ( this.callback ) this.callback.call(this, this );

        this.trigger(Image.LOADED);

        this._clean();
    };

    function onXMLHttpProgress( e ) 
    {
        if ( e.lengthComputable ) 
        {
            let actualProgress = parseInt(( e.loaded / e.total ) * 100);
            if (actualProgress != this.completedPercentage) 
            {
                this.completedPercentage = actualProgress;
                this.trigger({type:Image.PROGRESS, data : {loaded : e.loaded, total : e.total, percentage : this.completedPercentage } });
            }
        }
    };

    function onXMLHttpLoadStart() 
    {
        this.completedPercentage = 0;
        this.trigger(Image.LOAD_START);
    }

    function onXMLHttpLoadEnd() 
    {
        this.completedPercentage = 100;
        this.trigger(Image.LOAD_END);

        this._clean();
    };

    function onXMLHttpError()
    {
        this.trigger(Image.ERROR);
        
        this._clean();
    }

    function onReadyStateChange(oEvent) 
    {
        if (this.xmlHTTP.readyState === 4) 
        {
            if (this.xmlHTTP.status === 404 || this.xmlHTTP.status === 500) 
            {
                this.trigger({type:Image.ERROR, data:this.url});
                this.xmlHTTP = null;
            }
        }
    }

    function onData64Loaded() 
    {
        this.completedPercentage = 100;
        this.trigger(Image.LOAD_END);
        this.trigger(Image.LOADED);

        if ( this.callback ) this.callback.call(this, this );
        
        this._clean();
    }





})();

