/**
 * The base searchLights function.
 *
 * @param {object} options - searchlight options object.
 * @returns {object} searchLights - the searchLights object.
 */
export default function searchLights(options = {}) {
    // * Default element values
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
    _Defaults.aSrchLtElsOpts = [
        {
            classes: ['red', 'srchLts-def'],
            color: 'rgb(255,0,0)',
            dia: _Defaults.dia,
            blur: _Defaults.blur,
            blend: _Defaults.blend,
            opacity: _Defaults.opacity,
            timing: 400,
        },
        {
            classes: ['green', 'srchLts-def'],
            color: 'rgb(0,255,0)',
            dia: _Defaults.dia,
            blur: _Defaults.blur,
            blend: _Defaults.blend,
            opacity: _Defaults.opacity,
            timing: 425,
        },
        {
            classes: ['blue', 'srchLts-def'],
            color: 'rgb(0,0,255)',
            dia: _Defaults.dia,
            blur: _Defaults.blur,
            blend: _Defaults.blend,
            opacity: _Defaults.opacity,
            timing: 475,
        },
    ]

    // * Private internal helper methods
    /**
     * Test if provided element is a DOM node
     *
     * @param {DOM element} el
     * @returns {boolean}
     */
    const _fnIsDOM = (el) => el instanceof Element

    /**
     * Test for if provided value is a NodeList, through existence of item().
     *
     * @param {nodeList} nl
     * @returns {boolean}
     */
    const _fnIsNodeList = (nl) => (nl ? typeof nl.item !== 'undefined' : false)

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
     * @returns {boolean}
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
     * Use of display none helps prevent FOUC
     * We use opacity 0, so that opacity transitions rather then just 'appearing' on the screen.
     *
     * @returns {node} DOM style element with content
     */
    const _fnSetBaseStyles = function () {
        const nBaseStyleEl = document.createElement('style')
        nBaseStyleEl.innerHTML = `
.mix-blend-mode ${sL.sTargetClass} {
    position: absolute;
    will-change: transform, opacity, left, top;
}`
        nBaseStyleEl.setAttribute('srchlts', '')
        document.head.insertAdjacentElement('afterbegin', nBaseStyleEl)
    }

    /**
     * Set an element's opacity mode
     *
     * @param {node} n
     * @param {float} fOpacity
     */
    const _fnSetOpacity = function (n, fOpacity = sL.settings.opacity) {
        // test incoming values
        if (!_fnIsDOM(n) || typeof fOpacity !== 'number') return
        n.style.opacity = fOpacity
    }

    /**
     * Set an element's blend mode
     *
     * @param {node} n
     * @param {string} sBlend
     */
    const _fnSetBlending = function (n, sBlend = sL.settings.blend) {
        // test incoming values
        if (!_fnIsDOM(n) || typeof sBlend !== 'string') return
        n.style.mixBlendMode = sBlend
    }

    /**
     * Set an element's easing (transitionTimingFunction)
     *
     * @param {node} n
     * @param {string} sEasing
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
     * @param {node} n
     * @param {int} iTiming
     */
    const _fnSetTiming = function (n, iTiming = sL.settings.transition) {
        // if (!_fnIsDOM(n) || typeof iTiming !== 'number') return
        n.style.transitionDuration = iTiming + 'ms'
    }

    /**
     * Set an element's z-index
     *
     *
     * @param {node} n
     * @param {int} iZindex
     */
    const _fnSetZindex = function (n, iZindex = sL.settings.zIndex) {
        // test incoming values
        if (!_fnIsDOM(n) || typeof iZindex !== 'number') return
        n.style.zIndex = iZindex
    }

    /**
     * PointerFollow Event Listener callback
     *
     * @param {event object} e
     */
    const _fnPointerFollow = function (e) {
        sL.m.fnFollowPtr(e, sL._data._nlSrchLtsEls)
        sL.fnPtrMoveCallbk(e, sL)
    }

    /**
     * PointerEnter Event Listener callback
     *
     * @param {event object} e
     */
    const _fnPointerEnter = function (e) {
        sL.m.fnSrchLtElsShow(sL._data._nlSrchLtsEls, e, sL)
        sL.fnPtrEnterCallbk(e, sL)
    }

    /**
     *   PointerLeave Event Listener callback
     *
     * @param {event object} e
     */
    const _fnPointerLeave = function (e) {
        sL.m.fnSrchLtElsHide(sL._data._nlSrchLtsEls, e, sL)
        sL.fnPtrLeaveCallbk(e, sL)
    }

    /**
     * Create the sL.options object
     * by combining any provided user options with the _Defaults object.
     *
     * @param {object} oOptions
     */
    const _fnBuildSettingsObj = function (oOptions) {
        // copy the _Defaults obj so we dont accidently mutate it
        let oDefaultsCopy = { ..._Defaults }

        // Allow user to override any API method by including tehm with their options object.
        sL = Object.assign(sL, oOptions)

        // do we have any current elements in the DOM?
        const nlCurrentEls = document.querySelectorAll(sL.sTargetClass)

        // TODO cleanup
        if (
            sL._data._aDOMhadEls.length &&
            oOptions &&
            oOptions.aSrchLtElsOpts === 'undefined'
        ) {
            // delete the _Default.aSrchLtElsOpts
            // if we've had DOM els, and we're not reciving any oOptions.aSrchLtElsOpts
            delete oDefaultsCopy.aSrchLtElsOpts
        } else {
            // TODO cleanup
            // if we found some previously
            if (nlCurrentEls.length) {
                // delete the _Default.aSrchLtElsOpts
                // if we have some in the DOM already
                delete oDefaultsCopy.aSrchLtElsOpts
            }

            if (!sL._data._aDOMhadEls.length) {
                // We've not been here before
                // Turn the node list into an array
                sL._data._aDOMhadEls = [...nlCurrentEls]
                // Add our custom parentNode prop to each el,
                // as el.parentNode is lost after removal from DOM
                sL._data._aDOMhadEls.forEach(function (n, i) {
                    n.srchLtParentNode = sL._data._aDOMhadEls[i].parentNode
                    n.srchLtPeviousElementSibling =
                        sL._data._aDOMhadEls[i].previousElementSibling
                })
            }
        }
        // create a new settings obj by merge the incoming options with oDefaultsCopy
        sL.settings = Object.assign({}, oDefaultsCopy, sL.options)

        // If the user didn't provide options.aSrchLtElsOpts, or only partial options
        // then we merge any missing top level options into each el as default values.
        if (oOptions && oOptions.options.aSrchLtElsOpts !== undefined) {
            sL.settings.aSrchLtElsOpts.forEach((srchLtEl, i) => {
                srchLtEl = Object.assign(
                    srchLtEl,
                    oOptions.options.aSrchLtElsOpts[i]
                )
                srchLtEl = Object.assign({}, oDefaultsCopy, srchLtEl)
                // prevent Inception moment that later creates a data-srchltels[obj] attr
                delete srchLtEl.aSrchLtElsOpts
                sL.settings.aSrchLtElsOpts[i] = srchLtEl
            })
        }

        // Now that we have set up Defaults, grab the parent to attach to
        sL._data._nSrchLtsParent = document.querySelector(sL.sParentEl)
    }

    /**
     * Add searchLight elements to DOM, apply inline styles, and render the Context.
     */
    const _fnAssembleSrchLtEls = function () {
        sL._data._nlSrchLtsEls = sL.m.fnCreateSrchLtEls(
            sL.settings.aSrchLtElsOpts,
            sL.sTargetClass
        )

        if (sL._data._nlSrchLtsEls) {
            // draw each element
            sL._data._nlSrchLtsEls.forEach(function (el) {
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
                    _fnSetZindex(el, oCtx.srchLt.zindex)
                }

                // do any rendering on the elements
                sL.m.fnDraw(oCtx)
            })
        }
    }

    // * The public searchLights object
    let sL = {}

    // Default parent to attach searchLight elements to
    sL.sParentEl = 'body'
    // Default seachLight element class
    sL.sTargetClass = '.searchlight'
    // Prevent most inline styles on serchLight elements
    sL.bUseInlineStyles = true
    // Enables the hiding of searchLight elements when the pointer exits the parent El
    sL.bEnableShowHide = true

    // * searchLight Private objects
    sL._data = {}
    // An array of captured srchLt DOM api elements if they exsist on first load
    sL._data._aDOMhadEls = []
    //  A nodeList of current srchLt elemtnts
    sL._data._nlSrchLtsEls
    // The srchLts parent node
    sL._data._nSrchLtsParent

    // * searchLights Public API methods
    sL.m = {}

    /**
     * Follow the pointer
     *
     * @param {event object} e
     * @param {nodeList} nl
     */
    sL.m.fnFollowPtr = function (e, nl) {
        if (!_fnIsNodeList(nl)) return

        nl.forEach(function (el) {
            el.style.left = e.pageX + 'px'
            el.style.top = e.pageY + 'px'
        })
        sL.m.fnSrchLtElsShow(nl, e, sL)
    }

    /**
     * Takes an array of class names, and merges it with any provided string
     * It will strip empty values and remove any stray peroids(.) from user data
     * It returns the assembled string of classes.
     *
     * @param {array} aClasses
     * @param {string} s
     *
     * @returns string of css classes
     */
    sL.m.fnStringifyClassArray = function (aClasses = [], s = '') {
        // Leave the origional array alone
        let aClassesCopy = [...aClasses]
        // merge with provided string
        aClassesCopy.push(s)
        // Remove fasey elememts
        aClassesCopy.filter(Boolean)
        // Remove duplicates
        aClassesCopy = [...new Set(aClassesCopy)]
        // Return string, removing full stops and extra spaces
        return aClassesCopy.join(' ').replace(/\s\s+/g, ' ').replace(/[.]/g, '')
    }

    /**
     * A terse debouce function
     *
     * @param {function} fn
     * @param {int} iDelay
     * @returns {function}
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
     * Create canvas elements using provided array of aSrchLtElsOpts
     * Returns the resulting DOM NodeList of canvas elements.
     *
     *
     * @param {array} [aSrchLtElsOpts]
     * @param {string} sTargetClass
     * @returns {nodeList}
     */
    sL.m.fnCreateSrchLtEls = function (
        aSrchLtElsOpts = [],
        sTargetClass = sL.sTargetClass
    ) {
        if (aSrchLtElsOpts.length) {
            // We have element options, so create them
            const htmlTemp = document.createDocumentFragment()
            aSrchLtElsOpts.forEach(function (aSrchLtElsOpts) {
                const nCanvas = document.createElement('canvas')
                // Add classes
                nCanvas.className = sL.m.fnStringifyClassArray(
                    aSrchLtElsOpts.classes,
                    sTargetClass
                )

                // copy the current aSrchLtElsOpts into a new object
                const aCopySrchLtEls = { ...aSrchLtElsOpts }

                // remove the classes array
                delete aCopySrchLtEls.classes

                // turn any incoming settings.aSrchLtElsOpt into data attributes
                // used for showHide and other flags
                for (const property in aCopySrchLtEls) {
                    if (aCopySrchLtEls[property]) {
                        nCanvas.setAttribute(
                            `data-${property}`,
                            `${aCopySrchLtEls[property]}`
                        )
                    }
                }
                htmlTemp.prepend(nCanvas)
            })

            // Attach it to the DOM
            sL._data._nSrchLtsParent
                ? sL._data._nSrchLtsParent.prepend(htmlTemp)
                : ''
        }
        // refresh the nodeList of searchlight elements now in the DOM
        const nlAllSrcLtsEls = document.querySelectorAll(sTargetClass)
        return nlAllSrcLtsEls ? nlAllSrcLtsEls : -1
    }

    /**
     * Creates a 2D context from the provided canvas element
     * sanitise dataset values used in drawing
     *
     * @param {node} canvasEl
     * @returns {object} context object, with element data attrs attached
     */
    sL.m.fnCreateCtx = function (canvasEl) {
        // If its not a canvas el, return the element
        if (canvasEl.tagName !== 'CANVAS') return canvasEl

        const dia = Math.abs(parseInt(canvasEl.dataset.dia || sL.settings.dia))
        const blur = Math.abs(
            parseInt(canvasEl.dataset.blur || sL.settings.blur)
        )

        // Set height and width of canvas element
        canvasEl.width = dia + blur * 2
        canvasEl.height = dia + blur * 2
        canvasEl.setAttribute('hidden', '')

        const ctx = canvasEl.getContext('2d')

        // copy the current aSrchLtElsOpts into a new object
        let oSlsettingsCopy = 'settings' in sL ? { ...sL.settings } : {}

        // Merge the data attrs with settings into ctx object for future use
        ctx.srchLt = { ...oSlsettingsCopy, ...canvasEl.dataset }

        return ctx
    }

    /**
     * Draw elements in provided rendering context
     * You could also use values from ctx.canvas.dataset.x,
     * but we have them in ctx.srchLt.x, with dia and blur sanitised
     * as well as all top level sL.settings, if they were missing off the origional element.
     * Any custom data-attrs are included as well.
     *
     * @param {object} ctx
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
     *
     * @param {event object} e
     * @param {nodeList} nodeList
     * @param {object} searchLight object
     */
    sL.m.fnSrchLtElsShow = function (nodeList, e, sL = {}) {
        if (!_fnIsNodeList(nodeList)) return
        nodeList.forEach(function (el) {
            el.removeAttribute('hidden')
            const timing = el.dataset.timing || sL.settings.timing
            sL.m._fnDbnce(function () {
                el.style.opacity = el.dataset.opacity || sL.settings.opacity
            }, timing)()
        })
    }

    /**
     * Hide the srchLt elements with a nice opacity decay based on the element's timing.
     *
     *
     * @param {event object} e
     * @param {nodeList} nodeList
     * @param {object} searchLight object
     */
    sL.m.fnSrchLtElsHide = function (nodeList, e, sl = {}) {
        if (!nodeList) return
        nodeList.forEach(function (el) {
            if (sL.bEnableShowHide) {
                // dial down the opacity
                el.style.opacity = '0'

                // Grab timing value of current element
                const timing = el.dataset.timing || sL.settings.timing

                // hide DOM after transistion completed
                sL.m._fnDbnce(function () {
                    el.setAttribute('hidden', '')
                }, timing)()
            }
        })
    }

    /**
     * Adjusts the style property of a srchLt element so that the cursor is centered over it by default.
     * Uses translate3d in order to trigger hardware exceleration
     *
     * @param {node} n
     */
    sL.m.fnCenterOnPtr = function (n) {
        if (!_fnIsDOM(n)) return
        n.style.transform =
            'translate3d(  ' + -n.width / 2 + 'px, ' + -n.height / 2 + 'px, 0)'
    }

    /**
     * Sets up event listeners onto the sL._data._nSrchLtsParent element
     * TODO: Does this need to be public?
     */
    sL.m.fnEventsCreate = function () {
        const node = sL._data._nSrchLtsParent
        node.addEventListener('pointermove', _fnPointerFollow, false)
        node.addEventListener('pointerEnter', _fnPointerEnter, false)
        node.addEventListener('pointerleave', _fnPointerLeave, false)
    }

    /**
     * Destroy event listeners on the sL._data._nSrchLtsParent element
     * TODO: Does this need to be public?
     */
    sL.m.fnEventsDestroy = function () {
        const node = sL._data._nSrchLtsParent

        node.removeEventListener('pointermove', _fnPointerFollow, false)
        node.removeEventListener('pointerenter', _fnPointerEnter, false)
        node.removeEventListener('pointerleave', _fnPointerLeave, false)
    }

    /**
     * Public  callback methods
     */
    sL.fnPtrMoveCallbk = function () {}
    sL.fnPtrLeaveCallbk = function () {}
    sL.fnPtrEnterCallbk = function () {}

    /**
     * Build DOM elements
     * Takes an array of elements and adds them to the DOM.
     * Defaults to any previliously captured srcLt els
     * if a target node is provided it will append to it,
     * otherwise it will look for our custom node attribute el.srchLtParentNode
     *
     * @param {arrat} [els=sL._data._aDOMhadEls]
     * @param {string} [nTarget='']
     * @returns
     */
    sL._build = function (els = sL._data._aDOMhadEls, nTarget = '') {
        if (els && els.length) {
            // have we been provided a target node?
            if (_fnIsDOM(nTarget)) {
                const htmlTemp = document.createDocumentFragment()
                els.forEach(function (el, i) {
                    els[i].htmlTemp.appendChild(el)
                })
                // this is more efficent for large numbers of elements...
                nTarget.appendChild(htmlTemp)
            } else {
                // otherwise, do the els have a custom srchLtParentNode?
                els.forEach(function (el, i) {
                    if (_fnIsDOM(els[i].srchLtParentNode)) {
                        els[i].srchLtParentNode.appendChild(el)
                    }
                })
            }
        }
        return sL
    }

    /**
     * Public destroy method
     * removes event listeners, srchLtEls
     * Clears settings & options and ptrs objects
     */
    sL._destroy = function () {
        // Make sure we have already been initialised

        if (!sL.settings) return

        // Remove event listeners
        sL.m.fnEventsDestroy()
        // Remove elements we built from Options and added to DOM
        // Not ALL srchLt elements that may have been on the DOM initially
        if (sL._data._nlSrchLtsEls) {
            console.log('destroying')
            sL._data._nlSrchLtsEls.forEach(function (el) {
                el.setAttribute('hidden', '')
                el.remove()
            })
        }

        // Nuke run time objects: settings, nodeLists ect
        delete sL.options
        delete sL.settings
        delete sL._data._nlSrchLtsEls
        delete sL._data._nSrchLtsParent
        // * sL._data._aDOMhadEls is not destroyed so that we have the option to _build() them in future.

        // reset callbacks
        sL.fnPtrMoveCallbk = function () {}
        sL.fnPtrLeaveCallbk = function () {}
        sL.fnPtrEnterCallbk = function () {}

        // remove the style element
        const styleEL = document.querySelector('style[srchlts]')
        styleEL ? styleEL.remove() : ''

        return sL
    }

    /**
     * Public init method
     *
     * @param {object} options
     */
    sL._init = function (oOptions) {
        // Destroy any preexsiting initialisation
        sL._destroy()

        // Bail if browser dosen't support blending modes (see notes on safari)
        if (!_fnSupportsBlend()) return

        // Add the base styles to head if bUseInlineStyles
        if (sL.bUseInlineStyles) _fnSetBaseStyles()

        // Merge Defaults and user options into new sL.settings object
        _fnBuildSettingsObj(oOptions)

        // Draw each searchlight and add it to the DOM
        _fnAssembleSrchLtEls()

        // Create event listeners
        sL.m.fnEventsCreate()

        // return updated srchLts object
        return sL
    }
    // return public API
    return sL
}
