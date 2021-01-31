/**
 * Searchlights.js
 *
 * todo list
 * @done destroy method for cleanup . . .
 * @done Be able to specify in options what element the pointers should be prepended to // done with 'attach' option
 * @todo Assess if rather then tracking if the mouse leaves body to show/hide, instead if it leaves the 'attach' target with custom event?
 *
 * @todo Consider ways to adjust layering order. Is z-index easiest?
 *
 * @done Consider using a refrence to the actual ptr DOM element computed width and height rather try to calculate center settings.
 * This will keep the pointer centered even if the values are changed with js later.
 *
 * @done refactor createSrchLtEls() to allow numeric 0 values from data-*
 * @todo refactor the merging of defaults and options into the settings object.
 *
 * @todo Better handeling of pointers first appearance on screen (now they sit at 00 untill poiner event.
 *
 * @todo Automatically calculate degrees of seperation for n searchlights
 * @todo Automatically calculate off center seperation of searchlights provided a distance value
 *
 * @todo Optionally be able to converge searchlights to 0 (cursor tip) after the cursor pauses
 * @todo Optionally be able to shuffle or randomise the css transition value for each searchlight after cursor pause to make it behavior less predictable
 *
 * @todo ::before ::after psudo elemnts in order to transition blending mode on cursor stop?
 *
 * @param {*} optons
 */

const { doc } = require('prettier')

window.searchLights = (function (options) {
    ;('use strict')

    // The public srchLts object
    let srchLts = {}

    // Default values
    srchLts.defaults = {
        target: '.searchlight',
        attach: 'body',
        blur: 1,
        elDia: 100,
        elWidth: null,
        elheight: null,
        blend: 'exclusion',
        opacity: 0.8,
        easing: null,
        timing: null,
    }
    srchLts.defaults.ptrEls = [
        {
            classes: ['red'],
            color: 'rgb(255,0,0)',
            elDia: srchLts.defaults.elDia,
            blur: srchLts.defaults.blur,
            blend: srchLts.defaults.blend,
            opacity: srchLts.defaults.opacity,
        },
        {
            classes: ['green'],
            color: 'rgb(0,255,0)',
            elDia: srchLts.defaults.elDia,
            blur: srchLts.defaults.blur,
            blend: srchLts.defaults.blend,
            opacity: srchLts.defaults.opacity,
        },
        {
            classes: ['blue'],
            color: 'rgb(0,0,255)',
            elDia: srchLts.defaults.elDia,
            blur: srchLts.defaults.blur,
            blend: srchLts.defaults.blend,
            opacity: srchLts.defaults.opacity,
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
     * Set an element's opacity mode
     *
     * @param {*} el
     * @param {*} opacity
     */
    const setOpacity = function (el, opacity = srchLts.settings.opacity) {
        // test incoming values
        if (!isDOM(el) && typeof opacity !== 'number') return
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
        if (!isDOM(el) && typeof blend === 'string') return
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
        if (!isDOM(el) && typeof easing === 'string') return
        el.style.transitionTimingFunction = easing
        // console.log(el.style.transitionTimingFunction)
    }

    /**
     * Set an element's transition in milliseconds
     *
     * @param {*} el
     * @param {*} transition
     */
    const setTransition = function (
        el,
        transition = srchLts.settings.transition
    ) {
        // test incoming values
        if (!isDOM(el) && typeof transition !== 'number') return
        el.style.transitionDuration = transition + 'ms'
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
        const ptrs = document.querySelectorAll(target)

        // If elements are already in the DOM return them
        if (ptrs.length) {
            srchLts.isDOM = true
            return ptrs
        }

        // Otherwise create them
        ptrEls.forEach(function (ptrEl) {
            let canvas = document.createElement('canvas')

            // Make sure that at least the default target class is present
            ptrEl.classes.push(target)
            ptrEl.classes = ptrEl.classes.filter(Boolean)

            const classesStr = [...new Set(ptrEl.classes)]
                .join(' ')
                .replace(/[.,#]/g, '')
            // Set defaults if not present

            const dia = ptrEl.elDia
                ? parseInt(ptrEl.elDia)
                : parseInt(srchLts.settings.elDia)
            const blend = ptrEl.blend ? ptrEl.blend : srchLts.settings.blend
            const blur = ptrEl.blur
                ? ptrEl.blur
                : parseFloat(srchLts.settings.blur)
            const opacity = isNaN(parseFloat(ptrEl.opacity))
                ? parseFloat(ptrEl.opacity)
                : parseFloat(srchLts.settings.opacity)

            canvas.className = classesStr
            canvas.setAttribute('data-color', ptrEl.color)
            canvas.setAttribute('data-el-dia', dia)
            canvas.setAttribute('data-blend', blend)
            canvas.setAttribute('data-blur', blur)
            canvas.setAttribute('data-opacity', opacity)

            // if a 'attach' target has been set use it, otherwise body
            const prependTarget = srchLts.settings.attach
                ? srchLts.settings.attach
                : 'body'
            const attach = document.querySelector(prependTarget)
            attach.prepend(canvas)
        })
        // NodeList of elements now in DOM
        return document.querySelectorAll(target)
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

        const elDia = parseInt(canvasEl.dataset.elDia || srchLts.settings.elDia)
        const blur = parseInt(canvasEl.dataset.blur || srchLts.settings.blur)

        // Set height and width of canvas element
        canvasEl.width = elDia + blur * 2
        canvasEl.height = elDia + blur * 2

        const ctx = canvasEl.getContext('2d')

        // Add all canvasEl data attrs to ctx object for future use
        ctx.srchLt = { ...canvasEl.dataset }
        return ctx
    }

    /**
     * Draw elements in provided rendering context
     *
     * @param {*} ctx
     */
    srchLts.drawCtx = function (ctx) {
        if (ctx.constructor.name !== 'CanvasRenderingContext2D') return
        const elDia = parseFloat(ctx.srchLt.elDia)
        const blur = parseFloat(ctx.srchLt.blur)
        ctx.fillStyle = ctx.srchLt.color
        ctx.filter = 'blur(' + parseInt(ctx.srchLt.blur) + 'px)'
        ctx.beginPath()
        ctx.closePath()
        ctx.arc(
            elDia / 2 + blur,
            elDia / 2 + blur,
            elDia / 2 - blur * 2,
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
    srchLts.showSrchLts = function (nodeList) {
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
    srchLts.hideSrchLts = function (nodeList) {
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
     * Sets up pointer event listeners
     *
     * @param {*} settings
     */
    srchLts.eventSetup = function () {
        // console.log(srchLts)
        const ptrs = srchLts.ptrs

        // register the event listener
        document.onpointermove = (e) => {
            // Track the pointer
            srchLtsFollow(e, srchLts.ptrs)
            srchLts.ptrMoveCallbk()
            document.dispatchEvent(srchLts.ptrHalted)
        }
        document.onpointerenter = (e) => {
            srchLts.showSrchLts(e, srchLts.ptrs)
            srchLts.ptrEnterCallbk(e, srchLts)
        }
        document.onpointerleave = (e) => {
            srchLts.hideSrchLts(e, srchLts.ptrs)
            srchLts.ptrLeaveCallbk(e, srchLts)
        }
    }

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
        srchLts.ptrs = undefined
        srchLts.settings = undefined
    }

    /**
     * Create the srchLts.settings object
     * by combining any provided user options with srchLts.defaults.
     *
     * @param {*} opts
     */
    const buildSettingsObj = function (opts) {
        // merge options with defaults
        srchLts.settings = Object.assign({}, srchLts.defaults, srchLts.options)

        // Allow overrideing of API methods
        srchLts = Object.assign(srchLts, opts)

        console.log(opts)

        // If the user didn't provide options.ptrEls,
        // we merge any top level options as new defaults
        // in the template for making new pointers: srchLts.settings.ptrEls
        if (opts && opts.options.ptrEls !== 'undefined') {
            srchLts.settings.ptrEls.forEach((ptrEl, i) => {
                ptrEl = Object.assign(ptrEl, opts.options.ptrEls[i])
                console.log(ptrEl)
            })
        }
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

        // draw each element
        srchLts.ptrs.forEach(function (el) {
            if (!isDOM(el)) return

            // create the 2d conext
            const ctx = srchLts.create2dCtx(el, srchLts)
            // console.log(ctx.srchLt)

            // Set element styles
            srchLts.centerOnPtr(el)
            setBlending(el, ctx.srchLt.blend)
            setOpacity(el, ctx.srchLt.opacity)
            setEasing(el, ctx.srchLt.easing)
            setTransition(el, ctx.srchLt.transition)

            // draw the elements
            srchLts.drawCtx(ctx)
        })
    }

    /**
     * Public init function
     *
     * @param {*} options
     */
    srchLts.init = function (opts) {
        // if (opts) console.log(opts)
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

searchLights.init()

// Test Suite
const test = {
    options: {
        opacity: 0.8,
        blend: 'difference',
        elDia: 400,
        blur: 60,
    },
}

test.options.ptrEls = [
    {
        classes: ['test', 'blue'],
        color: 'rgb(33, 27, 27)',
        elDia: test.options.elDia,
        blur: 0.1,
        opacity: test.options.opacity,
        blend: 'screen',
        easing: 'ease-in',
        timing: 20,
    },
    {
        classes: ['red'],
        color: 'rgb(15,30,200)',
        elDia: 300,
        blur: 4,
        blend: test.options.blend,
        opacity: 1,
    },
    {
        classes: ['green'],
        color: 'rgb(15,200,30)',
        elDia: 110,
        opacity: test.options.opacity,
    },
]
test.ptrMoveCallbk = searchLights.dbnce(() => console.log('movement'), 500)
searchLights.init(test)

// const pointerEls = document.querySelectorAll('.searchLights')

// const ptrsZindex = function (z) {
//     console.log('pointer stopped')
//     let zVal = getComputedStyle(document.documentElement).getPropertyValue(
//         '--ptrs-z-index'
//     ) // #999999
//     console.log(zVal)

//     if (zVal == 100) {
//         zVal = -1
//     } else {
//         zVal = 100
//     }
//     console.log(zVal)
//     document.documentElement.style.setProperty('--ptrs-z-index', zVal)
// }

// document.addEventListener('srchLtsPtrHalted', ptrsZindex, false)

// document.addEventListener(
//     'pointermove',
//     searchLights.dbnce(() => ptrsZindex(), 400),
//     false
// )

// searchLights.init(test)
