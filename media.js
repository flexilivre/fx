/**
 * TODO : rotation of a media should not result in a new blob
 */
fx.ns("fx", class Media extends fx.Model {

    constructor(data)
    {
        super(data);

        this.loaded = false;
        this.loading = false;
        this.image = null;

        this._usingNumber = 0;

        this._rotation = {};
        this._generating = {};
    }

    get usage()
    {
        return this._usingNumber;
    }

    get mediaWidth()
    {
        return this.mediaObject ? this.mediaObject.width : 0;

        /*if (this.memory)
            return this.memory.width;
        
        if (this.image)
            return this.image.width;
        
        return 0;*/
    }

    get mediaHeight()
    {
        return this.mediaObject ? this.mediaObject.height : 0;

        /*if (this.memory)
            return this.memory.height;
    
        if (this.image)
            return this.image.height;
        
        return 0;*/
    }

    get mediaObject()
    {
        if (this.memory)
            return this.memory;

        return this.image;
    }

    clean()
    {
        try 
        {
            if (this.file)
                this.prop("file", null);

            if (this.memory && this.memory.src)
            {
                    (window.URL || window.webkitURL).revokeObjectURL(this.memory.src);
                    this.prop("memory", null);
            }
        }
        catch(e)
        {
            fx.log.info(e);
        }
    }

    load()
    {
        if (this.loading)
            return;
            
        if (this.loaded)
            this.trigger({type:"complete", media : this});
        else
            fx.medialoader.load( this );
    }

    unload(force)
    {
        fx.medialoader.stop( this, force );
    }


    // TODO : to finish this part
    fetch(rotation, callback)
    {
        if (!this.mediaObject)
            return;

        if (typeof rotation == "function")
        {
            callback = rotation;
            rotation = 0;
        }
        else
            rotation = rotation || 0;

        if (this._getBlob(rotation))
            callback({url : this._getBlob(rotation), width : this.mediaWidth, height : this.mediaHeight, media : this});
        else
        {
            if (this._generating[rotation])
                return;

            this._generating[rotation] = true;
            this._onFetchHandler = this._onFetch.bind(this, rotation, callback);
            fx.graphics.canvasToBlob(this.mediaObject, this.mediaWidth, this.mediaHeight, undefined /* type */, this._onFetchHandler, rotation);
            
        }
            
    }

    _onFetch(rotation, callback, blob)
    {
        this._onFetchHandler = null;
        
        if (this._getBlob(rotation))
            (window.URL || window.webkitURL).revokeObjectURL(blob);
        
        this._registerBlob((window.URL || window.webkitURL).createObjectURL(blob), rotation);
        
        if (rotation == 0 && this.file)
            this.file.url = this._getBlob(rotation);
        
        callback({url : this._getBlob(rotation), width : this.mediaWidth, height : this.mediaHeight, media : this});

        this._generating[rotation] = false;
    }
   
    _load()
    {
        if (this.loaded || this.mediaObject)
        {
            if (this.url)
                this._registerBlob(this.url, 0);
            else
            if (this.file && this.file.url)
                //this._rotation[0] = this.file.url;
                this._registerBlob(this.file.url, 0);

            this.trigger({type:"complete", media : this});
            return;
        }
        
        /*if (this.isBlob)
            this.image = new fx.extends.BlobLoader();
        else
            this.image = new Image();*/

        this.image = new fx.ImageLoader();
        
        this.on(Image.LOAD_START, this.onLoadStart, this.image);
        this.on(Image.LOADED, this.onLoadComplete, this.image);
        this.on(Image.PROGRESS, this.onLoadProgress, this.image);
        this.on(Image.ERROR, this.onLoadError, this.image);
        this.on(Image.MEMORY_PROBLEM, this.onLoadError, this.image);

        this.image.load( this.URL );
    }

    _unload()
    {
        if (this.image)
            this.image.destroy();

        // TODO : destroy also all rotation versions
        for(let rotation in this._rotation)
        {
            if (rotation != 0)
                (window.URL || window.webkitURL).revokeObjectURL( this._getBlob(rotation) );

            this._registerBlob(null, rotation);
        }
            

        
        this.image = null;
        this.loaded = false;
        this.loading = false;
    }

    onLoadStart()
    {
        this.loading = true;
        this.trigger({type:"start", media : this});
    }

    onLoadComplete()
    {
        this.loading = false;
        this.loaded = true;
        this._registerBlob(this.image.blob, 0);
        this.trigger({type:"complete", media : this});

    }

    onLoadProgress(e)
    {
        this.trigger({type:"progress", data : e.detail, media : this});
    }

    onLoadError()
    {
        this.unload(true);
        this.trigger({type:"error", media : this});
    }
    
    

    using(val)
    {
        if (val)
            this._usingNumber++;
        else
            this._usingNumber--;
    }

    _getBlob(rotation)
    {
        return this._rotation[rotation];
    }

    _registerBlob(blob, rotation)
    {
        if (blob == null)
            delete this._rotation[rotation];
        else
            this._rotation[rotation] = blob;
            
        //fx.medialoader.registerBlob(blob, this.URL);
    }
    
    destroy()
    {
        super.destroy();

        this.off(Image.LOAD_START, this.onLoadStart, this.image);
        this.off(Image.LOADED, this.onLoadComplete, this.image);
        this.off(Image.PROGRESS, this.onLoadProgress, this.image);
        this.off(Image.ERROR, this.onLoadError, this.image);
        this.off(Image.MEMORY_PROBLEM, this.onLoadError, this.image);

        this.unload();
        
        if (this.image)
            this.image.destroy();

        this.image = null;
        this.file = null;

    }
});