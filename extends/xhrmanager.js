/**
 * Manage the XHR requests :
 * - some XHR requests are used for downloading/uploading assets
 * - some XHR requests are used for communicating with server (save, update, etc...)
 * Modern browser allow up to 6 simultaneous XHR connections
 * So, in order to not have the communication with the server locked till all the download/upload is done,
 * we reserve 4 connections for uploading/downloading and 2 for communication
 */


fx.ns("fx.extends", function XHRManager(quality)
{
    let activeAssetsConnections = 0,
        waitingAssetsConnections = [],
        fullQuality = quality,
        xhrs = {},
        closing = false,
        MAXCONNECTIONS = 3,
        MAXASSETSCONNECTIONS = 3,
        NEXTID = 1000,
        events = fx.EventDispatcher();

    return {
        on : function(event, callback){
            events.on(event, callback);
        },
        off : function(event, callback){
            events.off(event, callback);
        },
        closing : function(){
            return closing;
        },
        loadImage : function(element, isblob, callback)
        {   
            if (isblob)
                element.image = new fx.extends.BlobLoader();
            else
                element.image = new Image();
            
            element.loading = true;
            element.loaded = false;
            
            if (!element.image || !element.image.load || typeof element.image["load"] != 'function')
            {
                callback();
                return;
            }

            loadurl.XHRID = NEXTID++;
            
            let url = this.getURL(element);

            if (activeAssetsConnections < MAXASSETSCONNECTIONS)
            {
                activeAssetsConnections++;

                element.image.on(Image.MEMORY_PROBLEM, function(){
                    events.trigger(Image.MEMORY_PROBLEM);

                    delete( xhrs[this.XHRID] );
                });

                element.image.on(Image.ERROR, function(){
                    activeAssetsConnections--;
                    loadWaitingAssets();

                    delete( xhrs[this.XHRID] );
                });

                let xhr = element.image.load(url,
                    function(){
                    activeAssetsConnections--;
                    loadWaitingAssets();
                    callback();

                    delete( xhrs[this.XHRID] );
                });

                if (xhr)
                    xhrs[element.image.XHRID] = xhr;
            }
            else
            {
                waitingAssetsConnections.push({image:element.image, url:url, callback:callback});
            }
        },
        getURL : function(element)
        {
            return ( (!element.ressource & !fullQuality ) ? element.light_url : element.url );
        },
        loadWaitingAssets()
        {
            if ( waitingAssetsConnections.length > 0 )
            {
                let asset = waitingAssetsConnections.splice(0,1)[0];

                asset.image.XHRID = NEXTID++;

                activeAssetsConnections++;

                asset.image.on(Image.ERROR, function(){
                    activeAssetsConnections--;
                    loadWaitingAssets();

                    delete( xhrs[this.XHRID] );
                });

                let xhr = asset.image.load(asset.url, function(){
                    activeAssetsConnections--;
                    loadWaitingAssets();
                    asset.callback();

                    delete( xhrs[this.XHRID] );
                });

                if (xhr)
                    xhrs[asset.image.XHRID] = xhr;
            }
        },
        clear : function()
        {
            MAXASSETSCONNECTIONS = -1;

            for (let id in xhrs)
            {
                let xhr = xhrs[id];
                if (xhr)
                    xhr.abort();
            }

            closing = true;
        },
    }
        
});



