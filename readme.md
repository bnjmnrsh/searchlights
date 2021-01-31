# SearchLights.js

A fun little project to expriment with `mix-blend-mode` and drawing with `CanvasRenderingContext2D`. There are a number of project goals.

1. The plugin should be 'plug and play' running out of the box with some fun defaults.
2. These defaults should be able to be overwritten with user options provided by either

-   The exsistance of `<canvas>` elements with the approperate `class` and `datta` attributes.
-   or, progromatically, via a options object.

3. The plugin should be extendable via custom events, callbacks, and or by overwriting the public API methods with your own to modify functionality.

## Basic Use

Fundimentially you can just plunk the `searchLights.js` script in the footer of your doc. with an inline script instantiating the plugn.

```
<script src="./searchLights.js" />
<script>searchLights.init()</script>
```

## Known accessibility issues

The `canvas` elements added by `searchLight()` can cause issues interacting with other elements on a page, such as selecting text.
If this occurs, then you may adjust the `z-index` value of the `.searchlight` selector.

## Browser support for mix-blend-mode

`searchlights.js` will test the browser on instantiation adding the class `mix-blend-mode`. If the browser doesn't report support, the scrip will exit silently.

> Note: Safari has partial support, and will return true, though some modes not supported, including: hue, saturation, color, and luminosity

https://caniuse.com/css-mixblendmode

## Blending mode keyword values

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
mix-blend-mode: saturation; *
mix-blend-mode: color; *
mix-blend-mode: luminosity; *

/* Global values */
mix-blend-mode: initial;
mix-blend-mode: inherit;
mix-blend-mode: unset;
```

\*\ These values not supported in Safari, see notes in 'Browser support for mix-blend-mode'

## Styles
