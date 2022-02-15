"use strict";
/** 
* fx package : allows to create a new application, defines it services, and it's components
* @namespace fx
*/
(function(){
	
	if (window.fx)
	{
		alert("fx already declared");
		return;
	}
	
	window.fx = {
		
		init : function() {
			
			this.log = new fx.Logger();
			this.ajax = new fx.Ajax();
			this.browser = new fx.Browser();
			this.keyboard = new fx.Keyboard();
			// TODO : do deeper tests with maxMedia & mediaToFree
			this.medialoader = new fx.MediaLoader({maxMedia:50, mediaToFree:5, maxMediaLoading:3});
			this.effectsEnabled = true;
			
			if (!fx._mainClass)
			{
				fx.throwError('No Main class found');
				return;
			}
			
			fx._mainInstance = new fx._mainClass();
			if (typeof fx._mainInstance.init == "function")
				fx._mainInstance.init();
			
			if (this._assetsToLoad)
			{
				for (let i = 0; i < this._assetsToLoad.length; i++)
					fx.asset(this._assetsToLoad[i]);

				this._assetsToLoad = null;
			}

			fx._mainInstance.onReady();
			
		},
		asset : function(obj){
			
			this.assets = this.assets || {};

			if (!fx._mainInstance)
			{
				if (!this._assetsToLoad)
					this._assetsToLoad = [];
				this._assetsToLoad.push(obj);
				return;
			}
				
			if (Utils.typeEqual(obj, "string"))
			{
				let id = Utils.newID();
				this.assets[ id ] = new fx.Asset(obj, id);
				return this.assets[ id ];
			}
	
			for (let property in obj) {
				if (obj.hasOwnProperty(property)) 
				{
					if (this.assets[property])
						this.assets[ property ]= new fx.Asset(obj[property], property);
					else
						this.assets[ property ] = new fx.Asset(obj[property], property);
				}
			}
		},
		urls : function(obj){
			this.urls = this.urls || {};
			this.urls = Object.assign(this.urls, obj);
		},
		url : function(url){
			if (this.urls[window.location.hostname] && this.urls[window.location.hostname][url])
				return this.urls[window.location.hostname][url];
			return url;
		},
		ns : function(ns, val) {

			if (val && fx.Main && (val.prototype instanceof fx.Main))
			{
				/*if (fx._mainClass)
				{
					fx.throwError('Main class already defined. Class ' + fx._mainClass.name + ' will be used instead of ' + val.name);
					return;
				}
				else*/
					// last Main Class declared is used
					fx._mainClass = val;
			}

			let part = ns.split(".");
			let obj = window;
			for (let i = 0; i < part.length; i++)
			{
				if (val && i == part.length - 1)
				{
					if (val.constructor)
					{
						if (!obj[part[i]])
							Object.defineProperty( obj, part[i] , {value : {},  writable: false, enumerable: true  });
						
						Object.defineProperty( obj[part[i]], val.name , {value : val,  writable: false, enumerable: true  });
					}
					else
						Object.defineProperty( obj, part[i] , {value : val,  writable: false, enumerable: true  });
				}
				
				if (!obj[part[i]])
					Object.defineProperty( obj, part[i] , {value : {},  writable: false, enumerable: true  });
	
					obj = obj[part[i]];
			}
	
			return obj;
		},
		service : function(val, model) {
			
			this._services = this._services || {};

			if (typeof val == "string")
			{
				let name = val.toLowerCase();
				if (this._services[name])
				{
					if (typeof this._services[name] == "function")
					{
						if (!model)
							model = fx._mainInstance.model;
							
						this._services[name] = new this._services[name](model);
					}

					return this._services[name];
				}
				else
					fx.throwError("Service " + val + " doesn't exist");
			}
			else
			{
				if (typeof val != "function")
					fx.throwError('A service must be a class');
				else	
					this._services[val.name.toLowerCase()] = val;
			}
			
		},
		enableToolTip : function()
		{
			if ( !fx._toolTip )
				fx._toolTip = new fx.components.ToolTip();
		},
		get : function(name){
			if (name == "dom")
				return fx.dom;
			
			if (name == "ajax")
				return this.ajax;

			if (name == "assets")
				return this.assets;
			
			if (name == "model")
				return fx._mainInstance ? fx._mainInstance.model : null;

			if (name == "contextMenu" && fx.components.ContextMenu)
			{
				if ( !fx._contextMenu )
					fx._contextMenu = new fx.components.ContextMenu();

				return fx._contextMenu;
			}
			
			if (typeof fx[name] == "function")
				fx[name] = new fx[name]();

			return fx[name];
			
		},
		// allows to set constants accessible across the whole application 
		set : function(name, obj)
		{
			if (fx[name])
				fx[name] = obj;
			else
				Object.defineProperty( fx, name , {value : obj,  writable: true, enumerable: true  });
	
		},
		// instead of using console directly, let's use fx.console, so we avoid all cases 
		// when console is not defined (IE with javascript console closed for example)
		// and override this function in case we need to transfer all to some other log source.
		console : console || {log: () => {}, warn: () => {}, error: () => {} },
		throwError : function(msg) 
		{
			
			if (!console) return;
	
			let callstack = [];
			let isCallstackPopulated = false;
			try {
				i.dont.exist += 0; //doesn't exist- that's the point
			} catch (e) {
				if (e.stack) { //Firefox / chrome
					let lines = e.stack.split('\n');
					for (let i = 0, len = lines.length; i < len; i++) {
							callstack.push(lines[i]);
					}
					//Remove call to logStackTrace()
					callstack.shift();
					isCallstackPopulated = true;
				}
				else if (window.opera && e.message) { //Opera
					let lines = e.message.split('\n');
					for (let i = 0, len = lines.length; i < len; i++) {
						if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
							let entry = lines[i];
							//Append next line also since it has the file info
							if (lines[i + 1]) {
								entry += " at " + lines[i + 1];
								i++;
							}
							callstack.push(entry);
						}
					}
					//Remove call to logStackTrace()
					callstack.shift();
					isCallstackPopulated = true;
				}
			}
			if (!isCallstackPopulated) { //IE and Safari
				let currentFunction = arguments.callee.caller;
				while (currentFunction) {
					let fn = currentFunction.toString();
					let fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf("(")) || "anonymous";
					callstack.push(fname);
					currentFunction = currentFunction.caller;
				}
			}
			
			console.error("ERROR : " + msg + '\n' + callstack.splice(2).join('\n'));
	
		},
	};

	
	if (!Utils.pageLoaded())
		window.onload = window.fx.init.bind(fx);
	else
		window.fx.init();

})();

