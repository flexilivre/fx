// TODO : rename it to EventEmmiter
// TODO : create a class Event 
fx.ns("fx", class EventDispatcher extends fx.Disposable {
	
	constructor()
	{
		super();

		this._events = {};
		this._binds = [];
		this._enabled = true;
		
		this._registeredEvents = [];
		this._internalbinds = [];
		// used only on mobile
		this._hammers = {};

		this._touchEvents = {	
			"click" : ["tap"], 
			/*"panstart" : [ "panstart", "mousedown"],
			"panmove" : [ "panmove", "mousemove"],
			"panend" : [ "panend", "mouseend"],*/
		}

		this._desktopEvents = {	
			"mousewheel" : ['mousewheel', 'wheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
		}

		this._matchingEventsList = (fx.browser.isMobile || fx.browser.isTablet) ? this._touchEvents : this._desktopEvents;
	}

	disable(){
		this._enabled = false;
	}

	enable(){
		this._enabled = true;
	}

	get enabled()
	{
		return this._enabled;
	}

	get registeredEvents()
	{
		return this._registeredEvents;
	}

	

	// ---------------------------------------------- //

	on(event, handler, source)
	{	
		if (!this._binds)
			return;

		// no handler given
		if (!handler || typeof handler != "function")
			return new TypeError("Handler cannot be undefined or is not a function");

		// if source is not provided, it mean we listen on current object
		if (!source)
			source = this;

		// if we get an Array, we listen on each element of the array
		if (source instanceof Array)
		{
			for (let i = 0; i < source.length; i++)
				this.on(event, handler, source[i]);

			return;
		}
		
		if (source instanceof fx.Component && !source.node)
		{
			this._registeredEvents.push({event:event, handler:handler, source:source}); // How to do ?
		}
		else
		{
			// check if there is not already the same bind registred (same event, same callback, same source)
			let bind;
			for (let i = 0; i < this._binds.length; i++)
			{
				if (this._binds[i] && this._binds[i].handler == handler && this._binds[i].event == event && this._binds[i].source == source)
				{
					bind = this._binds[i];
					break;
				}
			}

			if (!bind) // we didn't find same bind registered, so we create one
			{
				bind = { 	event : event, 
							bind :  handler.bind(this), // we use .bind(this), so the handler is called in current object context
							handler : handler,
							source : source,
							node :  source.node ? source.node : source };

				this._binds.push( bind );
			}

			let events = this._matchingEvents(event);

			for (let i = 0; i < events.length; i++)
			{
				if (this._isMobileEvent(events[i]))
					this._addMobileEvent(events[i], bind);
				else
					bind.node.addEventListener(events[i], bind.bind);
			}
				
		}

		return this;
	}

	_addMobileEvent(event, bind)
	{
		if (!bind.source.id)
			bind.source.id = Utils.newID();

		let data = this._hammers[bind.source.id];
		if (!data)
		{
			data = {hammer : new Hammer.Manager(bind.node) };
			this._hammers[bind.source.id] = data;
		}	
		
		
		if (event.indexOf("swipe") != -1)
		{
			if( !data.hammer.get('swipe') )
				data.hammer.add(new Hammer.Swipe());
		}
		else
		if (event.indexOf("tap") != -1)
		{
			if( !data.hammer.get('tap') )
				data.hammer.add(new Hammer.Tap({threshold:fx.browser.isSafari ? 5 :15})); 
		}
		else
		if (event.indexOf("pan") != -1)
		{
			if( !data.hammer.get('pan') )
				data.hammer.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));//.recognizeWith([element.hammer.get('tap')]);
		}
		else
		if (event.indexOf("pinch") != -1)
		{
			if( !data.hammer.get('pinch') )
				data.hammer.add(new Hammer.Pinch()).recognizeWith([data.hammer.get('pan')]);
		}
		else
		if (event.indexOf("press") != -1)
		{
			if( !data.hammer.get('press') )
				data.hammer.add(new Hammer.Press({threshold:20})).recognizeWith([data.hammer.get('pan')]);
		}
		else
		if (event.indexOf("rotate") != -1)
		{
			if( !data.hammer.get('rotate') )
				data.hammer.add(new Hammer.Rotate());
		}
		else
		{
			bind.node.addEventListener(event, bind.bind);
			return;
		}
	
		data._mobileEvent = this._mobileEvent.bind(this, bind);

		data.hammer.on(event, data._mobileEvent );
	}

	_mobileEvent(bind, e)
	{
		bind.bind(this._convertEvent(e), bind.source);

		if (this._hammers[bind.source.id])
			delete this._hammers[bind.source.id]._mobileEvent;
	}

	_convertEvent(event)
    {
        if (event && event.center)
        {
            event.pageX = event.center.x;
            event.pageY = event.center.y;
        }
        else
        if (event && event.gesture && event.gesture.srcEvent)
        {
            event.pageX = event.gesture.srcEvent.pageX;
            event.pageY = event.gesture.srcEvent.pageY;
		}
		
		event.target = event.srcEvent.target;

        return event;
    }

	_removeMobileEvent(event, bind)
	{
		let data = this._hammers[bind.source.id];
		if (data && data.hammer)
			data.hammer.off(event, bind.bind);
	}

	_isMobileEvent(event)
    {
        return /*window.Hammer  fx.browser.touchEnabled &&*/ "pan|panstart|panmove|panend|pancancel|panleft|panright|panup|pandown|pinch|pinchstart|pinchmove|pinchend|pinchcancel|pinchin|pinchout|press|pressup|rotate|rotatestart|rotatemove|rotateend|rotatecancel|swipe|swipeleft|swiperight|swipeup|swipedown|tap".indexOf(event) != -1;
    }
	
	off(event, handler, source)
	{
		if (!this._binds)
			return;

		// no handler given
		if (!handler || typeof handler != "function")
			return fx.log.error("Handler cannot be undefined or is not a function");

		// if source is not provided, it mean we listen on current object
		if (!source)
			source = this;

		// if we get an Array, we listen on each element of the array
		if (source instanceof Array)
		{
			for (let i = 0; i < source.length; i++)
				this.off(event, handler, source[i]);

			return;
		}
		
		if (source instanceof fx.Component && !source.node)
		{
			return;
		}
		else
		{
			
			for (let i =0; i < this._binds.length; i++)
			{
				if (this._binds[i] && this._binds[i].handler == handler  && this._binds[i].event == event && this._binds[i].source == source)
				{
					let events = this._matchingEvents(event);
					for (let j = 0; j < events.length; j++)
					{
						if (this._isMobileEvent(events[j]))
							this._removeMobileEvent(event, this._binds[i]);
						else
							this._binds[i].node.removeEventListener(events[j], this._binds[i].bind);
					}
					
					this._binds[i] = null;
				}					
			}
		
		}
		
		return this;
	}
	
	trigger(event, data)
	{	
		if (!this._binds)
			return;
			
		if (this instanceof fx.Component && this.node) // in case fx.Component 
		{
			// if data is not given
			if (!data)
			{
				// and event is given as an object: {type:"updated", ... }
				if (event.type)
				{
					data = {};
					if (event.detail)
						data = event.detail;
					else
						for (let property in event)
						{
							if (property != "type")
								data[property] = event[property];
						}

					event = event.type;
				}
			}

			// in case we want event to propagate like a DOM event (from child to parents)
			if (data && data.propagate)
				data.source = this;

			let events = this._matchingEvents(event);
			for (let i = 0; i < events.length; i++)
				this.node.dispatchEvent(  new CustomEvent(events[i], {  bubbles: data && data.propagate, detail: data }) );
		}
		else
		{
			if (!data)
				this.dispatchEvent( event );
			else
				this.dispatchEvent( {type : event, detail : data} );
				
		}
			
		

				

		return this;
	}

	triggerDelay(event, data, delay)
	{
		// if event is given as an object
		if (!delay)
		{
			if (event.type)
			{
				if (typeof data == "number")
					delay = data;

				data = {};
				for (let property in event)
				{
					if (property != "type")
						data[property] = event[property];
				}
				event = event.type;
			}
		}

		if (delay === undefined)
			delay = 0;

		// TODO : add this bind to some array in order to delete it at the end
		setTimeout(this.trigger.bind(this, event, data), delay);
	}


	bind(callback)
	{
		// TODO : add this bind to some OTHER array in order to delete it at the end

		let bind = callback.bind(this);
		this._internalbinds.push( bind )
		return bind;
	}

	/**
	 * Call the given function with the given delay.
	 * If delay is called again with the same function, and delay is not over yet, the delay is resetted so the function is called only once after the new given delay.
	 * @param {function} handler 
	 * @param {Int} delay : if delay is equal to null, and a delay was already called, it will be canceled.
	 */
	delay(handler, delay)
	{
		
		let bind = this._internalbinds.find({handler : handler});
		if (bind)
		{
			clearTimeout(bind.timer);	

			if (delay !== null)
				bind.timer = setTimeout( bind.bind, (delay === undefined) ? 0 : delay);
		}
		else
		if (delay !== null)
		{
			bind = handler.bind(this);
			this._internalbinds.push( {handler : handler, bind : bind, timer : setTimeout( bind, (delay === undefined) ? 0 : delay) } );
		}
			
		return bind ? bind.timer : null;
	}

	/**
	 * Calls a function  at regular intervals
	 * To stop it, just call with same function and delay set to 0
	 * @param {function} handler 
	 * @param {Int} delay 
	 */
	repeat(handler, delay)
	{
		let bind = this._internalbinds.find({handler : handler});
		if (bind)
		{
			clearInterval(bind.timer);	

			if (delay !== null)
				bind.timer = setInterval( bind.bind, (delay === undefined) ? 0 : delay);
		}
		else
		if (delay !== null)
		{
			bind = handler.bind(this);
			this._internalbinds.push( {handler : handler, bind : bind, timer : setInterval( bind, (delay === undefined) ? 0 : delay) } );
		}
			
		return bind ? bind.timer : null;
	}


	// ------------------------ COMPATIBILITY TO DOM EVENTs --------------------- //

	// We use here same name that in Javascript DOM in order to make all events compatible
	addEventListener(e, callback)
	{
		this._subscribe(e, callback);
	}

	removeEventListener(e, callback)
	{
		this._unsubscribe(e, callback);
	}

	dispatchEvent(e)
	{
		this._publish(e);
	}


	// ----------------------------- PRIVATE -----------------------//

	_subscribe(e, callback)
	{
		if (!this._events) return;

		this._events[e] = this._events[e] || [];
		this._events[e].push( callback );
	}

	_unsubscribe(e, callback)
	{
		if (!this._events) return;

		let event = typeof e == "string" ? e : e.type;
		
		if (this._events[event])
		{
			for (let index = 0; index < this._events[event].length; index++)
			{
				if (this._events[event][index] === callback)
				{
					this._events[event].splice(index, 1);
					break;
				}
			}
		}
	
	}

	_publish(e, data)
	{
		if (!this._events) return;

		if (!this._enabled) return;

		if (Utils.typeEqual(e, "string"))
			e = {type : e, detail : data};

		//let result;
		if (this._events[e.type])
		{
			let events = this._events[e.type].slice(0); // so if this._events[e.type] changed while looping ( .off() ), this loop is not impacted
			for (let index = 0; index < events.length; index++)
			{
				if (events[index] && typeof events[index] == "function")
				{
					try 
					{
						events[index](e, this);
					}
					catch(error)
        			{
						fx.log.error(error);
					}
				}

				//result = result || (events[index] && events[index](e, this) );
				if (e.handled)
					break;
			}
		}
		
		//return result;
	}

	
	

	destroy()
	{
		super.destroy();

		this.disable();

		if (this._binds)
		{
			for (let i =0; i < this._binds.length; i++)
				if (this._binds[i])
					this.off(this._binds[i].event, this._binds[i].handler, this._binds[i].source);
		}

		if (this._internalbinds)
		{
			let bind;
			while (bind = this._internalbinds.pop())
			{
				bind.handler = null;
				bind.bind = null;
				clearTimeout(bind.timer);
				bind.timer = null;
			}
		}

		if (this._hammers)
		{
			for (let id in this._hammers) 
			{
				let data = this._hammers[id];
				if (data.hammer)
					data.hammer.destroy()

				delete this._hammers[id];
			}
		}
	}


	_matchingEvents(event)
	{
		return this._matchingEventsList[event] || [event];
	}
});