//Allows the instructor to take a trick and choose multiple students to set it to.

//Gets the web token
const apiUrl = ''										
const authToken = 'Bearer ' + (getCookie('auth_token') || getCookie('task_manager_auth_token'))	
var userItems = []
hookMessageTags()	

//Waits for page to be loaded
//Has 2 event listeners for logout and one for teh students chosen
document.addEventListener('DOMContentLoaded', handlerDomLoaded)	
document.querySelector('#btn-logout').addEventListener('click', handleLogout);
document.querySelector('#user-list').addEventListener('click', handleStudentListButtonClicks)	

//Recieves the trick chosen to set
trickdescription = localStorage.getItem('trick-description')
document.getElementById("trick-name").innerHTML = trickdescription;

//Uses get router to get all instructors students
async function handlerDomLoaded() {
	try {
		const response = await fetch(apiUrl + '/users', {
			credentials: 'include',
			headers: {
				Authorization: authToken
			}
		})			
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
	//Makes sure students are authorised
	if (userItems.length) {
		for (var i = 0; i< userItems.length; i ++){
			if(userItems[i].official == true){
				updatePageDom(userItems[i])
			}
		}


	} 
}

//Sets trick to student when chose
//Using trick post router
async function handleStudentListButtonClicks(event) {
	switch (event.target.name) {
		case 'btn-send':
			console.log(event.target.parentElement)
			const parentItemId = event.target.parentElement.id.replace('item-','')	
            console.log(parentItemId)
            try {
                const response = await fetch(apiUrl + '/tasks/' + parentItemId + '/' + trickdescription,  {
                    credentials: 'include',
                    method: 'POST',
                    headers: {
                        Authorization: authToken
                    }
                })		
                if (response.ok) {
                    console.log('trick-set')					
                } else {
                    throw `Failed to retrieve existing Task data! ${response.statusText} - ${response.status}`
                }
            } catch (err) {
                message1.textContent = 'ERROR!'
                message2.textContent = err
                message3.textContent = "Unable to GET All students! Logout and Login then try again!"
                throw message3.textContent
            }
            var remove_user = document.getElementById('item-' + parentItemId);
            remove_user.remove();
	}
}

//Updates page with students
function updatePageDom(user) {
	let userList = document.querySelector('#user-list')
	const existingItem = userList.querySelector(`#item-${user._id}`)

	let newListItem = document.createElement('li')
	newListItem.id = `item-${user._id}`	
	newListItem.name = 	`${user.name}`								
	newListItem.classList.add('w3-container')
	newListItem.innerHTML = `
		<span name="user-text">${user.name}</span>
		<button name="btn-send" class="send-icon"></button>
	`;
	userList.append(newListItem)
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