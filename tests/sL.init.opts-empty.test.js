'use strict'
//github.com/suchipi/test-it
import searchLights from '../src/searchlights.js'

// console.log(searchLights._init().settings)

describe('_init() without options', () => {
    document.body.innerHTML = `<div></div>`

    it('should populate sL.settings with _Defaults values', () => {
        const defaultOutput = searchLights._init()

        expect(searchLights._init()).toMatchSnapshot()
    })
})
