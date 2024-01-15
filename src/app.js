// Test Suite
const test = {
    options: {
        opacity: 0.8,
        blend: 'difference',
        dia: 400,
        blur: 6,
    },
}

test.options.ptrEls = [
    {
        classes: ['test', 'blue'],
        color: 'rgb(33, 27, 27)',
        dia: test.options.dia,
        blur: 0.1,
        opacity: test.options.opacity,
        blend: 'screen',
        easing: 'ease-in',
        timing: 20,
    },
    {
        classes: ['red'],
        color: 'rgb(15,30,200)',
        dia: 300,
        blur: -2,
        blend: test.options.blend,
        opacity: 1,
    },
    {
        classes: ['green'],
        color: 'rgb(15,200,30)',
        dia: 110,
        opacity: test.options.opacity,
    },
]
test.ptrMoveCallbk = searchLights.dbnce(() => console.log('movement'), 500)

// const pointerEls = document.querySelectorAll('.searchLights')

// const ptrsZindex = function (z) {
//     console.log('pointer stopped')
//     let zVal = getComputedStyle(document.documentElement).getPropertyValue(
//         '--ptrs-z-index'
//     ) // #999999
//     console.log(zVal)

//     if (zVal == 100) {
//         zVal = -1
//     } else {
//         zVal = 100
//     }
//     console.log(zVal)
//     document.documentElement.style.setProperty('--ptrs-z-index', zVal)
// }

// document.addEventListener('srchLtsPtrHalted', ptrsZindex, false)

// document.addEventListener(
//     'pointermove',
//     searchLights.dbnce(() => ptrsZindex(), 400),
//     false
// )

searchLights.init(test)
