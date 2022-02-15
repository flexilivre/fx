/** 
* Animations for fx
* @namespace fx.animate
* Every component animation is defined here
*/
fx.animate.fadeSequence = (function(){

	let showSpeed = 0.4,
		hideSpeed = 0.25,
		showDelayFactor = 500,
		hideDelayFactor = 500,
		dom = fx.get("dom");

	return {
		show : function(component, callback){
			
			let childs = component.getChilds();

			component.animating = true;

			// let's disable transition
			dom.css(component.node, {"transition": "none"});
			for (let index = 0; index < childs.length; index++)
				dom.css(childs[index].node, {"transition": "none"});

			// let's hide element without transition
			dom.css(component.node,  {opacity : 0});

			for (let index = 0; index < childs.length; index++)
				dom.css(childs[index].node, {opacity : 0});

			// let's enable transition
			dom.css(component.node, {"transition": "none"});
			for (let index = 0; index < childs.length; index++)
				dom.css(childs[index].node, {"transition": null});
			
			dom.css(component.node, {"transition":"all " + showSpeed + "s "});
			let delay = showSpeed;
			for (let index = 0; index < childs.length; index++)
			{
				delay += showSpeed;
				dom.css(childs[index].node, {"transition": "all " + showSpeed + "s " + delay + "s"});
			}

			setTimeout(function(){
				
				dom.css(component.node,  {opacity : 1});

				for (let index = 0; index < childs.length; index++)
					dom.css(childs[index].node, {opacity : 1});			
				
				component.animating = false;
				component.updateDisplay(true);

				if (callback)
					setTimeout(callback, delay * showDelayFactor);
					

			}, 100);
		},
		hide : function(component, callback){
			
			let childs = component.getChilds();

			// let's disable transition
			dom.css(component.node, {"transition" : "none"});
			for (let index = 0; index < childs.length; index++)
				dom.css(childs[index].node, {"transition": "none"});
			
			// let's hide element without transition
			dom.css(component.node,  {opacity : 1});
			for (let index = 0; index < childs.length; index++)
				dom.css(childs[index].node,  {opacity : 1});

			// let's enable transition
			dom.css(component.node, {"transition": "none"});
			for (let index = 0; index < childs.length; index++)
				dom.css(childs[index].node, {"transition": "none"});
			
			// let's enable transition
			let delay = 0;
			for (let index = 0; index < childs.length; index++)
			{
				dom.css(childs[index].node, {"transition": "all " + hideSpeed +"s " + (delay ? (delay + "s") : "")});
				delay += hideSpeed;
			}

			dom.css(component.node, {"transition": "all " + hideSpeed + "s "  + (delay ? (delay + "s") : "")});

			delay += hideSpeed;

			setTimeout(function(){

				for (let index = 0; index < childs.length; index++)
					dom.css(childs[index].node, {opacity : 0});		
				
				dom.css(component.node,  {opacity : 0});	

				if (callback)
					setTimeout(callback, delay * hideDelayFactor)

			}, 100);
		}
	};

})();