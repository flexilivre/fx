/**
 * Service used to load Medias : it's a clever queue
 * It loads media one after the other.
 * But it can stop loading one media which is loading, and start loading another one
 * It's design to fit the use of a standard application. 
 * Customer scroll, element are displayed, images are being loaded.
 * If he keeps scrolling, we will try to load next images and not wait for the previous ones to be loaded first.
 */
fx.ns("fx", class MediaLoader extends fx.EventDispatcher {

    constructor(parameters)
    {
        super();
        
        this._maxMedia = parameters && parameters.maxMedia ? parameters.maxMedia : 50;
        this._mediaToFree = parameters && parameters.mediaToFree ? parameters.mediaToFree : 5;
        this._maxMediaLoading = parameters && parameters.maxMediaLoading ? parameters.maxMediaLoading : 3;

        this._queue = [];
        this._currentMedias = [];
        this._loadedMedias = [];

        

        this._checkMemoryHandler = this._checkMemory.bind(this);
    }

    get loading()
    {
        return this._queue.length > 0;
    }

    // used when leaving the application
    clear()
    {
        for (let i = 0; i < this._currentMedias.length; i++)
            this._currentMedias[i].unload();

        this._currentMedias = [];
        this._queue = [];
    }
    
    load(media) 
    {
        if (this._queue.indexOf(media) == -1)
        {
            this._queue.push(media);
            this._process();
        }
        
        return media;
    }

    stop(media, force)
    {
        this.off("complete", this.complete, media);
        this.off("error", this.error, media);

        media._unload();

        // check currentMedias first
        this._currentMedias.remove(media);
        
        // otherwise check queue
        this._queue.remove(media);

        this._loadedMedias.remove(media);
    
        if (!force)
            this._process();
    }

    _process()
    {
        if (this._queue.length > 0 && this._currentMedias.length < this._maxMediaLoading)
        {
            let media = this._queue.shift();
            this._currentMedias.push( media );

            this.on("complete", this.complete, media);
            this.on("error", this.error, media);

            media._load();            
        }

        if (this._checkMemoryTimer)
            clearTimeout(this._checkMemoryTimer);

        this._checkMemoryTimer = setTimeout(this._checkMemoryHandler, 250);
    }

    complete(e) 
    {
        this._currentMedias.remove( e.media );

        if (this._loadedMedias.indexOf(e.media) == -1)
            this._loadedMedias.push(e.media);
            
        this._process();
    }

    error(e) 
    {
        this._currentMedias.remove( e.media );

        this._process();
    }

    // ---- Memory management : media are loaded in Blob. 
    // So we manage to never overpass a maximum number of Blobs loaded at the same time
    // in order to not have any memory problem

    _checkMemory()
    {
        this._checkMemoryTimer = null;

        if (this._loadedMedias.length > this._maxMedia)
        {
            let notUsedMedia = [];
            for (let i = 0; i < this._loadedMedias.length; i++)
            {
                if (this._loadedMedias[i].usage == 0)
                    notUsedMedia.push( this._loadedMedias[i] );
            }

            // we free 5 not used media
            for (let i = 0; i < this._mediaToFree && i < notUsedMedia.length; i++)
                notUsedMedia[i].unload(true);

        }
    }


    /*registerBlob(blob, url)
    {
        if (!this._registredBlobs)
            this._registredBlobs = {}
        
        if (blob == null)
            delete this._registredBlobs[blob];
        else
            this._registredBlobs[blob] = url;

        return this._registredBlobs[blob];
    }

    replaceBlobs(code)
    {
        for(let blob in this._registredBlobs)
        {
            let blobRegex = blob.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            let regex = new RegExp(blobRegex, 'g');
            code = code.replace(regex,this._registredBlobs[blob]);

            let emptyImageRegex = fx.assets.imagePlaceHolder.content.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            regex = new RegExp(emptyImageRegex, 'g');

            code = code.replace(regex,"");
            //code = code.replace(/m_/g,'thumb_');
        }

        return code;
    }*/
});
