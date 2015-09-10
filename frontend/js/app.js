fetch('/data.json')
.then(function(response) {
	return response.json();
})
.then(function(json) {
	window.WAAPI = json;
})
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
		/*
		// Need to preserve the original HTML-ified sourcecode,
		// which may contain highlighting (<high-light>) and typographic syntax (<b>/<i>)
		// We split the contentText and innerHTML while allowing the whole to be indexed
		var pseudo = {
			nodes: Array.prototype.map.call(block.childNodes, function(node, index) {
				if(node.nodeType === document.TEXT_NODE)
				{
					return node.nodeValue;
				}
				
				else if(node.nodeType === document.ELEMENT_NODE)
				{
					var parsed = node.outerHTML.match(/(<[^>]+>)([^<]*)(<\/[^>]+>)/);
					if(!parsed) return ['unparsed:', node];
					var start = parsed[1];
					var inner = parsed[2];
					var end = parsed[3];
					return [start, inner, end];
				}
				else return ['unknown', node];
			}),
			get length () {
				var total = 0, iter = this.nodes.length;
				while(iter-->0) {
					var node = this.nodes[iter];
					if(typeof node === 'string') total += node.length;
					else total += node[1].length;
				}
				return total;
			},
			
			get text () {
				return this.nodes.map(function(node) {
					if(typeof node === 'string') return node;
					else return node[1];
				}).join('');
			},
			
			get raw () {
				return this.nodes.map(function(node) {
					if(typeof node === 'string') return node;
					else return node.join('');
				}).join('');
			},
			
			slice: function(start, end, fn) {
				var temp = [], consumed = 0; consumable = end-start;
				if(consumable > this.length - 1) consumable = this.length - 1;
				
				var offset = 0, iter = 0;
				while(consumed < consumable && iter < this.nodes.length)
				{
					var node = this.nodes[iter++];
					var isElement = typeof node !== 'string';
					var str = isElement? node[1] : node;

					if(start-offset > str.length)
					{
						offset += str.length;
						continue;
					}
					else if(offset > end) break;
					
					var piece;
					if(start-offset <= 0 && end-offset >= str.length) piece = str;
					else piece = str.slice(start-offset, end-offset);
					
					consumed += piece.length;
					
					if(fn) piece = fn(piece);
					
					if(isElement)
					{
						var startTag = node[0];
						var endTag = node[2];
						
						temp.push(startTag);
						temp.push(piece);
						temp.push(endTag);
					}
					
					else temp.push(piece);
					
					offset += str.length;
				}
				
				return temp.join('');
			}
		};
		
		if(typeof pseudo.nodes[0] === 'string') pseudo.nodes[0] = pseudo.nodes[0].trimLeft();
		else pseudo.nodes[0][1] = pseudo.nodes[0][1].trimLeft();
		if(typeof pseudo.nodes[pseudo.nodes.length-1] === 'string') pseudo.nodes[pseudo.nodes.length-1] = pseudo.nodes[pseudo.nodes.length-1].trimRight();
		else pseudo.nodes[pseudo.nodes.length-1][1] = pseudo.nodes[pseudo.nodes.length-1][1].trimRight();
		
		
		var source = pseudo.text;
// 		var source = block.textContent.trim();
		*/

		
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
		
		var source = pseudo.text;
		
		
		
		var ctx = source.match(/(.*)\n/);
		if(!ctx) ctx = source; else ctx = ctx[1];
		

		var last = 0;
		var ast = acorn.parse(source, {
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
		
		function onWhitespace(start, end) {
			// pseudo.tokenize(start, end, function(piece) {
			// 	return piece.replace()
			// });
			
			pseudo.tokenize(start, end, function(piece, node) {
				console.log('"' + piece + '"');
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
				
				//var text = document.createTextNode(piece);
				//node.diff.push(text);
			});
			
			
// 			var text = pseudo.slice(start, end, function (str) {
// 				return str
// // 				.replace(/ /g, '<span class="space">$&</span>')
// // 				.replace(/[\n\r]+/g, '<span class="newline">$&</span>')
// 				.replace(/\t/g, '<span class="tab">&#09;</span>');
// 			});
// 			code.push(text);
		}
		
		// if(source === 'new KeyframeEffect(target, frames, options);') debugger;

		pseudo.render();
	}
});

/*
.keyword { color: hsl(0, 70%, 50%) }
.syntax, .operator { color: hsl(0, 0%, 80%);}
.entity { color: hsl(260, 30%, 60%) }
.string { color: hsl(0, 40%, 60%) }
.numeric { color: hsl(215, 50%, 60%) }

.type { color: hsl(15, 25%, 34%) }
.argument { color: hsl(120, 20%, 50%) }
*/
