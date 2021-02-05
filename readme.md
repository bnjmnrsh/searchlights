# searchLights.js

A fun little project to experiment with `mix-blend-mode` and drawing with `CanvasRenderingContext2D`. There are a number of project goals.

1. The plugin should be 'plug and play' running out of the box with some fun defaults.
2. These defaults should be able to be overwritten with user options provided by either

-   The existence of DOM elements with the appropriate `class` and `data` attributes.
-   or, programmatically, via a options object `searchLights({options})`.

3. The plugin should be extendable via custom events, callbacks, and or by overwriting the public API methods with your own to modify functionality.

## Basic Use

Fundamentally you can just plunk the `searchLights.js` script in the footer of your doc. with an inline script instantiating the plugin.

```
<script src="./searchLights.js" />
<script>searchLights.init()</script>
```

## Known accessibility issues

The elements added by `searchLight()` (such as `<canvas>`), when tied to pointer tracking, can interfere elements on a page, such as selecting text. If this occurs, then you may adjust the `z-index` value of the  selector.

## Browser Support

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

\* These values not supported in Safari, see [Browser Support]()

## Styles

## Configurations

Name | Value | Defaults | Description |
-----|:-----:|:--------:| ------------|
`searchLights` | `{object}` | `undefined` | The `searchLights ` object is the public API of searchLights.js and exposes a number of [methods]() and options.
`searchLights.enableShowHide` | `bool` | `true` | Set via `searchlights({enableShowHide: bool})` This flag which enables the fade out of searchLight elements when the pointer exits the when it encounters preexisting `.searchlight` elements.
`searchLights.isDOM` | `bool` | `undefined` | This top-level flag is set when `searchLights.js` encounters preexisting `.searchlight` elements in the DOM. 
`searchLights.useInlineStyles` | `bool` | `true` | Set via `options`, `useInlineStyles` disables the writing of styles by plugin. Use if you want to control styles purely in your style sheets. If this flag is `false` then the only inline element styles that are written, will be to `transform` to centre the element under pointer, and the dynamic positioning of the elements to follow the pointer.
`searchLights.targetClass` | `string` | `searchlight` | User settable flag via `searchLights.targetClass`. It is the css class to be added to any searchLights DOM element.
`searchLights.parentEl` | `string` | `document.body ` | Is the DOM element which programmatically generated searchlight elements will be appended to. This element is also be the target for `pointer` enter/exit events, meaning by default the opacity of searchlights goes to `0` on exit of the `parentEl` element, and to the default `opacity` when it re-enters. See `searchLights.enableShowHide`.
`searchLights.options` | `{object}` | `undefined` | The options object is the primary object of the public API. It is best explained with some [example settings]().
`searchLights.options.blur` | `int` | `3` | Settable via `searchLights({options.blur})`. This value sets the global default edge blur value in `px` of the drawn searchlight elements.
`searchLights.options.color` | `string` | `null` | User settable via the `options` object. Default `undefined`, takes any valid css color value. This top level option will become the default color of the pixels drawn for each searchlight value, if they are not specifically set in the individual elements of the `searchLights.options.ptrEls` array.
`searchLights.options.dia` | `int` | `100` | User settable via `options`. `dia` sets the diameter in `px` of the drawn searchlight elements.
`searchLights.options.height` `searchLights.options.width` | `int` | `undefined` | These values are calculated dynamically and are placeholders for future work.
`searchLights.options.blend` | `string` | `screen` | User settable via the `options` object. `blend` sets the css `mix-blend-mode` of searchlight elements. [Full list of blending mode keyword values](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode)
`searchLights.options.opacity` | `float` | `.8` | User settable via the `options` object. `opacity` sets the inline CSS `opacity` of searchlight elements. CSS uses values between `0` and `1`.
`searchLights.options.easing` | `string` | `ease-out` | User settable via the `options` object. `easing` sets the inline CSS `transition-timing-function` of searchlight elements. [Full list of keyword values](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function)
`searchLights.options.timing` | `int` | `90` | User settable via the `options` object. `timing` sets the inline CSS `transition-duration` of searchlight elements in milliseconds. When setting up custom pointers, use varying `timing` values to create different effects.
`searchLights.options.ptrEls` | `[array]` | searchLights.defaults.ptrEls | `searchLights.options.ptrEls` is an array of individual searchlight object element settings used to dynamically add searchlight elements to the DOM. Default values will be added if they are not specifically set. The `ptrEls` array, can hold any `searchLights.options` value to allow for fine control of each element. Keep in mind that the only "required" `ptrEls` specific property is `color`. Without a valid css color value, the searchlight elements will be drawn with transparent pixels, which is likely not what you likely want.

```
	const srchLts = {
		sParentEl = 'body',
		sTargetClass = '.searchlight',
		bUseInlineStyles = true,
		bUseInlineStyles = true,
	}
	// General settings for all pointers 
	srchLts.options = {
		 blur: 3,
        dia: 100,
        blend: 'screen',
        opacity: 0.8,
        easing: 'ease-out',
        timing: 90,
        width: undefined,
        height: undefined,
        color: undefined,
	}
	// Pointer elements with options defined. 
   srchLts.options.ptrEls = [
            {
                classes: ['red'],
                color: 'rgb(255,0,0)',
                dia: 150,
                blur: 2,
                blend: 'screen',
                opacity: .8,
                timing: 400,
            },
            {
                classes: ['green'],
                color: 'rgb(0,255,0)',
                dia: 200,
                blur: 4,
                blend: 'difference',
                opacity: .5,
                timing: 325,
            },
            {
                classes: ['blue'],
                color: 'blue',
                dia: 250,
                blur: 3,
                blend: 'exclusion',
                opacity: .4,
                timing: 275,
            },
    ]
    
    searchLights._Init(srchLts)
```

## Public Methods



## Gotchas

-   When the `parentEl` is positioned, `relative`, `absolute` or `fixed`, there appears to be some drawing issues, where the upper left corner of the `.searchlight` elements are transparent (event with a background color), and the elements slightly offset. The result is that the pointer is not centred as expected, and some of the searchlight elements may be clipped. Early testing, this appears to be a Chrome bug, as safari and FF don't have the issue.

-   `CanvasRenderingContext2D.filter` is not currently supported in safari
    https://caniuse.com/?search=CanvasRenderingContext2D.filter

-   Firefox, mouse movements are very janky. So the effect of following the mouse is not smooth and hypnotic. Firefox waits for the mouse to stop moving and then redraws. :( Is evident in this early draft pen. https://codepen.io/ShonenKnife/pen/ExgOxzy?editors=1111
    Related to https://bugzilla.mozilla.org/show_bug.cgi?id=1471840
    Example https://bugs.chromium.org/p/chromium/issues/attachment?aid=346022&signed_aid=K_lUkuhx3vW-b96uMCPv6A== (is download)

possibly using tips here.
https://stackoverflow.com/questions/53989222/getting-jank-on-css-transform
https://stackoverflow.com/a/54013312/362445

removed position property.
used `tanslate3d` for hardware acceleration.
also ` will-change: transform;`

## Code Conventions

Variable and function names are descriptive, using camelCase, and generally use [Hungarian Notation (adapted)](http://cws.cengage.co.uk/rautenbach/students/ancillary_content/hungarian_notation.pdf):

| Prefix Code | Description |
|-------------|-------------|
|s            | String      |
|b            | Boolean     |
|f            | Float       |
|i            | Integer     |
|o            | Object      |
|a            | Array       |
|fn           | Function or method |
|n            | DOM node    |
|nl           | DOM nodeList |
|_            | Private variable or function |

Notable exceptions are `searchLights._init()` and `searchLights._destroy()` methods, which are not prefixed with `fn`, and the `serchlights.options` parameters, which are not prefixed by datatype.  


