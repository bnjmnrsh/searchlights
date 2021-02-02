/**
 * Searchlights.js
 *
 * todo list
 * @todo Bug with timing, being passed through as string, should be an int. (we turn it into a string anyway tho...)
 * @todo Believe that the ctx element is not getting all the default values. line 418
 *
 * @todo make sure the when adding elements to the DOM it is done in such a way as to minimise redraw/reflow
 *
 * @todo Better handeling of pointers first appearance on screen (now they sit at 00 untill poiner event.)
 * @done Assess if rather then tracking if the mouse leaves body to show/hide, instead if it leaves the 'attach' target with custom event? / changes made to srchLts.eventSetup
 *
 * @todo Consider a constructor to be able to create more then one.
 *
 * These might be best as an experiment in extending the plugin:
 * @todo Automatically calculate degrees of seperation for n searchlights
 * @todo Automatically calculate off center seperation of searchlights provided a distance value
 * @todo Optionally be able to converge searchlights to 0 (cursor tip) after the cursor pauses
 *
 * @done Ensure that any provided options are dynamically turned into data-* attributes
 * @done If we are inlining styes on the elemetn, we should create the basic stylesheet on the fly.
 * @done destroy method for cleanup . . .
 * @done Be able to specify in options what element the pointers should be prepended to // done with 'attach' option
 * @done Consider using a refrence to the actual ptr DOM element computed width and height rather try to calculate center settings.
 * This will keep the pointer centered even if the values are changed with js later.
 * @done refactor createSrchLtEls() to allow numeric 0 values from data-*
 * @done refactor the merging of defaults and options into the settings object.
 *
 * @wont Consider ways to adjust layering order. Is z-index easiest? // achivable with callback or event listener.
 * @wont Optionally be able to shuffle or randomise the css transition value for each searchlight after cursor pause to make it behavior less predictable // could be done with css and external js
 * -->https://css-tricks.com/newsletter/236-initialisms-and-layout-shifts/ && https://imagineer.in/blog/stacking-context-with-opacity/
 * @wont ::before ::after psudo elemnts in order to transition blending mode on cursor stop? // could be achieved with css, so added flag to disable inline styles.
 *
 * @param {*} optons
 *
 */

window.searchLights = (function (options) {
    ;('use strict')

    // The public srchLts object
    let srchLts = {}

    /**
     * Overwritable flag wich if false, will prevent most inline styles on canvas elements
     */
    srchLts.useInlineStyles = true

    // Default values
    srchLts.defaults = {
        target: '.searchlight',
        attachTarget: 'body',
        blur: 3,
        dia: 100,
        blend: 'screen',
        opacity: 0.8,
        easing: 'ease-out',
        timing: 90,
        width: null,
        height: null,
        color: undefined,
    }
    srchLts.defaults.ptrEls = [
        {
            classes: ['red'],
            color: 'rgb(255,0,0)',
            dia: srchLts.defaults.dia,
            blur: srchLts.defaults.blur,
            blend: srchLts.defaults.blend,
            opacity: srchLts.defaults.opacity,
            timing: 400,
        },
        {
            classes: ['green'],
            color: 'rgb(0,255,0)',
            dia: srchLts.defaults.dia,
            blur: srchLts.defaults.blur,
            blend: srchLts.defaults.blend,
            opacity: srchLts.defaults.opacity,
            timing: 425,
        },
        {
            classes: ['blue'],
            color: 'rgb(0,0,255)',
            dia: srchLts.defaults.dia,
            blur: srchLts.defaults.blur,
            blend: srchLts.defaults.blend,
            opacity: srchLts.defaults.opacity,
            timing: 475,
        },
    ]

    // Helper methods

    /**
     * Test if provided element is a DOM node
     *
     * @param {*} el
     * @returns boolean
     */
    const isDOM = (el) => el instanceof Element

    /**
     * Test for if provided value is a NodeList, by testing for existence of item() method.
     *
     * @param {*} nodeList
     * @returns boolean
     */
    const isNodeList = (nodeList) => {
        if (!nodeList) return
        return typeof nodeList.item !== 'undefined'
    }

    /**
     * Checks if the browser reports supporting mixBlendingMode
     * Adds the class "mixBlendMode" to body if the browser supports it.
     *
     * A JS based test is nessicary here as IE11 and doesn't support *-blend-modes, and nor does it
     * support @supports.
     *
     * Note Safari has partial support, and will return true, despite not supporting the following:
     * hue, saturation, color, and luminosity
     *
     * https://caniuse.com/css-mixblendmode
     *
     * @returns boolean
     */
    const supportsBlend = () => {
        const supported =
            typeof window.getComputedStyle(document.body).mixBlendMode !==
            'undefined'
        supported ? document.body.classList.add('mix-blend-mode') : ''
        return supported
    }

    /**
     * Builds the base syles for searchLights
     * and returns the node to be attached to the DOM
     *
     * @param {*} target | searchLight elements class
     *
     * @returns DOM style node with content
     */
    const setBaseStyles = function (target = srchLts.settings.target) {
        const baseStyles = document.createElement('style')
        baseStyles.innerHTML = `.mix-blend-mode ${target} { position: absolute; }`
        return baseStyles
    }

    /**
     * Set an element's opacity mode
     *
     * @param {*} el
     * @param {*} opacity
     */
    const setOpacity = function (el, opacity = srchLts.settings.opacity) {
        // test incoming values
        if (!isDOM(el) || typeof opacity !== 'number') return
        el.style.opacity = opacity
    }

    /**
     * Set an element's blend mode
     *
     * @param {*} el
     * @param {*} blend
     */
    const setBlending = function (el, blend = srchLts.settings.blend) {
        // test incoming values
        if (!isDOM(el) || typeof blend !== 'string') return
        el.style.mixBlendMode = blend
    }

    /**
     * Set an element's easing (transitionTimingFunction)
     *
     * @param {*} el
     * @param {*} easing
     */
    const setEasing = function (el, easing = srchLts.settings.easing) {
        // test incoming values
        if (!isDOM(el) || typeof easing !== 'string') return
        el.style.transitionTimingFunction = easing
    }

    /**
     * Set an element's transition in milliseconds
     *
     * @todo fix incoming number/string issue
     *
     * @param {*} el
     * @param {*} transition
     */
    const setTiming = function (el, timing = srchLts.settings.transition) {
        // test incoming values
        // if (!isDOM(el) || typeof opacity !== 'number') return
        el.style.transitionDuration = timing + 'ms'
    }

    /**
     * Follow the pointer
     *
     * @param {*} e
     * @param {*} nodeList
     */
    const srchLtsFollow = function (e, nodeList) {
        if (!isNodeList(nodeList)) return

        nodeList.forEach(function (el) {
            el.style.left = e.pageX + 'px'
            el.style.top = e.pageY + 'px'
        })
    }

    /**
     * Takes an array of class names, and merges it with any provided string
     * It will strip empty values and remove any stray peroids(.) from user data
     * It returns the assembled string of classes.
     *
     * @param {*} classArray
     * @param {*} string
     *
     * @returns string of classes
     */

    const strinifyClassArray = function (classArray = [], string = '') {
        // merge array with provided target class as string
        classArray.push(string)

        // Remove empty array elememts
        classArray = classArray.filter(Boolean)

        // Make it a string, removing any full stops
        const classesStr = [...new Set(classArray)]
            .join(' ')
            .replace(/[.]/g, '')

        return classesStr
    }

    /**
     * Create the srchLts.settings object
     * by combining any provided user options with srchLts.defaults.
     *
     * @param {*} opts
     */
    const buildSettingsObj = function (opts) {
        // Allow overrideing of API methods
        srchLts = Object.assign(srchLts, opts)

        // merge options with defaults
        srchLts.settings = Object.assign({}, srchLts.defaults, srchLts.options)

        // If the user didn't provide options.ptrEls,
        // we merge any top level options as new defaults
        // in the template for making new pointers: srchLts.settings.ptrEls
        if (opts && opts.options.ptrEls !== undefined) {
            srchLts.settings.ptrEls.forEach((ptrEl, i) => {
                ptrEl = Object.assign(ptrEl, opts.options.ptrEls[i])
            })
        }

        // Capture our elements
        srchLts.settings.attachedEl = document.querySelector(
            srchLts.settings.attachTarget
        )
        !srchLts.settings.attachedEl
            ? (srchLts.settings.attachedEl = document.body)
            : ''
    }

    /**
     * Add canvas el to DOM, draw the 2d Context, and apply inline styles.
     */
    const assembleSrchLtPtrs = function () {
        // Attach the pointer elements to the DOM
        srchLts.ptrs = srchLts.createSrchLtEls(
            srchLts.settings.ptrEls,
            srchLts.settings.target
        )

        // if useInlineStyles is true, add the base styles to head
        if (srchLts.useInlineStyles) {
            document.head.insertAdjacentElement(
                'afterbegin',
                setBaseStyles(srchLts.settings.target)
            )
        }

        // draw each element
        srchLts.ptrs.forEach(function (el) {
            if (!isDOM(el)) return

            // create the 2d conext
            const ctx = srchLts.create2dCtx(el, srchLts)

            // Set each element's specific styles
            srchLts.centerOnPtr(el)

            // if useInlineStyles is true assign the styles to each element
            if (srchLts.useInlineStyles) {
                setBlending(el, ctx.srchLt.blend)
                setOpacity(el, ctx.srchLt.opacity)
                setEasing(el, ctx.srchLt.easing)
                setTiming(el, ctx.srchLt.timing)
            }

            // draw the elements
            srchLts.drawCtx(ctx)
        })
    }

    // srchLts Public API methods

    /**
     * A terse debouce function
     *
     * @param {*} fn
     * @param {*} delay
     */
    srchLts.dbnce = (fn, delay = 300) => {
        let timer
        return (...args) => {
            clearTimeout(timer)
            timer = setTimeout(() => {
                fn(...args)
            }, delay)
        }
    }

    /**
     * Create canvas elements using either options.schLightEls array,
     * or defaults.schLightEls if none exsits in DOM.
     * Returns the resulting DOM NodeList of canvas elements.
     *
     * @todo make the target for prepending configerable
     *
     * @param {*} ptrEls
     * @returns [*] NodeList of canvas elements in DOM
     */
    srchLts.createSrchLtEls = function (ptrEls = [], target) {
        let allSrcLts = document.querySelectorAll(target)

        // If elements are already in the DOM return them set isDOM flag
        if (allSrcLts && allSrcLts.length) {
            srchLts.isDOM = true
            return allSrcLts
        }

        // Otherwise create them
        ptrEls.forEach(function (ptrEl) {
            const canvas = document.createElement('canvas')
            // Add classes
            canvas.className = strinifyClassArray(ptrEl.classes, target)

            // Sanitise and set defaults if not present
            ptrEl.dia = ptrEl.dia
                ? parseInt(ptrEl.dia)
                : parseInt(srchLts.settings.dia)
            ptrEl.blend = ptrEl.blend ? ptrEl.blend : srchLts.settings.blend
            ptrEl.blur = ptrEl.blur
                ? ptrEl.blur
                : parseFloat(srchLts.settings.blur)
            ptrEl.opacity = isNaN(parseFloat(ptrEl.opacity))
                ? parseFloat(ptrEl.opacity)
                : parseFloat(srchLts.settings.opacity)
            ptrEl.easing = ptrEl.easing ? ptrEl.easing : srchLts.settings.easing
            ptrEl.timing = ptrEl.timing
                ? parseInt(ptrEl.timing)
                : parseInt(srchLts.settings.timing)

            // copy the current ptrEl into a new object
            const copyPtrEl = { ...ptrEl }
            // remove the classes array
            delete copyPtrEl.classes

            // turn the prtEl options into data attributes
            for (const property in copyPtrEl) {
                canvas.setAttribute(
                    `data-${property}`,
                    `${copyPtrEl[property]}`
                )
            }
            // Attach it to the DOM
            srchLts.settings.attachedEl
                ? srchLts.settings.attachedEl.prepend(canvas)
                : ''
        })
        // refresh the nodeList of searchlight elements now in the DOM
        allSrcLts = document.querySelectorAll(target)
        return allSrcLts ? allSrcLts : -1
    }

    /**
     * Creates a 2D context from the provided canvas element
     *
     * @param {*} canvasEl
     * @returns context object, with element data attrs attached
     */
    srchLts.create2dCtx = function (canvasEl) {
        // Teset for canvas DOM element
        if (canvasEl.tagName !== 'CANVAS') return

        const dia = Math.abs(
            parseInt(canvasEl.dataset.dia || srchLts.settings.dia)
        )
        const blur = Math.abs(
            parseFloat(canvasEl.dataset.blur || srchLts.settings.blur)
        )

        // Set height and width of canvas element
        canvasEl.width = dia + blur * 2
        canvasEl.height = dia + blur * 2

        const ctx = canvasEl.getContext('2d')

        // Add all canvasEl data attrs to ctx object for future use
        ctx.srchLt = { ...canvasEl.dataset }

        /**
         *
         * Here we need to merge in defaults if not present in ctx.srchLt
         *
         */

        return ctx
    }

    /**
     * Draw elements in provided rendering context
     *
     * @param {*} ctx
     */
    srchLts.drawCtx = function (ctx) {
        if (ctx.constructor.name !== 'CanvasRenderingContext2D') return

        const dia = ctx.srchLt.dia
        const blur = parseFloat(ctx.srchLt.blur)
        ctx.fillStyle = ctx.srchLt.color
        ctx.filter = 'blur(' + parseInt(ctx.srchLt.blur) + 'px)'
        ctx.beginPath()
        ctx.closePath()
        ctx.arc(
            dia / 2 + blur,
            dia / 2 + blur,
            Math.abs(dia / 2),
            0,
            Math.PI * 2
        )
        ctx.fill()
    }

    /**
     * Pointer enter callback
     *
     * @param {*} e
     * @param {*} nodeList
     */
    srchLts.showSrchLts = function (e, nodeList) {
        if (!isNodeList(nodeList)) return
        nodeList.forEach(function (el) {
            el.style.opacity = el.dataset.opacity || srchLts.settings.opacity
        })
    }

    /**
     * Pointer exit callback
     *
     * @param {*} nodeList
     */
    srchLts.hideSrchLts = function (e, nodeList) {
        if (!isNodeList(nodeList)) return
        nodeList.forEach(function (el) {
            el.style.opacity = '0'
        })
    }

    /**
     * Adjusts the style property of a provided element so that the cursor is centered by default.
     *
     * @param {*} el
     */
    srchLts.centerOnPtr = function (el) {
        if (!isDOM(el)) return
        el.style.transform =
            'translate( ' + -el.width / 2 + 'px, ' + -el.height / 2 + 'px)'
    }

    /**
     * Pointer  Callbacks.
     */
    srchLts.ptrMoveCallbk = function () {}
    srchLts.ptrLeaveCallbk = function () {}
    srchLts.ptrEnterCallbk = function () {}

    /**
     * Custom Pointer Events
     */
    srchLts.ptrHalted = new CustomEvent('srchLtsPtrHalted', {
        detail: {
            pointerMotion: false,
        },
    })

    const ptrOverEls = function (els) {}
    /**
     * Sets up pointer event listeners onto the srchLts.settings.attach element
     *
     * @param {*} settings
     */
    srchLts.eventSetup = function () {
        const ptrs = srchLts.ptrs
        const el = srchLts.settings.attachedEl

        // register the event listener
        el.onpointermove = (e) => {
            // Track the pointer
            srchLtsFollow(e, srchLts.ptrs)
            srchLts.ptrMoveCallbk()
            el.dispatchEvent(srchLts.ptrHalted)
        }
        el.onpointerenter = (e) => {
            srchLts.showSrchLts(e, srchLts.ptrs)
            srchLts.ptrEnterCallbk(e, srchLts)
        }
        el.onpointerleave = (e) => {
            srchLts.hideSrchLts(e, srchLts.ptrs)
            srchLts.ptrLeaveCallbk(e, srchLts)
        }
    }

    /**
     * A destroy method
     * removes event listeners
     * removes elements from DOM
     * Clears settings & options and ptrs objects
     */
    srchLts.destroy = function () {
        // Make sure we have already been initialised
        if (!srchLts.settings) return

        // Remove event listeners
        document.removeEventListener('onpointermove', srchLtsFollow, false)
        document.removeEventListener(
            'onpointerenter',
            srchLts.showSrchLts,
            false
        )
        document.removeEventListener(
            'onpointerleave',
            srchLts.hideSrchLts,
            false
        )

        // Remove elements from DOM
        srchLts.ptrs.forEach(function (el) {
            el.remove()
        })

        // Nuke run time objects: settings, ptrs
        srchLts.options = undefined
        srchLts.settings = undefined
        srchLts.ptrs = undefined
    }

    /**
     * Public init function
     *
     * @param {*} options
     */
    srchLts.init = function (opts) {
        // destroy any preexsiting initialisation
        srchLts.destroy()

        // Bail if browser dosen't support blending modes (see notes on safari)
        if (!supportsBlend()) return

        // Merge defaults and user options into new srchLts.settings object
        buildSettingsObj(opts)

        // Draw each searchlight and add it to the DOM
        assembleSrchLtPtrs()

        // Set up event listeners
        srchLts.eventSetup()

        // return updated srchLts object
        return srchLts
    }

    // make the srcLts our public API
    return srchLts
})()
