/*
	Router that works with History.js
	---------------------------------
	Usage:
	Router.pages({
		'/': function() {},
		'/example/': function() {},
		'/test/:user': function(user) {}
	});
	
	Route.page('/extra', function() {});
	
	Features
	--------
	• Routes
	
	• Parameters
		e.g.  '/test/:thing/detail' where :thing is a named parameter
	
	• Default Route
		'*' is a route that helps catch anything, should be specified last
	
	• Events
		e.g. 'handled', triggered at end of a successful route match
*/

var Router = {
	init: function() {
		History.Adapter.bind(window, 'statechange', function() {
			var state = History.getState();
			Router.handle(state.url);
		});
		
		window.addEventListener('click', this.onclick, false);
		var startPath = location.pathname + location.search + location.hash;
		Router.handle(startPath);
	},
	
	// Manage routes
	routes: {},
	pages: function(routes) {
		for (var url in routes) {
			var route = (this.routes[url]? this.routes[url] : this.routes[url] = new Route(url));
			route.bind(routes[url]);
		}
	},
	
	// Add a route
	page: function(url, callbacks) {
		callbacks = Array.prototype.slice.call(arguments, 1);
		var route = (this.routes[url]? this.routes[url] : this.routes[url] = new Route(url));
		route.bind(callbacks);
	},
	
	// get the relative path from a full url
	getPath: function(url) {
		if(!this.a) this.a = document.createElement('a');
		this.a.href = url;
		return this.a.pathname + this.a.search + (this.a.hash || '');
	},
	
	// Handle routing
	previous: null,
	current: null,
	handle: function debounce(fn) {
		var timeout;
		return function(url) {
			clearTimeout(timeout);
			timeout = setTimeout(function() { fn.call(Router, url); }, 10);
		};
	}(function(url) {
		var path = this.getPath(url);
		for (var i in this.routes) {
			var route = this.routes[i];
			var result = route.handle(path);
			if(result === false) continue;
			else
			{
				this.previous = this.current;
				this.current = route;
				this.trigger('handled', result);
				return;
			}
		}
	}),
	
	onclick: function(ev) {
		// Ensure is a default, normal click
		if((ev.which == null? ev.button : ev.which) != 1) return;
		if(ev.shiftKey || ev.ctrlKey || ev.metaKey) return;
		if(ev.defaultPrevented) return;
		
		// Ensure is a anchor (check ancestors otherwise), or anchor-like (button with href)
		var node = ev.target;
		while(node && node.nodeName != 'A') node = node.parentNode;
		if(!node || node.nodeName != 'A') return;
		
		// Check that target has not been set
		if(node.target) return;
		
		// Check origin
		var origin = location.protocol + '//' + location.hostname + (location.port? ':' + location.port : '');
		var href = node.href;
		if(href.indexOf(origin) !== 0) return;
		
		ev.preventDefault();
		
		var path = node.pathname + node.search + (node.hash || '');
		History.pushState(null, null, path);
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
		if(event in this.events)
		{
			this.events[event].push(callback);
		}
	},
	
	events: {
		handled: []
	}
}



function Route(url) {
	this.expressions = [];
	this.callbacks = [];
	this.url = url;
	this.regexify(url);
}

Route.prototype = {
	handle: function(path) {
		var result = this.match(path);
		if(result === false) return false;
		
		var ctx = {
			request: {
				path: path,
				params: result
			},
			route: this.url,
			older: Router.current? Router.current.url : null
		};
		
		var args = [];
		if(Array.isArray(result)) args = result;
		else for(var n in result) args.push(result[n]);
		
		for(var step = 0, steps = this.callbacks.length; step < steps; ++step)
		{
			var callback = this.callbacks[step];
			if(typeof callback == 'object') callback = callback.route || callback.index;
			if(typeof callback == 'function') callback.apply(ctx, args); else
			if(typeof callback == 'string')
			{
				var transformed = callback;
				for(var iter = 0, keys = Object.keys(ctx.request.params), total = keys.length; iter < total; ++iter)
				{
					var key = keys[iter];
					var val = ctx.request.params[key];
					transformed = transformed.replace(new RegExp(':' + key, 'g'), val);
				}
				
				History.replaceState(null, null, transformed);
			}
		}
		
		return ctx;
	},
	
	match: function(path) {
		for(var iter = 0, total = this.expressions.length; iter < total; ++iter)
		{
			var expression = this.expressions[iter];
			var result = expression.match(path);
			
			if(result === false) continue;
			
			return result;
		}

		return false;
	},

	regexify: function(path) {
		if(Array.isArray(path))
		{
			var iter = path.length;
			while(iter-->0) this.regexify(path[iter]);
			return;
		}
		
		if(path instanceof RouteExpression) this.expressions.push(path);
		else if(path instanceof RegExp) this.expressions.push(new RouteExpression(path));
		else if(typeof path == 'string') this.expressions.push(new RouteExpression().fromString(path));
		else if(typeof path == 'object' && path.regex && path.keys) this.expressions.push(new RouteExpression(path.regex, path.keys));
	},
	
	bind: function(callback) {
		if(Array.isArray(callback))
		{
			var iter = callback.length;
			while(iter-->0) this.bind(callback[iter]);
			return;
		}
		else this.callbacks.push(callback);
	},
	
	unbind: function(callback) {
		if(Array.isArray(callback))
		{
			var iter = callback.length;
			while(iter-->0) this.unbind(callback[iter]);
			return;
		}
		
		if(typeof callback == 'function' || typeof callback == 'string')
		{
			var index = this.callbacks.indexOf(callback);
			if(index != -1) this.callbacks.splice(index, 1);
		}
	}
};




function RouteExpression(regex, keys) {
	this.regex = regex || null;
	this.keys = keys || null;
}

RouteExpression.prototype = {
	match: function(path) {
		var params = this.keys?  {}:  [];
		var result = RouteMatch.call(this, path, params);
		return result === true? params : false;
	},
	
	fromString: function(path) {
		if(path == 'default' || path == '*')
		{
			this.regex = /^.*/;
			this.keys = [];
			return this;
		}
		
		this.regex = pathtoRegexp(path, this.keys = []);
		return this;
// 		var matches = this.url.match(/\:([a-zA-Z0-9_]+)/g);
// 		if (matches !== null) {
// 			for (var i in matches) {
// 				matches[i] = matches[i].substring(1);
// 			}
// 			this.keys = matches;
// 			this.regex = this.url.replace(/\:([a-zA-Z0-9_]+)/g, '(.*?)');
// 		}
// 		else
// 		{
// 			this.regex = this.url;
// 		}
		
// 		this.regex = new RegExp('^' + this.regex.replace('/', '\\/') + '/?$', 'g');
	}
};




/*** Start of code borrowed from page.js ***/
/* Copyright (c) 2012 TJ Holowaychuk <tj@vision-media.ca> */

function RouteMatch(path, params) {
	var keys = this.keys;
	var qsIndex = path.indexOf('?');
	var pathname = ~qsIndex ? path.slice(0, qsIndex) : path;
	var m = this.regex.exec(decodeURIComponent(pathname));
	if(!m) return false;
	
	for(var i = 1, len = m.length; i < len; ++i)
	{
		var key = keys[i - 1];
		
		var val = 'string' == typeof m[i]
			? decodeURIComponent(m[i])
			: m[i];
		
		if(key)
		{
			params[key] = params[key] !== undefined?  params[key]:  val;
		}
		else
		{
			params.push(val);
		}
	}
	
	return true;
}

var PATH_REGEXP = new RegExp([
  // Match already escaped characters that would otherwise incorrectly appear
  // in future matches. This allows the user to escape special characters that
  // shouldn't be transformed.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
  // "/route(\\d+)" => [undefined, undefined, undefined, "\d+", undefined]
  '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
  // Match regexp special characters that should always be escaped.
  '([.+*?=^!:${}()[\\]|\\/])'
].join('|'), 'g');

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1');
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array should be passed in, which will contain the placeholder key
 * names. For example `/user/:id` will then contain `["id"]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 keys
 * @param  {Object}                options
 * @return {RegExp}
 */
function pathtoRegexp (path, keys, options) {
  keys = keys || [];
  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var flags = options.sensitive ? '' : 'i';
  var index = 0;

  if (path instanceof RegExp) {
    // Match all capturing groups of a regexp.
    var groups = path.source.match(/\((?!\?)/g) || [];

    // Map all the matches to their numeric keys and push into the keys.
    keys.push.apply(keys, groups.map(function (match, index) { return index; }));
//       return {
//         name:      index,
//         delimiter: null,
//         optional:  false,
//         repeat:    false
//       };

    // Return the source back to the user.
    return path;
  }

  if (Array.isArray(path)) {
    // Map array parts into regexps and return their source. We also pass
    // the same keys and options instance into every generation to get
    // consistent matching groups before we join the sources together.
    path = path.map(function (value) {
      return pathtoRegexp(value, keys, options).source;
    });

    // Generate a new regexp instance by joining all the parts together.
    return new RegExp('(?:' + path.join('|') + ')', flags);
  }

  // Alter the path string into a usable regexp.
  path = path.replace(PATH_REGEXP, function (match, escaped, prefix, key, capture, group, suffix, escape) {
    // Avoiding re-escaping escaped characters.
    if (escaped) {
      return escaped;
    }

    // Escape regexp special characters.
    if (escape) {
      return '\\' + escape;
    }

    var repeat   = suffix === '+' || suffix === '*';
    var optional = suffix === '?' || suffix === '*';

    keys.push(key || index++);
//       name:      key || index++,
//       delimiter: prefix || '/',
//       optional:  optional,
//       repeat:    repeat
//     });

    // Escape the prefix character.
    prefix = prefix ? '\\' + prefix : '';

    // Match using the custom capturing group, or fallback to capturing
    // everything up to the next slash (or next period if the param was
    // prefixed with a period).
    capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');

    // Allow parameters to be repeated more than once.
    if (repeat) {
      capture = capture + '(?:' + prefix + capture + ')*';
    }

    // Allow a parameter to be optional.
    if (optional) {
      return '(?:' + prefix + '(' + capture + '))?';
    }

    // Basic parameter support.
    return prefix + '(' + capture + ')';
  });

  // Check whether the path ends in a slash as it alters some match behaviour.
  var endsWithSlash = path[path.length - 1] === '/';

  // In non-strict mode we allow an optional trailing slash in the match. If
  // the path to match already ended with a slash, we need to remove it for
  // consistency. The slash is only valid at the very end of a path match, not
  // anywhere in the middle. This is important for non-ending mode, otherwise
  // "/test/" will match "/test//route".
  if (!strict) {
    path = (endsWithSlash ? path.slice(0, -2) : path) + '(?:\\/(?=$))?';
  }

  // In non-ending mode, we need prompt the capturing groups to match as much
  // as possible by using a positive lookahead for the end or next path segment.
  if (!end) {
    path += strict && endsWithSlash ? '' : '(?=\\/|$)';
  }

  return new RegExp('^' + path + (end ? '$' : ''), flags);
};

/*** End of code borrowed from page.js ***/
