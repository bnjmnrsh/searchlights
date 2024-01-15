'use strict'
//github.com/suchipi/test-it
import searchLights from '../src/searchlights.js'

// console.log(searchLights._init().settings)

describe('_init() with options, no aSrchLtElsOpts', () => {
    // document.body.innerHTML = `<div></div>`
    it('the sL.settings object should  use _Default.aSrchLtElsOpts to populate els options', () => {
        const opts = {
            options: {
                blur: 2,
                dia: 200,
                blend: 'difference',
                opacity: 0.2,
                easing: 'ease',
                timing: 20,
                zindex: 1,
            },
        }

        expect(searchLights._init(opts)).toMatchSnapshot()
    })
})
