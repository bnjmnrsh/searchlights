import '../src/searchlights.js'
import { describe, expect, it } from 'vitest'

describe('_init() with options, no aSrchLtElsOpts', () => {
    document.body.innerHTML = `<div>
        <!-- Load searchlights from canvas element -->
        <canvas class="searchlight dom-api" data-color="red" data-blend="normal" data-dia="20" data-blur="3" data-timing="900" data-food="tacos" data-z="1" hidden></canvas>
    </div>`

    it('should generate a CanvasRenderingContext2D from the provided canvas element with a pre-defined srchLt object attached from data attributes', () => {
        const comparison = {
            blur: '3',
            dia: '20',
            blend: 'normal',
            opacity: 0.8,
            easing: 'ease-out',
            timing: '900',
            width: undefined,
            height: undefined,
            color: 'red',
            zindex: 0,
            food: 'tacos',
            z: '1',
        }

        const sl = window.searchLights()._init()
        // Create CanvasRenderingContext2D object
        const ctx = sl.m.fnCreateCtx(sl._data._aDOMhadEls[0])
        // console.log(ctx.srchLt)
        expect(ctx.srchLt).toEqual(comparison)
    })
})
