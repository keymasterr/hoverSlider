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
- **Flicker-free switching** — the outgoing image is held underneath until the incoming one has painted
- **`@2x` / `@3x` retina support** — infers pixel density from filename
- **Ready state** — `hover_slider-ready` class added when all images are decoded; optional `data-wait` delays interaction until then
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

`hoverSlider()` returns an array of handles, one per initialized element:

```js
const [slider] = hoverSlider('.my-gallery');
slider.el;        // the container element
slider.destroy(); // tear down, restore the original DOM, return the element
```

The same teardown is also exposed on the element itself as `_hoverSliderDestroy()`:

```js
const slider = document.querySelector('.hover_slider');
slider._hoverSliderDestroy();

// Re-initialize later
hoverSlider(slider);
```

Teardown removes only what hoverSlider added — a `hover_slider` class, `data-*` attribute, or `aria-hidden` that was already on your markup is left alone.


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
| `data-wait` | `wait` | `true` \| `false` | `false` | Delay interaction until all images are decoded |

Boolean attributes follow the HTML convention: a bare `data-touch-loop` counts as `true`, same as `data-touch-loop="true"`. Any other value is `false`.

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
3. **Neither set** — width is read from the first image's natural width (scaled down for `@2x` / `@3x` images) and paired with `aspect-ratio` and `max-width: 100%`, so the slider shrinks to fit a narrow viewport instead of overflowing it

Sizing is measured from an empty clone of the container inserted next to the original, so ancestor rules, percentage widths and inherited sizing resolve exactly as they do for the real element.

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
- CSS Nesting
- `TouchEvent` API
- `Image.decode()` method
- `Promise.allSettled()`

**Minimum versions:** Chrome/Edge 112+, Firefox 121+, Safari 16.5+


## Notes

- **`hover_slider-cover_ready` class** — a CSS hook available once the first image is decoded, similar to the existing commented note in the CSS
- **Idempotency** — calling `hoverSlider()` on an already-initialized element is safe and does nothing
- **Failed images** — a broken image no longer blocks the slider: the rest still work, `hover_slider-ready` is still reached, and the failure is reported via `console.warn`
- **Accessibility** — the container is focusable with arrow-key navigation; the indicator and every image after the first are `aria-hidden`, so screen readers announce only the cover image's `alt`
- **(to himself)**: Only use slideshows if the hidden images don’t matter to the story.


## License

MIT
