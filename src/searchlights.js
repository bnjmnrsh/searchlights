/**
 * searchlights.js
 *
 * @param {*} optons
 *
 */

window.searchLights = (function (options) {
    ;('use strict')

    // The public searchLights object
    let sL = {}

    // Default parent to attach searchLight elements to
    sL.sParentEl = 'body'
    // Default seachLight element class
    sL.sTargetClass = '.searchlight'
    //flag will prevent most inline styles on serchLight elements
    sL.bUseInlineStyles = true
    //flag will enables the hiding of searchLight elements when the pointer exits the parent El
    sL.bEnableShowHide = true

    // Default element values
    const _Defaults = {
        blur: 3,
        dia: 100,
        blend: 'screen',
        opacity: 0.8,
        easing: 'ease-out',
        timing: 90,
        width: undefined,
        height: undefined,
        color: undefined,
        zindex: 0,
    }
    _Defaults.srchLtEls = [
        {
            classes: ['red'],
            color: 'rgb(255,0,0)',
            dia: _Defaults.dia,
            blur: _Defaults.blur,
            blend: _Defaults.blend,
            opacity: _Defaults.opacity,
            timing: 400,
        },
        {
            classes: ['green'],
            color: 'rgb(0,255,0)',
            dia: _Defaults.dia,
            blur: _Defaults.blur,
            blend: _Defaults.blend,
            opacity: _Defaults.opacity,
            timing: 425,
        },
        {
            classes: ['blue'],
            color: 'rgb(0,0,255)',
            dia: _Defaults.dia,
            blur: _Defaults.blur,
            blend: _Defaults.blend,
            opacity: _Defaults.opacity,
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
     * @param {*} nl
     * @returns boolean
     */
    const _fnIsNodeList = (nl) => {
        return nl ? typeof nl.item !== 'undefined' : false
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
    const _fnSupportsBlend = function () {
        const bSupported =
            typeof window.getComputedStyle(document.body).mixBlendMode !==
            'undefined'
        bSupported ? document.body.classList.add('mix-blend-mode') : ''
        return bSupported
    }

    /**
     * Builds the base syles for searchLights and prepends them to the head
     *
     * @returns DOM style element with content
     */
    const _fnSetBaseStyles = function () {
        const nBaseStyleEl = document.createElement('style')
        nBaseStyleEl.innerHTML = `.mix-blend-mode ${sL.sTargetClass} { position: absolute; will-change: transform, opacity; }`
        document.head.insertAdjacentElement('afterbegin', nBaseStyleEl)
    }

    /**
     * Set an element's opacity mode
     *
     * @param {*} n
     * @param {*} fOpacity
     */
    const _fnSetOpacity = function (n, fOpacity = sL.settings.opacity) {
        // test incoming values
        if (!_fnIsDOM(n) || typeof fOpacity !== 'number') return
        n.style.opacity = fOpacity
    }

    /**
     * Set an element's blend mode
     *
     * @param {*} n
     * @param {*} sBlend
     */
    const _fnSetBlending = function (n, sBlend = sL.settings.blend) {
        // test incoming values
        if (!_fnIsDOM(n) || typeof sBlend !== 'string') return
        n.style.mixBlendMode = sBlend
    }

    /**
     * Set an element's easing (transitionTimingFunction)
     *
     * @param {*} n
     * @param {*} sEasing
     */
    const _fnSetEasing = function (n, sEasing = sL.settings.easing) {
        // test incoming values
        if (!_fnIsDOM(n) || typeof sEasing !== 'string') return
        n.style.transitionTimingFunction = sEasing
    }

    /**
     * Set an element's transition in milliseconds
     *
     * @todo fix incoming number/string issue
     *
     * @param {*} n
     * @param {*} iTiming
     */
    const _fnSetTiming = function (n, iTiming = sL.settings.transition) {
        // test incoming values
        // if (!_fnIsDOM(n) || typeof iTiming !== 'number') return
        n.style.transitionDuration = iTiming + 'ms'
    }

    /**
     * Set an element's z-index
     *
     *
     * @param {*} n
     * @param {*} iZindex
     */
    const _fnSetZindex = function (n, iZindex = sL.settings.zIndex) {
        // test incoming values
        if (!_fnIsDOM(n) || typeof iZindex !== 'number') return
        n.style.zIndex = iZindex
    }

    /**
     * Create the sL.options object
     * by combining any provided user options with the _Defaults object.
     *
     * @param {*} oOpts
     */
    const _fnBuildOptionsObj = function (oOpts) {
        // Allow user to overrideing many API method with custom version, and merge in options object.
        sL = Object.assign(sL, oOpts)

        // see if there are any searchLight elements in the DOM, if so remove the default ones
        sL._nlHasDOM = document.querySelectorAll(sL.sTargetClass)

        // copy the _Defaults obj
        let oDefaultsCopy = { ..._Defaults }

        if (sL._nlHasDOM.length) {
            // Remove the template serchLtEls so they are not added
            delete oDefaultsCopy.srchLtEls
        }

        // create a new settings obj by merge the incoming options with oDefaultsCopy
        sL.settings = Object.assign({}, oDefaultsCopy, sL.options)

        // If the user didn't provide options.srchLtEls, or only partial options
        // then we merge any missing top level options into each el as default values.
        if (oOpts && oOpts.options.srchLtEls !== undefined) {
            sL.settings.srchLtEls.forEach((srchLtEl, i) => {
                srchLtEl = Object.assign(srchLtEl, oOpts.options.srchLtEls[i])
                srchLtEl = Object.assign({}, oDefaultsCopy, srchLtEl)
                // prevent Inception moment that creates a data-srchltels attr
                delete srchLtEl.srchLtEls
                sL.settings.srchLtEls[i] = srchLtEl
            })
        }

        // Now that we have set up Defaults, grab the parent to attach to
        sL._nSrchLtsParentNode = document.querySelector(sL.sParentEl)
    }

    /**
     * Add searchLight elements to DOM, apply inline styles, and render the Context.
     */
    const _fnAssembleSrchLtEls = function () {
        // Create nodeList of searchLight elememts
        sL.srchLtsElsNodeList = sL.m.fnCreateSrchLtEls(
            sL.settings.srchLtEls,
            sL.sTargetClass
        )

        // draw each element
        sL.srchLtsElsNodeList.forEach(function (el) {
            if (!_fnIsDOM(el)) return

            // create the 2d conext
            const oCtx = sL.m.fnCreateCtx(el, sL)

            // Set each element's specific styles
            sL.m.fnCenterOnPtr(el)

            // if bUseInlineStyles is true assign the styles to each element
            if (sL.bUseInlineStyles) {
                _fnSetBlending(el, oCtx.srchLt.blend)
                _fnSetOpacity(el, oCtx.srchLt.opacity)
                _fnSetEasing(el, oCtx.srchLt.easing)
                _fnSetTiming(el, oCtx.srchLt.timing)
            }

            // do any rendering on the elements
            sL.m.fnDraw(oCtx)
        })
    }

    // searchLights Public API methods

    sL.m = {}

    /**
     * Follow the pointer
     *
     * @param {*} e
     * @param {*} nl
     */
    sL.m.fnFollowPtr = function (e, nl) {
        if (!_fnIsNodeList(nl)) return

        nl.forEach(function (el) {
            el.style.left = e.pageX + 'px'
            el.style.top = e.pageY + 'px'
            sL.m.fnSrchLtElsShow(el, nl)
        })
    }

    /**
     * Takes an array of class names, and merges it with any provided string
     * It will strip empty values and remove any stray peroids(.) from user data
     * It returns the assembled string of classes.
     *
     * @param {*} aClasses
     * @param {*} s
     *
     * @returns string of css classes
     */
    sL.m.fnStringifyClassArray = function (aClasses = [], s = '') {
        // merge array with provided target class as string
        aClasses.push(s)

        // Remove empty array elememts
        aClasses = aClasses.filter(Boolean)

        // Make it a string, removing any full stops
        const sClasses = [...new Set(aClasses)].join(' ').replace(/[.]/g, '')

        return sClasses
    }

    /**
     * A terse debouce function
     *
     * @param {*} fn
     * @param {*} iDelay
     */
    sL.m._fnDbnce = (fn, iDelay = 300) => {
        let timer
        return (...args) => {
            clearTimeout(timer)
            timer = setTimeout(() => {
                fn(...args)
            }, iDelay)
        }
    }

    /**
     * Create canvas elements using either options.schLightEls array,
     * or Defaults.schLightEls if none exsits in DOM.
     * Returns the resulting DOM NodeList of canvas elements.
     *
     * @todo make the target for prepending configerable, ie
     *
     * @param {*} [aSrchLtEls=[]]
     * @param {*} sTargetClass
     * @returns
     */
    sL.m.fnCreateSrchLtEls = function (aSrchLtEls = [], sTargetClass) {
        // Otherwise create them
        aSrchLtEls.forEach(function (aSrchLtEls) {
            const nCanvas = document.createElement('canvas')
            // Add classes
            nCanvas.className = sL.m.fnStringifyClassArray(
                aSrchLtEls.classes,
                sTargetClass
            )

            // copy the current aSrchLtEls into a new object
            const aCopySrchLtEls = { ...aSrchLtEls }

            // remove the classes array
            delete aCopySrchLtEls.classes

            // turn any prtEl options into data attributes
            for (const property in aCopySrchLtEls) {
                if (aCopySrchLtEls[property]) {
                    nCanvas.setAttribute(
                        `data-${property}`,
                        `${aCopySrchLtEls[property]}`
                    )
                }
            }
            // Attach it to the DOM

            sL._nSrchLtsParentNode
                ? sL._nSrchLtsParentNode.prepend(nCanvas)
                : ''
        })
        // refresh the nodeList of searchlight elements now in the DOM
        const nlAllSrcLtsEls = document.querySelectorAll(sTargetClass)
        return nlAllSrcLtsEls ? nlAllSrcLtsEls : -1
    }

    /**
     * Creates a 2D context from the provided canvas element
     *
     * @param {*} canvasEl
     * @returns context object, with element data attrs attached
     */
    sL.m.fnCreateCtx = function (canvasEl) {
        // Teset for canvas DOM element
        if (canvasEl.tagName !== 'CANVAS') return

        const dia = Math.abs(parseInt(canvasEl.dataset.dia || sL.settings.dia))
        const blur = Math.abs(
            parseInt(canvasEl.dataset.blur || sL.settings.blur)
        )

        // Set height and width of canvas element
        canvasEl.width = dia + blur * 2
        canvasEl.height = dia + blur * 2

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
    sL.m.fnDraw = function (ctx) {
        if (ctx.constructor.name !== 'CanvasRenderingContext2D') return

        const dia = ctx.srchLt.dia
        const blur = parseInt(ctx.srchLt.blur)
        ctx.fillStyle = ctx.srchLt.color
        ctx.filter = 'blur(' + blur + 'px)'
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
     * Show the srchLt elements
     *
     * we can get away with using nodeList.forEach as it actyally has better support then mix-blend-mode (Edge 15)
     * https://caniuse.com/css-mixblendmode / https://caniuse.com/?search=nodeList.forEach
     *
     * @param {*} e
     * @param {*} nodeList
     */
    sL.m.fnSrchLtElsShow = function (e, nodeList) {
        if (!_fnIsNodeList(nodeList)) return

        // return typeof nodeList.item !== 'undefined'
        nodeList.forEach(function (el) {
            el.style.display = 'initial'
            el.style.opacity = el.dataset.opacity || sL.settings.opacity
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
    sL.m.fnSrchLtElsHide = function (e, nodeList) {
        // if (!_fnIsNodeList(nodeList)) return
        nodeList.forEach(function (el) {
            if (sL.bEnableShowHide) {
                // dial down the opacity
                el.style.opacity = '0'

                // Grab timing value of current element
                const timing = el.dataset.timing || sL.settings.timing

                // remove it from the DOM after transistion
                sL.m._fnDbnce(function () {
                    el.style.display = 'none'
                }, timing)()
            }
        })
    }

    /**
     * Adjusts the style property of a srchLt element so that the cursor is centered over it by default.
     * Uses translate3d in order to trigger hardware exceleration
     *
     * @param {*} el
     */
    sL.m.fnCenterOnPtr = function (el) {
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
    sL.fnPtrMoveCallbk = function () {}
    sL.fnPtrLeaveCallbk = function () {}
    sL.fnPtrEnterCallbk = function () {}

    /**
     * Sets up pointer event listeners onto the sL.settings.attach element
     *
     * @param {*} settings
     */
    sL.m.fnEventSetup = function () {
        const ptrs = sL.srchLtsElsNodeList
        const node = sL._nSrchLtsParentNode

        // register the event listener
        node.onpointermove = (e) => {
            // Track the pointer
            sL.m.fnFollowPtr(e, ptrs)
            sL.fnPtrMoveCallbk(e, sL)
        }
        node.onpointerenter = (e) => {
            sL.m.fnSrchLtElsShow(e, ptrs)
            sL.fnPtrEnterCallbk(e, sL)
        }
        node.onpointerleave = (e) => {
            sL.m.fnSrchLtElsHide(e, ptrs)
            sL.fnPtrLeaveCallbk(e, sL)
        }
    }

    /**
     * Public destroy method
     * removes event listeners
     * removes elements from DOM
     * Clears settings & options and ptrs objects
     */
    sL._destroy = function () {
        // Make sure we have already been initialised
        if (!sL.settings) return

        // Remove event listeners
        document.removeEventListener('onpointermove', sL.m.fnFollowPtr, false)
        document.removeEventListener(
            'onpointerenter',
            sL.m.fnSrchLtElsShow,
            false
        )
        document.removeEventListener(
            'onpointerleave',
            sL.m.fnSrchLtElsHide,
            false
        )

        // Remove elements from DOM
        sL.srchLtsElsNodeList.forEach(function (el) {
            el.remove()
        })

        // Nuke run time objects: settings, nodeLists ect
        delete sL.options
        delete sL.settings
        delete sL.srchLtsElsNodeList
    }

    /**
     * Public init method
     *
     * @param {*} options
     */
    sL._init = function (oOpts) {
        // Destroy any preexsiting initialisation
        sL._destroy()

        // Bail if browser dosen't support blending modes (see notes on safari)
        if (!_fnSupportsBlend()) return

        // Merge Defaults and user options into new sL.settings object
        _fnBuildOptionsObj(oOpts)

        // Add the base styles to head if bUseInlineStyles
        if (sL.bUseInlineStyles) _fnSetBaseStyles()

        // Draw each searchlight and add it to the DOM
        _fnAssembleSrchLtEls()

        // Set up event listeners
        sL.m.fnEventSetup()

        // return updated srchLts object
        return sL
    }

    // srcLts as public API
    return sL
})()
