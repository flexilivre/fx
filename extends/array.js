(function(){
	/**
	 * Overrides of Array.prototype.find in order to search for one item from it's properties instead of using a function.
	 * Example :
	 * let array = [{id : 1, value : 55}, {id : 2, value : 55}, {id : 3, value : 84}];
	 * let elt = array.find({id : 2}); // return second element of array with property id equal to 2 : {id : 2, value : 55}
	 * let elt = array.find({value : 55});  // return only the first element of array with property value equal to 55 : {id : 1, value : 55}
	 * let elts = array.find({value : 55}, true);  // return an array containing all elements with property value equal to 55 : [{id : 1, value : 55}, {id : 2, value : 55}]
	 */
	let proxy = Array.prototype.find;
	Array.prototype.find = function()
	{
		if (typeof arguments[0] == "function")
			return proxy.apply(this, arguments);
		else
		{
			let data = arguments[0];
			let unique = (arguments[1] === undefined);
			let results = [];
			for (let i = 0; i < this.length; i++)
		    {
		    	let element = this[i];
		    	let all = true;
		    	for (let key in data)
		    		all = all && (element[key] == data[key]);
		    	
				if (all)
				{
					if (unique)
						return element;
					else
						results.push(element);
				}
		        	
			}
			
		    return unique ? null : results;
		}
	};

	Array.prototype.getItemAt = function(i)
	{
		return this[i];
	};

	Array.prototype.removeAt = function(index)
	{
		if (index != -1)
			this.splice(index, 1);
	};

	// return array with all possible combinations of array elements
	Array.prototype.combinations = function()
	{
		return new Array(1 << this.length).fill().map(
			(e1, i) => this.filter((e2, j) => i & 1 << j))
							  .filter((a) => a.length > 0)
							  .sort( (a, b) => (a.length < b.length ? -1 : (a.length > b.length ? 1 : 0)));
	}

	if (!Array.prototype.last){
			Array.prototype.last = function(){
					return this[this.length - 1];
			};
	};

	Array.prototype.removeAll = function() {
		while(this.length > 0) {
			this.pop();
		}
	};

	Array.prototype.remove = function(field, value)
	{
		if (!value)
		{
			if (typeof field == "object")
			{
				let index = this.indexOf(field);
				if (index != -1)
					this.splice(index, 1);

				return (index != -1);
			}
			else
			{
				value = field;
				field = "id";

				let ret = this.splice(this.findIndex(function(item) {
					return item[field] === value;
				}), 1);

				return ret.length > 0;
			}
			
		}
	};


	Array.prototype.move = function(old_index, new_index) 
	{
    	if (new_index >= this.length) {
        	let k = new_index - this.length + 1;
        	while (k--) {
            	this.push(undefined);
        	}
    	}
    	this.splice(new_index, 0, this.splice(old_index, 1)[0]);
	};


	Array.prototype.hasOnlyUnique = function()
	{
		// TODO : recode with .every(fnc)
		for (let i = 0; i < this.length; i++)
		{
			let item = this[i];
			let occurences = [];
			for (let j = 0; j < this.length; j++)
		    {
		    	let element = this[j];
		    	let all = true;
		    	for (let key in item)
		    		all = all && (element[key] == item[key]);
		    	
		        if (all)
					occurences.push( element );
		    }
			if (occurences.length > 1)
				return false;
		}
		return true;
	};


	Object.defineProperty(Array.prototype, 'unique', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function() {
			var a = this.concat();
			for(var i=0; i<a.length; ++i) {
				for(var j=i+1; j<a.length; ++j) {
					if(a[i] === a[j])
						a.splice(j--, 1);
				}
			}
	
			return a;
		}
	});

	if (!Array.prototype.includes) 
	{
		Object.defineProperty(Array.prototype, "includes", {
		  enumerable: false,
		  value: function(obj) {
			  var newArr = this.filter(function(el) {
				return el === obj;
			  });
			  return newArr.length > 0;
			}
		});
	}

	Array.prototype.flat||Object.defineProperty(Array.prototype,"flat",{configurable:!0,value:function r(){var t=isNaN(arguments[0])?1:Number(arguments[0]);return t?Array.prototype.reduce.call(this,function(a,e){return Array.isArray(e)?a.push.apply(a,r.call(e,t-1)):a.push(e),a},[]):Array.prototype.slice.call(this)},writable:!0}),Array.prototype.flatMap||Object.defineProperty(Array.prototype,"flatMap",{configurable:!0,value:function(r){return Array.prototype.map.apply(this,arguments).flat()},writable:!0});

	/************ Compare 2 arrays */

	
	if(Array.prototype.equals)
		console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
	// attach the .equals method to Array's prototype to call it on any array
	Array.prototype.equals = function (array) {
	// if the other array is a falsy value, return
	if (!array)
		return false;

	// compare lengths - can save a lot of time 
	if (this.length != array.length)
		return false;

	for (let i = 0, l=this.length; i < l; i++) {
		// Check if we have nested arrays
		if (this[i] instanceof Array && array[i] instanceof Array) {
			// recurse into the nested arrays
			if (!equals(this[i], array[i]))
				return false;
		}
		/**REQUIRES OBJECT COMPARE**/
		else if (this[i] instanceof Object && array[i] instanceof Object) {
			// recurse into another objects
			if (!equals(this[i], array[i]))
				return false;
			}
		else if (this[i] != array[i]) {
			// Warning - two different object instances will never be equal: {x:20} != {x:20}
			return false;   
		}           
	}       
	return true;
	}
	// Hide method from for-in loops
	Object.defineProperty(Array.prototype, "equals", {enumerable: false});


	function equals(object1, object2)
	{
		//For the first loop, we only check for types
		for (propName in object1) {
			//Check for inherited methods and properties - like .equals itself
			//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
			//Return false if the return value is different
			if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
				return false;
			}
			//Check instance type
			else if (typeof object1[propName] != typeof object2[propName]) {
				//Different types => not equal
				return false;
			}
		}
		//Now a deeper check using other objects property names
		for(propName in object2) {
			//We must check instances anyway, there may be a property that only exists in object2
				//I wonder, if remembering the checked values from the first loop would be faster or not 
			if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
				return false;
			}
			else if (typeof object1[propName] != typeof object2[propName]) {
				return false;
			}
			//If the property is inherited, do not check any more (it must be equa if both objects inherit it)
			if(!object1.hasOwnProperty(propName))
			  continue;
	
			//Now the detail check and recursion
	
			//This returns the script back to the array comparing
			/**REQUIRES Array.equals**/
			if (object1[propName] instanceof Array && object2[propName] instanceof Array) {
					   // recurse into the nested arrays
			   if (equals(!object1[propName], (object2[propName])))
							return false;
			}
			else if (object1[propName] instanceof Object && object2[propName] instanceof Object) {
					   // recurse into another objects
			   if (equals(!object1[propName], (object2[propName])))
							return false;
			}
			//Normal value comparison for strings and numbers
			else if(object1[propName] != object2[propName]) {
			   return false;
			}
		}
		//If everything passed, let's say YES
		return true;
	}
	
})();