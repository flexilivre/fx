(function(){
    let proxy = Object.prototype.toString;
    Object.prototype.toString = function()
        { 
            if (this instanceof fx.Disposable)
            {
                if (this.name !== undefined && typeof this.name == "string")
                    return this.name;
                
                if (this.label !== undefined && typeof this.label == "string")
                    return this.label;
            }

            return proxy.call(this); 
        };
})();