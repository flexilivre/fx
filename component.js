/**
 * Component is base class for any graphical component.
 * It creates dom element based on render() function.
 * It manages all events (dom and custom) on this element, and call render() function every time data is updated.
 * It allows manipulating graphical representation thanks to wrappers (with, height, x, y, addClass, etc...).
 */
// TODO : Component should inherits from Events
fx.ns("fx", class Component extends fx.DataHandler {

	constructor(data, tag)
	{
		super(data);

		this._tag = tag || "div";

        this._childs = [];
		
		this._parent;
        this._effect = undefined;
		
        this._visible = false;
		this._animating = false;
		this._enabled = false;
		
		this._node;
		this._viewport = {};
		this._id = Utils.newID();
        
		this._realWidth;
		this._realHeight;
		this._realPosition = {top:0, let:0};


		this._visibleAtStart = true;
		this._pointerEvents = true;
		this._registeredClasses = [];
		this._registeredAttributes = [];
		this._updateDisplayAsked = true;

		this._className = "";

		this._needRender = false;
		this._nbChildsRender = 0;

		this._contextMenu = false;

		this._currentPopup = null;

		this._destroyOnSwitch = false;

		this.destroyHandler = this.destroy.bind(this);
	}
	
	// ----------------------- GETTERS / SETTERS ---------------------- //
	
	/**
	 * Component unique id (same id on DOM)
	 */
	get id(){ 
		return this._id;
	}

	set id(val)
	{
		this._id = val;
		if (this._node)
			this._node.setAttribute("id", this.id );
	}

	/**
	 * Shows/Hide a component
	 */
	get visible(){
		return this._visible;
	}

	set visible(val){
		this._visible = val;

		if (this._visible)
			this.show();
		else
			this.hide();
	}

	get globalyVisible()
	{
		let visible = this.css("opacity") == 1 && this.css("visibility") == "visible";
		let parent = this.parent;
		while (visible && parent)
		{
			visible = visible && parent.css("opacity") == 1 && parent.css("visibility") == "visible";
			parent = parent.parent;
		}
		
		return visible;
	}

	/**
	 * Enable/disables a component (mouse events)
	 */
	get enabled()
	{
		return this._enabled;
	}

	set enabled(val)
	{
		if (val)
			this.enable();
		else
			this.disable();
	}

	/**
	 * Set component visible/not visible at start.
	 * By default component are visible when created thr first time.
	 */
	get visibleAtStart(){
		return this._visibleAtStart;
	}

	set visibleAtStart(val)
	{
		this._visibleAtStart = val;
		if (this.initialized)
			this.visible = val;
	}


	/**
	 * If set to true and used as view in router, this component will be destroy after switching to new view
	 */
	get destroyOnSwitch()
	{
		return this._destroyOnSwitch;
	}

	set destroyOnSwitch(val)
	{
		this._destroyOnSwitch = val;
	}

	/**
	 * Enable/disables pointers event on component
	 */
	get pointerEvents()
	{
		return this._pointerEvents;
	}

	set pointerEvents(val){
		this._pointerEvents = val;
	}

	/**
	 * True while component is animated (fx.animate)
	 */
	get animating(){
		return this._animating;
	}

	set animating(val){
		this._animating = val;
	}

	/**
	 * Component's Class name in DOM
	 */
	get className(){
		return Object.getPrototypeOf(this).constructor.name + (this._className ? (" " + this._className) : "");
	}

	set className(val)
	{
		this._className = val;
	}
	
	/**
	 * Component's class names in DOM (in DOM component has class name of all his parents)
	 */
	get classNames(){
		
		let classNames = [];
		let element = this;
		while(Object.getPrototypeOf(element))
		{
			element = Object.getPrototypeOf(element)
			if (element.constructor.name != "Object")
				classNames.push(element.constructor.name);

			if (element.constructor.name == "Component")
				break;
		}
		return classNames;
	}

	/**
	 * Absolution calculated position
	 */
	get realPosition(){
		return this._realPosition;
	}

	/**
	 * Effect name from fx.animate
	 */
	get effect()
	{
		return this._effect;
	}

	set effect(name)
	{
		if (name && !fx.animate[name])
			fx.throwError("Effect " + name + " does not exisit in fx.animate");
		else
			this._effect = name ? name : "";
	}

	get showEffect()
	{
		return this._showEffect;
	}

	set showEffect(name)
	{
		if (name && !fx.animate[name])
			fx.throwError("Effect " + name + " does not exisit in fx.animate");
		else
			this._showEffect = name ? name : "";
	}

	get hideEffect()
	{
		return this._hideEffect;
	}

	set hideEffect(name)
	{
		if (name && !fx.animate[name])
			fx.throwError("Effect " + name + " does not exisit in fx.animate");
		else
			this._hideEffect = name ? name : "";
	}

	/**
	 * DOM node to which this component is linked
	 */
	get node(){
		return this._node;
	}
	
	/**
	 * Calculated width
	 */
	get realWidth(){
		return this._realWidth && !isNaN(parseInt(this._realWidth)) ? this._realWidth : this.measuredWidth();
	}
	
	/**
	 * Calculated height
	 */
	get realHeight(){
		return this._realHeight && !isNaN(parseInt(this._realHeight))? this._realHeight : this.measuredHeight();
	}

	/**
	 * Calculated Y (top) absolute position
	 */
	get y()
	{
		return parseFloat(this.realPosition ? this.realPosition.top : this.top());	
	}

	set y(val)
	{
		this.top(val);
	}
	
	/**
	 * Calculated X (left) absolute position
	 */
	get x()
	{
		return parseFloat(this.realPosition ? this.realPosition.left : this.left());	
	}

	set x(val)
	{
		this.left(val);
	}
	
		/**
	 * Return scroll top value
	 */
	get scrollTop()
	{
		return this.node ? this.node.scrollTop : 0;
	}

	/**
	 * Sets scroll top value
	 */
	set scrollTop(val)
	{
		if (this.node)
			this.node.scrollTop = val;
	}

	/**
	 * Return scroll left value
	 */
	get scrollLeft()
	{
		return this.node ? this.node.scrollLeft : 0;
	}

	/**
	 * Sets scroll top value
	 */
	set scrollLeft(val)
	{
		if (this.node)
			this.node.scrollLeft = val;
	}

	get toolTip()
	{
		return this._toolTip;
	}

	set toolTip(val)
	{
		this._toolTip = val;

		this._setAttribute();	
		//if(!val)
			//fx.get("tooltip").hide();
	}

	get toolTypeStyle()
	{
		return this._toolTypeStyle;
	}

	set toolTypeStyle(val)
	{
		this._toolTypeStyle = val;
	}

	_setAttribute()
	{
		if (this.initialized)
			this.attr("toolTip", this.toolTip);
	}
	/**
	 * Override this function in order to customize context Menu on this component.
	 * This function has to return an array of object. Each object has to have a "label" property and a "code" property.
	 * "label" property will be displayed in Menu, and "code" property will be sent in event handler onContextMenu
	 * 
	 * Example :
	 * contextMenu(e)
	 * {
	 * 		return [
	 *             	{label : "Edit", code : "edit"},
	 *             	{label : "Enable", code : "visible"},
	 * 				{label : "Duplicate", code : "duplicate"}
	 * 		];
	 * }
	 * 
	 * onContextMenu(item)
	 * {
	 * 		console.log(item);
	 * }
	 * 
	 */
	contextMenu(e)
	{
		return this._contextMenu;
	}

	/*set contextMenu(val)
	{
		this._contextMenu = val;
	}*/


	/**
	 * Return parent component
	 */
	get parent()
	{
		return this._parent;
	}
	

	/**
	 * Override this function in order to create component childs.
	 */
	create() {}

	/**
	 * Override this function if you need some components to be created only after create() function was called.
	 */
	postCreate() {}

	/**
	 * Override this function in order to create component width HTML. Every time component data is update, this HTML is refreshed
	 */
	render() {}

	/**
	 * Override this function if you need to perform any action when component is ready for the first time (childs created, displayed, resized, positionned)
	 */
	onReady() {}

	
	/**
	 * The first time data is set, this function is called with action.type == "init" so you can set your component.
	 * Then every time data is updated, this function is called with an action containing properties which were updated.
	 * @param {fx.Action} action 
	 */
	onDataUpdated(action)
	{
		super.onDataUpdated(action);

		this.update();
	}

	/**
	 * Events are sent throught model and can be caught in any component where model is present.
	 * Event are bubbling from bottom to top.
	 * @param {fx.Event} event 
	 */
	onDataEvent(event)
	{
		super.onDataEvent(event);
	}

	/**
	 * Override this function if you need to perform any action after component is resized & positionned
	 */
	onDisplayUpdated() {}

	/**
	 * To override in order to get the item clicked on ContextMenu
	 */
	onContextMenu(item)
	{
		
	}
	
	
	/**
	 * This function create the component and adds it either to it's parent, if it's has not parent component is added to document.body.
	 */
	init()
	{
		if (this.initialized)
		{
			this._initialize();

			//if (!this._needRender)
			//{
			//	for( let i = 0; i < this._childs.length; i++)
			//		this.addChild( this._childs[i] , this._childs[i].viewport);

				this.resize();
				this.position();

				this.onReady();
			//}
			
		}
		else
		{
			this._initialize();

			this.create();

			this.postCreate();
			this._checkRenderAndCreate();

			this.resize();
			this.position();
			
			super.init();

			this._initChildren();

			this._applyRegisteredEvents();
			
			this._applyCSS();

			this._setAttribute();

			this._setVisilibityAtStart();
			
			this._setContextMenu();
			
			this.delay(this.onDisplayUpdated, 10);
			
			this.onReady();

			if (this.data && !this._needRender)
				this.onDataUpdated(new fx.Action("init", null, this.data));
		}
	}

	/**
	 * Call this function to disable component and display waiting animation.
	 * It's usefull when loading data is needed, and takes some time for example.
	 * @param {Boolean} val : if true, displays waiting state, otherwiser removes it
	 * @param {String} text : text displayed during waiting state
	 * @param {Boolean} style : possible values : 
	 * 							- "light" : light opacity
	 * 							- "dark" (default): heavy opacity
	 */
	loading(val, text, style)
	{
		if (val)
        {
			if (this._loading)
				return;

			if (!this._loaderComponent)
			{
				if (fx.assets.loader)
				{
					this._loaderComponent = new fx.components.Box();

					if (text)
					{
						this._loaderComponent = new fx.components.Box();
						let vbox = new fx.components.VBox({className:"inner"});
						vbox.addChild(new fx.components.Image(fx.assets.loader), {width : 50, height : 50});
						vbox.addChild(new fx.components.Text(text) );
						this._loaderComponent.addChild(vbox, {width:"100%", height:80, top:"center", left:"center"});
					}
					else
					{
						this._loaderComponent.addChild(new fx.components.Image(fx.assets.loader), {width:50, height:50, top:"center", left:"center"} );
					}
						
				}
				else
					this._loaderComponent.addChild(new fx.components.Text(text ? text : "Chargement..."), {width:50, height:50, top:"center", left:"center"} );
					
				this.addClass("__loading");
				this._loaderComponent.addClass("loading");
				if (style)
					this._loaderComponent.addClass(style);
			}
                
			let childs = this.getChilds();
			//this._loadingOpacity = {};
			if (childs)
				for (let i = 0; i < childs.length; i++)
				//{
					//this._loadingOpacity[childs[i].id] = childs[i].css("opacity");
					//childs[i].css("opacity", 0.1);
					childs[i].addClass("_loading");
				//}
					
			
			//this.disable();

            this.addChild(this._loaderComponent, {width:"100%", height:"100%"});
        }
        else
        {
			if (!this._loading)
				return;

			let childs = this.getChilds();
			if (childs)
				for (let i = 0; i < childs.length; i++)
				//{
					/*if (this._loadingOpacity && this._loadingOpacity[childs[i].id] )
						childs[i].css("opacity", this._loadingOpacity[childs[i].id]);
					else
						childs[i].css("opacity", "");*/
						childs[i].removeClass("_loading");
				//}
					
			this.delay(this._removeLoading, 1000);

            if (this._loaderComponent)
				this.removeChild(this._loaderComponent);
				
			this._loaderComponent.destroy();
			this._loaderComponent = null;

			//this.enable();
		}
		
		this._loading = val;

		this._updateLoadingScale();
	}

	_removeLoading()
	{
		this.removeClass("__loading");
	}
	
	_updateLoadingScale()
	{
		if (this._loaderComponent && this.node)
		{
			let scale = 1/fx.graphics.getScale(this.node);
			if (scale != 1)
				this.css(this._loaderComponent.find(".inner"), {"transform" : "scale(" + scale + ")"});
		}
	}

	/**
	 * Call this function in order to force component to resize and re-position.
	 */
	updateDisplay(onlyIfAsked)
	{
		if (!this.initialized) return;

		if (onlyIfAsked && !this._updateDisplayAsked)
			return;

		if (!this.visible)
		{
			this._updateDisplayAsked = true;
			return;
		}
	
		this.resize();
		this.position();

		for (let i = 0; i < this._childs.length; i++)
			this._childs[i].updateDisplay();
		
		this._updateDisplayAsked = false;

		this._updateLoadingScale();

		//this.delay(this.onDisplayUpdated, 10);
		this.onDisplayUpdated();
	}

	/**
	 * Onverride  this function to destroy all what you created.
	 * All properties are automaticall destroyed, and all event handler are removed automatically.
	 */
	destroy()	
	{
		super.destroy();
		
		// we disable the component
		this.disable();
		
		// let's remove and destroy all childs
		this.removeAllChild(true);

		// if it has a parent, let's call parent removeChild so it's remove from childs and from screen
		if (this.parent)
			this.parent.removeChild( this, false );
		else
			fx.dom.remove(this.id);
		
		fx.get("contextMenu").unregister(this);
		
	}
	
	/**
	 * Return child component with given id
	 * @param {String} id 
	 */
	getChild(id) 
	{
		for (let index = 0; index < this._childs.length; index++)
		{
			if (this._childs[index].id == id)
				return this._childs[index];
		}
		return null;
	}

	getChildIndex(child) 
	{
		let indexOfChild;
		for (let index = 0; index < this._childs.length; index++)
		{
			if (this._childs[index].id == child.id)
			{
				indexOfChild = index;
				break;
			}
		}
		return indexOfChild;
	}

	/**
	 * Return child component containing given data
	 * @param {Object} data 
	 */
	getChildFromData(data)
	{
		for (let index = 0; index < this._childs.length; index++)
		{
			if (this._childs[index].data == data)
				return this._childs[index];
		}
		return null;
	}
	
	/**
	 * Return all child components
	 */
	getChilds()
	{
		return this._childs;
	}

	/**
	 * Return true if given child is as child of component.
	 * @param {fx.Component} child 
	 */
	hasChild(child){
		let has = false;
		if (child instanceof fx.Component)
		{
			for (let index = 0; index < this._childs.length; index++)
				has = has || this._childs[index].id == child.id;
		}
		return has;
	}
	
	/**
	 * Add a child to component. Child will be set with given viewport (width, height, left/right, top/bottom).
	 * [optional] effect will be applied to child.
	 * [optional] index : child will be added at given index. If ommited, child will be added at the end.
	 * @param {fx.Component} child 
	 * @param {Object} viewport 
	 * @param {String} effect 
	 * @param {int} index 
	 */
	addChild(child, viewport, effect, index)
	{
		if (!(child instanceof fx.Component))
			throw new Error('fx.Component.addChild(child) : child must be an instance of fx.Component');
		else
		if (window[child.id])
			fx.throwError("Child " + child.classNames[0] + " was already added ");
		else
		{
			child._parent = this;
		
			if (index !== undefined)
			{
				child._index = index;
				this._childs.splice(index, 0, child);
			}
			else
				this._childs.push(child);

			if (viewport)
				child.viewport(viewport);

			if (effect)
				child.effect = effect;

			if (this.initialized)
			{
				child.init();
				child.updateDisplay();

				this._applyRegisteredEvents();
			}
				

			return child;
		}
	}
	
	/**
	 * Remove child from component.
	 * [optional] destoy : if true, child is destroyed
	 * @param {fx.Component} child 
	 * @param {Boolean} destroy 
	 */
	removeChild(child, destroy)
	{
		if (destroy)
			child.destroy();

		let index = this._childs.indexOf(child);

		if (index != -1)
		{
			fx.dom.remove(child.id);
			this._childs.splice(index, 1);
		}

		return this;
	}
	
	/**
	 * Removes all childs from component
	 * [optional] destoy : if true, all childs are destroyed
	 * @param {boolean} destroy 
	 */
	removeAllChild(destroy)
	{
		if (this._childs)
		{
			let childs = this._childs.slice(0);
			for (let index = 0; index < childs.length; index++)
			{
				if (destroy)
					childs[index].destroy();
				else
					fx.dom.remove(childs[index].id);
			}
		}
		
		this._childs = [];
		return this;
	}
	
	/**
	 * Move child1 to before position in DOM
	 * @param {fx.Component} child1 
	 * @param {fx.Component} child2 
	 */
	moveChildBefore( child1, child2 )
	{
		let index = this._childs.indexOf(child1);
		let newIndex = this._childs.indexOf(child2);
		
		// TODO : check this part
		this._childs.move( index, newIndex);

		this.node.insertBefore( child1.node, child2.node);
	}

	/**
	 * Move child1 to after position in DOM
	 * @param {fx.Component} child1 
	 * @param {fx.Component} child2 
	 */
	moveChildAfter(child1, child2) 
	{
		let index = this._childs.indexOf(child1);
		let newIndex = this._childs.indexOf(child2);
		
		// TODO : check this part
		this._childs.move( index, newIndex+1);

		this.node.insertBefore( child1.node, child2.nextSibling);
	}

	/**
	 * Shows or hide component
	 * if val is not given, toggle component visibility.
	 * if val is give, and set to true, component is shown.
	 * @param {Boolean} val 
	 */
	toggle(val)
	{	
		if (val === undefined)
			val = !this.visible;

		if (val)
			this.show();
		else
			this.hide();
	}
	
	/**
	 * Shows component
	 * callback is called when component is visible
	 * effect : component is showed with given effect (fx.animate)
	 * @param {Function} callback 
	 * @param {String} effect 
	 */
	show(callback, effect)
	{
		if (!this.initialized || this.visible)
		{
			this._visibleAtStart = true;
			if (callback && typeof callback == "function") callback();
			return;
		}

		this._visible = true;

		if (typeof callback == "string")
		{
			effect = callback;
			callback = null;
		}

		if (!this.enabled)
			this.enable();

		if (fx.effectsEnabled && ( effect !== undefined || this._effect !== undefined || this._showEffect !== undefined) && fx.animate && fx.animate[effect ? effect : (this._showEffect ? this._showEffect : this._effect)])
		{
			fx.animate[effect ? effect : (this._showEffect ? this._showEffect : this._effect)]["show"](this, (typeof callback == "function") ? callback : null);
			
			if (this.pointerEvents)
				this.css({"pointer-events" : ""});
		}
		else
		{
			let css = {"opacity": 1, "visibility" : "visible"};

			if (this.pointerEvents)
				css.pointerEvents = "";

			this.css(css);
				
			if (typeof callback == "function") callback();

			this.updateDisplay(true);
		}

		
		if (this.data &&  this.data instanceof fx.ModelArray)
           this.data.refresh();
	}
	
	/**
	 * Hides component
	 * callback is called when component is hidden
	 * effect : component is hidden with given effect (fx.animate)
	 * force : tries to hide component event if alreay hidden
	 * @param {Function} callback 
	 * @param {String} effect 
	 * @param {Boolean,} force
	 */
	hide(callback, effect, force)
	{
		if (!this.initialized || (!this.visible && !force))
		{
			this._visibleAtStart = false;
			if (callback && typeof callback == "function") callback();
			return;
		}

		this._visible = false;
		
		if (typeof callback == "string")
		{
			effect = callback;
			callback = null;
		}

		if (this.enabled)
			this.disable();

		if (fx.effectsEnabled && !force && fx.animate[effect ? effect : (this._hideEffect ? this._hideEffect : this._effect)])
		{
			fx.animate[effect ? effect : (this._hideEffect ? this._hideEffect : this._effect)]["hide"](this, (typeof callback == "function") ? callback : null);

			if (this.pointerEvents)
				this.css({"pointer-events" : "none !important"});
		}
		else
		{
			let css = {"opacity": 0, "visibility" : "hidden"};

			if (this.pointerEvents)
				css.pointerEvents = "none !important";

			this.css(css);
				
			if (typeof callback == "function") callback();
		}

	}


	hideDestroy()
	{
		this.hide( this.destroyHandler);
	}
	
	
	/**
	 * Refresh component HTML if created with render function
	 */
	update(force)
	{
		if (this.initialized && this.node && (this._needRender || force))
		{
			// we use delay here, so if too many updates happen at same time, component is refreshed only once
			this.delay(this._update, 10);
			/*this.node.innerHTML = this.render();
			this._refreshHandlers();
			this.updateDisplay();*/
		}
	}

	_update()
	{
		if (this.initialized && this.node)
		{
			this.node.innerHTML = this.render();
			this._refreshHandlers();
			this.updateDisplay();
		}
	}

	/**
	 * Return position in dom of given element, or if not element given it return Component position in DOM.
	 * @param {HTMLElement} element 
	 */	
	childPosition(element) {
		return fx.dom.position( element ? this.find(element) : this.node );
	}
	
	/**
	 * Enable mouse events on component
	 */
	enable(){

		if (/*this.enabled ||*/ !this.initialized)
			return;

		this.removeClass("disabled");

		this._enabled = true;

		return this;
	}
	
	/**
	 * Disable mouse events on component
	 */
	disable(){

		if (/*!this.enabled ||*/ !this.initialized)
			return;

		this.addClass("disabled");

		this._enabled = false;

		return this;
	}
	
	
	/**
	 * Resize component according to viewport property
	 */
	resize()
	{
		// let's calculate _realWidth and _realHeight
		this._realWidth;
		this._realHeight;
		
		if (this._viewport.width !== undefined)
		{
			if (this._viewport.width == "fill")
			{
				let totalWidth = 0;

				if (this.css("position") == "absolute")
					totalWidth = parseFloat( this.css("left") );
				else
				{
					let childs = this.parent.getChilds();
					
					for (let i = 0; i < childs.length; i++)
					{
						if (childs[i].visible && childs[i].id != this.id)
							totalWidth += childs[i].realWidth;
					}
				}

				this._realWidth = (this.parent ? this.parent.realWidth : fx.dom.width(window)) - totalWidth;
			}
			else
			if (typeof this._viewport.width == "string" && this._viewport.width.endsWith("%"))
			{
				if (typeof this._viewport.left == "string")
				{
					if (this._viewport.left.endsWith("%"))
						this._realWidth = (this.parent ? this.parent.realWidth : fx.dom.width(window) ) * (parseFloat(this._viewport.width) / 100) -  (this.parent ? this.parent.realWidth : fx.dom.width(window) ) * (parseFloat(this._viewport.left) / 100);
					else
					if (this._viewport.left == "center")
						this._realWidth = (this.parent ? this.parent.realWidth : fx.dom.width(window) ) * (parseFloat(this._viewport.width) / 100);					
					else
						this._realWidth = (this.parent ? this.parent.realWidth : fx.dom.width(window) ) * (parseFloat(this._viewport.width) / 100) - parseFloat(this._viewport.left ? this._viewport.left : 0);					
				}
				else
					this._realWidth = (this.parent ? this.parent.realWidth : fx.dom.width(window) ) * (parseFloat(this._viewport.width) / 100) - parseFloat(this._viewport.left ? this._viewport.left : 0);					
			}
			else
			if (this._viewport.width == "max-content") // max-content, etc...
				this._realWidth = this._viewport.width;
			else
			if (this._viewport.width == "auto") // max-content, etc...
				this._realWidth = "";
			else
				this._realWidth = parseFloat( this._viewport.width );
		}
		else 
		{
			this._realWidth = undefined;
			this.toFinishResize = true;
		}

		if (this._viewport.height !== undefined)
		{
			if (this._viewport.height == "fill")
			{
				//this.toFinishResize = true;
				//this._realHeight =  undefined;//(this.parent ? this.parent.realHeight : fx.dom.height(window) ) * (parseFloat(this._viewport.height) / 100)

				let totalHeight = 0;
				
				if (this.css("position") == "absolute")
					totalHeight = parseFloat( this.css("top") );
				else
				{
					let childs = this.parent.getChilds();
				
					for (let i = 0; i < childs.length; i++)
					{
						if (childs[i].visible && childs[i].id != this.id)
							totalHeight += childs[i].measuredHeight();
					}
				}

				this._realHeight = (this.parent ? this.parent.realHeight : fx.dom.height(window)) - totalHeight;
			}
			else
			if (typeof this._viewport.height == "string" &&  this._viewport.height.endsWith("%") )
			{
				if (typeof this._viewport.top == "string" && this._viewport.top.endsWith("%"))
					this._realHeight =  (this.parent ? this.parent.realHeight : fx.dom.height(window) ) * (parseFloat(this._viewport.height) / 100)  - (this.parent ? this.parent.realHeight : fx.dom.height(window) ) * (parseFloat(this._viewport.top) / 100) ;
				else
					this._realHeight =  (this.parent ? this.parent.realHeight : fx.dom.height(window) ) * (parseFloat(this._viewport.height) / 100)  - parseFloat(this._viewport.top ? this._viewport.top : 0);
			}
			else
			if (this._viewport.height == "max-content")
				this._realHeight = this._viewport.height;
			else
			if (this._viewport.top && this._viewport.bottom)
			{
				let parentHeight = (this.parent ? this.parent.realHeight : fx.dom.height(window));
				let top = ( typeof this._viewport.top == "string" && this._viewport.top.endsWith("%")) ? ( (parseFloat(this._viewport.top) / 100) * parentHeight ) : this._viewport.top;
				let bottom = ( typeof this._viewport.bottom == "string" &&  this._viewport.bottom.endsWith("%")) ? ( (parseFloat(this._viewport.bottom) / 100) * parentHeight ) : this._viewport.bottom;
				this._realHeight = parentHeight - top - bottom;
			}
			else
			if (this._viewport.height == "auto")
				this._realHeight = "";
			else
				this._realHeight = parseFloat( this._viewport.height );
		}
		else 
		{
			this._realHeight = undefined;
			this.toFinishResize = true;
		}
	
		
		this.css({ width : this._realWidth, height : this._realHeight !== undefined ? this._realHeight : "auto"});

		return this;
	}

	
		
	/**
	 * Position component according to viewport property
	 */
	position()
	{
		this._realPosition = {};
		
		if ( this._viewport.top === undefined && this._viewport.left  === undefined && this._viewport.bottom  === undefined && this._viewport.right  === undefined ) // no position
		{
			this._realPosition.top = 0;
			this._realPosition.left = 0;
		}
		
		if ( this._viewport.top == "center" || this._viewport.left == "center" || this._viewport.bottom == "center" || this._viewport.right == "center")
		{
			if (this._viewport.left == "center" || this._viewport.right == "center")
				this._realPosition.left = ((this.parent ? this.parent.realWidth : fx.dom.width(window) ) - this.realWidth) / 2;
			
			
			if (this._viewport.top == "center" || this._viewport.bottom == "center")
				this._realPosition.top = ((this.parent ? this.parent.realHeight : fx.dom.height(window) ) - this.realHeight) / 2;
		}

		if (typeof this._viewport.left == "string" && this._viewport.left.endsWith("%"))
			this._realPosition.left = (this.parent ? this.parent.realWidth : fx.dom.width(window) ) * (parseFloat(this._viewport.left) / 100);
		
		if (typeof this._viewport.right == "string"  && this._viewport.right.endsWith("%"))
			this._realPosition.right = (this.parent ? this.parent.realWidth : fx.dom.width(window) ) * (parseFloat(this._viewport.right) / 100);

		if (typeof this._viewport.top == "string"  && this._viewport.top.endsWith("%"))
			this._realPosition.top = (this.parent ? this.parent.realHeight : fx.dom.height(window) ) * (parseFloat(this._viewport.top) / 100);

		if (typeof this._viewport.bottom == "string"  && this._viewport.bottom.endsWith("%"))
			this._realPosition.bottom = (this.parent ? this.parent.realHeight : fx.dom.height(window) ) * (parseFloat(this._viewport.bottom) / 100);

		if (Utils.isNumber(this._viewport.left))
		{
			this._realPosition.left = this._viewport.left;
			this._realPosition.right = "unset";
		}
		else
		if (Utils.isNumber(this._viewport.right))
		{
			this._realPosition.right = this._viewport.right;
			this._realPosition.left = "unset";
		}

		if (Utils.isNumber(this._viewport.top))
		{
			this._realPosition.top = this._viewport.top;
			this._realPosition.bottom = "unset";
		}
		else
		if (Utils.isNumber(this._viewport.bottom))
		{
			this._realPosition.bottom = this._viewport.bottom;
			this._realPosition.top = "unset";
		}
		

		this.css(this._realPosition)
		
		return this;
	}

	
	/**
	 * Set or get viewport property of component. Viewport property contains size of component (with/height) and it's position (top/bottom, left/top)
	 * Size and position can be set with integers or with strings, example : {width:100, height:"auto", top:"center", left:"15%"}
	 * Size, and position can be percentages, example : {width : "100%", height:"50%", top:"10%", left:"50%"}
	 * Size possible values :
	 * - percentage : size will be a percentage of parent size
	 * - absolute value
	 * - "auto" : size is calculated from component content
	 * - "fullscreen" : size will equal to screen size
	 * 
	 * Position possible values :
	 * - percentage : size will be a percentage of parent size
	 * - absolute value
	 * - "center" : component will be center according to it's parent size
	 * 
	 * You can use right and bottom to align component on right side of bottom side.
	 * 
	 * You can avoid providing absolute values in pixels.
	 * 
	 * @param {Object} val 
	 * @param {Boolean} applyOnly 
	 */
	viewport(val, applyOnly){

		if (val){

			if (val == "fullscreen")
				this._viewport = {top:"0px", left:"0px", width:"100%", height:"100%"}
			else
			{
				this._viewport = {};
				for (let prop in val)
				{
					if ("left,right,top,bottom,width,height".indexOf(prop) != -1)
						this._viewport[prop] = val[prop];
					else
						fx.log.info(" This viewport property wasn't regognized : " + prop);
				}
				
				if (!this._viewport["width"])
					this._viewport["width"] = "auto";
				
				if (!this._viewport["height"])
					this._viewport["height"] = "auto";
			}
			
			if (!applyOnly && this.node && this.initialized)
				this.updateDisplay();
				
			return this;
		}
		else 
			return this._viewport;
	}
	
	/**
	 * Sets/gets viewport.top value
	 * @param {String} val 
	 * @param {bool} animate 
	 */
	top(val, animate){

		if (val !== undefined)
		{
			if (animate)
				this._applyAnimate();

			this._viewport.top = val;
			this.position(true);
			return this;
		}
		
		return this._viewport.top;
	}
	
	/**
	 * Sets/gets viewport.left value
	 * @param {String} val 
	 * @param {bool} animate 
	 */
	left(val, animate){

		if (val !== undefined)
		{
			if (animate)
				this._applyAnimate();
				
			this._viewport.left = val;
			this.position(true);
			return this;
		}
		
		return this._viewport.left;   
	}

	/**
	 * Moves component position. Top and left can be absolute values, or strings ("center")
	 * @param {String} left 
	 * @param {String} top 
	 */
	move(left, top)
	{
		this._viewport.left = left;
		this._viewport.top = top;
		this.position(true);
	}
	
	/**
	 * Sets/gets viewport.right value
	 * @param {String} val 
	 * @param {bool} animate 
	 */
	right(val, animate) {

		if (val !== undefined)
		{
			if (animate)
				this._applyAnimate();

			this._viewport.right = val;
			this.position(true);
			return this;
		}
		
		return this._viewport.right;
	}
	
	/**
	 * Sets/gets viewport.bottom value
	 * @param {String} val 
	 * @param {bool} animate 
	 */
	bottom(val, animate) {

		if (val !== undefined)
		{
			if (animate)
				this._applyAnimate();

			this._viewport.bottom = val;
			this.position(true);
			return this;
		}
		
		return this._viewport.bottom;
	}
	
	/**
	 * Sets/gets viewport.twidthop value
	 * @param {String} val 
	 * @param {bool} animate 
	 */
	width(val, animate) {

		if (val !== undefined)
		{
			if (animate)
				this._applyAnimate();

			this._viewport.width = val;
			this.resize();

			this.trigger("resized");
			return this;
		}
		
		return this._viewport.width;	
	}
	
	/**
	 * Sets/gets viewport.height value
	 * @param {String} val 
	 * @param {bool} animate 
	 */
	height(val, animate) {

		if (val !== undefined)
		{
			if (animate)
				this._applyAnimate();
			
			this._viewport.height = val;
			this.resize();

			this.trigger("resized");
			return this;
		}
		
		return this._viewport.height;
	}
	
	/**
	 * Return given component of current measured width (with border and margin)
	 * @param {fx.Component} child 
	 */
	measuredWidth(child){
		child = child || this.node;
		return fx.dom.width(child)
				+ ( (child == window) ? 0 : (
					  parseFloat(fx.dom.css(child, "border-left-width"))
					+ parseFloat(fx.dom.css(child, "border-right-width"))
					+ parseFloat(fx.dom.css(child, "margin-right") )
					+ parseFloat(fx.dom.css(child, "margin-left") )
				 ) );
	}
	
	/**
	 * Return given component of current measured height (with border and margin)
	 * @param {fx.Component} child 
	 */
	measuredHeight(child, innerOnly){
		if (child === false)
		{
			innerOnly = true
			child = this.node
		}
		else
			child = child || this.node;

		return fx.dom.height(child) 
				+ (innerOnly ? 0 : ( ( (child == window) ? 0 : (
										parseFloat(fx.dom.css(child , "border-top-width"))
										+ parseFloat(fx.dom.css(child , "border-bottom-width")) 
										+ parseFloat(fx.dom.css(child, "margin-top") )
										+ parseFloat(fx.dom.css(child, "margin-bottom") )
										+ parseFloat(fx.dom.css(child, "padding-top") )
										+ parseFloat(fx.dom.css(child, "padding-bottom") )
									) ) ) );
	}

	

	/**
	 * Adds a class to given element, or to component
	 * If element given, it can be a DOM element or a fx.Component
	 * @param {Element} element 
	 * @param {String} className 
	 */
	addClass(element, className) {

		if (!className)
		{
			if (!element) return;

			className = element;
			element = this.node;

			if (!this.initialized)
				this._registeredClasses.push(className);
		}
		//else
		//	element = this.find(element);

		fx.dom.addClass(element, className);
	}
	
	/**
	 * Removes a class from given element, or to component
	 * If element given, it can be a DOM element or a fx.Component
	 * @param {Element} element 
	 * @param {String} className 
	 */
	removeClass(element, className) {

		if (!className)
		{
			if (!element) return;

			className = element;
			element = this.node;
		}
		//else
		//	element = this.find(element);

		fx.dom.removeClass(element, className);
	}
	
	/**
	 * Checks if given element, or current component contains given class
	 * If element given, it can be a DOM element or a fx.Component
	 * @param {Element} element 
	 * @param {String} className 
	 */
	hasClass(element, className) {

		if (!className)
		{
			className = element;
			element = this.node;
		}
		//else
		//	element = this.find(element);

		return fx.dom.hasClass(element, className);
	}
	
	/**
	 * Adds or removes class from given element, or current component 
	 * If element given, it can be a DOM element or a fx.Component
	 * @param {Element} element 
	 * @param {String} className 
	 */
	toggleClass(element, className, val) {
		if (val === undefined)
		{
			val = className;
			className = element;
			element = this.node;
		}
		//else
		//	element = this.find(element);

		fx.dom.toggleClass(element, className, val);
	}

	/**
	 * Trick to start a CSS animation. Call this function with name of class containing animation.
	 * @param {String} name 
	 */
	launchCSSAnimation(name)
	{
		// trick to force animation to start
		this.removeClass(name);
		void this.node.offsetWidth;
		this.addClass(name);
	}

	/**
	 * Gets/Sets an attribute from component DOM node
	 * @param {String} attribute 
	 * @param {String} value 
	 */
	attr(attribute, value)
	{
		if (value !== undefined)
		{
			if (!this._node)
				this._registeredAttributes.push({name : attribute, value : value});
			else
				this._node.setAttribute(attribute, value );
			
			return this;
		}		
		else
			return this._node ? this._node.getAttribute(attribute) : null;
	}
	
	/**
	 * Set focus component DOM node
	 */
	focus(options)
	{
		if (this._node)
			this._node.focus(options);
	}
	
	/**
	 * Gets/Sets css properties from given element or current component.
	 * Example :
	 * let comp = new fx.Component();
	 * console.log( comp.css("background-color") );
	 * comp.css("background-color", "red");
	 * comp.css({background-color" : "red"});
	 * console.log( comp.css(document.body) , "color" );
	 * comp.css(document.body , {"color" : "red"} );
	 * @param {Element} element 
	 * @param {Object} properties 
	 */
	css(element, properties) 
	{
		if (properties === undefined)
		{
			properties = element;
			element = this.node;

			if (!this.initialized)
			{
				if ( typeof properties != "string")
				{
				if (!this._cssToApply)
					this._cssToApply = {};

				Object.assign(this._cssToApply, properties);

				return;
				}
				else
				{
					if (this._cssToApply && this._cssToApply[properties])
						return this._cssToApply[properties];
				}
			}
				
		}
		else if (typeof element == "string" && (typeof properties != "object" || properties === null))
		{
			let prop = {};
			prop[element] = properties;
			properties = prop;
			element = this.node;
		}
		else 
			element = this.find(element);
		
		return fx.dom.css(element, properties);
	}
	
	/**
	 * Find dom node in component matching with given selector.
	 * Only one HTMLEmement component is returned.
	 * @param {Element} selector 
	 */
	find(selector) 
	{
		let element;
		if (selector === null)
			element = null;

		// if dom element given, if it's child of component we return it, otherwise we return null
		if (Utils.isDOMNode(selector) || Utils.isDOMElement(selector))
			element = (fx.dom.parent(selector, this.node)) ? selector : null;
		else
		if (Utils.isID(selector)) // id
			element = window[selector];
		else
			element = fx.dom.find(selector, this.node);

		// we tag any element returned by find
		if (element) 
		{
			element["_data-selector-" + this.id] = selector;

			if (element instanceof Array)
			{
				for (let i = 0; i < element.length; i++)
					element[i]["_data-selector-" + this.id] = selector + ":eq(" + i + ")";
			}
		}
			
		
		return element;
	}


	popup(popup, options)
    {
        if (this._currentPopup)
            this._currentPopup.close();

        this._currentPopup = popup;
    
        if (this._currentPopup)
        {
			this._currentPopup.viewport("fullscreen");	

			this._currentPopup.options = options;
				
            this._currentPopup.init();
            
            this._currentPopup.show(true);

			this.on("closed", this._onPopupClosed, this._currentPopup);
		}
		
		return this._currentPopup;
    }

	_onPopupClosed()
	{
		this._currentPopup = null;
	}


	//------------------------------- PRIVATE ---------------------------//

	
	_initChildren()
	{
		for (let i = 0; i < this._childs.length; i++)
			if (!this._childs[i].initialized)
				this._childs[i].init();
	}

	_applyRegisteredEvents()
	{
		let handled = [];
		for (let i = 0; i < this._registeredEvents.length; i++)
		{
			let registeredEvent = this._registeredEvents[i];
			if (registeredEvent.source.node)
			{
				this.on(registeredEvent.event, registeredEvent.handler, registeredEvent.source);
				handled.push( registeredEvent);
			}
		}

		let event;
		while (event = handled.pop())
			this._registeredEvents.remove(event);
	}
	

	_applyCSS()
	{
		if (this._cssToApply)
		{
			this.css(this._cssToApply);
			this._cssToApply = null;
		}
	}

	_setVisilibityAtStart()
	{
		if (this.visibleAtStart)
			this.show(null, null);
		else
			this.hide(null, null, true);
	}
	
	_setContextMenu()
	{
		if (this.contextMenu())
		{
			fx.get("contextMenu").register(this);
			this.on("menu-action", this._onContextMenuAction);
		}
	}

	_initialize()
	{
		super.register();
		
		if (!this._node)
		{
			this._node = document.createElement(this._tag);
			this._node.setAttribute("id", this.id );
			this._node.setAttribute("class", this.classNames.join(" ") + " " + (this._className ? this._className : "") + " " + this._registeredClasses.join(" ") );
			for (let i = 0; i < this._registeredAttributes.length; i++)
				this._node.setAttribute(this._registeredAttributes[i].name, this._registeredAttributes[i].value);

			if (!this.visibleAtStart)
				fx.dom.css(this.node, { "opacity":0, "visibility" :"hidden", "pointer-events":"none"});	
		}

		let html = this.render();
		
		if (html !== undefined)
		{
			this._needRender = true;
			this._node.innerHTML = html;
			this._nbChildsRender = this._node.children.length;
		}
		

		let parentContainer = this.parent ? window.document.getElementById( this.parent.id ) : window.document.body; // window[ this.parent.id]

		if ( !parentContainer )
		{
			fx.log.info(this.classNames[0] + "#" + this._id + " can not be added. Possible cause : super.init() not called in parent, addChild() has no effect.");
			return;
		}
		else
		{
			if (this._index !== undefined && this._index < Math.max(0,parentContainer.children.length -1))
				parentContainer.insertBefore(this._node, parentContainer.children[this._index]);
			else
				parentContainer.appendChild(this._node);
		}

		if (this._className && !this.hasClass(this._className))
			this.addClass(this._className);

		if (!this.parent && !this.initialized)
			this.on("resize", this._windowResized, window);
	}

	_checkRenderAndCreate()
	{
		if (this._nbChildsRender > 0 && this._node.children.length > this._nbChildsRender)
		{
			this._needRender = false;
			fx.log.warning("fx.Component must override render() or create() but not both. If both overrided, render will be called only the at initialization.");
		}
	}
	
	
	_applyAnimate()
	{
		fx.dom.css(this.node, {"transition" : "all 0.4s"});
		this.delay( this._animateFinished , 500);
		
	}

	_animateFinished()
	{
		fx.dom.css(this.node, {"transition" : "none"}); 

		if (this.parent)
			this.parent.updateDisplay();
	}
	
	_onContextMenuAction(e)
	{
		//this.onContextMenu(e.detail);
		this.onContextMenu(e);
	}

	_windowResized (e)
	{
		this.updateDisplay();
	}

	_refreshHandlers()
	{
		// loop on all properties, find handler (created from find())
		// check if they are DOM object, and find the one not linked anymore to DOM
		// then refresh them
		// - remove event handler
		// - get new handler
		// - add event handler

		for(var property in this)
		{
			let handler = this[property];
			
			if ( Utils.isDOMNode(handler) || Utils.isDOMElement(handler) )
			{
				if ( !fx.dom.parent(handler, document.body) )
				{
					let selector = handler["_data-selector-" + this.id];
					let newHandler = this.find(selector);
					this[property] = newHandler;
					for (let i = 0; i < this._binds.length; i++)
					{
						if (this._binds[i] && this._binds[i].source == handler)
						{
							this.on(this._binds[i].event, this._binds[i].handler, this[property] );
							this.off(this._binds[i].event, this._binds[i].handler, this._binds[i].source );
						}
					}
				}
			}
		}

		// do the same for all handler in this._binds
		for (let i = 0; i < this._binds.length; i++)
		{
			if (this._binds[i])
			{
				if (Utils.isDOMNode(this._binds[i].source) || Utils.isDOMElement(this._binds[i].source) )
				{
					if ( !fx.dom.parent(this._binds[i].source, document.body) )
					{
						let selector = this._binds[i].source["_data-selector-" + this.id];
						if (selector)
						{
							let newHandler = this.find(selector);
							this.on(this._binds[i].event, this._binds[i].handler, newHandler );
							this.off(this._binds[i].event, this._binds[i].handler, this._binds[i].source );
						}
					}
				}
			}
		}
	}

});