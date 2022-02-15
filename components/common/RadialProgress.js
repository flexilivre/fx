fx.ns("fx.components", class RadialProgress extends fx.Component {

    constructor(parameters)
    {
      super();
      
      this.showLabel = parameters && parameters.showLabel;
      this.progressColor = parameters && parameters.color ? parameters.color : '#ea67a2';
      this.progressBackgroundColor = parameters && parameters.backgroundColor ? parameters.backgroundColor : '#ffffff';
      this.progressColorThickness = parameters && parameters.thickness ? parameters.thickness : 10;
      this.progressStyle = parameters && parameters.style !== undefined ? parameters.style : 'round';
    }


    get canvas()
    {
        return this.find(".canvas");
    }

    get percentageLabel()
    {
        return this.find(".percentage");

    }

    
    onReady()
    {
        super.onReady();

        if (!this.showLabel)
            this.css(this.percentageLabel, {"display" : "none"})

            this.canvas.width = this.realWidth;
            this.canvas.height = this.realHeight;
        
        this.progress(0);
    }

    render()
    {
        let html = '';
      
        html +='<div class="canvas-wrap">';
        html += '<canvas class="canvas"></canvas>';
        html += '<span class="percentage"></span>';
        html += '</div>';

        return html;
    }

    progress(percentage)
    {
        percentage = percentage * 360 / 100;
        let context = this.canvas.getContext('2d');
   
        let posX = this.canvas.width / 2,
            posY = this.canvas.height / 2;
     
        context.lineCap = 'round';

        context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
  
        context.beginPath();
        context.arc( posX, posY, this.realWidth/2 - this.progressColorThickness, (Math.PI/180) * 270, (Math.PI/180) * (270 + 360) );
        context.strokeStyle = this.progressBackgroundColor;
        context.lineWidth = this.progressColorThickness;
        context.stroke();
  
        context.beginPath();
        context.strokeStyle = this.progressColor;
        context.lineWidth = this.progressColorThickness;
        context.arc( posX, posY, this.realWidth/2 - this.progressColorThickness, (Math.PI/180) * 270, (Math.PI/180) * (270 + percentage) );
        context.stroke();

        this.percentageLabel.innerHTML = percentage.toFixed();
    }
      
   
});