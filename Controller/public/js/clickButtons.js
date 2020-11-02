const buttons = document.querySelectorAll('button')

for (let btn of buttons) {
    btn.onclick = () => {
        goFetch('/doAction', {'action': btn.innerText}, (res, data) => {
            alert(res, data)
        })
    }
}


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

			if (delivery_status !== 200 || !server_response.res) {
				if (opt_callback) opt_callback(false, server_response.err)
				return
			}

			if (opt_callback) opt_callback(true, server_response.body)
		})
}