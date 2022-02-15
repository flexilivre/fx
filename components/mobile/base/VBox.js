fx.ns("fx.components", class VBox extends fx.components.Box {

    constructor(data) {
        super(data);
    }
    
    onReady(){
        super.onReady();

        this.updateDisplay();
    }

    position(){
        super.position(true);

        // childs should be displayed in one column
        let childs = this.getChilds();
        for (let index = 0; index < childs.length; index++)
                childs[index].css({position:"relative"});
                
    }
});