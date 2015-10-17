# KeyframeEffect

<div class="mirror">
<div class="prose">

KeyframeEffect updates CSS properties of a single DOM element over time.

They sit within an Animation and work with its' global clock, known as the DocumentTimeline.

</div>
<div class="code">

```
var effect = new KeyframeEffect(target, frames, options);
```

```
var target = Element || null;
var frames = [Keyframes, Keyframes /*, ... */];
var options = Number || KeyframeEffectOptions;
```

</div>
</div>

## Arguments

<div class="mirror">
<div class="prose">

* ### target
  is the Element being animated.<br><br>
  Can be null for animations that don't target a specific element, for example Animation-driven sounds via Audio API.
* ### frames
  is an array of Keyframes to use.
* ### options
  is either a Number specifying duration in milliseconds OR an Object with properties specifying timing and behaviour of the effect.<br><br>
  For a list & description of the properties see KeyframeEffectOptions.

</div>
<div class="code">

```
/// Constructing a KeyframeEffect

// Grab a DOM element to animate
var target = document.querySelector('.my-target');

// Keyframes for fade out, start from `opacity: 1`
// and end at `opacity: 0`
var frames = [
	{
		opacity: 1
	},
	{
		opacity: 0
	}
];

var options = {
	duration: 300,	// Play effect for 300ms,
	delay: 100,		// delay it for 100ms,
	fill: 'both'	// keep CSS active beyond animation
					// (until `.cancel()` is called)
};

var effect = new KeyframeEffect(target, frames, options);
```

</div>
</div>


## Usage

You can use the effect by putting it directly into an animation

```
var animation = document.timeline.play(effect);
```

Or alternatively you can composite it with other effects

```
var group = new GroupEffect([
	effect,
	otherEffect
]);

var animation = document.timeline.play(group);
```
