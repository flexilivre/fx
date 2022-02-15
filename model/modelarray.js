/**
 * fx.ModelArray is a Model thay contains an array of objects
 */
fx.ns("fx", class ModelArray extends fx.Model {

    constructor(data /*, parentModel, parentProperty*/)
    {
        super(data /*, parentModel, parentProperty*/);
    }

    /**************************** GETTERS ****************************/

    get sendActions()
	{
		return {update : false, create : false, delete : false};
    }
    
    get JSON()
    {
        let json = [];
        for (let i = 0; i < this._array.length; i++)
            json.push( this._array[i] instanceof fx.Model ? this._array[i].JSON : this._array[i])
        
        return json;
    }

    get length()
    {
        return this._array.length;
    }

    get last()
    {
        return this._array[ this._array.length - 1];
    }

    set internalSort( callback )
    {
        this._internalSort = callback ;
        if (this._array)
            this._applyInternalSort();
    }

   
    /**************************** OVERRIDES & PUBLIC FUNCTIONS ****************************/

    toArray()
    {
        return this._array.concat();
    }

    getItemAt(index)
    {
        return this._array[index];
    }

    

    indexOf(item)
    {
        return this._array.indexOf(item);
    }
    

    // TODO : on all removeItem[s][all] check case of item (need to call .delete() or not ?)
    removeItems(items, history)
    {
        for (let i = 0; i < items.length; i++)
            this.removeItem( items[i], history );
    }

    removeItem(item, history)
    {
        let index = this._array.indexOf( item );
        if (index != -1)
        {
            let previous = this.JSON;

            this._array.splice(index, 1);

            let action = new fx.Action("removeItem", item, this);
            action.item = item;
            action.previous = previous;
            action.index = index;
            action.json = this.JSON;
            action.history = history;
            this.trigger({type:"updated", action : action});
        }
        else
            fx.log.error("removeItem : item not found, " + item);
    }

    removeItemAt(index, history)
    {
        if (index >= 0 && index <= this.length)
        {
            let previous = this.JSON;

            this._array.splice(index, 1);

            let action = new fx.Action("removeItemAt", index, this);
            action.index = index;
            action.previous = previous;
            action.index = index;
            action.json = this.JSON;
            action.history = history;
            this.trigger({type:"updated", action : action});
        }
            
        else
            fx.console.log("removeItemAt : index out of range", index);

        
    }

    removeAll(silent, history)
    {
        if (this._array.length == 0)
            return;

        let previous = this.JSON;

        let item;
        while (item = this._array.pop() || this._array.length > 0)
        {
            if (!silent && item instanceof fx.Model)
                item.delete();
        }
        
        if (!silent)
        {
            let action = new fx.Action("removeAll", null, this);
            action.previous = previous;
            action.json = [];
            action.history = history;
            this.trigger({type:"updated", action : action});
        }
    }

    /**
     * Add new item
     * @param {*} item : items or array of items to be added
     * @param {*} unique : item is unique, so if it already exist don't add it
     * @param {*} silent : it set to true, don't trigger any event
     * @param {*} history : if set to true, used for history
     * @param {*} all : if set to true means no more items will be added after that (needed for exemple on VerticalGridDynamic to know that it can be update instantanetly instead of waiting for next items)
     */
    addItem(item, unique, silent, history, all)
    {
        unique = !(unique === false);

        let previous = this.JSON;

        let items = ( item instanceof Array || item instanceof fx.ModelArray) ? item : [item];
            
        let added = false;
        let addedItems = [];
        let itemModel;
        for(let i = 0; i < items.length; i++)
        {
            let elt = items instanceof fx.ModelArray ? items.getItemAt(i) : items[i];

            if (!unique || (elt.hasOwnProperty("id") ? !this._array.find({id : elt.id}) : (this._array.indexOf(elt) == -1) ) )
            {
                itemModel = elt instanceof fx.Model ? elt : this._createModel(elt);
                this._connect(itemModel, true);
                addedItems.push(itemModel);
                this._array.push( itemModel);
                added = true;
            }
        }
            
        if (!silent)
        //if (added) We send an action event if not element was added because in cases when no result, component need to be refreshed
        {   
            let action = new fx.Action("addItem", item, this);
            action.items = addedItems;
            action.previous = previous;
            action.json = [];
            action.history = history;
            action.all = all;
            this.trigger({type:"updated", action : action});
        }
    }

    addItemAt(index, item, history)
    {
        if (index >= 0 && index <= this.length)
        {
            let previous = this.JSON;

            let items = ( item instanceof Array || item instanceof fx.ModelArray) ? item : [item];
            
            for(let i = 0; i < items.length; i++)
            {
                let itemModel = items instanceof fx.ModelArray ? items.getItemAt(i) : this._createModel(items[i]);
                this._connect(itemModel, true);
                this._array.splice(index, 0, itemModel );
            }
                

            let action = new fx.Action("addItemAt", item, this);
            action.items = items;
            action.index = index;
            action.previous = previous;
            action.json = [];
            action.history = history;
            this.trigger({type:"updated", action : action});
        }
            
    }

    moveItemAt(index, item, history)
    {
        if (index >=0 && index < this.length && this.indexOf(item) != -1)
        {
            let previous = this.JSON;

            let oldindex = this._array.indexOf(item);
            this._array.move( oldindex, index);

            let action = new fx.Action("moveItemAt", {item:item, index : index}, this);
            action.item = item;
            action.previous = previous;
            action.json = this.JSON;
            action.history = history;
            this.trigger({type:"updated", action : action});
        }
    }

    moveItem(item, reference, side,history)
    {
        side = side || "right";

        if (!item || reference === undefined)
            return;
        
        let previous = this.toArray();

        if (Utils.isInt(reference))
        {
            this._array.move( this._array.indexOf(item), reference);
        }
        else
        if (side == "right")
        {
           let oldindex = this._array.indexOf(item);
           let newindex = this._array.indexOf(reference);

           if (oldindex > newindex)
                newindex++;

           this._array.move( oldindex, newindex);
        }
        else // "before"
        {
           let oldindex = this._array.indexOf(item);
           let newindex = this._array.indexOf(reference);

           if (oldindex < newindex)
                newindex--;

           this._array.move( oldindex, newindex);
        }
        
        let action = new fx.Action("moveItem", {item:item, reference:reference, side:side}, this);
        action.item = reference;
        action.side = side;
        action.previous = previous;
        action.json = this.JSON;
        action.history = history;
        this.trigger({type:"updated", action : action});
      
    }
	
    contains(item)
    {
        return this._array.indexOf( item ) != -1;
    }

    indexOf(item)
    {
        return this._array.indexOf( item );
    }

    find(properties, returnArray)
    {
        return this._array.find(properties, returnArray);
    }

    filter(callback)
    {
        return this._array.filter(callback);
    }

    sort(callback)
    {
        return this._array.sort(callback);
    }

    every(callback)
    {
        return this._array.every(callback);
    }

    concat(item)
    {
        return this.addItem(item);
    }

    init(data)
    {
        // we store here the array of data
        if (!this._array || this._array.length > 0)
            this._array = [];

        if (!data) return;

        for (let i = 0; i < data.length; i++)
        {
            let model = this._createModel(data[i]);
            this._array.push( model );
            this._connect(model, true);
        }

        this._applyInternalSort();

        this.trigger({type:"updated", action : new fx.Action("init", this, this)});
    }


    undo(action)
    {
        switch(action.type)
        {
            case "removeItem":
                action.model.addItemAt(action.index, action.item, true);
                break;

            case "addItem" :
                action.data.delete(true);
                break;

            case "addItemAt" :
                //TODO
                action.data.delete(true);
                break;

            case "moveItem" :
                action.model.moveItemAt(action.previous.indexOf( action.item ), action.item, true);
                //action.model.moveItem(action.data, action.item, action.side, true);
                break;
        } 
    }

    redo(action)
    {
        switch(action.type)
        {
            case "removeItem":
                action.item.delete(true);
                break;

            case "addItem":
                action.model.addItem(action.data, undefined, undefined, true);
                break;

            case "addItemAt" :
                //TODO
                action.model.addItemAt(action.index, action.data, true);
                break;

            case "moveItem" :
                action.model.moveItem(action.data, action.item, action.side, true);
                break;
        } 
    }

    /**
     * Reserved add, delete, empty, insert(after, before, reference)
     **/ 
    update(name, data) // DISABLED
    {
    }

    /**
     * To override if needed to sort or update data before being displayed
     */
    refresh()
    {
     
    }

    /**************************** PRIVATE FUNCTIONS ****************************/

    _connect(data, on)
    {
        if (data instanceof fx.Model)
            data.parentModel = on ? this : null;
    }

    _onUpdated(e)
    {
        // we spy here on delete action, so we can delete element from array
        if (e.action.type == "delete" && e.action.model.parentModel == this)
        {
            if (this.contains(e.action.model))
                this.removeItem( e.action.model, e.action.history );
        }

        this._applyInternalSort();
        //else
        super._onUpdated(e);
    }


    _applyInternalSort()
    {
        if (this._internalSort)
            this._array.sort( this._internalSort );
    }
    
   
});
