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
		var ctx = source.match(/(.*)\n/);
		if(!ctx) ctx = source; else ctx = ctx[1];
		console.groupCollapsed('Parsing new block (' + ctx + ')');
		console.group('Source');
		console.log(source);
		console.groupEnd();
		
		
		var code = [];
		var last = 0;
		var ast = acorn.parse(source, {
			onToken: function(token) {
				if(last) onWhitespace(last, token.start);
				last = token.end;
				
				if(token.type.label === 'eof') return;
				
				var str = pseudo.slice(token.start, token.end);
				if(token.type === acorn.tokTypes.num)
					code.push(['<span class="numeric">', str, '</span>'].join(''));
				
				else if(token.type === acorn.tokTypes.string)
					code.push(['<span class="string">', str, '</span>'].join(''));
				
				else if(token.type === acorn.tokTypes.template)
					code.push(['<span class="template">', str, '</span>'].join(''));
				
				else if(token.type === acorn.tokTypes.name)
					code.push([
						'<span class="name">',
// 							'<high-light group="', token.value, '">',
								str,
// 							'</high-light>',
						'</span>'
					].join(''));
				
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
					code.push('<span class="keyword">', str,'</span>');
				
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
					code.push('<span class="syntax">', str,'</span>');
				
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
					code.push('<span class="operator">', str, '</span>');
				
				else
				{
					console.log(token);
					code.push(str); // code.push(token.value || token.type.label);
				}
			},
			
			onComment: function(isBlock, text, start, end) {
				if(last) onWhitespace(last, start);
				last = end;
				
				var str = pseudo.slice(start, end);
				code.push(['<span class="comment">', str, '</span>'].join(''));
				
			}
		});
		
		function onWhitespace(start, end) {
			var text = pseudo.slice(start, end, function (str) {
				return str
				.replace(/ /g, '<span class="space">$&</span>')
// 				.replace(/[\n\r]+/g, '<span class="newline">$&</span>')
				.replace(/\t/g, '<span class="tab">&#09;</span>');
			});
			code.push(text);
		}
		
		block.innerHTML = code.join('');
		console.groupEnd();
		
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
