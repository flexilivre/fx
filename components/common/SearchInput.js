fx.ns("fx.components", class SearchInput extends fx.components.Input {

    constructor(parameters)
    {
        super(parameters);

        this._propositions = parameters && parameters.propositions ? parameters.propositions : [];
    }

    /********************** Constants / parameters *********************/

    get results()
    {
        return this._results;
    }

    set results(val)
    {
        this._results = val;
        if (this.initialized)
            this._updateResults();
    }

    get value()
    {
        return super.value;
    }

    set value(val)
    {
        super.value = val;

        this.toggleClass("filled", this.value != "");
    }

    get waiting()
    {
        return this._waiting;
    }

    set waiting(val)
    {
        this._waiting = val;

        if (val)
        {
            this.resultsContainer.innerHTML = "<ul class='list'><li>" + fx.assets.loader.render("waiting") + "</li></ul>";
            this.css(this.resultsContainer, {display:"block"});
        }
        else
        {
            this.resultsContainer.innerHTML = "";
            this.css(this.resultsContainer, {display:"none"});
        }
    }


    /************************ Overrides *******************/
    onReady()
    {
        super.onReady();

        this.on("escape", this.onEscape);
        this.on("click", this.onClick, window);
        this.on("keydown", this.onKeyDown);
        this.on("enter", this.onEnter);

        this.resultsContainer = this.find(".results");
    }

    render()
    {
        return super.render() + fx.assets.ExitIcon.render() + fx.assets.SearchIcon.render() + '<div class="results"></div>';
    }


    
    /************************ Events *******************/

    onEnter(e)
    {
        this.results = [];
    }

    onEscape(e)
    {
        if (this.results.length > 0)
            this.results = [];
        else
        if (this.value != "")
        {
            this.value = ""
            this.trigger("enter");
        }
    }

    onClick(e)
    {
        if (!this.enabled)
            return;

        if (!fx.dom.parent(e.target, this.node))
            this.results = [];
        else
        if (fx.dom.parent(e.target, ".ExitIcon"))
        {
            this.value = "";
            this.results = [];
            this.trigger("enter");
        }
        else
        if (fx.dom.parent(e.target, ".SearchIcon"))
        {
            this.results = [];
            this.trigger("enter");
        }
        else
        {
            let result = fx.dom.parent(e.target, ".result");
            if (result)
            {
                this.value = result.innerText;
                this.trigger("selected", this.value);

                this.results = [];
            }
            else
                this.results = this._propositions || [];
        }
        
    }


    onKeyPress(e)
    {
        super.onKeyPress(e);

        this.toggleClass("filled", this.value != "");
    }
    
    onKeyDown(e)
    {
        if (e.keyCode == 38) // up
        {
            let selectedItem = this.find(".selected");
            if (selectedItem) // previous
            {
                fx.dom.removeClass(selectedItem, "selected");
                let elements = this.find(".result");
                let index = elements.indexOf(selectedItem);
                index--;
                if (index >= 0)
                    fx.dom.addClass(elements[index], "selected");
            }
            else // last
            {
                let element = this.find(".result:last-child");
                fx.dom.addClass(element, "selected");
            }

            e.preventDefault();
            e.stopPropagation();

        }
        else
        if (e.keyCode == 40) // up
        {
            let selectedItem = this.find(".selected");
            if (selectedItem) // next
            {
                fx.dom.removeClass(selectedItem, "selected");
                let elements = this.find(".result");
                let index = elements.indexOf(selectedItem);
                index++;
                if (index < elements.length)
                    fx.dom.addClass(elements[index], "selected")
            }
            else // first
            {
                let element = this.find(".result:first-child");
                fx.dom.addClass(element, "selected");
            }

            e.preventDefault();
            e.stopPropagation();

            
        }
        else
        if (e.keyCode == 13)
        {
            let selectedItem = this.find(".selected");
            if (selectedItem)
            {
                this.value = selectedItem.innerText;
                this.trigger("selected", this.value);

                this.results = [];

                e.preventDefault();
                e.stopPropagation();
            }
        }

        
    }

    /******************************************************/
    _updateResults()
    {
        if (this._results.length == 0)
            this.css(this.resultsContainer, {display:"none"});
        else
        {
            let html = "<ul class='list'>";
            for(let i = 0; i < Math.min(10, this.results.length); i++) // Max 10 results
            {
                let label = this.results[i].label || "";
                let index = (this.value == "string" && typeof this.value.toLowerCase == "function") ? label.toLowerCase().indexOf(this.value.toLowerCase()) : -1; // fix trackjs crash (this.value.toLowerCase is not a function)
                if (index > -1) // underline search string in results
                    label = label.slice(0, index) + "<span class='bold underlined'>" + label.substring(index, index + this.value.length) + "</span>" + label.slice(index + this.value.length);
                
                html += "<li class='result' data-value='" + this.results[i].label + "'>" + label + "</li>";
            }

            html += "</ul>";

            this.resultsContainer.innerHTML = html;

            this.css(this.resultsContainer, {display:"block"});
        }
    }

});