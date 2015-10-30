new FontFaceObserver('Lato', {}).check().then(function() {
	document.documentElement.classList.add('font-lato');
});

new FontFaceObserver('Inconsolata', {}).check().then(function() {
	document.documentElement.classList.add('font-inconsolata');
});



/// Fetch & Parse Docs
NProgress.start();

fetch('/documentation.json')
.then(function(response) { return response.json() })
.then(function(docs) { window.WAAPI = docs })
.then(function() {
	/// Kick off application and routing
	App.init();
	Router.init();
	NProgress.done();
}, function(err) {
	console.error(err);
});



var App = {
	init: function() {
		console.log('%c[App] %cInit', 'color: #777', 'color: #000');
	},
	
	Intro: {
		route: function() {
			console.log('%c[App.Intro] %cInit', 'color: #777', 'color: #000');
			var view = document.querySelector('main.content');
			
			fetch('/docs/Default.html')
			.then(function(response) { return response.text() })
			.then(function(article) {
				view.innerHTML = article;
			});
		}
	},
	
	Interface: {
		route: function(name) {
			console.log('%c[App.Interface] %c' + name, 'color: #777', 'color: #000');
			var view = document.querySelector('main.content');
			
			if(!(name in WAAPI.interfaces))
			{
				view.innerHTML = '<h1 class="herald">Not Found</h1><br><p><a href="/" class="inline">Back to homepage?</a></p>';
				return;
			}
			
			var interface = WAAPI.interfaces[name];
			
			/// Already served by server?
			var header = view.querySelector('h1.herald');
			if(header && header.innerText === name)
			{
				var codeblocks = view.querySelectorAll('code.block');
				Array.prototype.forEach.call(codeblocks, CodeHighlight);
				
				return; /// Already served by server
			}
			
			NProgress.start();
			
			/// Fetch the article content
			fetch(interface)
			.then(function(response) {
				NProgress.done();

				if(response.status === 404)
				{
					view.innerHTML = '<h1 class="herald">Not Found</h1><br><p><a href="/" class="inline">Back to homepage?</a></p>';
				}

				else return response.text();
			})
			.then(function(article) {
				if(!article) return;
				
				view.innerHTML = article;
				
				var codeblocks = view.querySelectorAll('code.block');
				Array.prototype.forEach.call(codeblocks, CodeHighlight);
			});
		}
	}
};



/// Routing
Router.pages({
	'/': App.Intro,
	'/interface/:name': App.Interface,
	
	// Default route to send user to intro screen on 404
	'*': '/'
});




/// Syntax Highlighting
function CodeHighlight(block) {
	// Need to preserve the original HTML-ified sourcecode,
	// which may contain highlighting (<high-light>) and typographic syntax (<b>/<i>)
	// We replace all the text nodes with syntax highlighted code
	var pseudo = {
		nodes: [],
		
		walk: function (node) {
			var index = 0;
			if(node.nodeType === document.TEXT_NODE)
			{
				var length = node.nodeValue.length;
				var start = pseudo.length;
				var end = start + length;
				pseudo.length += length;
				pseudo.nodes.push({ start: start, end: end, dom: node, diff: [] });
			}
			else if(node.nodeType === document.ELEMENT_NODE) Array.prototype.forEach.call(node.childNodes, pseudo.walk);
		},
		
		replace: function(target, by) {
			if(!by.length) return target.parentNode.removeChild(target);
			var parent = target.parentNode;
			var newer = by.shift();
			parent.replaceChild(newer, target);
			var current = newer;
			var iter = by.length;
			while(iter-->0)
			{
				newer = by.shift();
				parent.insertBefore(newer, current.nextSibling);
				current = newer;
			}
		},
		
		length: 0,
		get text () { return pseudo.nodes.map(function(node) { return node.dom.nodeValue }).join('') },
		
		
		tokenize: function(start, end, token) {
			var nodes = this.nodes.filter(function(node) { return start < node.end && end > node.start });
			
			nodes.forEach(function(node, index) {
				var piece = node.dom.nodeValue.slice(Math.max(start, node.start) - node.start, Math.min(end, node.end) - node.start);
				var nodus;
				if(typeof token === 'string')
				{
					nodus = document.createElement('span');
					nodus.className = token;
					nodus.textContent = piece;
					node.diff.push(nodus);
				}
				
				else if(typeof token === 'function')
				{
					token(piece, node);
				}
				
				else
				{
					nodus = document.createTextNode(piece);
					node.diff.push(nodus);
				}
			});
		},
		
		render: function() {
			for(var iter = 0, total = this.nodes.length; iter < total; ++iter)
			{
				var node = this.nodes[iter];
				this.replace(node.dom, node.diff);
			}
		}
	};
	
	if(block.firstChild.nodeType === document.TEXT_NODE) block.firstChild.nodeValue = block.firstChild.nodeValue.trimLeft();
	if(block.lastChild.nodeType === document.TEXT_NODE) block.lastChild.nodeValue = block.lastChild.nodeValue.trimRight();
	
	pseudo.walk(block);
	
	function onWhitespace(start, end) {
		pseudo.tokenize(start, end, function(piece, node) {
			var threads = piece.split(/(\t)/);
			for(var iter = 0, total = threads.length; iter < total; ++iter)
			{
				var thread = threads[iter];
				
				if(iter&1)
				{
					var tab = document.createElement('span');
					tab.className = 'tab';
					tab.innerHTML = '&#9;';// = '\t';
					node.diff.push(tab);
				}
				
				else node.diff.push(document.createTextNode(thread));
			}
		});
	}
	
	var last = 0;
	var ast = acorn.parse(pseudo.text, {
		ecmaVersion: 6,
		onToken: function(token) {
			if(last !== token.start) onWhitespace(last, token.start);
			last = token.end;
			
			if(token.type.label === 'eof') return;
			
			if(token.type === acorn.tokTypes.num)
				pseudo.tokenize(token.start, token.end, 'numeric');
			
			else if(token.type === acorn.tokTypes.string)
				pseudo.tokenize(token.start, token.end, 'string');
			
			else if(token.type === acorn.tokTypes.template)
				pseudo.tokenize(token.start, token.end, 'template');
			
			else if(token.type === acorn.tokTypes.name)
			{
				if(token.value in window && isNative(window[token.value]) )
					pseudo.tokenize(token.start, token.end, 'native');
				else
					pseudo.tokenize(token.start, token.end, 'name');
			}

			else if(token.type === acorn.tokTypes._break ||
					token.type === acorn.tokTypes._case ||
					token.type === acorn.tokTypes._catch ||
					token.type === acorn.tokTypes._class ||
					token.type === acorn.tokTypes._const ||
					token.type === acorn.tokTypes._continue ||
					token.type === acorn.tokTypes._debugger ||
					token.type === acorn.tokTypes._default ||
					token.type === acorn.tokTypes._delete ||
					token.type === acorn.tokTypes._do ||
					token.type === acorn.tokTypes._else ||
					token.type === acorn.tokTypes._export ||
					token.type === acorn.tokTypes._extends ||
					token.type === acorn.tokTypes._false ||
					token.type === acorn.tokTypes._finally ||
					token.type === acorn.tokTypes._for ||
					token.type === acorn.tokTypes._function ||
					token.type === acorn.tokTypes._if ||
					token.type === acorn.tokTypes._import ||
					token.type === acorn.tokTypes._in ||
					token.type === acorn.tokTypes._instanceof ||
					token.type === acorn.tokTypes._let ||
					token.type === acorn.tokTypes._new ||
					token.type === acorn.tokTypes._null ||
					token.type === acorn.tokTypes._return ||
					token.type === acorn.tokTypes._super ||
					token.type === acorn.tokTypes._switch ||
					token.type === acorn.tokTypes._this ||
					token.type === acorn.tokTypes._throw ||
					token.type === acorn.tokTypes._true ||
					token.type === acorn.tokTypes._try ||
					token.type === acorn.tokTypes._typeof ||
					token.type === acorn.tokTypes._var ||
					token.type === acorn.tokTypes._void ||
					token.type === acorn.tokTypes._while ||
					token.type === acorn.tokTypes._with ||
					token.type === acorn.tokTypes._yield)
				pseudo.tokenize(token.start, token.end, 'keyword');
			
			else if(token.type === acorn.tokTypes.arrow ||
					token.type === acorn.tokTypes.assign ||
					token.type === acorn.tokTypes.backQuote ||
					token.type === acorn.tokTypes.braceL ||
					token.type === acorn.tokTypes.braceR ||
					token.type === acorn.tokTypes.bracketL ||
					token.type === acorn.tokTypes.bracketR ||
					token.type === acorn.tokTypes.colon ||
					token.type === acorn.tokTypes.comma ||
					token.type === acorn.tokTypes.dollarBraceL ||
					token.type === acorn.tokTypes.dot ||
					token.type === acorn.tokTypes.ellipsis ||
					token.type === acorn.tokTypes.parenL ||
					token.type === acorn.tokTypes.parenR ||
					token.type === acorn.tokTypes.prefix ||
					token.type === acorn.tokTypes.question ||
					token.type === acorn.tokTypes.regexep ||
					token.type === acorn.tokTypes.relational ||
					token.type === acorn.tokTypes.semi ||
					token.type === acorn.tokTypes.slash ||
					token.type === acorn.tokTypes.star)
				pseudo.tokenize(token.start, token.end, 'syntax');
			
			else if(token.type === acorn.tokTypes.eq ||
					token.type === acorn.tokTypes.equality ||
					token.type === acorn.tokTypes.incDec ||
					token.type === acorn.tokTypes.logicalAND ||
					token.type === acorn.tokTypes.logicalOR ||
					token.type === acorn.tokTypes.modulo ||
					token.type === acorn.tokTypes.plusMin ||
					token.type === acorn.tokTypes.bitShift ||
					token.type === acorn.tokTypes.bitwiseAND ||
					token.type === acorn.tokTypes.bitwiseOR ||
					token.type === acorn.tokTypes.bitwiseXOR)
				pseudo.tokenize(token.start, token.end, 'operator');
			
			else
			{
				pseudo.tokenize(token.start, token.end);
			}
		},
		
		onComment: function(isBlock, text, start, end) {
			if(last !== start) onWhitespace(last, start);
			last = end;
			
			pseudo.tokenize(start, end, 'comment');
		}
	});
	
	pseudo.render();
}





/// 'View' manages current visible element types and is responsible for showing/hiding  new & old elements
var View = {
	init: function initialiseViews() {
		console.log('%c[View] %cInit', 'color: #777', 'color: #000');
		
		/// Fast click and handling of anchor tags (by immediately calling History .pushState/.replaceState)
		document.addEventListener('mouseup', onLink);
		document.addEventListener('touchend', onLink);
		
		function onLink(event) {
			if(!(event.target.matches('a[href]') && event.target.host === location.host && !event.defaultPrevented))
			{
				if(event.type === 'touchend')
				{
					event.preventDefault();
					event.target.click();
				}
				return;
			}

			if(event.target !== document.elementFromPoint(event.clientX, event.clientY)) return;
			
			event.preventDefault();
			
			event.target.classList.add('tapped');
			History.pushState(null, null, event.target.getAttribute('href'));
			event.target.classList.remove('tapped');
		}
		
		Router.on('handled', function(ctx) {
			console.log('%c[Router] %c' + ctx.request.path, 'color: #777', 'color: #000');
			var anchor = document.querySelectorAll('[href].current');
			if(anchor) Array.prototype.forEach.call(anchor, function(node) { node.classList.remove('current') });
			anchor = document.querySelectorAll('[href]');
			if(anchor) Array.prototype.forEach.call(anchor, function(node) {
				var href = node.getAttribute('href');
				if(ctx.request.path.indexOf(href) === 0)
				{
					var a = href.split('/');
					var b = ctx.request.path.split('/');
					var iter = a.length;
					while(iter-->0) if(a[iter] !== b[iter]) return false;
					node.classList.add('current');
				}
			});
		});
		
// 		View.on('screen', function(ev) { console.log('%c[View.Screen] ' + '%c'+ev.older + ' %c» ' + '%c'+ev.newer, 'color: #777', 'color: #000', 'color: #aaa', 'color: #000'); });
	},
	
	/*
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
	*/
	
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

document.addEventListener('DOMContentLoaded', View.init);





var Highlighter = {
	init: function() {
		document.addEventListener('mouseover', Highlighter);
	},
	
	handleEvent: function(event) { this[event.type](event); },
	mouseover: function(event) {
		var highlight = event.target.closest('high-light');
		if(!highlight) return;
		var group = highlight.getAttribute('group');
		if(!group) return;
		
		var elements = document.querySelectorAll('high-light[group="' + group + '"]');
		var iter = elements.length;
		while(iter-->0) elements[iter].classList.add('on');
		
		highlight.addEventListener('mouseleave', this);
	},
	
	mouseleave: function(event) {
		var highlight = event.target.closest('high-light');
		var group = highlight.getAttribute('group');
		if(!group) return;
		var elements = document.querySelectorAll('high-light[group="' + group + '"]');
		var iter = elements.length;
		while(iter-->0) elements[iter].classList.remove('on');
		
		highlight.removeEventListener('mouseleave', this);
	}
}

document.addEventListener('DOMContentLoaded', Highlighter.init);
