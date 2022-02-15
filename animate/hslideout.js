fx.animate.hslideout = (function(){

	let showSpeed = 0.5, // speed to show an element
        hideSpeed = 0.25, // speed to show an element
		defaultTimeout = 10,
        offset = 400,
		timers = [];

	function cleanTimers()
	{
		let timer;
		while(timer = timers.pop())
			clearTimeout(timer);
	}
		
	
	return {
		show : function(component, callback)
		{	
			cleanTimers()

			offset = component.realWidth * 0.25;

			component.animating = true;
			let zindex = component.css( "z-index");
			component.css({transition : "none", transform : "translateX(" + offset + "px)", opacity : 0, "visibility" : "visible", "z-index" : 1});
			
			timers.push(setTimeout(function(){

				component.css({transition : "all " + showSpeed + "s cubic-bezier(0.5, 1, 0.89, 1)", opacity : 1, transform : "translateX(0px)"});
				
				timers.push(setTimeout( function(){

					component.css( {"transition" : "none", "z-index" : zindex});
					
					component.animating = false;
					component.updateDisplay(true);

					if (callback)
						callback();

				}, showSpeed * 1000));


			}, defaultTimeout));
		
		},
		hide : function(component, callback)
		{
			cleanTimers()

			offset = component.realWidth * 0.15;

			component.animating = true;
            component.css({transition : "none", transform : "translateX(0px)", opacity : 1, "visibility" : "visible"});
			

			timers.push(setTimeout(function(){

					component.css({transition : "all " + hideSpeed + "s cubic-bezier(0.11, 0, 0.5, 0)", opacity : 0, transform : "translateX(" + offset + "px)"});
					
					timers.push(setTimeout( function(){
						
						component.css( {"transition" : "none", "visibility" : "hidden"});
						component.animating = false;
						
						if (callback)
							callback();

					}, hideSpeed * 1000));

				}, defaultTimeout));
		}
	};

})();