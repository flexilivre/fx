fx.animate.scrollup = (function(){

	let showSpeed = 0.5, // speed to show an element
		defaultTimeout = 10;
		
	
	return {
		show : function(component, callback){
			
			component.animating = true;
            component.css({"transition" : "none", transform : "translate(0px," + fx.graphics.screenSize().height + "px)", "visibility" : "visible", opacity : 1, display:"block"});
			
			setTimeout(function(){

                component.css({transition : "all " + showSpeed + "s "});
				
				setTimeout( function(){

                    // let's enable transition
				    component.css({"transform" : "translate(0px,0px)"});
                
                    setTimeout( function(){

                        component.animating = false;
                        component.updateDisplay(true);

                        if (callback)
                            callback();

                    }, showSpeed * 500);

                }, defaultTimeout);
            }, defaultTimeout);
		},
		hide : function(component, callback){
		
			
			component.animating = true;
			
            component.css( {transition : "all " + showSpeed + "s ", "transform" : "translate(0px," + fx.graphics.screenSize().height + "px)"});

            setTimeout(function(){

                component.css( {"transition" : "none", "visibility" : "hidden", display :"none", opacity : 0 });
                component.animating = false;
                
            }, showSpeed * 500);
			//}, defaultTimeout);
		}
	};

})();