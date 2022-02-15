fx.animate.vzigzag = (function(){

	let easing = "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
		showSpeed = 0.5, // speed to show an element
		hideSpeed = 0.25, // speed to show an element
        defaultTimeout = 10,
        range = 150;
		dom = fx.get("dom");
		


	return {
		show : function(component, callback){
            
            component.animating = true;

            let top = (-range + Math.round(Math.random() * (range*2))) + "px";
            let left = (-range+ Math.round(Math.random() * (range*2))) + "px";
            // let's disable transition
            let position = dom.css(component.node, "position");
            position = position == "static" ? undefined : position;

            let viewport = component.viewport();

            component.viewport({top : top/*, left : left*/}, true);
            dom.css(component.node, {"transition": "none", opacity : 0, "visibility" : "visible", top:top/*, left : left*/, position:"relative"});
         
            setTimeout(function(){

                dom.css(component.node, {transition : "all " + (showSpeed) + "s " + easing});

			    setTimeout(function(){
                
                    dom.css(component.node, {opacity : 1, top:"0px", left : "0px"});
                    
                    setTimeout( function(){
                        dom.css(component.node, {"transition" : "none", position:position});
                        component.viewport(viewport, true);

                        component.animating = true;
                        component.updateDisplay(true);
			
                        if (callback)
                            callback();

                    }, showSpeed * 1000);


                }, defaultTimeout);
            }, defaultTimeout);
		},
		hide : function(component, callback){
			
			let top = (-range + Math.round(Math.random() * (range*2))) + "px";
            let left = (-range+ Math.round(Math.random() * (range*2))) + "px";
            // let's disable transition
            let position = dom.css(component.node, "position");
            position = position == "static" ? undefined : position;

            let viewport = component.viewport();

            dom.css(component.node, {transition : "all " + hideSpeed + "s " + easing, "visibility" : "visible", position:"relative", top:viewport.top, left:viewport.left});
         
            setTimeout(function(){

                component.viewport({top : top/*, left : left*/}, true);
                dom.css(component.node, {opacity : 0, top:top/*, left : left*/});

			    setTimeout(function(){
                
                    component.viewport(viewport, true);
                    dom.css(component.node, {"transition" : "none", position:position});
                    

                        if (callback)
                            callback();

                    }, hideSpeed * 1000);

               
            }, defaultTimeout);
		}
	};

})();