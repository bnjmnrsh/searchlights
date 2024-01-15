'use strict'
//github.com/suchipi/test-it
import searchLights from '../src/searchlights.js'

// console.log(searchLights._init().settings)

describe('_init() sL.settings without base options, but with aSrchLtElsOpts', () => {
    document.body.innerHTML = `<div></div>`
    it('should replace the missing aSrchLtElsOpts vals with _Defaults', () => {
        const test = {
            options: {
                aSrchLtElsOpts: [
                    {
                        classes: ['test-a', 'blue'],
                        color: 'rgb(33, 27, 27)',
                        dia: 300,
                        blur: 1,
                        opacity: 0.5,
                        blend: 'screen',
                        easing: 'ease-in',
                        timing: 200,
                    },
                    {
                        classes: ['test-a', ' red'],
                        color: 'rgb(15,30,200)',
                        dia: 250,
                        blur: 2,
                        blend: 'normal',
                        opacity: 1,
                    },
                    {
                        classes: ['test-a', 'green'],
                        color: 'rgb(15,200,30)',
                        opacity: 0.5,
                    },
                ],
            },
        }

        expect(searchLights._init(test.aSrchLtElsOpts)).toMatchSnapshot()
    })
})
