/**
 * FileSelector allow to select files from device.
 * Contructor allows to specify files types and multiple selection.
 * Wehn files are selected, this component trigger "files-selected" event with array of selected files in event.detail.
 * 
 * Call destroy function when finish using.
 */
fx.ns("fx.components", class FileSelector extends fx.EventDispatcher {

    /**
     * FileSelector optional parameters :
     * - fileTypes : array of files extensions. Example : new fx.components.FileSelector({fileTypes : [".jpeg", ".jpeg", ".png"]}). Default value : ["*"]
     * - multipleSelection : boolean. If true, user can select multiple files. Default value : false.
     * @param {Object} parameters 
     */
    constructor(parameters)
    {
        super();

        this._fileTypes = (parameters && parameters.fileTypes) ? parameters.fileTypes : ["*"];
        this._multipleSelection = (parameters && parameters.multipleSelection) ? parameters.multipleSelection : false;
    
        this._input = document.createElement('input');
        this._input.id = Utils.newID();
        this._input.setAttribute("id", Utils.newID());
        this._input.setAttribute("type", "file");
        this._input.setAttribute("accept", this._fileTypes.join(",") /*".jpg,.jpeg,.png"*/);
        this._input.setAttribute("multiple", "multiple");
        this._input.style.display = "none";
       
        this.on("change", this._onFilesSelected, this._input);

        document.body.appendChild( this._input );
    }

    /**
     * Call this function to open an explorer, so user can select files.
     */
    selectFiles()
    {
        this._input.click();
    }

    get files()
    {
        if(!this._files)
            this._files = [];
            
        return this._files;
    }

    _onFilesSelected(event)
    {
        this._files = [];

        // TODO : make this part work even for file like photo.2012.jpeg 
        // we filter here only valid image types
        for (let i = 0; i < event.target.files.length; i++)
        {
            let file = event.target.files[i];

            let ext = "." + file["name"].toLowerCase().split('.').pop();

            if ( this._fileTypes.indexOf(ext) > -1 )
                this._files.push(file);
        }

        // no this._files, we do nothing
        if (this._files.length == 0)
            return;

        // clear input, so user can select again the same files
        this._input.value = "";

        //this.model.event("files-selected", files);
        this.trigger("files-selected", this._files);
    }

    destroy()
    {
        super.destroy();

        fx.dom.remove(this._input.id);
        this._files = null;
    }

});