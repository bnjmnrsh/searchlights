import '../src/searchlights.js'
import { describe, expect, it } from 'vitest'

describe('_init() with options.', () => {
    document.body.innerHTML = `<div></div>`
    it('should accept an options object and populate sL.options with the values provided.', () => {
        const opts = {
            sParentEl: 'body',
            sTargetClass: '.searchlight',
            bUseInlineStyles: true,
            bEnableShowHide: true,
            options: {
                blur: 2,
                dia: 200,
                blend: 'difference',
                opacity: 0.2,
                easing: 'ease',
                timing: 20,
                zindex: 1,
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
                        width: '30px',
                        height: '30px',
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

        const comparison =
            '{"blur":2,"dia":200,"blend":"difference","opacity":0.2,"easing":"ease","timing":20,"zindex":1,"aSrchLtElsOpts":[{"blur":1,"dia":300,"blend":"screen","opacity":0.5,"easing":"ease-in","timing":200,"width":"30px","height":"30px","color":"rgb(33, 27, 27)","zindex":0,"classes":["test-a","blue"]},{"blur":2,"dia":250,"blend":"normal","opacity":1,"easing":"ease-out","timing":90,"color":"rgb(15,30,200)","zindex":0,"classes":["test-a"," red"]},{"blur":3,"dia":100,"blend":"screen","opacity":0.5,"easing":"ease-out","timing":90,"color":"rgb(15,200,30)","zindex":0,"classes":["test-a","green"]}]}'

        const sl = window.searchLights()._init(opts)
        expect(JSON.stringify(sl.options)).toEqual(comparison)
    })
})
