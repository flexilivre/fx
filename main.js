    fx.ns("fx", class Main extends fx.EventDispatcher {
    
    constructor()
    {
        super();

        this._currentPopup = null;
        
        this.router = new fx.Router();

        this.on("beforeunload", this.onLeave, window);
        this.on("online", this.onLine, window);
        this.on("offline", this.onOffline, window);
    }

    onReady()
    {
        this.router.init(this.views, this.switchEffectIn, this.switchEffectOut, this.model);

        if (this.model)
            this.model.event( "start" );
    }

    switchTo(view, data)
    {
        this.router.switchTo(view, data);
    }

    get currentView()
    {
        return this.router && this.router.currentView ? this.router.currentView.name : "";
    }

    remove(view)
    {
        this.router.remove(view);
    }

    back()
    {
        this.router.back();
    }

    lock()
    {
        this.router.lock();
    }

    navigateToURL(url, newWindow)
    {
        this.router.navigateToURL(url, newWindow);
    }

    navigateBack()
    {
        let currentAdress = window.location.toString().split('#')[0];   

        window.history.back();

        // in order to navigate until new adress
        let nextAdress = window.location.toString().split('#')[0];

        if (nextAdress == currentAdress)
            this.delay(this.navigateBack, 250);
        
    }

    get hasPopup()
    {
        return this._currentPopup != null;
    }

    popup(popup, onlyIfNoPopup)
    {
        if (this._currentPopup)
        {
            if (onlyIfNoPopup)
                return;

            this._currentPopup.close();
        }
            

        this._currentPopup = popup;
    
        if (this._currentPopup)
        {
            this._currentPopup.viewport("fullscreen");
            this._currentPopup.init();
            
            this._currentPopup.show(true);

            this.on("closed", this._onPopupClosed, this._currentPopup);
        }
    }

    _onPopupClosed()
    {
        this._currentPopup = null;
    }
   
    
    /****************************** EVENTS TO OVERRIDE **************************/
    /**
     * This function is called everytime an update is done on model.
     * @param {fx.Action} action action object will all details about update.
     */
    onDataUpdated(action)
    {

    }

    /**
     * This function is called everytime an event is sent somewhere in model.
     * @param {fx.Event} e event
     */
    onDataEvent(e)
    {
        
    }
    

    onLeave(e)
    {
        if (e.cancel)
        {
            if(!e) e = window.event;

            e.cancelBubble = true;
            e.returnValue = "Votre album n'a pas été sauvegardé. Etes-vous sûre de vouloir quitter cette page ?"; //This is displayed on the dialog
            
            if (e.stopPropagation) e.stopPropagation();
            if (e.preventDefault) e.preventDefault();

            return e.returnValue = "ATTENTION : en quittant sans sauvegarder vous risquez de perdre un partie de votre travail. Veuillez utiliser le bouton QUITTER pour quitter en sauvegardant votre travail.";
        }
    }

    onLine()
    {
        if (this.model)
            this.model.event("online");
    }

    onOffline()
    {
        if (this.model)
            this.model.event("offline");
    }

    get model()
    {
        return this._model;
    }

    set model(val)
    {
        if (!val)
            fx.throwError("Model cannot be null or undefined");
        else
        if (this._model)
            fx.throwError("Model already set on Main application");
        else
        {
            this._model = val;
            this.on("event", this._onDataEvent, this._model);
            this.on("updated", this._onDataUpdated, this._model);
        }
    }

    get views()
    {
        return this._views;
    }

    set views(val)
    {
        if ( val instanceof Array)
            this._views = val;   
        else
            fx.throwError("views parameter must be an array of String");
        
    }


    get switchEffect()
    {
        return this._switchEffect;
    }

    set switchEffect(val)
    {
        this._switchEffect = val;
    }

    get switchEffectIn()
    {
        return this._switchEffectIn || this._switchEffect;
    }

    set switchEffectIn(val)
    {
        this._switchEffectIn = val;
    }

    get switchEffectOut()
    {
        return this._switchEffectOut || this._switchEffect;
    }

    set switchEffectOut(val)
    {
        this._switchEffectOut = val;
    }

     /********************************** PRIVATE FUNCTIONS ************************/

    /*_onDataUpdated(e)
    {
        this.onDataUpdated(e.action);
    }*/

    _onDataEvent(e)
    {
        this.onDataEvent(e.detail.event);
    }

    _onDataUpdated(e)
    {
        this.onDataUpdated(e.action);
    }

});