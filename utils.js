/** 
* Utils for fx packages
* @namespace Utils
*/

class Utils {
	construtor(){}

	static get prefixID() {
		return "uuid-";//"UUID-";
	}
	
	static typeEqual(input, desiredType){
		return typeof input == desiredType;
	    //return Utils.type(input).toLowerCase() == desiredType;
	}

	static type(input){
		return typeof input;
		//let type = Object.prototype.toString.call(input);

	    //return (type.indexOf("[object") == -1) ? type : Object.prototype.toString.call(input).match(/^\[object\s(.*)\]$/)[1];
	}

	static newID(unique)
	{
		 // we use an incremental ID with date.now() and _id++ to be sure all ids are differents
		Utils._dateStart = unique ? Utils._dateStart || Date.now() : 1628936362305;;
	  	Utils._id = Utils._id || 0;
		return Utils.prefixID + (Utils._dateStart + Utils._id++).toString(36);
	}
	
	static clone(obj)
	{
		let newObj = {};
		for (let property in obj)
			newObj[property] = obj[property];

		return newObj;
	}

	
    // Update all node children ids
    static refreshNodeIDs(node)
    {
        if (node)
        {
			if (node.id)
				node.id = Utils.newID();;

            for (let i = 0; i < node.children.length; i++)
				Utils.refreshNodeIDs(node.children[i]);
        } 
    }

    static extendObj (destination, source) {
	    let toString = Object.prototype.toString,
	        toStringCall = toString.call({});
	    for (let property in source) {
	        if (source[property] && toStringCall == toString.call(source[property])) {
	            destination[property] = destination[property] || {};
	            Utils.extendObj(destination[property], source[property]);
	        } else {
	            destination[property] = source[property];
	        }
	    }
	    return destination;
	}
	
	static getConstructor(path) {
		let parts = path.split("."),
			value = window,
			index;
		for (index = 0; index < parts.length; index++)
		{
			if (!(value = value[parts[index]]))
				break;
		}
		return {fcn : value, name : parts[index] };
	}

	static validConstructor(temp){
	   return (temp["init"] && Utils.typeEqual(temp["init"], 'function')  &&
	           temp["destroy"] && Utils.typeEqual(temp["destroy"], 'function') );
	}

	static pageLoaded() {
  		return document.readyState === "complete" || document.readyState === "interactive";
	}

	static normalizeCSSValue(val) {
		return  (!isNaN(parseFloat(val)) && isFinite(val))  ? (val + "px") : val;
	}

	static isID(val)
	{
		return val && typeof val == "string" && val.indexOf(this.prefixID) == 0;
	}

	static isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

	static isInt(n){ return (typeof n != "object") && !isNaN(n) && Number(n) === n && n % 1 === 0; }


	static stripHtml(html)
	{
		var tmp = document.createElement("DIV");
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || "";
	}

	//---- URL parameters
	static getURLParam( name )
	{
		if (!Utils._urlparams)
			Utils._urlparams = new URLSearchParams(window.location.search);

		return Utils._urlparams.get( name ) || 0
	}
	

	//Returns true if it is a DOM node
	static isDOMNode(o){
		return (
			typeof Node === "object" ? o instanceof Node : 
			o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
		);
	}
	
	//Returns true if it is a DOM element    
	static isDOMElement(o){
		return (
			typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
			o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
		);
	}


	static validateEmail(email) {
		const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	static _fixURL(url)
    {
        if (url.indexOf("https://") == 0)
            return url;

        if (url.indexOf("https//") == 0)
            return url;

        if (url.indexOf("//") == 0)
            return url;

        return "//" + url;

    }
	
	static ObjectEquals( a, b, enforce_properties_order, cyclic ) 
	{
		return a === b       // strick equality should be enough unless zero
		  && a !== 0         // because 0 === -0, requires test by _equals()
		  || _equals( a, b ) // handles not strictly equal or zero values
		;
		
		function _equals( a, b ) {
		  // a and b have already failed test for strict equality or are zero
		  
		  let s, l, p, x, y;
		  
		  // They should have the same toString() signature
		  if ( ( s = toString.call( a ) ) !== toString.call( b ) ) return false;
		  
		  switch( s ) {
			default: // Boolean, Date, String
			  return a.valueOf() === b.valueOf();
			
			case '[object Number]':
			  // Converts Number instances into primitive values
			  // This is required also for NaN test bellow
			  a = +a;
			  b = +b;
			  
			  return a ?         // a is Non-zero and Non-NaN
				  a === b
				:                // a is 0, -0 or NaN
				  a === a ?      // a is 0 or -O
				  1/a === 1/b    // 1/0 !== 1/-0 because Infinity !== -Infinity
				: b !== b        // NaN, the only Number not equal to itself!
			  ;
			// [object Number]
			
			case '[object RegExp]':
			  return a.source   == b.source
				&& a.global     == b.global
				&& a.ignoreCase == b.ignoreCase
				&& a.multiline  == b.multiline
				&& a.lastIndex  == b.lastIndex
			  ;
			// [object RegExp]
			
			case '[object Function]':
			  return false; // functions should be strictly equal because of closure context
			// [object Function]
			
			case '[object Array]':
			  if ( cyclic && ( x = reference_equals( a, b ) ) !== null ) return x; // intentionally duplicated bellow for [object Object]
			  
			  if ( ( l = a.length ) != b.length ) return false;
			  // Both have as many elements
			  
			  while ( l-- ) {
				if ( ( x = a[ l ] ) === ( y = b[ l ] ) && x !== 0 || _equals( x, y ) ) continue;
				
				return false;
			  }
			  
			  return true;
			// [object Array]
			
			case '[object Object]':
			  if ( cyclic && ( x = reference_equals( a, b ) ) !== null ) return x; // intentionally duplicated from above for [object Array]
			  
			  l = 0; // counter of own properties
			  
			  if ( enforce_properties_order ) {
				let properties = [];
				
				for ( p in a ) {
				  if ( a.hasOwnProperty( p ) ) {
					properties.push( p );
					
					if ( ( x = a[ p ] ) === ( y = b[ p ] ) && x !== 0 || _equals( x, y ) ) continue;
					
					return false;
				  }
				}
				
				// Check if 'b' has as the same properties as 'a' in the same order
				for ( p in b )
				  if ( b.hasOwnProperty( p ) && properties[ l++ ] != p )
					return false;
			  } else {
				for ( p in a ) {
				  if ( a.hasOwnProperty( p ) ) {
					++l;
					
					if ( ( x = a[ p ] ) === ( y = b[ p ] ) && x !== 0 || _equals( x, y ) ) continue;
					
					return false;
				  }
				}
				
				// Check if 'b' has as not more own properties than 'a'
				for ( p in b )
				  if ( b.hasOwnProperty( p ) && --l < 0 )
					return false;
			  }
			  
			  return true;
			// [object Object]
		  } // switch toString.call( a )
		} // _equals()
		
		/* -----------------------------------------------------------------------------------------
		   reference_equals( a, b )
		   
		   Helper function to compare object references on cyclic objects or arrays.
		   
		   Returns:
			 - null if a or b is not part of a cycle, adding them to object_references array
			 - true: same cycle found for a and b
			 - false: different cycle found for a and b
		   
		   On the first call of a specific invocation of equal(), replaces self with inner function
		   holding object_references array object in closure context.
		   
		   This allows to create a context only if and when an invocation of equal() compares
		   objects or arrays.
		*/
		function reference_equals( a, b ) {
		  let object_references = [];
		  
		  return ( reference_equals = _reference_equals )( a, b );
		  
		  function _reference_equals( a, b ) {
			let l = object_references.length;
			
			while ( l-- )
			  if ( object_references[ l-- ] === b )
				return object_references[ l ] === a;
			
			object_references.push( a, b );
			
			return null;
		  } // _reference_equals()
		} // reference_equals()
	  } // equals()

}

