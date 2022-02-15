fx.ns("fx", class graphics {

    static screenSize()
    {
        return  {
            width : fx.dom.width(window),
            height : fx.dom.height(window),
        };
    }

    static imageToDataUri(img, width, height, type, quality, fromX, fromY)
    {
        if (!quality) quality = 1;
        if (!type) type = 'image/jpeg';

        (fromX) || (fromX = 0);
        (fromY) || (fromY = 0);

        let canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, fromX, fromY, width, height);

        let str = "";
        try {
            str = canvas.toDataURL(type, quality);
        }
        catch(e)
        {
            fx.log.error(e);
        }

        canvas = null;
        ctx = null;
        return str;
    }

    static imageToData(img, width, height)
    {
        let canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        let imageData;
        try {
            imageData = ctx.getImageData(0, 0, width, height);
        }
        catch(e){}

        canvas = null;
        ctx = null;
        return imageData;
    }

    static canvasToBlob(image, width, height, type, callback, rotate)
    {
        if (!type) type = 'image/jpeg';

        if (image.img instanceof Image)
            image = image.img;

        let canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');

        if (rotate)
        {
            if(rotate == 90 || rotate == 270) 
            {
                canvas.width = height;
                canvas.height = width;
            } else 
            {
                canvas.width = width;
                canvas.height = height;
            }

            ctx.translate(canvas.width/2,canvas.height/2);
            
            
            ctx.rotate(rotate*Math.PI/180);
            ctx.drawImage(image,-width/2,-height/2, width, height);

        }
        else
        {
            if ( image.width > image.height)
                height = image.height / image.width * width;
            else
                width = image.width / image.height * height;
        
            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(image, 0, 0, width, height);
        }

        canvas.toBlob(callback, type /*, 1*/);
    }

    static getImageDimension(file, callback, freeMemory)
    {
        let img = new Image();

        img.onload = function() {
            callback(img, img.width, img.height);
            if (freeMemory)
            {
                if (typeof file != "string")
                    URL.revokeObjectURL(img.src);
                img = null;
            }
        };
    
        img.src = (typeof file == "string") ? file : URL.createObjectURL(file);
    }

    
    static averageColorFromBase64(imgEl, returnColorObject, width, height)
    {
          var blockSize = 5, // only visit every 5 pixels
              defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
              canvas = document.createElement('canvas'),
              context = canvas.getContext && canvas.getContext('2d'),
              data,
              i = -4,
              length,
              rgb = {r:0,g:0,b:0},
              count = 0;

          if (!context) 
              return defaultRGB;
          
          if (width && height)
          {
              canvas.width = width;
              canvas.height = height; 
              context.drawImage(imgEl, 0, 0, width, height);
          }
          else
          {
              height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
              width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
              context.drawImage(imgEl, 0, 0);
          }
          
          try {
              data = context.getImageData(0, 0, width, height);
          } catch(e) {
              /* security error, img on diff domain */
              return defaultRGB;
          }

          length = data.data.length;

          while ( (i += blockSize * 4) < length ) {
              ++count;
              rgb.r += data.data[i];
              rgb.g += data.data[i+1];
              rgb.b += data.data[i+2];
          }

          // ~~ used to floor values
          rgb.r = ~~(rgb.r/count);
          rgb.g = ~~(rgb.g/count);
          rgb.b = ~~(rgb.b/count);

          //return rgb;
          let color = tinycolor(rgb)
          return returnColorObject ? color : color.toRgbString();
    }

    static getImageLuminance(imgEl, width, height)
    {
          let blockSize = 5, // only visit every 5 pixels
              defaultRGB = 1, // for non-supporting envs
              canvas = document.createElement('canvas'),
              context = canvas.getContext && canvas.getContext('2d'),
              data,
              i = -4,
              length,
              count = 0,
              dark = 0;

        try 
        {
            if (!context) 
                return defaultRGB;

            if (width && height)
            {
                canvas.width = width;
                canvas.height = height; 
                context.drawImage(imgEl, 0, 0, width, height);
            }
            else
            {
                height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
                width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
                context.drawImage(imgEl, 0, 0);
            }

            data = context.getImageData(0, 0, width, height);

            length = data.data.length;
            //let colors = [];
            while ( (i += blockSize * 4) < length ) 
            {
                count++;
                let rgb = [data.data[i], data.data[i+1], data.data[i]+2];
              //  colors.push(rgb);
                let brightness = fx.graphics.getBrigthness(rgb);
                
                if(brightness < 20)
                    dark+=3;
                else
                if(brightness < 50)
                    dark+=2;
                else
                if(brightness < 100)
                    dark+=1;
            }

            /*let palette = quantize(colors, 10).palette();

            console.log( palette ) ;*/

            return dark / count;

        }  catch(e)  {
            return defaultRGB;
        }
    }

    // TODO : check that S L for a function
    // 
    /*
Good solution :  https://awik.io/determine-color-bright-dark-using-javascript/
hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
    );


  
    static rgbToHsl(r, g, b){
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
    
        if(max == min){
            h = s = 0; // achromatic
        }else{
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
    
        return [h, s, l];
    }  */

    static getBrigthness(rgb) {
        return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    }

    static getLuminance(rgb) {
        //http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
        var RsRGB, GsRGB, BsRGB, R, G, B;
        RsRGB = rgb.r/255;
        GsRGB = rgb.g/255;
        BsRGB = rgb.b/255;

        if (RsRGB <= 0.03928) {R = RsRGB / 12.92;} else {R = Math.pow(((RsRGB + 0.055) / 1.055), 2.4);}
        if (GsRGB <= 0.03928) {G = GsRGB / 12.92;} else {G = Math.pow(((GsRGB + 0.055) / 1.055), 2.4);}
        if (BsRGB <= 0.03928) {B = BsRGB / 12.92;} else {B = Math.pow(((BsRGB + 0.055) / 1.055), 2.4);}
        return Number( ((0.2126 * R) + (0.7152 * G) + (0.0722 * B)).toFixed(2));
    }

    static getColorAlpha(color)
    {
        if (color && color.indexOf("rgba") != -1)
          return color.replace(/^.*,(.+)\)/,'$1');
      else
          return undefined;
    }

    static globalToLocal( elt, globalX, globalY ){
        // Get the position of the context element.
        //let position = fx.graphics.offset( elt );
        //let position = $(elt).offset();
        let position = fx.graphics.offset( elt );
        // Return the X/Y in the local context.
        return({
            x: Math.floor( globalX - position.left ),
            y: Math.floor( globalY - position.top )
        });
    }

    static localToGlobal( elt, localX, localY ){
        // Get the position of the context element.
        let position = fx.graphics.offset( elt );
        //let position = context.offset();
        // Return the X/Y in the local context.
        return({
            x: Math.floor( localX + position.left ),
            y: Math.floor( localY + position.top )
        });
    }

    static offset(elt) 
    {
        let rect = elt.getBoundingClientRect(), bodyElt = document.body;
        return {
            top: rect.top + bodyElt .scrollTop,
            left: rect.left + bodyElt .scrollLeft
        }
    }

    static getTextWidthDOM(textContainer, parent) {

        if (!parent)
            parent = textContainer.parentNode;

        let span = document.createElement("div");
        //span.style.font = fx.dom.css(textContainer, "font-weight", true) + " " + fx.dom.css(textContainer, "font-style", true) + " " + fx.dom.css(textContainer, "font-size", true) + " " + fx.dom.css(textContainer, "font-family", true);
        span.style.fontSize = fx.dom.css(textContainer, "font-size", true);
        span.style.fontWeight = fx.dom.css(textContainer, "font-weight", true);
        span.style.fontFamily = fx.dom.css(textContainer, "font-family", true);
        span.style.fontStyle = fx.dom.css(textContainer, "font-style", true);
        span.style.lineHeight = fx.dom.css(textContainer, "line-height", true); // search recursively
        span.style.float = "left";
        span.style.whiteSpace = "nowrap";
        span.style.visibility = "hidden";
        span.style.position = "absolute";
        span.style.width = "auto";
        span.style.height = "auto";
        span.innerHTML = textContainer.innerHTML;
        parent.appendChild( span );

        //let w = fx.dom.width( span);        
        //let h = fx.dom.height( span);
        //let size = { width : span.clientWidth + 1, height : span.clientHeight };
        let width = span.clientWidth;

        parent.removeChild( span );

        return width;

    }

    static getSelectionContainerElement () 
    {
        let range, sel, container;
        if (document.selection && document.selection.createRange) {
            // IE case
            range = document.selection.createRange();
            return range.parentElement();
        } else if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt) {
                if (sel.rangeCount > 0) {
                    range = sel.getRangeAt(0);
                }
            } else {
                // Old WebKit selection object has no getRangeAt, so
                // create a range from other selection properties
                range = document.createRange();
                range.setStart(sel.anchorNode, sel.anchorOffset);
                range.setEnd(sel.focusNode, sel.focusOffset);

                // Handle the case when the selection was selected backwards (from the end to the start in the document)
                if (range.collapsed !== sel.isCollapsed) {
                    range.setStart(sel.focusNode, sel.focusOffset);
                    range.setEnd(sel.anchorNode, sel.anchorOffset);
                }
            }

            if (range) {
                container = range.commonAncestorContainer;

                // Check if the container is a text node and return its parent if so
                return container.nodeType === 3 ? container.parentNode : container;
            }   
        }
    }

    static selectText(element) 
    {
        if (!element)
            element = fx.graphics.getSelectionContainerElement();

        if (window.getSelection) { // All browsers, except IE <=8
            window.getSelection().selectAllChildren(element);
        } 
        else 
        if (document.body.createTextRange) { // IE <=8
            let range = document.body.createTextRange();
            range.moveToElementText(element);
            range.select();
        }
    }

    static  deselectText()
    {
        if (window.getSelection) { // All browsers, except IE <=8
            window.getSelection().removeAllRanges();
        } 
        else 
        if (document.selection) { // IE <=8
            document.selection.empty();
            }
    }

    static elementsFromPoint(x,y, count) {

        let elements = [];

        x = parseInt(x);
        y = parseInt(y);

        if (!Utils.isInt(x) || !Utils.isInt(y))
            return elements;

        if (document.elementsFromPoint) // Chrome
            elements = document.elementsFromPoint(x, y);
        else
        if (document.msElementsFromPoint){ // IE
            elements = document.msElementsFromPoint(x, y);
        }
        else
        if (document.elementFromPoint)
        {
            let previousPointerEvents = [], current, i, d;
            
            // get all elements via elementFromPoint, and remove them from hit-testing in order
            while ((current = document.elementFromPoint(x, y)) && elements.indexOf(current) === -1 && current != null && count >= 0) {

                // push the element and its current style
                elements.push(current);
                previousPointerEvents.push({
                    value: current.style.getPropertyValue('pointer-events'),
                    priority: current.style.getPropertyPriority('pointer-events')
                });

                // add "pointer-events: none", to get to the underlying element
                current.style.setProperty('pointer-events', 'none', 'important');

                count--;
            }

            // restore the previous pointer-events values
            for (i = previousPointerEvents.length; d = previousPointerEvents[--i];) {
                elements[i].style.setProperty('pointer-events', d.value ? d.value : '', d.priority);
            }
        }
        else
        if (document.msElementsFromRect && document.msElementsFromRect(x, y, 1, 1)){ // IE
            let nodes = document.msElementsFromRect(x, y, 1, 1)
            for(let i = nodes.length; i--; elements.unshift(nodes[i]));
        }

         // case when msElementsFromPoint return object
         if (!(elements instanceof Array))
         {
            let tmp = [];
            for (var key in elements)
                if (elements.hasOwnProperty(key))
                    tmp.push(elements[key]);
                
            elements = tmp;
         }

        return elements;

    }


    static getBoundingRect(rect, angle)
    {
        let radVal = Number(angle) * Math.PI / 180;
        let radVal2 = (90- Number(angle)) * Math.PI / 180;

        let x, y, x1, y1, x2, y2, x3, y3;
        x = Number(rect.x);
        y = Number(rect.y);
        x1 = -Math.sin(radVal) * Number(rect.height) + Number(rect.x);
        y1 = Math.cos(radVal) * Number(rect.height) + Number(rect.y);
        x2 = Math.cos(radVal) * Number(rect.width) + x1;
        y2 = Math.sin(radVal) * Number(rect.width) + y1;
        x3 = Math.sin(radVal2) * Number(rect.width) + x;
        y3 = Math.cos(radVal2) * Number(rect.width) + y;

        let newX = Math.min(x, x1, x2, x3);
        let newY = Math.min(y, y1, y2, y3);

        let width = Number(rect.height) * Math.abs( Math.sin( radVal) ) + Number(rect.width) * Math.abs( Math.cos( radVal ) );
        let height = Number(rect.height) * Math.abs( Math.cos( radVal ) ) + Number(rect.width) * Math.abs( Math.sin( radVal ) );

        return {x : newX, y : newY, width : width, height : height};
    }

    static rotate(cx, cy, x, y, angle)
    {
        let radians = (Math.PI / 180) * angle,
                cos = Math.cos(radians),
                sin = Math.sin(radians),
                nx = (cos * (x - cx)) - (sin * (y - cy)) + cx,
                ny = (sin * (x - cx)) + (cos * (y - cy)) + cy;
        return [nx, ny];
    }

    static getRotationAngle(x1 , y1, x2,y2)
    {
        return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    }

    static  getRotationDegrees( element )
    {
        let obj = $(element);
        let angle;
        let matrix = obj.css("-webkit-transform") ||
                     obj.css("-moz-transform")    ||
                     obj.css("-ms-transform")     ||
                     obj.css("-o-transform")      ||
                     obj.css("transform");

        if (matrix !== 'none') 
        {
            let values = matrix.split('(')[1].split(')')[0].split(',');
            let a = values[0];
            let b = values[1];
            angle = Number(Math.atan2(b, a) * (180/Math.PI));
        } 
        else 
        { 
            angle = 0; 
        }

        return (angle < 0) ? angle + 360 : angle;
    }


    static getTranslate(item) 
    {
        if (!item)
            return {x:0, y:0};

        if (item instanceof fx.Component)
            item = item.node;

        let transArr = [];

        if (!window.getComputedStyle) return;
        let style     = getComputedStyle(item),
            transform = style.transform || style.webkitTransform || style.mozTransform || style.msTransform;

        if (transform)
        {
            let mat       = transform.match(/^matrix3d\((.+)\)$/);
            if (mat) return parseFloat(mat[1].split(', ')[13]);

            mat = transform.match(/^matrix\((.+)\)$/);
            mat ? transArr.push(parseFloat(mat[1].split(', ')[4])) : transArr.push(0);
            mat ? transArr.push(parseFloat(mat[1].split(', ')[5])) : transArr.push(0);
            return { x : transArr[0], y : transArr[1] };
        }
        else
            return {x:0, y:0};

        
    }

    static getScale(element)
    {
        if (element instanceof fx.Component)
            element = element.node;
            
        return !element ? 0 : element.getBoundingClientRect().width / element.offsetWidth;   
    }


    static scrollbarWidth() {

        // Creating invisible container
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll'; // forcing scrollbar to appear
        outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
        document.body.appendChild(outer);
      
        // Creating inner element and placing it in the container
        const inner = document.createElement('div');
        outer.appendChild(inner);
      
        // Calculating difference between container's full width and the child width
        const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
      
        // Removing temporary elements from the DOM
        outer.parentNode.removeChild(outer);
      
        return scrollbarWidth;
      
      }
      
   

});