const apiUrl = ''										// Blank will default to current host, if set make sure CORS is configured on the back-end!
const authToken = 'Bearer ' + (getCookie('auth_token') || getCookie('task_manager_auth_token'))		// Grab the Token from either the back-end set Cookie or one we've set
var userItems = []										// Main array for the todo list
hookMessageTags()	

document.addEventListener('DOMContentLoaded', handlerDomLoaded)	
document.querySelector('#btn-logout').addEventListener('click', handleLogout);
document.querySelector('#user-list').addEventListener('click', handleStudentListButtonClicks)	


async function handlerDomLoaded() {
	try {
		const response = await fetch(apiUrl + '/users', {
			credentials: 'include',
			headers: {
				Authorization: authToken
			}
		})			// GET is the default Fetch method
		if (response.ok) {
			userItems = await response.json()	
			console.log(userItems)					// Parse the returned JSON from the returned Body
		} else {
			throw `Failed to retrieve existing Task data! ${response.statusText} - ${response.status}`
		}
	} catch (err) {
		message1.textContent = 'ERROR!'
		message2.textContent = err
		message3.textContent = "Unable to GET All students! Logout and Login then try again!"
		throw message3.textContent
	}

	if (userItems.length) {
		for (var i = 0; i< userItems.length; i ++){
			if(userItems[i].official == true){
				updatePageDom(userItems[i])
			}
		}


	} 
}

function handleStudentListButtonClicks(event) {
	switch (event.target.name) {
		case 'btn-choose':
			console.log(event.target.parentElement)
			const parentItemId = event.target.parentElement.id.replace('item-','')	
			const parentItemName = event.target.parentElement.name
			console.log(parentItemName)
			localStorage.setItem('studentid', parentItemId)
			localStorage.setItem('studentname', parentItemName);
			console.log(parentItemId)	
			window.location.href = "/student.html"
	}
}
function updatePageDom(user) {
	// Updates the Page's DOM by adding, removing, or updating one Todo List Item
	let userList = document.querySelector('#user-list')
	const existingItem = userList.querySelector(`#item-${user._id}`)

	// Show/Hide the Clear All button and the Instructions (they end up being mutually exclusive)
	// if (todoItems.length > 0) {
	// 	document.querySelector('#instructions').classList.add('w3-hide')		// The Instructions are only shown if there's NO todo items
	// 	document.querySelector('#btn-clear-all').classList.remove('w3-hide')	// Only show Clear All if there's something to clear
	// } else {
	// 	document.querySelector('#instructions').classList.remove('w3-hide')		
	// 	document.querySelector('#btn-clear-all').classList.add('w3-hide')		// Safe, can't add class more than once
	// }

	// if (user.deleted) {															// Added by deleteTodo() to signal removal
	// 	return existingItem.remove();
	// }

	let newListItem = document.createElement('li')
	newListItem.id = `item-${user._id}`	
	newListItem.name = 	`${user.name}`								// ID of the new List Item = item-<todo._id Number>
	newListItem.classList.add('w3-container')
	newListItem.innerHTML = `
		<span name="user-text">${user.name}</span>
		<button name="btn-choose" class="choose-icon"></button>
	`;
	userList.append(newListItem)
	// if (todo.completed) {
	// 	newListItem.children['btn-check'].checked = true
	// 	let todoText = newListItem.querySelector(`span`)			// There's only one span (could use .nextElementSibling but we might change the order later)
	// 	todoText.classList.toggle('w3-text-grey')
	// 	todoText.classList.toggle('sa-text-line-through')
	// }

	// if (existingItem) {
	// 	todoList.replaceChild(newListItem, existingItem)
	// } else {
	// 	todoList.append(newListItem)
	// }
}





async function handleLogout(event) {
	// Combination Handler/Workflow
	clearMessages()
	try {
		const ignored = await fetch(apiUrl + '/users/logout', {
			credentials: 'include',
			method: 'POST',
			headers: { Authorization: authToken }
		})
	} catch (err) {
		// We don't really care if it worked or not, but we'll log it all the same.
		message2.textContent = 'Warning: Unable to fully logout!'
		console.log('Error! Unable to POST logout!');
		console.log(err)
	}
	
	setCookie('auth_token', 'deleted', -1)						// Should be deleted by the API but if it fails we'll remove it
	setCookie('task_manager_auth_token', 'deleted', -1)			// Our Cookie so we must remove it
	window.location.href = "index.html"
}