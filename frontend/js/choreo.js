
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
