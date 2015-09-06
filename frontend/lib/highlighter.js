
var HighLighter = {
	init: function() {
		document.addEventListener('mouseover', this);
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

document.addEventListener('DOMContentLoaded', function(event) {
	HighLighter.init();
});
