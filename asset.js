fx.ns("fx", class Asset extends fx.Model 
{
	constructor(data, assetName)
	{
		super(); 

		this._name = assetName || "";
		this._content = data;
		
		if (this._content && this._content.indexOf("<svg") != -1)
			this.type = "svg";
		else
			this._type = "image";
	}

	get name()
	{
		return this._name;
	}

	get type()
	{
		return this._type;
	}

	set type(val)
	{
		return this._type = val;
	}

	get content()
	{
		return this._content;
	}

	render(className, tooltip)
	{
		if (!this._content)
			return;
			
		className = className || "asset";

		let html = '';
		if (this._type == "svg")
		{
			// add className
			let firstTabClosing = this._content.indexOf(">");
			let classPosition = this._content.indexOf("class");

			if (classPosition != -1 && firstTabClosing > classPosition) // class tag present, so we inject className
				html = this._content.splice(this._content.indexOf('"', classPosition) + 1, 0, className + " " + this._name);
			else // no class attribute, so we create a new one
				html = this._content.splice(firstTabClosing, 0, ' class="' + className + " " + this._name + '"');

			if (tooltip)
			{
				let firstTabClosing = html.indexOf(">");
				html = html.splice(firstTabClosing, 0, ' title="' + tooltip + '"');
			}
		}
		else
		//if (type == "png" || type == "jpg" || type == "gif" || type == "base64")
			html += '<img class="' + className + '" src="' + this._content + '" title="' + (tooltip ? tooltip : "")  + '">';

		return html;
	}
});