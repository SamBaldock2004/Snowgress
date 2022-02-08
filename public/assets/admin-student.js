//This has all the student-insructor interactions
//For individual student interaction

//Gets the student siD and name that is being used, also get the web token
const apiUrl = ''										
const authToken = 'Bearer ' + (getCookie('auth_token') || getCookie('task_manager_auth_token'))	
var todoItems = []										
hookMessageTags()										
StudentId = localStorage.getItem('studentid')
StudentName = localStorage.getItem('studentname')
document.getElementById("studentName").innerHTML = StudentName;

//Waits for page to load then
//4 event listeners for the 3 main functions
document.addEventListener('DOMContentLoaded', handlerDomLoaded)									
document.querySelector('#input-form').addEventListener('submit', handleSubmitForm)			
document.querySelector('#todo-list').addEventListener('click', handleTodoListButtonClicks)		
document.querySelector('#btn-clear-all').addEventListener('click', handleClearAll);			
document.querySelector('#btn-logout').addEventListener('click', handleLogout);					


//Gets all the student scurrent tricks
async function handlerDomLoaded() {
    try{
		const response = await fetch(apiUrl + '/tasks/' + StudentId, {
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

//Checks which button is clicked
//4 options
function handleTodoListButtonClicks(event) {
	const parentItemId = event.target.parentElement.id.replace('item-','')		
	switch (event.target.name) {
		case 'btn-check':
			clearMessages()				
			return checkTodo(parentItemId)
		case 'btn-edit':
			clearMessages()
			return editTodo(parentItemId, 'description')
		case 'btn-comment':
			clearMessages()
			console.log(parentItemId, 'comment')
			return editTodo(parentItemId, 'comment')
		case 'btn-delete':
			clearMessages()
			return deleteTodo(parentItemId, StudentId)
		default:
			
	}
}

//Clear all tricks set, deletes them all
async function handleClearAll(event) {
	
	clearMessages()
	try {
		const allDeletes = todoItems.map( item => fetch(apiUrl + '/tasks/' + item._id, {				
				credentials: 'include',
				method: 'DELETE',
				headers: { Authorization: authToken }
			})
		)
		const allResponses = await Promise.all(allDeletes)				
		if ( !allResponses.every( response => response.ok ) ) {
			allResponses.forEach( response => { 
				if (!response.ok) { console.log('Failed to delete: ' + response.url) } 
			})
			throw "At least one Task was unable to be deleted!"
		}
	} catch (err) {
		message1.textContent = 'ERROR!'
		message2.textContent = err
		message3.textContent = "Unable to DELETE all Tasks!"
		throw message3.textContent
	}

	todoItems = []
	let todoList = document.querySelector('#todo-list')
	todoList.innerHTML = ''
	document.querySelector('#instructions').classList.remove('w3-hide')		
	document.querySelector('#btn-clear-all').classList.add('w3-hide')
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

//Lets insructor input trick description and creates a trick for the student
async function addTodo(text) {
	let todo = {
		description: text,
		completed: false		
	}

	try {
		const response = await fetch(apiUrl + '/tasks/' + StudentId, {
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

//Adds all the tricks descriptions to screen with the corresponding buttons
function updatePageDom(todo) {
	let todoList = document.querySelector('#todo-list')
	const existingItem = todoList.querySelector(`#item-${todo._id}`)

	if (todoItems.length > 0) {
		document.querySelector('#instructions').classList.add('w3-hide')		
		document.querySelector('#btn-clear-all').classList.remove('w3-hide')	
	} else {
		document.querySelector('#instructions').classList.remove('w3-hide')		
		document.querySelector('#btn-clear-all').classList.add('w3-hide')		
	}

	if (todo.deleted) {															
		return existingItem.remove();
	}

	let newListItem = document.createElement('li')
	newListItem.id = `item-${todo._id}`											
	newListItem.classList.add('w3-container')
	newListItem.innerHTML = `<input type="checkbox" name="btn-check" class="w3-check w3-margin-right w3-padding-small w3-large">
		<span name="todo-text">${todo.description}</span>
		<button name="btn-delete" class="delete-icon"></button>
		<button name="btn-edit" class="edit-icon"></button>
		<button name="btn-comment" class="comment-icon"></button><br>
        <a class="evidence">${todo.evidence}</a><br>
		<a class="evidence">${todo.comment}</a>
        
	`;

	//Crosses of trick if complete
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

//Allows instructor to mark trick as complete
async function checkTodo(id) {
	const index = todoItems.findIndex( (item) => item._id == id )

	todoItems[index].completed = !todoItems[index].completed			
	try {
		const response = await fetch(apiUrl + '/tasks/' + todoItems[index]._id + "/"  + StudentId, {
			credentials: 'include',
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: authToken
			},
			body: JSON.stringify(todoItems[index], ['completed', 'description'])		
		})
		if (response.ok) {
			todoItems[index] = await response.json()
			if(todoItems[index].completed){
				try {
					const response = await fetch(apiUrl + '/users/' + StudentId, {
						credentials: 'include',
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json',
							Authorization: authToken
						},		
					})
					if (response.ok) {
						console.log("Response is ok")
					} else {
						throw `Failed Completing Task For User! ${response.statusText} - ${response.status}`
					}
				} catch (err) {
					message1.textContent = 'ERROR!'
					message2.textContent = err
					message3.textContent = "Unable to PATCH Complete Task User! " + todoItems[index]._id
					throw message3.textContent
				}
			}
		} else {
			throw `Failed Completing Task! ${response.statusText} - ${response.status}`
		}
	} catch (err) {
		message1.textContent = 'ERROR!'
		message2.textContent = err
		message3.textContent = "Unable to PATCH Complete Task! " + todoItems[index]._id
		throw message3.textContent
	}
	updatePageDom(todoItems[index])
}

//Allows instructor to delete set trick
async function deleteTodo(id, StudentId) {
	let todo = todoItems.find( (item) => item._id == id )

	try {
		const response = await fetch(apiUrl + '/tasks/' + todo._id +"/" + StudentId, {
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

//Allows instructor to add a comment or edit trick description
async function editTodo(id,item_to_edit) {
	const index = todoItems.findIndex( (item) => item._id == id )
	if (item_to_edit == 'comment') {
		
		let input = prompt("Comment on trick", todoItems[index].comment)
		let inputValue = input ? stripHTML(input).trim() : ''			
		if (inputValue != '' && inputValue != todoItems[index].comment) {
			todoItems[index].comment = inputValue
			try {
				const response = await fetch(apiUrl + '/tasks/' + todoItems[index]._id + "/" + StudentId,{
					credentials: 'include',
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
						Authorization: authToken
					},
					body: JSON.stringify(todoItems[index], ['completed','description','comment'])		
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
	}else{
		let input = prompt("Edit Todo item", todoItems[index].description)
		let inputValue = input ? stripHTML(input).trim() : ''			
		if (inputValue != '' && inputValue != todoItems[index].description) {
			todoItems[index].description = inputValue
			try {
				const response = await fetch(apiUrl + '/tasks/' + todoItems[index]._id + "/" + StudentId,{
					credentials: 'include',
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
						Authorization: authToken
					},
					body: JSON.stringify(todoItems[index], ['completed','description','comment'])	
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
}