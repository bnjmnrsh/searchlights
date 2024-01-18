import '../src/searchlights.js'
import { describe, expect, it } from 'vitest'

describe('test if _build() and _destroy() work', () => {
    document.body.innerHTML = `<div></div>`
    const sl = window.searchLights()._init()
    const sldata = { ...sl._data }

    it('test if searchLight elements are created on the dom', () => {
        let nodes = document.querySelectorAll('.searchlight')
        // Default number of searchlights
        expect(nodes.length).toBe(3)
    })
    it('test if searchLights()._destroy() nukes them out of the DOM', () => {
        sl._destroy() // nuke them all
        let nodes = document.querySelectorAll('.searchlight')
        expect(nodes.length).toBe(0)
    })
    // At present _build is unreachable due to limitations with jsdom and calling appendChild on documentFragment
    //
    // it('test if searchLights()._build() creates new ones', () => {
    //     const els = `<canvas class="searchlight dom-api" data-color="red" data-blend="normal" data-dia="20" data-blur="3" data-timing="900" data-food="tacos" data-z="1" hidden></canvas>
    //     <canvas class="searchlight dom-api" data-color="rgb(0,0,255)" data-blend="exclusion" data-dia="70" data-blur="3" data-easing="ease-out" data-timing="500" data-opacity="1" hidden></canvas>
    //     <canvas class="searchlight dom-api" data-color="green" data-blend="exclusion" data-dia="70" data-blur="3" data-easing="ease-out" data-timing="90" data-opacity="1" hidden></canvas>`

    //     const htmlTemp = document.createElement('div')
    //     htmlTemp.innerHTML = els
    //     const canvases = htmlTemp.querySelectorAll('canvas')
    //     sl._build(canvases, document.body) // build new ones
    //     let nodes = document.querySelectorAll('.searchlight')
    //     expect(nodes.length).toBe(3)
    // })
})
