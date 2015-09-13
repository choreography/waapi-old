Promise.all([
	fetch('/web-animations.idl')
	.then(function(response) { return response.text() })
	.then(function(text) { return WebIDL2.parse(text) })
	.then(function(idl) {
		window.IDL = {
			ast: idl,
			interfaces: {}
		};
		
		var iter = idl.length;
		while(iter-->0) {
			var node = idl[iter];
			if(node.type && node.type === 'interface')
			{
				var interface = IDL.interfaces[node.name] = {};
				
				node.extAttrs.forEach(function(extAttr) {
					if(extAttr.name === 'Constructor')
					{
						interface.constructor = {};
						extAttr.arguments.forEach(function(arg) {
							interface.constructor[arg.name] = arg;
						});
					}
				});
				
				node.members.forEach(function(member) {
					if(member.type === 'attribute')
					{
						if(!interface.attributes) interface.attributes = {};
						interface.attributes[member.name] = member;
					}
					
					else if(member.type === 'operation')
					{
						if(!interface.methods) interface.methods = {};
						interface.methods[member.name] = member;
					}
					
					else if(member.type === 'constant')
					{
						if(!interface.constants) interface.constants = {};
						interface.constants[member.name] = member;
					}
					
					else console.error('unknown member.type', member);
				});
			}
		}
	}),
	
	fetch('/documentation.json')
	.then(function(response) { return response.json() })
	.then(function(docs) { window.WAAPI = docs })
])
.then(function() {
	/// Kick off application and routing
	App.init();
	Router.init();
});

View.init();




var App = {
	init: function() {
		
	},
	
	Intro: {
		route: function() {
			View.Screen('intro');
		},
		
		enter: function(event) {},
		exit: function(event) {}
	},
	
	Interface: {
		route: function() {
			View.Screen('interface');
		},
		
		enter: function(event) {},
		exit: function(event) {}
	}
};







/// Routing
Router.pages({
	'/': App.Intro,
	'/interface/:name': App.Interface,
	
	// Default route to send user to intro screen on 404
	'*': '/'
});




document.addEventListener('DOMContentLoaded', function() {
	console.log('ready');
	
	var blocks = document.querySelectorAll('code');
	var iter = blocks.length;
	while(iter-->0)
	{
		var block = blocks[iter];
		
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
						tab.textContent = '\t';
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
					pseudo.tokenize(token.start, token.end, 'name');
				
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
});


