import '../src/searchlights.js'
import { describe, expect, it } from 'vitest'

describe('_init() without options', () => {
    document.body.innerHTML = `<div></div>`

    it('should populate sL.settings with _Defaults values', () => {
        const sl = window.searchLights()._init()
        const comparison =
            '{"blur":3,"dia":100,"blend":"screen","opacity":0.8,"easing":"ease-out","timing":90,"zindex":0,"aSrchLtElsOpts":[{"classes":["red","srchLts-def"],"color":"rgb(255,0,0)","dia":100,"blur":3,"blend":"screen","opacity":0.8,"timing":400},{"classes":["green","srchLts-def"],"color":"rgb(0,255,0)","dia":100,"blur":3,"blend":"screen","opacity":0.8,"timing":425},{"classes":["blue","srchLts-def"],"color":"rgb(0,0,255)","dia":100,"blur":3,"blend":"screen","opacity":0.8,"timing":475}]}'
        expect(JSON.stringify(sl.settings)).toEqual(comparison)
    })
})
