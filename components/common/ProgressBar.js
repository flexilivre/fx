fx.ns("fx.components", class ProgressBar extends fx.Component {

    constructor(parameters)
    {
      super();

      this.showLabel = parameters && parameters.showLabel;
    }

    get showLabel()
    {
        return this._showLabel;
    }

    set showLabel(val)
    {
        this._showLabel = val;
    }

    get label()
    {
        return this._label ? this._label.text : "";
    }

    set label(val)
    {
        if (this._label)
        {
            this._label.text = val;
            this.updateDisplay();
        }
    }

    onReady()
    {
        super.onReady();

        this.update(0);
    }

    /**
     * If only position is given, it's used as a percentage (0-100)
     * If total is given, if will be used to calculate what percentage position means.
     * @param {float} position 
     * @param {int} total 
     */
    update(position, total)
    {
        if (!this.initialized) return;
        
        let percentage = position;

        if (total !== undefined)
            percentage = (total == 0) ? 0 : (position * 100 / total);
        
        this.progressInner.width( Math.min(this.realWidth, this.realWidth * percentage/100) );

        if (this._showLabel)
        {
            if (!this._label)
            {
                this._label = new fx.components.Text({className:"label"});
                this.addChild(this._label, {top:"center", left:"center"});
            }

            this._label.text = parseInt(percentage) + " %";
        }
    }

  
    create()
    {
        super.create();
      
        this.progressInner = new fx.components.Box("inner");
        
        this.addChild(this.progressInner, {top:0, left:0, width:0, height:"100%"});
    
    }
  
  });
  