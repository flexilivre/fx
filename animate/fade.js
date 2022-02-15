fx.animate.fade = (function(){

	let easing = "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
		showSpeed = 0.6, // speed to show an element
		hideSpeed = 0.25, // speed to show an element
		defaultTimeout = 10,
		dom = fx.get("dom");
		

	function getTransition(speed)
	{
		return "opacity " + " " + speed + "s " + easing;
	}

	return {
		show : function(component, callback){
			
			let childs = component.getChilds();

			// let's disable transition
			dom.css(component.node, {"transition": "none", opacity : 0, "visibility" : "visible"});
			
			component.animating = true;
			
			setTimeout(function(){
				// let's enable transition
				dom.css(component.node, {transition : getTransition(showSpeed), opacity : 1});
				
				/*for (let index = 0; index < childs.length; index++)
					if (childs[index].visibleAtStart)
						childs[index].show();*/
				
					
				setTimeout( function(){
					dom.css(component.node, {"transition" : "none"});
					
					component.animating = false;
					component.updateDisplay(true);
					
					if (callback)
						callback();

				}, showSpeed * 1000);


			}, defaultTimeout);
		},
		hide : function(component, callback){
			
			let childs = component.getChilds();

			// let's disable transition
			dom.css(component.node, {"transition": "none", opacity : 1, "visibility" : "visible"});
			
			setTimeout(function(){
				// let's enable transition
				dom.css(component.node, {transition : getTransition(hideSpeed)});

				setTimeout(function(){

					dom.css(component.node, { opacity : 0});
					
					setTimeout( function(){
						
						/*for (let index = 0; index < childs.length; index++)
							childs[index].hide();*/

						dom.css(component.node, {"transition" : "none", "visibility" : "hidden"});
						
						if (callback)
							callback();

					}, 1 * hideSpeed * 500);

				}, defaultTimeout);
			}, defaultTimeout);
		}
	};

})();