/// 'View' manages current visible element types and is responsible for showing/hiding  new & old elements
var View = {
	init: function initialiseViews() {
		console.log('%c[View] %cInit', 'color: #777', 'color: #000');
		
		/// Fast click and handling of anchor tags (by immediately calling History .pushState/.replaceState)
		/*$(document).on('mouseup touchend', '[href]', function(event) {
			if(event.isDefaultPrevented()) return;
			event.preventDefault();
			
			var href = this.href? this.href : this.getAttribute('href');
			if(href == '/back') return History.back();
			
			// TODO: Figure out a better way to handle popups in regards to view state & close button instead of route groupings hack
			History.pushState(null, null, href);
			
			$(this).addClass('current');
		});
		
		/// Prevent screen bounce
		$(document).on('touchstart touchmove', function(event) {
			event.preventDefault();
		});
		
		/// Close buttons on popups
		$('main.popup').on('mouseup touchend', 'button.close', function(event) {
			// Update history by going back to last screen-state based URL somehow
			// View.Popup(null);
			// History.back();
		});*/
		
		Router.on('handled', function(ctx) {
			console.log('%c[Router] %c' + ctx.request.path, 'color: #777', 'color: #000');
// 			$('a[href].current').removeClass('current');
// 			$('a[href]').each(function(index, $anchor) {
// 				var href = $anchor.getAttribute('href');
// 				if(ctx.request.path.indexOf(href) == 0) $anchor.classList.add('current');
// 			});
		});
		
		View.on('screen', function(ev) { console.log('%c[View.Screen] ' + '%c'+ev.older + ' %c» ' + '%c'+ev.newer, 'color: #777', 'color: #000', 'color: #aaa', 'color: #000'); });
		View.on('popup', function(ev) { console.log('%c[View.Popup] ' + '%c'+ev.older + ' %c» ' + '%c'+ev.newer, 'color: #777', 'color: #000', 'color: #aaa', 'color: #000'); });
		View.on('tabs', function(ev) { console.log('%c[View.Tabs] ' + '%c['+ev.container + '] ' + '%c'+ev.older + ' %c» ' + '%c'+ev.newer, 'color: #777', 'color: #777', 'color: #000', 'color: #aaa', 'color: #000'); });
	},
	
	Screen: function(newer) {
		if(newer === this._screen) return;
		var older = this._screen;
		this._screen = newer;
		
		if(newer)
		{
			var screen = document.querySelector('article.view.' + newer.replace(/ /g, '.'));
			screen.classList.remove('no-layout');
			document.body.classList.add('screen-' + newer.replace(/(\.| )/g, '-'));
		}
		
		if(older)
		{
			var screen = document.querySelector('article.view.' + older.replace(/ /g, '.'));
			screen.classList.add('no-layout');
			document.body.classList.remove('screen-' + older.replace(/(\.| )/g, '-'));
		}
		
		View.trigger('screen', { newer: newer, older: older });
	},
	
	Popup: function(newer) {
		if(newer === this._popup) return;
		var older = this._popup;
		this._popup = newer;
		
		if(newer)
		{
			this.Mask(true);
			$('main.popup.' + newer.replace(/ /g, '.'))
				.css('z-index', 100 * ((this._mask||0)+2))
				.css('visibility', '');
			$(document.body).addClass('popup-' + newer.replace(/(\.| )/g, '-'));
		}
		
		if(older)
		{
			this.Mask(false);
			$('main.popup.' + older.replace(/ /g, '.')).css('visibility', 'hidden');
			$(document.body).removeClass('popup-' + older.replace(/(\.| )/g, '-'));
		}

		View.trigger('popup', { newer: newer, older: older });
	},
	
	Mask: function(enable) {
		this._mask = (this._mask || 0) + (enable? 1 : -1);
		
		var $mask = $('div.mask');
		$mask.css('z-index', 100 * (this._mask+1));
		
		if(this._mask) $mask.addClass('visible');
		else $mask.removeClass('visible');

		View.trigger('mask', { enable: enable, level: this._mask });
	},
	
	Tabs: function(container, tab) {
		if(!this._tabs) this._tabs = {};
		var older = this._tabs[container] || null;
		var newer = tab;
		this._tabs[container] = tab;
		
		var $container = $(container);
		$container.children('.tab').css('visibility', 'hidden').filter('.'+tab).css('visibility', '');
		View.trigger('tabs', { container: container, newer: newer, older: older });
	},
	
	
	trigger: function(event, object) {
		if(event in this.events)
		{
			var subscribers = this.events[event];
			for(var iter = 0, total = subscribers.length; iter < total; ++iter)
			{
				var subscriber = subscribers[iter];
				subscriber.call(this, object);
			}
		}
	},
	
	on: function(event, callback) {
		if(!(event in this.events)) this.events[event] = [];
		this.events[event].push(callback);
	},
	
	events: {}
};



