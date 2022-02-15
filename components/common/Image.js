fx.ns("fx.components", class Image extends fx.Component {

  constructor(data)
  {
    super((data && data instanceof fx.Model ? data :  (data && data.data instanceof fx.Model) ? data.data : (data && data.url) ? data.url : (data && data.data ? data.data : data) ) );

    this.className = data && data.className ? data.className : "";
    this._cover = data && data.cover ? data.cover : false;
    this.assetClassName = (data && data.assetClassName) ? data.assetClassName : "photo";
    this.tooltip = (data && data.tooltip) ? data.tooltip : "";
  }

  
  get data()
  {
    return super.data;
  }

  set data(val)
  {
    super.data = val;

    if (this.initialized)
      this.update();
  }

  get url()
  {
    let url;

    if (this.data)
    {
      if (typeof this.data == "string")
        url = this.data;
      else
      if(this.data && "thumb" in this.data)  
        url = this.data.thumb;
      else
      if(this.data && this.data.url)  
        url = this.data.url;
    }

    return url;
  }

  get src()
  {
    if (this._src)
      return this._src;
    else
      return this.url;

    /*if (this.cover)
      return this._src;
    
    let img = this.find(this.assetClassName ? ("." + this.assetClassName) : ".image");
    if (img)
        return img.src;*/
  }

  set src(val)
  {
    this._src = val;

    if (this.initialized)
        this.update();

    /*if (this.cover)
    {
      let img = this.find(this.assetClassName ? ("." + this.assetClassName) : ".image");
      if (img)
      {
        img.src = "";
        fx.dom.css(img, {"display" : "none"});
      }

      this.css({"background-image" : "url(" + val + ')'});
      this._src = val;
    }
    else
    {
      let img = this.find(this.assetClassName ? ("." + this.assetClassName) : ".image");
      if (img)
          img.src = val;
    }

      fx.dom.toggleClass(this._image, "empty", !val);*/
  }

  get cover()
  {
    return this._cover
  }

  set cover(val) // TODO : create a real switch from Image to Cover Image
  {
      this._cover = val;

      if (this.initialized)
        this.update();
  }

  
  onReady()
  {
    super.onReady();

    this.addClass(this.className);

    if (this.data && this.data.id)
      this.attr('data-id', this.data.id);

    if (this.tooltip)
      this.attr("title", this.tooltip);

    //this._addImage();
    //this.render();
  }

  create()
  {
    this.update();
  }

  update()
  {
      if (this.cover)
      {
        if (this._image && this.node.contains(this._image))
          this._image.remove();

          this.node.innerHTML = "<div class='cover' style='background-image: url(" + (this.src ? this.src : "") + ")'></div>";
      }
      else
      {
        if (this.data instanceof fx.Asset)
          this.node.innerHTML = this.data.render(this.assetClassName);   
        else
        {
          if (!this._image)
          {
            this._image = new window.Image();
            this.node.appendChild( this._image );
            fx.dom.addClass(this._image, "image");
          }
        
          if (this.url || this.src)
          {
            fx.dom.removeClass(this._image, "empty");

            this._addImageListeners(true);
                    
            this._image.src = this.url ? this.url : this.src;
          }
          else
          {
            
            if (this._image)
            {
              fx.dom.addClass(this._image, "empty");
              this._image.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D"; // empty
            }
          }
        }

      }

      this._refreshHandlers();
		  this.updateDisplay();
      
  }


  onDataUpdated(action)
  {
    if (action.impacts("thumb") )
      this.src = this.data.thumb;
    else
    if (action.impacts("url") )
      this.src = this.data.url;
  }


  _addImageListeners(add)
  {
    if (add)
    {
      this.on("load", this._onComplete, this._image);
      this.on("error", this._onError, this._image);
    }
    else
    {
      this.off("load", this._onComplete, this._image);
      this.off("error", this._onError, this._image);
    }
  }
      

  _onComplete()
  {
    this.trigger("complete");

    this._addImageListeners(false);
  }

  _onError()
  {
    this.trigger("error");
  }
  



});
