window.onload = () => {
    let toBeTyped = []

    let typeme_elements = document.querySelectorAll('.typeme')

    for (const elem of typeme_elements) {
        if (document.getElementById('tf'+elem.id) || elem.classList.contains('reveal'))
            toBeTyped.push(elem.id)
    }

    typeInOrder = (i) => {
        if (i >= toBeTyped.length) return

        const elem = document.getElementById(toBeTyped[i])

        if (elem.classList.contains('reveal')) {
            elem.style.opacity = '1'
            typeInOrder(++i)
            return
        }

        type(toBeTyped[i], typeWriter_speed, () => {
            typeWriter_speed = typeWriter_speed/2
            typeInOrder(++i)
        })
    }

    typeInOrder(0)
}



function type(id, speed, opt_callback, cb_i) {
    let i = cb_i || 0
    const elem = document.getElementById(id)
    const text = document.getElementById('tf' + id).innerText


    if (i < text.length) {
        elem.innerHTML += text.charAt(i)
        i ++
        setTimeout(() => {
            type(id, speed, opt_callback, i)
        }, speed)
    } else {
        if (opt_callback) setTimeout(opt_callback, speed*2)
    }
}