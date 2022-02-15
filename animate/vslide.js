fx.animate.vslide = (function(){

	let easing = "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
		showSpeed = 0.25, // speed to show an element
		defaultTimeout = 10;
		
	
	return {
		show : function(component, callback){
			
			component.animating = true;
			component.css({transform : "scaleY(0)"});
			
			setTimeout(function(){

				component.css({transition : "transform " + showSpeed + "s ","visibility" : "visible", opacity : 1});
				
				setTimeout(function(){
				// let's enable transition
				component.css({transform : "scaleY(1)"});
				
			
				setTimeout( function(){
					component.css( {"transition" : "none"});
					
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
			
			//component.css( {"transition": "none", opacity : 1, height : component.realHeight, "visibility" : "visible"});
			
			//setTimeout(function(){
				// let's enable transition
				component.css( {transition : "transform " + showSpeed + "s "});

				setTimeout(function(){

					component.css( { transform : "scaleY(0)"});
					
					setTimeout( function(){
						
						component.css( {"transition" : "none", "visibility" : "hidden", opacity : 0});
						component.animating = false;
						
						if (callback)
							callback();

					}, showSpeed * 500);

				}, defaultTimeout);
			//}, defaultTimeout);
		}
	};

})();