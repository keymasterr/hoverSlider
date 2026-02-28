# hoverSlider

A lightweight, zero-dependency vanilla JavaScript image slider that advances slides by hovering or swiping — no buttons, no autoplay, just direct control.

Ideal for product shots, visual states, or any flipbook-style presentation.

---

## Demo

[![icon-hoverSlider](https://github.com/user-attachments/assets/8216e649-acb1-4254-86b0-2e4ce37effd6)  
keymasterr.com/micro/hover-slider](https://keymasterr.com/micro/hover-slider/)

Move your cursor (or swipe on mobile) across the slider to navigate between images. The position of your pointer within the slider determines which slide is shown.


## Features

- **Hover to slide** — cursor position maps directly to slides
- **Touch & swipe support** — horizontal swipe on mobile with vertical scroll preserved
- **Keyboard navigation** — arrow keys when focused
- **Configurable indicators** — line (default), dots, numbers, or none
- **Flexible sizing** — auto-detects dimensions from the image, or respects CSS-defined width/height
- **`@2x` / `@3x` retina support** — infers pixel density from filename
- **Zero dependencies** — pure HTML, CSS, and JS


## Installation

Just include the two files in your project:

```html
<link rel="stylesheet" href="hoverSlider.css">
<script src="hoverSlider.js"></script>
```


## Usage

### Basic setup

Wrap your images in a container with the `hover_slider` class, then call `hoverSlider()`:

```html
<div class="hover_slider">
  <img src="image-1.jpg">
  <img src="image-2.jpg">
  <img src="image-3.jpg">
</div>

<script>
  hoverSlider();
</script>
```

### Targeting specific elements

```js
hoverSlider('.my-gallery');           // CSS selector
hoverSlider(element);                 // single DOM element
hoverSlider(nodeList);                // NodeList or array
```

### Destroy

Each initialized slider gets a `_hoverSliderDestroy()` method that tears down the instance, restores the original DOM, and returns the element:

```js
const slider = document.querySelector('.hover_slider');
slider._hoverSliderDestroy();

// Re-initialize later
hoverSlider(slider);
```


## Configuration

Options can be set as `data-*` attributes on the element, or passed as a second argument to `hoverSlider()`. Attributes take priority over params.

Passing options as params is useful when many sliders on the same page share the same configuration:

```js
hoverSlider('.hover_slider', { ind: 'dots', fit: 'cover' });
```

An individual element can still override any param via its own `data-*` attribute.

| Attribute | Param key | Values | Default | Description |
|---|---|---|---|---|
| `data-ind` | `ind` | `line` \| `dots` \| `nums` \| `none` | `line` | Slide position indicator style |
| `data-fit` | `fit` | `contain` \| `cover` | `contain` | CSS `object-fit` for images |
| `data-border` | `border` | `none` | *(outline shown)* | Set to `none` to hide the container outline |
| `data-touch-loop` | `touchLoop` | `true` \| `false` | `false` | Loop when swiping past first/last slide |
| `data-touch-relative` | `touchRelative` | `true` \| `false` | `false` | Make touch navigation relative to swipe start position |

### Examples

```html
<!-- Dots indicator, cover fit -->
<div class="hover_slider" data-ind="dots" data-fit="cover">
  <img src="a.jpg">
  <img src="b.jpg">
</div>

<!-- Number indicator, no border, looping touch -->
<div class="hover_slider" data-ind="nums" data-border="none" data-touch-loop="true">
  <img src="a.jpg">
  <img src="b.jpg">
</div>
```


## Sizing

hoverSlider determines the container size using the following priority:

1. **Both width and height set in CSS** — used as-is
2. **Only one dimension set in CSS** — the other is inferred from the first image's aspect ratio
3. **Neither set** — width and height are read from the first image's natural dimensions, scaled down for `@2x` / `@3x` images

Only the first image determines the container size. All subsequent images are fitted within it using `object-fit`.


## Retina / HiDPI Images

Name your files with `@2x` or `@3x` suffixes and hoverSlider will halve or third the displayed size automatically:

```html
<img src="photo@2x.jpg">   <!-- displayed at 50% of natural size -->
<img src="photo@3x.png">   <!-- displayed at 33% of natural size -->
```


## Browser Support

Works in all modern browsers. Requires:

- CSS `:has()` selector
- `TouchEvent` API
- `Image.decode()` method

**Minimum versions:** Chrome/Edge 105+, Firefox 121+, Safari 15.4+


## Notes

- **Instant transitions** — slides switch without animation by design, for a direct flipbook-style feel
- **Idempotency** — calling `hoverSlider()` on an already-initialized element is safe and does nothing
- **(to himself)**: Only use slideshows if the hidden images don’t matter to the story.


## License

MIT
