export type HoverSliderTarget =
  | string
  | HTMLElement
  | NodeListOf<HTMLElement>
  | readonly HTMLElement[];

export interface HoverSliderOptions {
  /** Slide position indicator style. Default: `'line'`. */
  ind?: 'line' | 'dots' | 'nums' | 'none';
  /** CSS `object-fit` for images. Default: `'contain'`. */
  fit?: 'contain' | 'cover';
  /** Set to `'none'` to hide the container outline. */
  border?: 'none';
  /** Loop when swiping past the first/last slide. Default: `false`. */
  touchLoop?: boolean;
  /** Make touch navigation relative to the swipe start position. Default: `false`. */
  touchRelative?: boolean;
  /** Delay interaction until all images are decoded. Default: `false`. */
  wait?: boolean;
}

export interface HoverSliderInstance {
  /** The container element. */
  el: HTMLElement;
  /** Index of the slide currently shown. */
  readonly active: number;
  /** Show the slide at `index`. Out-of-range indexes and calls after `destroy()` are ignored. */
  setActive(index: number): void;
  /** Tear down, restore the original DOM, and return the element. */
  destroy(): HTMLElement;
}

/**
 * Initializes sliders on the matched elements. `data-*` attributes on an
 * element take priority over `options`. Already-initialized elements are skipped.
 */
declare function hoverSlider(
  target?: HoverSliderTarget,
  options?: HoverSliderOptions
): HoverSliderInstance[];

export default hoverSlider;
export { hoverSlider };

declare global {
  interface HTMLElement {
    /** Present while hoverSlider is initialized on this element. */
    _hoverSliderDestroy?: () => HTMLElement;
  }
}
