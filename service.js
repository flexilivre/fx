/**
* A service allows :
* - to access remote server
* - store/read/delete local data (localStorage)
* - store/read/delete cookies
* 
* A service is ready (ready == true) only when it's data property is set
**/
fx.ns("fx", class Service extends fx.EventDispatcher{

	constructor()
	{
		super();

		this._ajax = fx.get("ajax");
		
		this._handlers = [];
	}

	get endpoint()
	{
		return this._endpoint;
	}

	set endpoint(val)
	{
		this._endpoint = val;
	}

	get requestDefaultParams()
	{
		return null;
	}

	/**************************** AJAX *********************/
	get(url, data, callback) 
	{
		if (typeof url == "object")
		{
			options = callback;
			callback = data;
			data = url;
			url = data.url || this.endpoint;
		}

		return this._ajaxCall( url, "GET", callback, data);
	}

	post(url, data, callback, options) 
	{
		if (typeof url == "object")
		{
			options = callback;
			callback = data;
			data = url;
			url = data.url || this.endpoint;
		}

		return this._ajaxCall( url, "POST", callback, data, options);
	}

	put(url, data, callback, options) 
	{	
		if (typeof url == "object")
		{
			options = callback;
			callback = data;
			data = url;
			url = data.url || this.endpoint
		}

		return this._ajaxCall( url, "PUT", callback, data);
	}

	delete(url, data, callback, options) 
	{
		if (typeof url == "object")
		{
			options = callback;
			callback = data;
			data = url;
			url = data.url || this.endpoint
		}
		
		return this._ajaxCall( url, "DELETE", callback, data);
	}

	abort(request)
	{
		this._ajax.abort(request);
	}

	_ajaxCall( url, method, callback, data, options )
	{
		// TODO : use _getBind ?
		/*let bind = callback.bind(this);
		this._handlers.push( bind );*/

		if (!url)
			throw new Error( "No endpoint/url given" );

		if (!(data instanceof FormData) && this.requestDefaultParams)
			data = Object.assign({}, this.requestDefaultParams, data);

		let request = Object.assign({}, options, { method: method, url : url, callback: this._getBind(callback), data : data });
		
		return this._ajax.request( request );
	}

	/**************************** LOCAL STORAGE *********************/
	
	store(id, data) 
	{
		if (Utils.typeEqual(data, "object"))
			data = JSON.stringify(data); // use Model.json ?

		localStorage.setItem(id, data);
	}

	remove(id) 
	{
		localStorage.removeItem(id);
	}

	read(id) 
	{
		let data = localStorage.getItem(id);
		return JSON.parse(data);
	}

	/**************************** COOKIES *********************/
	readCookie(name)
	{
		return Cookies.get(name);
	}

	/**
	 * Stores a cookie
	 * @param {*} name cookie name
	 * @param {*} value string or number representing value of cookie
	 * @param {*} expire Number of days cookie will be stored
	 */
	writeCookie(name, value, expire)
	{
		Cookies.set(name, value, { expires: expire ? expire : 365 });
	}

	deleteCookie(name)
	{
		Cookies.remove(name);
	}

	/**************************** BINDS *********************/
	_getBind(callback)
	{
		if (!callback) return null;
		
		let bind;
		for (let i = 0; i < this._handlers.length; i++)
		{
			if (this._handlers[i].callback == callback)
			{
				bind = this._handlers[i].bind;
				break;
			}
		}

		if (!bind)
		{
			bind = callback.bind(this);
			this._handlers.push({ callback : callback, bind : bind});
		}

		return bind;
	}


	destroy()
	{
		super.destroy();

		//this._ajax = null;
		//this._handlers = null;
		//this._endpoint  = null;
	}
	
	


});