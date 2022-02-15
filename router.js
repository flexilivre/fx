/**
 * Creates a new router
 * @example fx.router(["ui.View1", "ui.View2", ...]);
 * @method router
 * @memberof fx.router
 */
fx.ns("fx", class Router{

	constructor()
	{
		this.switchEffect;
		this.currentView;
		this.associations = {};
		this.views = [];
		this._showViewHandler;

		this._navigation = [];
	}

	init(appViews, effectIn, effectOut, model)
	{
		this.switchEffectIn = effectIn;
		this.switchEffectOut = effectOut;
		this.model = model;
		
		if (appViews)
		{
			for (let index = 0; index < appViews.length; index++)
			{
				let view = appViews[index];
				let constructor = view;

				if (Utils.typeEqual(view, 'string'))
					constructor = Utils.getConstructor(constructor).fcn;
				else
				{
					fx.throwError('Application views parameter must be an array of Strings listing all main views');
					return;
				}

				if (!Utils.typeEqual(constructor, 'function'))
				{
					fx.throwError('View ' + view + ' can\'t be instanciated');
					return;
				}

				this.views.push( {name : view, instance : null, constructor : constructor} );
			}
		}
	}

	switchTo(viewName, data , noHistory)
	{
		if (this._locked) return;
		/*if (typeof remove !== "boolean")
			remove = false;*/
			
		if (this.currentView && this.currentView == this.getView(viewName))
			return;

		/*if (!Utils.typeEqual(callback, "function"))
			callback = null;*/

		
		// hide current view
		if (this.currentView)
		{
			this._showViewHandler = this._showView.bind(this, viewName, data /*remove, callback*/)
			if (this.currentView.instance) // fix trackjs crash
				this.currentView.instance.hide(this._showViewHandler);
		}
		else
			this._showView(viewName, data /*remove, callback*/);

		if (!noHistory)
			this._navigation.push({viewName : viewName, data : data});
		
	}

	remove(viewName) 
	{
		let view = this.getView(viewName);
		if ( !view) return;

		//this.views.splice(this.views.indexOf(view), 1);


		if (view == this.currentView && this.views.length > 0)
			this.switchTo( this.views[0] );
		
		if (view && view.instance)
		{
			view.instance.destroy();
			view.instance = null;
		}

	}

	navigateToURL(url, newWindow){

		if (this.currentView && this.currentView.instance && !newWindow)
			this.currentView.instance.hide();

		try // IE 11 Problem
		{
			if (newWindow)
			{
				let win = window.open(url, '_blank');
				win.focus();
			}
			else
				window.location.assign( url );
		}
		catch(e)
		{
			window.location.href = url;
		}

	}

	// let's follow user navigation, and get back to previous view 
	back()
	{
		if (this._navigation.length == 0)
			window.history.back();
		else
		{
			this._navigation.pop();
			let view = this._navigation[this._navigation.length - 1];
			if(view)
				this.switchTo(view.viewName, view.data, true);
			else
				window.history.back();
		}
	}

	lock()
	{
		this._locked = true;

		if (this.currentView && this.currentView.instance) // fix trackjs crash
			this.currentView.instance.hide();
	}

	associate(event, view){
		if (this.associations[event])
			this.dissociate(event);

		let handler = this.switchTo.bind(this, view);
		fx.get("events").on(event,  handler);
		this.associations[event] = handler;
	}

	dissociate(event){
		let handler = this.associations[event];
		fx.get("events").off(event, handler );
		delete this.associations[event];
	}

	getView (viewName)
	{
		return this.views.filter( function(view) { 
			if (view.name.indexOf(".") != -1)
			{
				let parts = view.name.split(".");
				return view.name == viewName || parts[parts.length-1] == viewName;
			}
			else
				return view.name == viewName;
		})[0];
	}

	_showView(viewName, data /*remove, callback*/)
	{	
		if (this.currentView && this.currentView.instance && this.currentView.instance.destroyOnSwitch)
		{
			this.currentView.instance.destroy();
			this.currentView.instance = null;
		}
		
		// get view
		let view = Utils.typeEqual( viewName, "string" ) ? this.getView(viewName) : viewName;
		// instanciate it if not yet
		if (!view)
		{
			fx.throwError('Impossible to switch to view ' + viewName + '. It was not found on registed views');
			return;
		}

		if (!view.instance)
		{
			view.instance = new view.constructor();
			if (data || !view.instance.data)
				view.instance.data = data ? data : this.model;

			view.name = viewName;
			view.instance.showEffect = (view.instance.showEffect !== undefined) ? view.instance.showEffect : (view.instance.effect !== undefined ? view.instance.effect : this.switchEffectIn);
			view.instance.hideEffect = (view.instance.hideEffect !== undefined) ? view.instance.hideEffect : (view.instance.effect !== undefined ? view.instance.effect : this.switchEffectOut);
			

			view.instance.viewport("fullscreen");
			view.instance.init();
		}
		else
		{
			if (data !== undefined)
				view.instance.data = data;
		}

		// show view
		view.instance.show(true);

		/*if (remove && this.currentView)
			this.currentView.instance.destroy();*/
			

		this.currentView = view;

		//if (callback) callback()

		this._showViewHandler = null;
		
		
	}
	/*_locationHashChangedHandler = this._locationHashChanged.bind(this);
	window.location.hash = "#" + this._extractName(view.name);
		window.removeEventListener("hashchange", _locationHashChangedHandler, false);
		setTimeout(function(){
			window.addEventListener("hashchange", _locationHashChangedHandler, false);
		}, 250);
		
	_locationHashChanged : function(){
		if (location.hash)
		{
			let hash = location.hash.substring(1);
			let view = this.getView(hash);
			if (view)
				this.switchTo(view);
		}
	},
	_extractName : function(name){
		if (name.indexOf(".") != -1)
		{
			let parts = name.split(".");
			name = parts[parts.length-1];
		}
		return name;
	}*/
});