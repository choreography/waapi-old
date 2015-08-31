
Choreo.Settings.noLayout = 'class'; // class-based hiding of views

Choreo.define({
	from: null,
	to: 'article.intro'
}, function() {
	var gloriousHeader = this.to.querySelector('header.glorious');
	var navItems = this.to.querySelectorAll('header.glorious, a.flat, iframe.__slackin, section.blurb, footer.curious');
	
	return Choreo.Animate.evade(gloriousHeader, navItems, function(element) {
		return new KeyframeEffect(element, [
			{ opacity: 0, transform: 'translate3d(' + (this.direction.x*20) + 'px, ' + (this.direction.y*20) + 'px, 0px) scale(0.9)' },
			{ opacity: 1, transform: 'translate3d(0px, 0px, 0px) scale(1)' }
		], {
			delay: this.distance*1.2,
			duration: 400,
			fill: 'both',
			easing: 'cubic-bezier(.33,.55,.46,1.14)'
		});
	});
});

Choreo.define({
	from: 'article.intro',
	to: 'article.external'
}, function() {
	var tapped = this.from.querySelector('.tapped');
	if(!tapped) return new KeyframeEffect(this.from, [
		{ opacity: 1 },
		{ opacity: 0 }
	], { duration: 250 });
	
	var cover = new Choreo.Revealer(tapped, {
		shape: 'circle',
		from: 'normal',
		to: 'everything',
		background: 'hsl(140, 50%, 70%)',
		
		duration: 600,
		fill: 'both',
		easing: 'ease-in'
	});
	
	return new GroupEffect([
		cover.effect,
		new KeyframeEffect(cover.proxy, [
			{ opacity: 1 },
			{ opacity: 0 }
		], { duration: 200, fill: 'both' }),
	], { fill: 'both' });
});

document.addEventListener('DOMContentLoaded', function(event) {
	Choreo.graph('article.intro');
	
	document.addEventListener('click', function(event) {
		if(!(event.target.matches('a[href]') && !event.defaultPrevented)) return;
		event.preventDefault();

		event.target.classList.add('tapped');
		var player = Choreo.graph('article.intro', 'article.external');
		
		player.finished.then(function() {
			if('history' in window) history.pushState(null, null, location.pathname);
			location = event.target.href;
		});
	});
});



Rainbow.onHighlight(function(block, language) {
	block.innerHTML = block.innerHTML.trim().replace(/\t/g, '<span class="tab">&#09;</span>');
});





var MirrorResizer = {
	init: function() {
		this.mirror = document.querySelector('div.mirror');
		this.divider = document.querySelector('div.mirror > button.divider');
		this.prose = document.querySelector('div.mirror > div.prose');
		this.code = document.querySelector('div.mirror > div.code');
		
		this.divider.addEventListener('mousedown', this);
	},
	
	handleEvent: function(event) { this[event.type](event); },
	mousedown: function(event) {
		event.preventDefault();
		this.mirrorBox = this.mirror.getBoundingClientRect();
		document.addEventListener('mousemove', this);
		document.addEventListener('mouseup', this);
	},
	mousemove: function(event) {
		var percent = (event.screenX - this.mirrorBox.left) / this.mirrorBox.width;
		percent *= 100.0;
		percent = percent.toFixed(2);
		this.divider.style.left = percent + '%';
		this.prose.style.width = percent + '%';
		this.code.style.width = (100 - percent) + '%';
	},
	mouseup: function(event) {
		event.preventDefault();
		document.removeEventListener('mousemove', this);
		document.removeEventListener('mouseup', this);
	}
};

document.addEventListener('DOMContentLoaded', function(event) {
	MirrorResizer.init();
});







var HighLighter = {
	init: function() {
		document.addEventListener('mouseover', this);
	},
	
	handleEvent: function(event) { this[event.type](event); },
	mouseover: function(event) {
		if(!event.target.matches('high-light')) return;
		var group = event.target.getAttribute('group');
		if(!group) return;
		
		var elements = document.querySelectorAll('high-light[group="' + group + '"]');
		var iter = elements.length;
		while(iter-->0) elements[iter].classList.add('on');
		
		event.target.addEventListener('mouseleave', this);
	},

	mouseleave: function(event) {
		var group = event.target.getAttribute('group');
		if(!group) return;
		var elements = document.querySelectorAll('high-light[group="' + group + '"]');
		var iter = elements.length;
		while(iter-->0) elements[iter].classList.remove('on');
		
		event.target.removeEventListener('mouseleave', this);
	}
}

document.addEventListener('DOMContentLoaded', function(event) {
	HighLighter.init();
});







fetch('/data.json')
.then(function(response) {
	return response.json();
})
.then(function(json) {
	window.WAAPI = json;
	
	
});


