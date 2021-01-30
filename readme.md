# SearchLights.js

A fun little project to expriment with `mix-blend-mode` and drawing with `CanvasRenderingContext2D`.

## Known Accessibility issues

The `canvas` elements added by `searchLight()` can cause issues interacting with other elements on a page, such as selecting text.
If this occurs, then you may adjust the `z-index` value of the `.searchlight` selector.

## mix-blend-mode, support

`searchlights.js` will test the browser on instantiation adding the class `mix-blend-mode` and if the browser doesn't report support, the scrip will exit silently.

Note Safari has partial support, and will return true, though some modes not supported, including: hue, saturation, color, and luminosity
https://caniuse.com/css-mixblendmode

https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode

```
/* Keyword values */
mix-blend-mode: normal;
mix-blend-mode: multiply;
mix-blend-mode: screen;
mix-blend-mode: overlay;
mix-blend-mode: darken;
mix-blend-mode: lighten;
mix-blend-mode: color-dodge;
mix-blend-mode: color-burn;
mix-blend-mode: hard-light;
mix-blend-mode: soft-light;
mix-blend-mode: difference;
mix-blend-mode: exclusion;
mix-blend-mode: hue;
mix-blend-mode: saturation;
mix-blend-mode: color;
mix-blend-mode: luminosity;

/* Global values */
mix-blend-mode: initial;
mix-blend-mode: inherit;
mix-blend-mode: unset;
```

## Styles
