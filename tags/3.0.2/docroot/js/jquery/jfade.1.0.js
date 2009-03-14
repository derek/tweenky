 /* Copyright (c) 2008 Kean Loong Tan http://www.gimiti.com/kltan
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * Copyright notice and license must remain intact for legal use
 * jFade
 * Version: 1.0 (Jun 30, 2008)
 * Requires: jQuery 1.2.6+
 *
 *
 * Original Code Copyright (c) 2008 by Michael Leigeber
 * Website: http://www.leigeber.com
 *
 *
 */

(function($) {

	$.fn.jFade = function(options) {
		// merge users option with default options
		var opts = $.extend({}, $.fn.jFade.defaults, options);
		var startrgb,endrgb,er,eg,eb,rint,gint,bint,step;
		var target = this;
		//var obj = this;
	
		var init = function() {
			var tgt = target;
			opts.steps = opts.steps || 20;
			opts.duration = opts.duration || 20;
			//clear everything + reset
			clearInterval(tgt.timer);
			endrgb = colorConv(opts.end);
			er = endrgb[0];
			eg = endrgb[1];
			eb = endrgb[2];
		
			if(!tgt.r) {
				//convert to usable rgb value
				startrgb = colorConv(opts.start);
				r = startrgb[0];
				g = startrgb[1];
				b = startrgb[2];
				tgt.r = r;
				tgt.g = g;
				tgt.b = b;
			}
			//process red
			rint = Math.round(Math.abs(tgt.r-er)/opts.steps);
			//process green
			gint = Math.round(Math.abs(tgt.g-eg)/opts.steps);
			//process blue
			bint = Math.round(Math.abs(tgt.b-eb)/opts.steps);
			if(rint == 0) { rint = 1 }
			if(gint == 0) { gint = 1 }
			if(bint == 0) { bint = 1 }
		
			tgt.step = 1;
			tgt.timer = setInterval( function() { animateColor(tgt,opts.property,opts.steps,er,eg,eb,rint,gint,bint) }, opts.duration);
		
			function animateColor(obj,property,steps,er,eg,eb,rint,gint,bint) {
				var tgt = obj;
				var color;
				if(tgt.step <= steps) { // for each loop
					var r = tgt.r;
					var g = tgt.g;
					var b = tgt.b;
					if(r >= er) {
						r = r - rint;
					}
					else {
					r = parseInt(r) + parseInt(rint);
					}
					if(g >= eg) {
						g = g - gint;
					}
					else {
						g = parseInt(g) + parseInt(gint);
					}
					if(b >= eb) {
					b = b - bint;
					}
					else {
						b = parseInt(b) + parseInt(bint);
					}
					color = 'rgb(' + r + ',' + g + ',' + b + ')';
					
					$(obj).css(property, color);
					
					tgt.r = r;
					tgt.g = g;
					tgt.b = b;
					tgt.step = tgt.step + 1;
				}
				else {// last loop
				
					clearInterval(tgt.timer);
					color = 'rgb(' + er + ',' + eg + ',' + eb + ')';
					$(obj).css(property, color);
				}
			}
			
			// convert the color to rgb from hex
			function colorConv(color) {
				//covert 0-2 position hex into decimal in rgb[0]
				//covert 2-4 position hex into decimal in rgb[1]
				//covert 4-6 position hex into decimal in rgb[2]
				var rgb = [parseInt(color.substring(0,2),16),
				parseInt(color.substring(2,4),16),
				parseInt(color.substring(4,6),16)];
				//return array containing rgb[0], rgb[1], rgb[2]
				return rgb;
			}
		};
		if (opts.trigger == "load")
			init();
		else
			$(this).bind(opts.trigger, function(){
				target = this;
				init();
			});
		
		return this;
	};

	$.fn.jFade.defaults = {
		trigger: "load",
		property: 'background',
		start: 'FFFFFF',
		end: '000000',
		steps: 5,
		duration: 30
	};
})(jQuery);