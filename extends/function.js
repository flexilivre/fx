/**
 * Hack in support for Function.name for browsers that don't support it.
 * IE, I'm looking at you.
**/

if(Function.prototype.name === undefined){
    Object.defineProperty(Function.prototype, 'name', {
        get:function(){
            if(!this.__name)
                this.__name = this.toString().split('(', 1)[0].split(' ')[1];
            return this.__name;
        }
    });
}