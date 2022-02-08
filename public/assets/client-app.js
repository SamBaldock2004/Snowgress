//The home page functions for the students.
//This contains all the relevent function for the student

//Checks user is authorized and has token
const apiUrl = ''	
const authToken = 'Bearer ' + (getCookie('auth_token') || getCookie('task_manager_auth_token'))		
var todoItems = []										
hookMessageTags()									

//For handlers and html rendered checker
document.addEventListener('DOMContentLoaded', handlerDomLoaded)		;										
document.querySelector('#todo-list').addEventListener('click', handleTodoListButtonClicks)	;	
document.querySelector('#btn-logout').addEventListener('click', handleLogout);					


//Loads all tricks assigned to student by using get router
async function handlerDomLoaded() {
	try {
		const response = await fetch(apiUrl + '/tasks', {
			credentials: 'include',
			headers: {
				Authorization: authToken
			}
		})	
		console.log(response)			
		if (response.ok) {
			todoItems = await response.json()
			console.log(todoItems)						
		} else {
			throw `Failed to retrieve existing Task data! ${response.statusText} - ${response.status}`
		}
	} catch (err) {
		message1.textContent = 'ERROR!'
		message2.textContent = err
		message3.textContent = "Unable to GET All Tasks! Logout and Login then try again!"
		throw message3.textContent
	}

	//Updates the pag with all tricks individually
	if (todoItems.length) {
		todoItems.forEach( item => updatePageDom(item) )
	} 
}

//Triggers the update function
//Allows user to add evidence
function handleTodoListButtonClicks(event) {
	const parentItemId = event.target.parentElement.id.replace('item-','')		

	switch (event.target.name) {

		case 'btn-edit':
			clearMessages()
			return editTodo(parentItemId)

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
	window.location.href = "index.html"
}

//Takes the inputed trick and renders it to the front end 
//Used in handerDOMloaded function
function updatePageDom(todo) {
	let todoList = document.querySelector('#todo-list')
	const existingItem = todoList.querySelector(`#item-${todo._id}`)

	
	let newListItem = document.createElement('li')
	newListItem.id = `item-${todo._id}`											
	newListItem.classList.add('w3-container')
	newListItem.innerHTML = `
		<span name="todo-text">${todo.description}</span>
		<button name="btn-edit" class="edit-icon"></button>
		<p class="evidence">${todo.evidence}</p>
		<p class="evidence">${todo.comment}</p>
	`;

	if (todo.completed) {
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

//Allows student to add evidence
//Uses patch router
async function editTodo(id) {
	const index = todoItems.findIndex( (item) => item._id == id )

	let input = prompt("Edit Todo item", todoItems[index].evidence)
	let inputValue = input ? stripHTML(input).trim() : ''			// or sanitizeHTML()
	if (inputValue != '' && inputValue != todoItems[index].evidence) {
		todoItems[index].evidence = inputValue
		try {
			const response = await fetch(apiUrl + '/tasks/' + todoItems[index]._id, {
				credentials: 'include',
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: authToken
				},
				body: JSON.stringify(todoItems[index], ['evidence'])			// Send only the properties we're allowed to update
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

