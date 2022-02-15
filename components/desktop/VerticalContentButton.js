/*fx.ns("fx.components", class VerticalContentButton extends fx.Component {
    
    constructor(parameters) {
        super(parameters);

        this.clickCallback = parameters.click;
        this.data = parameters.data;
        this.icon = parameters.icon;
        this.title = parameters.title;
        this.subtitle = parameters.subtitle

        this.dom = fx.get("dom");
    }

    onReady()
    {
        this.on("click", this.onClick);
    }


    onClick(){
        if (this.clickCallback)
            this.clickCallback(this.data || this);
    }

    render(){
        let html = this.icon.render("icon");
        html += "<div class='title'>" + this.title + "</div>";
        if (this.subtitle)
            html += "<div class='subtitle'>" + this.subtitle + "</div>";
        return html;
    }

});*/