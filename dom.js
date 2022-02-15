/** 
* Dom access based on JQUERY. If you want to use another library, just modify core of each function
* @namespace fx.dom
*/
fx.ns("fx", class dom {
    
    static find(selector, context){
        let elements = $(selector, context).get();
        return (elements.length == 0) ? null : ( (elements.length == 1) ? elements[0] : elements );
    }

    static on(evt, fn, el )
    {
        $( fx.dom._selector(el) ).bind(evt, fn);
    }

    static off(evt, fn, el){

        $( fx.dom._selector(el) ).unbind(evt, fn);      
    }

    static trigger(evt, el){

        $( fx.dom._selector(el) ).unbind(evt);      
    }

    static css(el, props, recursively){
        for (let property in props) {
            if (props.hasOwnProperty(property)) {
                let val = props[property];
                if ("width,height,top,left,bottom,right,margin-top,margin-bottom,margin-left,margin-right,padding-top,padding-bottom,padding-left,padding-right,border-width,font-size".indexOf(property) != -1 && ("" + val).trim().endsWith("px") == false )
                    props[property] = Utils.normalizeCSSValue(("" + val).trim());
            }
        }

        if (recursively === true && typeof props == "string")
        {
            let value;
            while (el && !( value = $( fx.dom._selector(el) ).css(props) ) )
                el = el.parentNode;

            return value;
        }

        return $( fx.dom._selector(el) ).css(props);
    }

    static position(el){
    	return $( fx.dom._selector(el) ).position();
    }

    static addClass(el, className){
    	$( fx.dom._selector(el) ).addClass(className);
    }

    static removeClass(el, className){
    	$( fx.dom._selector(el) ).removeClass(className);
    }

    static toggleClass(el, className, val){
        $( fx.dom._selector(el) ).toggleClass(className, val);
    }

    static hasClass(el, className){
        //return $(element).hasClass(className);
        el = fx.dom._selector(el);
        if (typeof el == "string")
            el = fx.dom.find(el);

        return el && el.classList && el.classList.contains(className);
        //return ( (" " + element.className + " ").replace(/[\n\t]/g, " ").indexOf(className) > -1 ) 
    }

    static width(element){
    	return $(element || window).width();
    }

    static height(element){
    	return $(element || window).height();
    }

    static outerWidth(element){
    	return $(element || window).outerWidth();
    }

    static outerHeight(element){
    	return $(element || window).outerHeight();
    }

    static offset(selector){
        return $( fx.dom._selector(selector) ).offset();
    }

    static remove(id) {
        $("#" + id).remove();
    }

    static ajax(options) {
        return $.ajax(options);
    }

    static stop( element, clearQueue, jumpToEnd )
    {
        $(element).stop(clearQueue, jumpToEnd);
    }

    static animate( element, properties , duration, easing, complete)
    {
        $(element).animate( properties , duration, easing, complete );
    }


    static parent(element, selector)
    {
        if (element)
        {
            if (selector instanceof fx.Component)
                selector = selector.node;

            if (element instanceof fx.Component)
                element = element.node;
                
            if (typeof selector == "object")
            {
                let parent = element;
                while (parent && parent != selector)
                    parent = parent.parentNode;
                
                return parent;
            }
            else
            {

                let found;

                while(element && !(found = $(element).is(selector)))
                    element = element.parentNode;
                
                return found ? element : null;
        
                /*let parents = fx.dom.parents(element, selector);
                if (parents.length > 0)
                    return parents[0];*/
            }
        }
        
        return null;
    }

    static parents(element, selector)
    {
        let parents = [];
        while (element && element.classList) 
        {
            if (element.classList.contains(selector.startsWith(".") ? selector.substr(1) : selector ))
                parents.unshift(element);
                
            element = element.parentNode;
        }
        return parents;
    }
    
    static _selector(el)
    {
        if (el instanceof fx.Component)
            el = "#" + el.id;
        else
        if (typeof el == "string" && el.indexOf(Utils.prefixID) == 0)
            el = "#" + el;

        return el;
    }


    static hasFocus(element)
    {
        if (typeof element == "string") //  selector
            element = fx.dom.find(element);
        
        if (element instanceof fx.Component)
            element = element.node;
        
        return document.activeElement === element
    }

    static focus(element)
    {
        if (typeof element == "string") //  selector
            element = fx.dom.find(element);
        
        if (element instanceof fx.Component)
            element = element.node;

        if (element && !(element instanceof Array))
            element.focus();
    }

    static text(node)
    {
        return $(node).text();
    }

    static turn(selector)
    {
        return $(selector);
    }

});