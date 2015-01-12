(function(){
		$.fn.stateline = function(opts){
			var settings = $.extend({
				nullColor: '#fc0',
				hoverColor: '#999'
			}, opts);

			// Extend template_helpers
			$.extend(settings.templateHelpers, {
					addCommas: function(n){
						n += '';
						x = n.split('.');
						x1 = x[0];
						x2 = x.length > 1 ? '.' + x[1] : '';
						var rgx = /(\d+)(\d{3})/;
						while (rgx.test(x1)) {
							x1 = x1.replace(rgx, '$1' + ',' + '$2');
						}
						return x1 + x2;
					},
					toCurrency: function(a, symbol){
						return _.isNumber(a) ? symbol+this.addCommas(a) : "";
					}
				});

			var $statelineContainer = this;

			// Map container
	    var $innerContainer = $('<div class="stateline-inner-container"></div>').appendTo($statelineContainer);
	    // Tooltip container
	    var $statelineTooltip = $('<div class="stateline-tooltip"></div>').appendTo($statelineContainer);
	    // Legend container
	    var $legendContainer = $('<div class="stateline-legend"></div>').appendTo($statelineContainer);
	    // Give the tooltip a custom width if set
	    var custom_tooltip_width = settings.tooltipWidth || '';
      $statelineTooltip.css('width', custom_tooltip_width);

	    // Initialize the map
	    var inner_container_el = $innerContainer[0];
	    var map = new Landline.Stateline(inner_container_el, 'states');

	    var tooltip_tmpl = _.template($(settings.tooltip).html());

	    map.on('mouseover', styleTooltip);
	    map.on('mousemove', showTooltip);
	    map.on('mouseout',  hideTooltip);

	    // Color states by income level
	    _.each(settings.data, function(stateData, fips) {
	      map.style(fips, "fill", colorStatesByCategories(stateData));
	    });

	    // Draw the map
	    map.createMap();

	    bakeLegend();
	    bakeSourceline();

	    function bakeLegend(){
	    	_.each(settings.legend, function(values, category){
	    		var $line = $('<div class="stateline-legendline"></div>');
	    		$('<div class="stateline-legendbox" style="background-color:'+values.color+';"></div>').appendTo($line);
	    		$('<div class="stateline-legendtext">'+values.description+'</div>').appendTo($line);

	    		$legendContainer.append($line);
	    	})
	    }

	    function bakeSourceline(){
	    	// Append the sourceline as a sibling of the map container
	    	$statelineContainer.parent().append('<div class="stateline-sourceline">Source: '+settings.source+'.</div>')
	    }

			function colorStatesByCategories(stateData) {
				var color = settings.legend[stateData.category].color;
				if (!color) { 
					color = settings.nullColor;
				}
				return color;
			}

	    function showTooltip(e, path, data){
	      var legend_data =  settings.data[data.fips];
	      // Add a shorthand for getting state name if we don't have it stored in our data but we want to use it
	      if (!legend_data.n) {
	      	legend_data.n = data.get('n');
	      }
	      // Add helper functions if they don't exist already
	      if (!legend_data.statelineHelpersAdded) {
	      	legend_data.statelineHelpersAdded = true;
	      	$.extend(legend_data, settings.templateHelpers);
	      }

	      // Calculate svg offset
	      var $cntnr = $(e.target).parents('.stateline-inner-container'),
	          svg_x = $cntnr.offset().left,
	          svg_y = $cntnr.offset().top;


	      // Subtract svg offset from main pageX offset
	      var buffer = 70,
	          left = (e.pageX - svg_x) + buffer, 
	          top = (e.pageY - svg_y),
	          tooltip_width = custom_tooltip_width || $statelineTooltip.width();

	      tooltip_width = parseInt(tooltip_width);
	      if ((left + tooltip_width + buffer*2) > $(window).width()) {
	        left = left - tooltip_width - buffer * 1.5;
	      } 

	      var legend_markup = tooltip_tmpl(legend_data);
	      $statelineTooltip.html(legend_markup)
	                            .css("left", left)
	                            .css("top", top)
	                            .show();
	    }

	    function hideTooltip(e, path, data){
	      $statelineTooltip.hide();
	      _.each(data.existingStyle, function(v, k) {
	        path.attr(k, v);
	      });
	    }

			function styleTooltip(e, path, data){
				data.existingStyle = (data.existingStyle || {});
				data.existingStyle["fill"]        = path.attr("fill");
				data.existingStyle["strokeWidth"] = path.attr("stroke-width");
				path.attr("fill", settings.hoverColor).attr("stroke-width", 1);
			}

		}


}).call(this);