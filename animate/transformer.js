fx.animate.transformer = (function(){

	let easing = "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
		showSpeed = 0.5, // speed to show an element
		hideSpeed = 0.35,  // speed to hide an element
		showDelayFactor = 1,
		hideDelayFactor = 1,
		timers = [],
		defaultTimeout = 10,
		dom = fx.get("dom");

	function getOppositePosition(child)
	{
		let viewport = child.viewport();
		let position = {top:viewport.top, bottom:viewport.bottom, left:viewport.left, right:viewport.right};
		if (viewport.top)
		{
			if (viewport.height == "100%" && viewport.width.indexOf("%") == -1)
				position.left = -child.realWidth;
			else
				position.top = -child.realHeight;
		}
		else
		if (viewport.bottom)
			position.bottom = -child.realHeight;
		
		return position;
	}

	function addTransition(obj, speed, easing, delay)
	{
		delay = delay || 0;
		obj.transition  = "";
		let props = ["top","left", "bottom", "right", "opacity"];
		for (let i = 0; i < props.length; i++)
		{
			obj.transition += props[i] + " " + speed + "s " + (easing || "") + " " + (delay || 0) + "s";
			if ( (i+1) < props.length)
				obj.transition += ",";
		}
		return obj;
	}

	return {
		show : function(component, callback){
			
			let childs = component.getChilds();

			// let's disable transition
			let obj = {"transition": "none", opacity : 0, "visibility" : "visible"};
			dom.css(component.node, obj );
			for (let index = 0; index < childs.length; index++)
			{
				let props = Object.assign(getOppositePosition( childs[index]), obj);
				dom.css(childs[index].node, props);
			}

			setTimeout(function(){
				let delay = 0;
				dom.css(component.node, addTransition({opacity : 1}, showSpeed ,  easing) );
				for (let index = 0; index < childs.length; index++)
				{
					delay += showSpeed;
					let viewport = childs[index].viewport();
					let position = {top:viewport.top, bottom:viewport.bottom, left:viewport.left, right:viewport.right};
		
					let props = Object.assign(addTransition({opacity : 1}, showSpeed ,  easing, delay), position) ;
					dom.css(childs[index].node, props );
					if (childs[index].visibleAtStart)
						childs[index].show();
				}

				setTimeout( function(){
					dom.css(component.node, {"transition" : "none"});
					for (let index = 0; index < childs.length; index++)
						dom.css(childs[index].node, {"transition": "none"});

						component.animating = true;
						component.updateDisplay(true);
						
					if (callback)
						callback();
				}, 1.5 * delay * 1000 * showDelayFactor);

			}, defaultTimeout);
		
		},
		hide : function(component, callback){
			
			let childs = component.getChilds().slice().reverse();

			// let's disable transition
			let obj = {"transition": "none", opacity : 1, "visibility" : "visible"};
			dom.css(component.node, obj );
			for (let index = 0; index < childs.length; index++)
			{
				let viewport = childs[index].viewport();
				let position = {top:viewport.top, bottom:viewport.bottom, left:viewport.left, right:viewport.right};

				let props = Object.assign(position, obj);
				dom.css(childs[index].node, props);
			}

			setTimeout(function(){
				let delay = 0;
				for (let index = 0; index < childs.length; index++)
				{
					dom.css(childs[index].node, addTransition({}, hideSpeed ,  easing, delay) );
					if (childs[index].visibleAtStart)
						childs[index].show();
					delay += hideSpeed;
				}
				dom.css(component.node, addTransition({}, hideSpeed ,  easing, delay) );

				setTimeout(function(){
					let delay = 0;
					dom.css(component.node, {opacity : 0} );
					for (let index = 0; index < childs.length; index++)
					{
						delay += hideSpeed;
						let props = Object.assign({opacity : 0}, getOppositePosition( childs[index]));
						dom.css(childs[index].node, props );
						if (childs[index].visibleAtStart)
							childs[index].show();
					}

					setTimeout( function(){
						dom.css(component.node, {"transition" : "none", "visibility" : "hidden"});
						for (let index = 0; index < childs.length; index++)
							dom.css(childs[index].node, {"transition": "none", "visibility" : "hidden"});

						if (callback)
							callback();
					}, delay * 1000 * showDelayFactor);

				}, defaultTimeout);

			}, defaultTimeout);
		}
	};

})();