fx.ns("fx", class Ajax {
    
    constructor()
    {
        this.NEXTID = 0;
        this.MAX_TRIES = 3;
        this.DELAY_RETRY = 1000;
        this.DELAY_TIMEOUT = 60000; // 1mn
        this.DELAY_TIMEOUT_MAX = 120000; // 2mn
        this.requests = {};
        this.onDoneHandler = this._onDone.bind(this);
        this.onFailedHandler = this._onFailed.bind(this);
        this.retryRequestHandler = this._retryRequest.bind(this);

        this.dom = fx.get("dom");

        this._binds = {};
    }

    request(options, request, parentRequest)
    {
        if (!request) {
            request = { tries: 1, 
                        maxTries : options.maxTries !== undefined ? options.maxTries : this.MAX_TRIES,
                        url:options.url, 
                        data:options.data, 
                        method : options.method || "POST", 
                        callback: options.callback, 
                        id:this.NEXTID, 
                        dataType : options.dataType  || "json",
                        processData: (options.processData !== undefined) ? options.processData : true, 
                        contentType: (options.contentType !== undefined) ? options.contentType : 'application/x-www-form-urlencoded; charset=UTF-8', 
                        parentRequest: parentRequest, 
                        sync : options.sync,
                        progressCallBack : options.progressCallBack,
                        timeout : (options.timeout !== undefined) ? options.timeout : this.DELAY_TIMEOUT };

            
            this.requests[this.NEXTID++] = request;
        }

        if (!(request.data instanceof FormData))
        {
            request.data = request.data || {};
            //request.data.connectionid = request.data.connectionid || Cookies.get("connectionid");
            request.data.debug = Utils.getURLParam("debug");
        }

        let _progressHandler = this._progress.bind(this, request);

        request.xhr = this.dom.ajax({   url:fx.url(request.url),
                                        dataType: request.dataType,  
                                        type:request.method, 
                                        timeout:request.timeout,  
                                        processData : request.processData,
                                        contentType: request.contentType, 
                                        cache:false,  
                                        data:request.data, 
                                        async : !request.sync,
                                        xhr: function()
                                        {
                                            var xhr = new window.XMLHttpRequest();
                                            //Upload progress
                                            xhr.upload.addEventListener("progress", _progressHandler, false);
                                            //Download progress
                                            xhr.addEventListener("progress", _progressHandler, false);
                                            return xhr;
                                        },
                                    })
                                .done( this.onDoneHandler )
                                .fail( this.onFailedHandler );


        
        request.xhr._requestid = request.id;
        
        return request;
    }

    abort(request)
    {
        if (this.requests[request.id] && request.xhr)
        {
            request.xhr.abort();
            this._clean(request);
        }
    }

     _progress(request, evt)
    {
        if (evt.lengthComputable) {
            //var percentComplete = evt.loaded / evt.total * 100;
            if (request.progressCallBack)
                request.progressCallBack(evt.loaded , evt.total);
        }
    }


    
    hasRequests()
    {
        let has = false;
        for (let key in this.requests)
        {
            has = true;
            break;
        };
        return has;
    }
    
    _onDone(data, textStatus, xhr)
    {
        let request = this.requests[xhr._requestid];

        if (data && data.error) 
        {
            if (data.handled)
            {
                if (request.callback)
                    request.callback({error:true, details : data, request : this._jsonRequest(request)});

                this._clean(request);
            }
            else
                this._manageError(request, data);
        }
        else
        {
            if (request.callback)
                request.callback( data ) ;
            this._clean(request);
        }
    }

    _onFailed(xhr, textStatus, errorThrown )
    {
        let request = this.requests[xhr._requestid];

        this._manageError(request, errorThrown);
    }

 
    _manageError(request, details)
    {
        if (!request) return;

        if (request.tries < request.maxTries && details != "abort")
        {
            request.tries++;
            request.toRetry = true;
            request.timeout = Math.min(this.DELAY_TIMEOUT_MAX, request.timeout + this.DELAY_TIMEOUT);
            setTimeout( this.retryRequestHandler ,  this.DELAY_RETRY);
        }
        else
        {
            if (request.callback)
                request.callback({error:true, details : details, request :this._jsonRequest(request)});
            this._clean(request);
        }
    };

    _retryRequest()
    {
        for (let key in this.requests)
        {
            let r = this.requests[key];
            if (r.toRetry)
            {
                r.toRetry = false;
                this.request(null, r );
            }
        }
    };



    _jsonRequest(request)
    {
        return {
            url:fx.url(request.url),  
            dataType: request.dataType,  
            type:request.method, 
            timeout:request.timeout,  
            processData : request.processData,
            contentType: request.contentType, 
            data: request.data, 
            async : !request.sync,
        }
    }

    _clean(request)
    {
        delete(this.requests[request.id]);
        delete(request.data);
        if (request.callback)
            delete(request.callback);
        delete(request.url);
        delete(request.id);
    }
});
