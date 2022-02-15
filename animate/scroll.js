fx.animate.scroll = (function(){

	let easing = "cubic-bezier(.24,.31,.58,.99)",
		showSpeed = 0.5, // speed to show an element
		hideSpeed = 0.4,  // speed to hide an element
		showDelayFactor = 1,
		hideDelayFactor = 1,
		timers = [],
		defaultTimeout = 10,
		dom = fx.get("dom");

	function getOppositePosition(child)
	{
		let viewport = child.viewport();
		let position = {top:viewport.top, bottom:viewport.bottom, left:viewport.left, right:viewport.right};
		if (viewport.top !== undefined)
		{
			if (typeof viewport.height == "string" && viewport.height == "100%" && (viewport.width + "").indexOf("%") == -1)
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
		let props = ["top","left", "bottom", "right"];
		for (let i = 0; i < props.length; i++)
		{
			obj.transition += props[i] + " " + speed + "s " + (easing || "") + " " + (delay || 0) + "s";
			if ( (i+1) < props.length)
				obj.transition += ",";
		}

		obj.transition += ", opacity " + (speed/2) + "s " + (easing || "") + " " + (speed/2) + "s"; 
		return obj;
	}


	return {
		show : function(component, callback){
			
			let childs = component.getChilds();

			component.animating = true;

			// let's disable transition
			let obj = {"transition": "none", opacity : 0, "visibility" : "visible"};
			dom.css(component.node, obj );

			setTimeout(function(){
			for (let index = 0; index < childs.length; index++)
			{
				if (!childs[index].visibleAtStart)
					continue;

				let props = Object.assign(getOppositePosition( childs[index]), obj);
				dom.css(childs[index].node, props);
			
			}

			setTimeout(function(){
				let delay = 0;
				dom.css(component.node, addTransition({opacity : 1}, showSpeed ,  easing) );
				for (let index = 0; index < childs.length; index++)
				{
					if (!childs[index].visibleAtStart)
						continue;

					//delay += showSpeed;
					let viewport = childs[index].realPosition;
					//let position = {top:viewport.top, bottom:viewport.bottom, left:viewport.left, right:viewport.right};
		
					let props = Object.assign(addTransition({opacity : 1}, showSpeed ,  easing, delay), viewport) ;
					dom.css(childs[index].node, props );
					if (childs[index].visibleAtStart /*&& childs[index].ready*/)
						childs[index].show();
                }
                delay += showSpeed;

				setTimeout( function(){
					dom.css(component.node, {"transition" : "none"});
					for (let index = 0; index < childs.length; index++)
					{
						if (!childs[index].visibleAtStart)
							continue;

						dom.css(childs[index].node, {"transition": "none"});
					}

					component.animating = false;
					component.updateDisplay(true);
			

					if (callback)
						callback();
				}, 1 * delay * 1000 * showDelayFactor);

			}, defaultTimeout);

		}, defaultTimeout);
		
		},
		hide : function(component, callback){
			
			let childs = component.getChilds().slice().reverse();

			// let's disable transition
			let obj = {"transition": "none", opacity : 1, "visibility" : "visible"};
			dom.css(component.node, obj );

			setTimeout(function(){
			for (let index = 0; index < childs.length; index++)
			{
				if (!childs[index].visibleAtStart)
						continue;

				let viewport = childs[index].viewport();
				let position = {top:viewport.top, bottom:viewport.bottom, left:viewport.left, right:viewport.right};

				let props = Object.assign(position, obj);
				dom.css(childs[index].node, props);
			}

			setTimeout(function(){
				let delay = 0;
				for (let index = 0; index < childs.length; index++)
				{
					if (!childs[index].visibleAtStart)
						continue;

					dom.css(childs[index].node, addTransition({}, hideSpeed ,  easing, delay) );
					//childs[index].show();
					//delay += hideSpeed;
				}
                dom.css(component.node, addTransition({}, hideSpeed ,  easing, delay) );
                
                //delay += hideSpeed;

				setTimeout(function(){
					let delay = hideSpeed;
					dom.css(component.node, {opacity : 0} );
					for (let index = 0; index < childs.length; index++)
					{
						if (!childs[index].visibleAtStart)
							continue;

						//delay += hideSpeed;
						let props = Object.assign({opacity : 0}, getOppositePosition( childs[index]));
						dom.css(childs[index].node, props );
						//childs[index].show();
					}

					setTimeout( function(){
						dom.css(component.node, {"transition" : "none", "visibility" : "hidden"});
						for (let index = 0; index < childs.length; index++)
						{
							if (!childs[index].visibleAtStart)
								continue;

							dom.css(childs[index].node, {"transition": "none", "visibility" : "hidden"});
						}
							

						if (callback)
							callback();
					}, delay * 1000 * showDelayFactor);

				}, defaultTimeout);

			}, defaultTimeout);

		}, defaultTimeout);
		}
	};

})();