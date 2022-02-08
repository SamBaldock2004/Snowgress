//This file allows an instructor to view all his/her unauthroized student
//It also lets them authorize them


//Retrieving user web token
const apiUrl = ''										
const authToken = 'Bearer ' + (getCookie('auth_token') || getCookie('task_manager_auth_token'))		
var userItems = []										
hookMessageTags()	

//Waits for page to load
//Conect front end to backend funtion using eventlistener
document.addEventListener('DOMContentLoaded', handlerDomLoaded)	
document.querySelector('#btn-logout').addEventListener('click', handleLogout);
document.querySelector('#user-list').addEventListener('click', handleStudentListButtonClicks)	

//Retrieves all unauthorized users with the get router
async function handlerDomLoaded() {
	try {
		const response = await fetch(apiUrl + '/users', {
			credentials: 'include',
			headers: {
				Authorization: authToken
			}
		})		
		//Checking response is ok or an error
		if (response.ok) {
			userItems = await response.json()	
			console.log(userItems)					
		} else {
			throw `Failed to retrieve existing Task data! ${response.statusText} - ${response.status}`
		}
	} catch (err) {
		message1.textContent = 'ERROR!'
		message2.textContent = err
		message3.textContent = "Unable to GET All students! Logout and Login then try again!"
		throw message3.textContent
	}
	//Filters for the unauthorized user using the boolean official
	if (userItems.length) {
		for (var i = 0; i< userItems.length; i ++){
			if(userItems[i].official == false){
				updatePageDom(userItems[i])
			}
		}


	} 
}

//If the instructor chooses to authorize students
function handleStudentListButtonClicks(event) {
	const parentItemId = event.target.parentElement.id.replace('item-','')	
	const parentItemName = event.target.parentElement.name
	console.log(parentItemName)	


	switch (event.target.name) {
		case 'btn-choose':
            authorizeStudent(parentItemId)			
	}
}

//Renders students to front end 
//If instructor authorizes a student they are removed from the list
function updatePageDom(user) {
	let userList = document.querySelector('#user-list')
	const existingItem = userList.querySelector(`#item-${user._id}`)


	let newListItem = document.createElement('li')
	newListItem.id = `item-${user._id}`	
	newListItem.name = 	`${user.name}`							
	newListItem.classList.add('w3-container')
	newListItem.innerHTML = `
		<span name="user-text">${user.name}</span>
		<button name="btn-choose" class="choose-icon"></button>
	`;
	userList.append(newListItem)

}

//Uses a patch router to authorise student
//Authroization function
async function authorizeStudent(parentItemId) {
    try {
        const response = await fetch(apiUrl + '/users/' + parentItemId , {
            credentials: 'include',
            method: 'PATCH',
            headers: {
                Authorization: authToken
            }
        })			
        if (response.ok) {
            userItems = await response.json()	
            console.log(userItems)		
            window.location.href = "/authorize.html"			
        } else {
            console.log(response)
            throw `Failed to retrieve existing Task data! ${response.statusText} - ${response.status}`
        }
    } catch (err) {
        message1.textContent = 'ERROR!'
        message2.textContent = err
        message3.textContent = "Unable to GET All students! Logout and Login then try again!"
        throw message3.textContent
    }				

}

//User logout
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