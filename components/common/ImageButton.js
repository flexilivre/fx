fx.ns("fx.components", class ImageButton extends fx.components.Button {

    constructor(data)
    {
        super(data);

        this._image = data ? data.image : "";
    }

    render()
    {
        return '<div class="shape">' + (this._image ? this._image.render("image") : "") + '<span class="label">' + this.label + '</span></div>';
    }
});