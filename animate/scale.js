// TODO : rewrite "scale" animation in order to make it update only scale property on transform
fx.animate.scale = (function(){

	let easing = "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
		showSpeed = 0.25, // speed to show an element
		hideSpeed = 0.4,
		defaultTimeout = 40;
		
	
	return {
		show : function(component, callback){
			let childs = component.getChilds();

			component.animating = true;
			
			component.css({"transition": "none", opacity : 0, transform : "scale(0)", "transform-origin" : "center", "visibility" : "hidden"});
			
			setTimeout(function(){
				
				component.css({transition : "transform " + showSpeed + "s " + easing, opacity : 1, transform : "scale(1)", "visibility" : "visible"});
					
				setTimeout( function(){
					component.css( {"transition" : "none"});
					
					component.animating = false;
					component.updateDisplay(true);
			
					if (callback)
						callback();

				}, showSpeed * 1000);


			}, defaultTimeout);
		},
		hide : function(component, callback){
			
			component.animating = true;
			
			component.css( {transition : "all " + showSpeed + "s " + easing, opacity : 1, transform : "scale(1)", "transform-origin" : "center", "visibility" : "visible"});
			
			setTimeout(function(){
				
				component.css( {transform : "scale(0)", opacity : 0});

				setTimeout(function(){

						component.css( {"transition" : "none", "visibility" : "hidden"});
						
						component.animating = false;
						
						if (callback)
							callback();

					}, hideSpeed * 1000);

			}, defaultTimeout);
		}
	};

})();