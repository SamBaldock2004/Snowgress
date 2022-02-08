//Allows instructor to create his own tricks to then set to muliple students
//Acts a save function


//Getting web token
const apiUrl = ''									
const authToken = 'Bearer ' + (getCookie('auth_token') || getCookie('task_manager_auth_token'))		
var todoItems = []									
hookMessageTags()										

//Loads web page first
//3 main event listeners for the trick creation, editing and logout
document.addEventListener('DOMContentLoaded', handlerDomLoaded)								
document.querySelector('#input-form').addEventListener('submit', handleSubmitForm)				
document.querySelector('#todo-list').addEventListener('click', handleTodoListButtonClicks)		
document.querySelector('#btn-logout').addEventListener('click', handleLogout);					

// Loads all existing tricks
async function handlerDomLoaded() {

	try {
		const response = await fetch(apiUrl + '/tasks', {
			credentials: 'include',
			headers: {
				Authorization: authToken
			}
		})				
		if (response.ok) {
			todoItems = await response.json()					
		} else {
			throw `Failed to retrieve existing Task data! ${response.statusText} - ${response.status}`
		}
	} catch (err) {
		message1.textContent = 'ERROR!'
		message2.textContent = err
		message3.textContent = "Unable to GET All Tasks! Logout and Login then try again!"
		throw message3.textContent
	}

	if (todoItems.length) {
		todoItems.forEach( item => updatePageDom(item) )
	} 
}

//Creates trick when submit (create button) is pressed
function handleSubmitForm(event) {
	event.preventDefault()		
	clearMessages()			
	const input = document.querySelector('#input-field')
	const inputValue = stripHTML(input.value).trim()		

	if (inputValue != '') {
		addTodo(inputValue)
	}
	input.focus()
	input.value = ''			
}

//Checks for any button press on presaved tricks (editing)
async function handleTodoListButtonClicks(event) {
	const parentItemId = event.target.parentElement.id.replace('item-','')
	console.log(parentItemId)

	try {
		const response = await fetch(apiUrl + '/users/me', {
			credentials: 'include',
			headers: {
				Authorization: authToken
			}
		})	
		result = await response.json()			
		if (response.ok) {
			console.log(result._id)				
		} else {
			throw `Failed to retrieve existing Task data! ${response.statusText} - ${response.status}`
		}
	} catch (err) {
		message1.textContent = 'ERROR!'
		message2.textContent = err
		message3.textContent = "Unable to GET All students! Logout and Login then try again!"
		throw message3.textContent
	}


	switch (event.target.name) {		
		case 'btn-edit':
			clearMessages()
			return editTodo(parentItemId)
			break;
		case 'btn-send':
			clearMessages()
			try {
				console.log('try')
				const response = await fetch(apiUrl + '/tasks/' + parentItemId + '/' + result._id,  {
					credentials: 'include',
					headers: {
						Authorization: authToken
					}
				})	
				if (response.ok) {
					trick = await response.json()
					console.log(trick)
				} else {
					throw `Failed to retrieve existing Task data! ${response.statusText} - ${response.status}`
				}
			} catch (err) {
				message1.textContent = 'ERROR!'
				message2.textContent = err
				message3.textContent = "Unable to GET All students! Logout and Login then try again!"
				throw message3.textContent
			}
			const parentItemName = trick[0].description
			console.log(parentItemName)
			localStorage.setItem('trick-description', parentItemName);
			window.location.href = "/set-trick.html"		
			break;
		case 'btn-delete':
			clearMessages()
			return deleteTodo(parentItemId, result._id)
	}
}

//Logout function
async function handleLogout(event) {
	clearMessages()
	try {
		const ignored = await fetch(apiUrl + '/users/logout', {
			credentials: 'include',
			method: 'POST',
			headers: { Authorization: authToken }
		})
	} catch (err) {
		message2.textContent = 'Warning: Unable to fully logout!'
		console.log('Error! Unable to POST logout!');
		console.log(err)
	}
	
	setCookie('auth_token', 'deleted', -1)					
	setCookie('task_manager_auth_token', 'deleted', -1)		
	window.location.href = "login.html"
}

//Add/create a trick
async function addTodo(text) {
	let todo = {
		description: text,
		completed: false	
	}

	try {
		const response = await fetch(apiUrl + '/tasks', {
			credentials: 'include',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: authToken
			},
			body: JSON.stringify(todo)
		})
		if (response.ok) {
			todo = await response.json()				
		} else {
			throw `Failed Adding Task! ${response.statusText} - ${response.status}`
		}
	} catch (err) {
		message1.textContent = 'ERROR!'
		message2.textContent = err
		message3.textContent = "Unable to POST new Task!"
		console.log(text)
		throw message3.textContent
	}
	todoItems.push(todo)
	updatePageDom(todo)
}

//Update page if any new tricks are created/edited
function updatePageDom(todo) {
	let todoList = document.querySelector('#todo-list')
	const existingItem = todoList.querySelector(`#item-${todo._id}`)

	if (todo.deleted) {														
	}

	let newListItem = document.createElement('li')
	newListItem.id = `item-${todo._id}`										
	newListItem.classList.add('w3-container')
	newListItem.innerHTML = `
    <span name="todo_text">${todo.description}</span>
    <button name="btn-edit" class="edit-icon"></button>
    <button name="btn-delete" class="delete-icon"></button>
    <button name="btn-send" class="send-icon"></button>
`;

	if (todo.completed) {
		newListItem.children['btn-check'].checked = true
		let todoText = newListItem.querySelector(`span`)		
		todoText.classList.toggle('w3-text-grey')
		todoText.classList.toggle('sa-text-line-through')
	}

	if (existingItem) {
		todoList.replaceChild(newListItem, existingItem)
	} else {
		todoList.append(newListItem)
	}
}

//Delete Trick
async function deleteTodo(id, AdminId) {
	let todo = todoItems.find( (item) => item._id == id )
    
	try {
		const response = await fetch(apiUrl + '/tasks/' + todo._id +"/" + AdminId, {
			credentials: 'include',
			method: 'DELETE',
			headers: { Authorization: authToken }
		})
		if (response.ok) {
			todo = await response.json()		
		} else {
			throw `Failed Removing Task! ${response.statusText} - ${response.status}`
		}
	} catch (err) {
		message1.textContent = 'ERROR!'
		message2.textContent = err
		message3.textContent = "Unable to DELETE Task! " + todo._id
		throw message3.textContent
	}
	todo.deleted = true												
	todoItems = todoItems.filter( (item) => item._id != id )		
	updatePageDom(todo)
}

//Edit trick
async function editTodo(id) {
	const index = todoItems.findIndex( (item) => item._id == id )

	let input = window.prompt("Edit Todo item", todoItems[index].description)
	let inputValue = input ? stripHTML(input).trim() : ''		
	if (inputValue != '' && inputValue != todoItems[index].description) {
		todoItems[index].description = inputValue
		try {
			const response = await fetch(apiUrl + '/tasks/' + todoItems[index]._id, {
				credentials: 'include',
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: authToken
				},
				body: JSON.stringify(todoItems[index], ['completed','description'])			
			})
			if (response.ok) {
				todoItems[index] = await response.json()
			} else {
				throw `Failed Updating Task! ${response.statusText} - ${response.status}`
			}
		} catch (err) {
			message1.textContent = 'ERROR!'
			message2.textContent = err
			message3.textContent = "Unable to PATCH Update Task! " + todoItems[index]._id
			throw message3.textContent
		}
		updatePageDom(todoItems[index])
	}
}