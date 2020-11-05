const { log, table } = console

// constant variables

let typeWriter_speed = 100


// core funktioner

function goFetch(route, data, opt_callback) {
	fetch(route, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json'
		},
		redirect: 'follow',
		referrerPolicy: 'no-referrer',
		body: JSON.stringify(data)
	})
		.then(r =>  r.json().then(data => ({status: r.status, body: data})))
		.then(obj => {
			let delivery_status = obj.status
			let server_response = obj.body

			if (delivery_status != 200 || !server_response.res) {
				if (opt_callback) opt_callback(false, server_response.err)
				return
			}

			if (opt_callback) opt_callback(true, server_response.body)
		})
}





function toggleBtn(query, opt_text) {
	const btn = document.querySelector(query ||'button[type=submit]')

	let texts = opt_text || ['Log ind', 'Logger ind...']

	btn.disabled = !btn.disabled
	btn.querySelectorAll('span')[1].innerText = ' ' + texts[Number(btn.disabled)]
	btn.querySelectorAll('span')[0].hidden = !btn.disabled
}



function checkInput(input, opt_event, opt_fixedOutcome) {
	if (opt_event) opt_event.preventDefault()

	if ( !opt_fixedOutcome && (input.value != '' && (input.type != 'fullname' || input.value.length > 5 ))) {
		input.classList.remove('is-invalid')
		input.classList.add('is-valid')
		return true
	} else {
		input.classList.remove('is-valid')
		input.classList.add('is-invalid')
		return false
	}
}




const capitalize = (s) => {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
}




