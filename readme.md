# searchLights.js

A fun little project to experiment with `mix-blend-mode` and drawing with `CanvasRenderingContext2D`.

There are two demos on CodePen:
 using [DOM `<canvas>` elements for configuration](https://codepen.io/bnjmnrsh/pen/XWGpaLV)
 using [JavaScript Objects for configuration](https://codepen.io/bnjmnrsh/pen/eYXgGjL)

There were a number of project goals:

1. The plugin should be 'plug and play' running out of the box with some fun defaults.
2. These defaults should be able to be overwritten with user options provided by either:

-   The existence of DOM elements with the appropriate `class` and `data` attributes.
-   or, programmatically, via a options object `searchLights({options})`.

3. The plugin should be extendable via custom events, callbacks, and or by overwriting the public methods with your own to modify functionality.

## Basic Use

Fundamentally you can just plunk the `searchLights.js` script in the footer of your HTML with an inline script instantiating the plugin. (i.e. the script is an iife instantiated onto `window` - yolo. )

```
<script src="./searchLights.js" />
<script>searchLights._init()</script>
```

## Known accessibility issues

The elements added by `searchLight()` (such as `<canvas>`), when tied to pointer tracking, can interfere elements on a page, such as selecting text. If this occurs, then you may adjust the `z-index` value of the selector.

## Browser Support

`searchlights.js` will test the browser on instantiation adding the class `mix-blend-mode`. If the browser doesn't report support, the script will exit silently.

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

```
.mix-blend-mode .searchlight {
    position: absolute;
    will-change: transform, opacity, left, top;
    opacity: 0;
    display: none;
}
```

## Configurations

| Name                                                       |   Value    |           Defaults           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------- | :--------: | :--------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `searchLights`                                             | `{object}` |         `undefined`          | The `searchLights ` object is the public API of searchLights.js and exposes a number of [methods]() and options.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `searchLights.enableShowHide`                              |   `bool`   |            `true`            | Set via `searchlights({enableShowHide: bool})` This flag which enables the fade out of searchLight elements when the pointer exits the when it encounters preexisting `.searchlight` elements.                                                                                                                                                                                                                                                                                                                                                       |
| `searchLights.isDOM`                                       |   `bool`   |         `undefined`          | This top-level flag is set when `searchLights.js` encounters preexisting `.searchlight` elements in the DOM.                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `searchLights.useInlineStyles`                             |   `bool`   |            `true`            | Set via `options`, `useInlineStyles` disables the writing of styles by plugin. Use if you want to control styles purely in your style sheets. If this flag is `false` then the only inline element styles that are written, will be to `transform` to centre the element under pointer, and the dynamic positioning of the elements to follow the pointer.                                                                                                                                                                                           |
| `searchLights.targetClass`                                 |  `string`  |        `searchlight`         | User settable flag via `searchLights.targetClass`. It is the css class to be added to any searchLights DOM element.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `searchLights.parentEl`                                    |  `string`  |       `document.body `       | Is the DOM element which programmatically generated searchlight elements will be appended to. This element is also be the target for `pointer` enter/exit events, meaning by default the opacity of searchlights goes to `0` on exit of the `parentEl` element, and to the default `opacity` when it re-enters. See `searchLights.enableShowHide`.                                                                                                                                                                                                   |
| `searchLights.options`                                     | `{object}` |         `undefined`          | The options object is the primary object of the public API. It is best explained with some [example settings]().                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `searchLights.options.blur`                                |   `int`    |             `3`              | Settable via `searchLights({options.blur})`. This value sets the global default edge blur value in `px` of the drawn searchlight elements.                                                                                                                                                                                                                                                                                                                                                                                                           |
| `searchLights.options.color`                               |  `string`  |            `null`            | User settable via the `options` object. Default `undefined`, takes any valid css color value. This top level option will become the default color of the pixels drawn for each searchlight value, if they are not specifically set in the individual elements of the `searchLights.options.ptrEls` array.                                                                                                                                                                                                                                            |
| `searchLights.options.dia`                                 |   `int`    |            `100`             | User settable via `options`. `dia` sets the diameter in `px` of the drawn searchlight elements.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `searchLights.options.height` `searchLights.options.width` |   `int`    |         `undefined`          | These values are calculated dynamically and are placeholders for future work.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `searchLights.options.blend`                               |  `string`  |           `screen`           | User settable via the `options` object. `blend` sets the css `mix-blend-mode` of searchlight elements. [Full list of blending mode keyword values](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode)                                                                                                                                                                                                                                                                                                                                  |
| `searchLights.options.opacity`                             |  `float`   |             `.8`             | User settable via the `options` object. `opacity` sets the inline CSS `opacity` of searchlight elements. CSS uses values between `0` and `1`.                                                                                                                                                                                                                                                                                                                                                                                                        |
| `searchLights.options.easing`                              |  `string`  |          `ease-out`          | User settable via the `options` object. `easing` sets the inline CSS `transition-timing-function` of searchlight elements. [Full list of keyword values](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function)                                                                                                                                                                                                                                                                                                                |
| `searchLights.options.timing`                              |   `int`    |             `90`             | User settable via the `options` object. `timing` sets the inline CSS `transition-duration` of searchlight elements in milliseconds. When setting up custom pointers, use varying `timing` values to create different effects.                                                                                                                                                                                                                                                                                                                        |
| `searchLights.options.ptrEls`                              | `[array]`  | searchLights.defaults.ptrEls | `searchLights.options.ptrEls` is an array of individual searchlight object element settings used to dynamically add searchlight elements to the DOM. Default values will be added if they are not specifically set. The `ptrEls` array, can hold any `searchLights.options` value to allow for fine control of each element. Keep in mind that the only "required" `ptrEls` specific property is `color`. Without a valid css color value, the searchlight elements will be drawn with transparent pixels, which is likely not what you likely want. |

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

-   Chrome: when attaching searchLight elements to targets other then the `<body>`, and the target, is positioned `relative`, `absolute` or `fixed`, there appears to be some drawing issues. The upper left corner of the `.searchlight` elements have transparent bites taken out of them (event when a `background-color` set in css), and the elements are slightly offset from center. The result is that the pointer is not centered as expected, and some of the searchlight elements may be clipped. Early testing, this appears to be a Chrome bug, as safari and FF don't have the issue.

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

**camelCase**
All functions and variables should be given descriptive camelCase names using Hungarian Notation.

**Hungarian Notation**
Variables and functions names should be prefixed with the following Hungarian notation codes:

| Prefix | Description        |
| :----: | ------------------ |
|   s    | String             |
|   b    | Boolean            |
|   f    | Float              |
|   i    | Integer            |
|   o    | Object             |
|   a    | Array              |
|   fn   | Function or method |
|   n    | DOM node           |
|   nl   | DOM nodeList       |
|   \_   | Treat as a private |
|   C    | Class name prefix  |

Notable exceptions are `searchLights._init()` and `searchLights._destroy()` methods, which are not prefixed with `fn`, and the `serchlights.options` and `serchlights.options`object parameters, which are not prefixed by datatype.

**Capitalization:** `const` variables which should not be mutated directly are Capitalized. Classe names are prefixed with a capital `C`

## TO DO

-   [ ] Make adding ptrs to dom more efficient with an HTML Fragment (we can only do this when we are provided a target string in \_build(), if we are not, then we resort to looking in the DOM elements them selves, to see if we previously saved a srchLtsParentElement. In fnCreateSrchLtEls(), we use the `settings`, or `_Default` so we are more effective with this technique.

-   [ ] Revise docs. . . .
-   [ ] Make sure we are not directly manipulating incoming params. . . objs & arrays
-   [ ] Better handling of pointers first appearance on screen (now they sit at 00 until pointer event.)
-   [ ] Consistently sanitize or parse every data-attr before it hits the DOM?
-   [ ] Consider a constructor to be able to create more then one.
-   [ ] onpointermove, vs onmousemove - onpointermove is janky on FF, but using onmousemove means that pointers aren't registered. Detect is user is using pointer?
    -   https://github.com/rafgraph/event-from, https://github.com/rafgraph/detect-it
-   [ ] On safari, the drawn borders are not blurred (no support) - fake it with drop shadow?
-   [ ] look at dynamically calling methods based on the data-\* attr name. https://www.sitepoint.com/call-javascript-function-string-without-using-eval/
    -   This would be useful for regenerating new DOM elements based on existing data-\* values. ie
    -   given data-opacity='.5' check if a method exists and if so run srchlte.opacity(el, .5)
-   [ ] add flag for the type of element to be made. Global? only or on a per element basis? hummmmm ie canvas or block....
-   [ ] consider being able to disable inline classes on a per element basis.
-   [ ] make sure that when adding elements to the DOM it is done in such a way as to minimise redraw/reflow

**These might be best as an experiment in extending the plugin:**

-   [ ] Automatically calculate degrees of separation for n searchlights
-   [ ] Automatically calculate off centre separation of searchlights provided a distance value
-   [ ] Optionally be able to converge searchlights to 0 (cursor tip) after the cursor pauses

**Completed**

-   [x] Make adding styles more efficient with classes where possible. (added hidden attr, not much else makes sense.
-   [x] add z-index to list of params (in progress)
-   [x] Believe that the ctx element is not getting all the default values. line 441
-   [x] Bug with timing, being passed through as string, should be an int. (we turn it into a string anyway tho...)
-   [x] Hungarian notation (in progress) - http://cws.cengage.co.uk/rautenbach/students/ancillary_content/hungarian_notation.pdf
-   [x] BUG `_fnBuildOptionsObj()` method works, is not adding default els to DOM. ln 200
-   [x] FOUC - modify base styles to set to display none, visibility hidden, add a `_funSetVisibleDisplay()` method to make the el visible on load. Bonus points for using debounce to have `_fnSetOpacity` run after all the other styles are added for a fade in effect.
-   [x] `_fnBuildOptionsObj` method should capture the DOM nodes that exists and store them for later.
-   [x] `_build()` method should take a list of nodes and attach them to the provided target element.
-   [x] Should \_fnAssembleSrchLtEls begin with adding the style element to body? (prob not)
-   [x] `_oSrchLtsParentNode rename to _nSrchLtsParentNode`
-   [x] Bug - calling `init({})` on searchLights when there were already elements in the DOM, does not redraw the default ones.... what is happening here?
-   [x] Consider removing escape hatch if DOM elements already exists. This could prevent us from creating algorithmic configs in future.
-   [x] Assess if rather then tracking if the mouse leaves body to show/hide, instead if it leaves the 'attach' target with custom event? / changes made to srchLts.m.fnEventSetup
-   [x] Ensure that any provided options are dynamically turned into data-\* attributes
-   [x] If we are inlining styes on the element, we should create the basic stylesheet on the fly.
-   [x] destroy method for cleanup . . .
-   [x] Be able to specify in options what element the pointers should be prepended to // done with 'attach' option
-   [x] Consider using a reference to the actual ptr DOM element computed width and height rather try to calculate centre settings.

*   This will keep the pointer centered even if the values are changed with js later.

-   [x] refactor m.fnCreateSrchLtEls() to allow numeric 0 values from data-\*
-   [x] refactor the merging of Defaults and options into the settings object.

@wont Detect when the pointer is over an array of DOM elements and optionally hide the element.
@wont convert nodeList.forEach() to Array.prototype.slice.call() for better backward compatibility, if we were to use this with (for example) just css or perhaps SVG approaches. (not needed according to CF)
@wont Consider ways to adjust layering order. Is z-index easiest? // achievable with callback or event listener.
@wont Optionally be able to shuffle or randomize the css transition value for each searchlight after cursor pause to make it behavior less predictable // could be done with css and external js
-->https://css-tricks.com/newsletter/236-initialisms-and-layout-shifts/ && https://imagineer.in/blog/stacking-context-with-opacity/
@wont ::before ::after pseudo elements in order to transition blending mode on cursor stop? // could be achieved with css, so added flag to disable inline styles.
