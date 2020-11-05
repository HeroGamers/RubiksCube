const buttons = document.querySelectorAll('button')

for (let btn of buttons) {
    btn.onclick = () => {
		let input_fields = document.getElementsByTagName("input")

		let data_dict = {}

		for (let field of input_fields) {
			let field_class_list = field.className.split(" ")
			for (let class_name of field_class_list) {
				data_dict["Input."+class_name] = field.value
			}
		}

		Object.keys(localStorage).forEach(function(key){
			data_dict["LocalStorage."+key] = localStorage.getItem(key)
		})

		console.log(data_dict)

        goFetch('/doAction', {'action': btn.innerText, "data": data_dict}, (res, data) => {
			// alert(data)
			if (res === true) {
				if (data.toString().includes("Done")) {
					let text_field = document.getElementsByClassName("solvemoves")[0]
					if (text_field) {
						text_field.style.cssText = text_field.style.cssText.replace("display: none", "display: block")
						text_field.textContent = data
					}

					localStorage.solveMoves = data.toString().replace("Done solving the cube, here are the moves: ", "")
				} else if (data.toString().includes("cube state")) {
					let text_field = document.getElementsByClassName("cubestate")[0]
					if (text_field) {
						text_field.style.cssText = text_field.style.cssText.replace("display: none", "display: block")
						text_field.textContent = data
					}

					localStorage.cubeState = data.toString().replace("Current cube state: ", "")
				} else if (data.toString().includes("message has been sent from the")) {
					let text_field = document.getElementsByClassName("clientmessage")[0]
					if (text_field) {
						text_field.style.cssText = text_field.style.cssText.replace("display: none", "display: block")
						text_field.textContent = data
					}

					localStorage.clientMessage = data.toString().replace("A message has been sent from the client: ", "")
				} else {
					alert(data)
				}
			}
			else {
				alert("Error: "+data)
			}
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
			console.log(delivery_status, server_response)

			if (delivery_status !== 200 || !server_response.res) {
				if (opt_callback) opt_callback(false, server_response.err)
				return
			}

			if (opt_callback) opt_callback(true, server_response.body)
		})
}