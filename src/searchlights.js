/**
 * searchlights.js
 *
 * @param {*} optons
 *
 */

window.searchLights = (function (options) {
    ;('use strict')

    // The public searchLights object
    let slts = {}

    /**
     * Overwritable flag wich if false, will prevent most inline styles on canvas elements
     */
    slts.sParentEl = 'body'
    slts.sTargetClass = '.searchlight'
    slts.bUseInlineStyles = true
    slts.bEnableShowHide = true

    // Default element values
    const Defaults = {
        blur: 3,
        dia: 100,
        blend: 'screen',
        opacity: 0.8,
        easing: 'ease-out',
        timing: 90,
        width: undefined,
        height: undefined,
        color: undefined,
        zIndex: 0,
    }
    Defaults.ptrEls = [
        {
            classes: ['red'],
            color: 'rgb(255,0,0)',
            dia: Defaults.dia,
            blur: Defaults.blur,
            blend: Defaults.blend,
            opacity: Defaults.opacity,
            timing: 400,
        },
        {
            classes: ['green'],
            color: 'rgb(0,255,0)',
            dia: Defaults.dia,
            blur: Defaults.blur,
            blend: Defaults.blend,
            opacity: Defaults.opacity,
            timing: 425,
        },
        {
            classes: ['blue'],
            color: 'rgb(0,0,255)',
            dia: Defaults.dia,
            blur: Defaults.blur,
            blend: Defaults.blend,
            opacity: Defaults.opacity,
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
    const _fnIsDOM = (el) => el instanceof Element

    /**
     * Test for if provided value is a NodeList, by testing for existence of item() method.
     *
     * @param {*} nodeList
     * @returns boolean
     */
    const _fnIsNodeList = (nodeList) => {
        if (!nodeList) return
        return typeof nodeList.item !== 'undefined'
    }

    /**
     * Checks if the browser reports supporting mixBlendingMode
     * Adds the class "mixBlendMode" to body if the browser supports it.
     *
     * A JS based test is nessicary here as IE11 and doesn't support mix-blend-mode, nor does it
     * support @supports.
     *
     * Note Safari has partial support, and will return true, despite not supporting the following:
     * hue, saturation, color, and luminosity
     *
     * https://caniuse.com/css-mixblendmode
     *
     * @returns boolean
     */
    const _fnSupportsBlend = () => {
        const _bSupported =
            typeof window.getComputedStyle(document.body).mixBlendMode !==
            'undefined'
        _bSupported ? document.body.classList.add('mix-blend-mode') : ''
        return _bSupported
    }

    /**
     * Builds the base syles for searchLights
     * and returns the node to be attached to the DOM
     *
     * @param {*} className | searchLight elements class
     *
     * @returns DOM style node with content
     */
    const _fnSetBaseStyles = function (className = slts.sTargetClass) {
        const _nBaseStyleEl = document.createElement('style')
        _nBaseStyleEl.innerHTML = `.mix-blend-mode ${className} { position: absolute; will-change: transform; }`
        return _nBaseStyleEl
    }

    /**
     * Set an element's opacity mode
     *
     * @param {*} el
     * @param {*} opacity
     */
    const _fnSetOpacity = function (el, opacity = slts.settings.opacity) {
        // test incoming values
        if (!_fnIsDOM(el) || typeof opacity !== 'number') return
        el.style.opacity = opacity
    }

    /**
     * Set an element's blend mode
     *
     * @param {*} el
     * @param {*} blend
     */
    const _fnSetBlending = function (el, blend = slts.settings.blend) {
        // test incoming values
        if (!_fnIsDOM(el) || typeof blend !== 'string') return
        el.style.mixBlendMode = blend
    }

    /**
     * Set an element's easing (transitionTimingFunction)
     *
     * @param {*} el
     * @param {*} easing
     */
    const _fnSetEasing = function (el, easing = slts.settings.easing) {
        // test incoming values
        if (!_fnIsDOM(el) || typeof easing !== 'string') return
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
    const _fnSetTiming = function (el, timing = slts.settings.transition) {
        // test incoming values
        // if (!_fnIsDOM(el) || typeof opacity !== 'number') return
        el.style.transitionDuration = timing + 'ms'
    }

    /**
     * Set an element's z-index
     *
     *
     * @param {*} el
     * @param {*} transition
     */
    const _fnSetZindex = function (el, zIndex = slts.settings.zIndex) {
        // test incoming values
        if (!_fnIsDOM(el) || typeof zIndex !== 'number') return
        el.style.zIndex = zIndex
    }

    /**
     * Create the slts.settings object
     * by combining any provided user options with the Defaults object.
     *
     * @param {*} oOpts
     */
    const _fnBuildSettingsObj = function (oOpts) {
        // Allow user to overrideing many API method with custom version, and merge in options object.
        slts = Object.assign(slts, oOpts)

        // see if there are any searchLight elements in the DOM, if so remove the default ones
        const _nlDOMsrcLts = document.querySelectorAll(slts.sTargetClass)

        let _aDefPtrEls = [...Defaults.ptrEls]

        if (_nlDOMsrcLts && _nlDOMsrcLts.length) {
            // set a global flag to signify pre-exsitsing DOM elements found
            slts._bIsDOM = true

            // Remove them from defaults
            Defaults.ptrEls = undefined
        }

        // create a new settings obj by merge the incoming options with Defaults
        slts.settings = Object.assign({}, Defaults, slts.options)

        // If the user didn't provide options.ptrEls, or only partial options
        // then we merge any missing top level options into each el as default values.
        if (oOpts && oOpts.options.ptrEls !== undefined) {
            slts.settings.ptrEls.forEach((ptrEl, i) => {
                ptrEl = Object.assign(ptrEl, oOpts.options.ptrEls[i])
                ptrEl = Object.assign({}, Defaults, ptrEl)
                // prevent Inception moment
                delete ptrEl.ptrEls
                slts.settings.ptrEls[i] = ptrEl
            })
        }

        // return the default searchlight elements to the Defaults obj
        if (_aDefPtrEls) {
            Defaults.ptrEls = [..._aDefPtrEls]
            console.log(Defaults)
        }

        // Now that we have set up Defaults, grab the parent to attach to
        slts.srchLtsParentNode = document.querySelector(slts.sParentEl)
    }

    /**
     * Add canvas el to DOM, draw the 2d Context, and apply inline styles.
     */
    const _fnAssembleSrchLtPtrs = function () {
        // Attach the pointer elements to the DOM
        slts.srchLtsElsNodeList = slts.m.fnCreateSrchLtEls(
            slts.settings.ptrEls,
            slts.sTargetClass
        )

        // if bUseInlineStyles is true, add the base styles to head
        if (slts.bUseInlineStyles) {
            document.head.insertAdjacentElement(
                'afterbegin',
                _fnSetBaseStyles(slts.sTargetClass)
            )
        }

        // draw each element
        slts.srchLtsElsNodeList.forEach(function (_el) {
            if (!_fnIsDOM(_el)) return

            // create the 2d conext
            const _oCtx = slts.m.fnCreateCtx(_el, slts)

            // Set each _element's specific styles
            slts.m.fnCenterOnPtr(_el)

            // if bUseInlineStyles is true assign the styles to each element
            if (slts.bUseInlineStyles) {
                _fnSetBlending(_el, _oCtx.srchLt.blend)
                _fnSetOpacity(_el, _oCtx.srchLt.opacity)
                _fnSetEasing(_el, _oCtx.srchLt.easing)
                _fnSetTiming(_el, _oCtx.srchLt.timing)
            }

            // draw the elements
            slts.m.fnDrawCtx(_oCtx)
        })
    }

    // searchLights Public API methods

    slts.m = {}

    /**
     * Follow the pointer
     *
     * @param {*} _e
     * @param {*} _nNodeList
     */
    slts.m.fnFollowPtr = function (_e, _nl) {
        if (!_fnIsNodeList(_nl)) return

        _nl.forEach(function (_el) {
            _el.style.left = _e.pageX + 'px'
            _el.style.top = _e.pageY + 'px'
            slts.m.fnSrchLtElsShow(_el, _nl)
        })
    }

    /**
     * Takes an array of class names, and merges it with any provided string
     * It will strip empty values and remove any stray peroids(.) from user data
     * It returns the assembled string of classes.
     *
     * @param {*} _aClasses
     * @param {*} _string
     *
     * @returns string of classes
     */

    slts.m.fnStringifyClassArray = function (_aClasses = [], _string = '') {
        // merge array with provided target class as string
        _aClasses.push(_string)

        // Remove empty array elememts
        aClasses = _aClasses.filter(Boolean)

        // Make it a string, removing any full stops
        const _sClasses = [...new Set(_aClasses)].join(' ').replace(/[.]/g, '')

        return _sClasses
    }

    /**
     * A terse debouce function
     *
     * @param {*} fn
     * @param {*} delay
     */
    slts.m.fnDbnce = (fn, delay = 300) => {
        let _timer
        return (...args) => {
            clearTimeout(_timer)
            _timer = setTimeout(() => {
                fn(...args)
            }, delay)
        }
    }

    /**
     * Create canvas elements using either options.schLightEls array,
     * or Defaults.schLightEls if none exsits in DOM.
     * Returns the resulting DOM NodeList of canvas elements.
     *
     * @todo make the target for prepending configerable
     *
     * @param {*} aPtrEls
     * @returns [*] NodeList of canvas elements in DOM
     */
    slts.m.fnCreateSrchLtEls = function (aPtrEls = [], sTargetClass) {
        // Otherwise create them
        aPtrEls.forEach(function (ptrEl) {
            const canvas = document.createElement('canvas')
            // Add classes
            canvas.className = slts.m.fnStringifyClassArray(
                ptrEl.classes,
                sTargetClass
            )

            // copy the current ptrEl into a new object
            const copyPtrEl = { ...ptrEl }

            // remove the classes array
            delete copyPtrEl.classes

            // turn any prtEl options into data attributes
            for (const property in copyPtrEl) {
                if (copyPtrEl[property]) {
                    canvas.setAttribute(
                        `data-${property}`,
                        `${copyPtrEl[property]}`
                    )
                }
            }
            // Attach it to the DOM
            slts.srchLtsParentNode ? slts.srchLtsParentNode.prepend(canvas) : ''
        })
        // refresh the nodeList of searchlight elements now in the DOM
        allSrcLts = document.querySelectorAll(sTargetClass)
        return allSrcLts ? allSrcLts : -1
    }

    /**
     * Creates a 2D context from the provided canvas element
     *
     * @param {*} canvasEl
     * @returns context object, with element data attrs attached
     */
    slts.m.fnCreateCtx = function (canvasEl) {
        // Teset for canvas DOM element
        if (canvasEl.tagName !== 'CANVAS') return

        const _dia = Math.abs(
            parseInt(canvasEl.dataset.dia || slts.settings.dia)
        )
        const _blur = Math.abs(
            parseInt(canvasEl.dataset.blur || slts.settings.blur)
        )

        // Set height and width of canvas element
        canvasEl.width = _dia + _blur * 2
        canvasEl.height = _dia + _blur * 2

        const ctx = canvasEl.getContext('2d')

        // Add all canvasEl data attrs to ctx object for future use
        ctx.srchLt = { ...canvasEl.dataset }

        /**
         *
         * Here we need to merge in Defaults if not present in ctx.srchLt
         *
         */

        return ctx
    }

    /**
     * Draw elements in provided rendering context
     *
     * @param {*} ctx
     */
    slts.m.fnDrawCtx = function (ctx) {
        if (ctx.constructor.name !== 'CanvasRenderingContext2D') return

        const _dia = ctx.srchLt.dia
        const _blur = parseInt(ctx.srchLt.blur)
        ctx.fillStyle = ctx.srchLt.color
        ctx.filter = 'blur(' + _blur + 'px)'
        ctx.beginPath()
        ctx.closePath()
        ctx.arc(
            _dia / 2 + _blur,
            _dia / 2 + _blur,
            Math.abs(_dia / 2),
            0,
            Math.PI * 2
        )
        ctx.fill()
    }

    /**
     * Show the srchLt elements
     *
     * we can get away with using nodeList.forEach as it actyally has better support then mix-blend-mode (Edge 15)
     * https://caniuse.com/css-mixblendmode / https://caniuse.com/?search=nodeList.forEach
     *
     * @param {*} e
     * @param {*} nodeList
     */
    slts.m.fnSrchLtElsShow = function (e, nodeList) {
        if (!_fnIsNodeList(nodeList)) return

        // return typeof nodeList.item !== 'undefined'
        nodeList.forEach(function (el) {
            el.style.display = 'initial'
            el.style.opacity = el.dataset.opacity || slts.settings.opacity
        })
    }

    /**
     * Hide the srchLt elements with opacity and display:none incase they interfer with pointer interactions
     *
     * We can get away with using nodeList.forEach as it actually has better support then mix-blend-mode (Edge 15)
     * https://caniuse.com/css-mixblendmode / https://caniuse.com/?search=nodeList.forEach
     *
     * @param {*} nodeList
     */
    slts.m.fnSrchLtElsHide = function (e, nodeList) {
        // if (!_fnIsNodeList(nodeList)) return
        nodeList.forEach(function (el) {
            if (slts.bEnableShowHide) {
                // dial down the opacity
                el.style.opacity = '0'

                // Grab timing value of current element
                const _timing = el.dataset.timing || slts.settings.timing

                // remove it from the DOM after transistion
                slts.m.fnDbnce(function () {
                    el.style.display = 'none'
                }, _timing)()
            }
        })
    }

    /**
     * Adjusts the style property of a srchLt element so that the cursor is centered over it by default.
     * Uses translate3d in order to trigger hardware exceleration
     *
     * @param {*} el
     */
    slts.m.fnCenterOnPtr = function (el) {
        if (!_fnIsDOM(el)) return
        el.style.transform =
            'translate3d(  ' +
            -el.width / 2 +
            'px, ' +
            -el.height / 2 +
            'px, 0)'
    }

    /**
     * Pointer  Callbacks.
     */
    slts.fnPtrMoveCallbk = function () {}
    slts.fnPtrLeaveCallbk = function () {}
    slts.fnPtrEnterCallbk = function () {}

    /**
     * Custom Pointer Events
     */
    slts._ptrMove = new CustomEvent('srchLtsMove', {
        detail: {
            pointerMotion: true,
        },
    })

    /**
     * Sets up pointer event listeners onto the slts.settings.attach element
     *
     * @param {*} settings
     */
    slts.m.fnEventSetup = function () {
        const _ptrs = slts.srchLtsElsNodeList
        const _node = slts.srchLtsParentNode

        // register the event listener
        _node.onpointermove = (e) => {
            // Track the pointer
            slts.m.fnFollowPtr(e, _ptrs)
            slts.fnPtrMoveCallbk(e, slts)
            _node.dispatchEvent(slts._ptrMove)
        }
        _node.onpointerenter = (e) => {
            slts.m.fnSrchLtElsShow(e, _ptrs)
            slts.fnPtrEnterCallbk(e, slts)
        }
        _node.onpointerleave = (e) => {
            slts.m.fnSrchLtElsHide(e, _ptrs)
            slts.fnPtrLeaveCallbk(e, slts)
        }
    }

    /**
     * _Destroy method
     * removes event listeners
     * removes elements from DOM
     * Clears settings & options and ptrs objects
     */
    slts._destroy = function () {
        // Make sure we have already been initialised
        if (!slts.settings) return

        // Remove event listeners
        document.removeEventListener('onpointermove', slts.m.fnFollowPtr, false)
        document.removeEventListener(
            'onpointerenter',
            slts.m.fnSrchLtElsShow,
            false
        )
        document.removeEventListener(
            'onpointerleave',
            slts.m.fnSrchLtElsHide,
            false
        )

        // Remove elements from DOM
        slts.srchLtsElsNodeList.forEach(function (el) {
            el.remove()
        })

        // Nuke run time objects: settings, nodeLists ect
        slts.options = undefined
        slts.settings = undefined
        slts.srchLtsElsNodeList = undefined
    }

    /**
     * Public _Init method
     *
     * @param {*} options
     */
    slts._init = function (oOpts) {
        // _Destroy any preexsiting initialisation
        slts._destroy()

        // Bail if browser dosen't support blending modes (see notes on safari)
        if (!_fnSupportsBlend()) return

        // Merge Defaults and user options into new slts.settings object
        _fnBuildSettingsObj(oOpts)

        // Draw each searchlight and add it to the DOM
        _fnAssembleSrchLtPtrs()

        // Set up event listeners
        slts.m.fnEventSetup()

        // return updated srchLts object
        return slts
    }

    // srcLts as public API
    return slts
})()
