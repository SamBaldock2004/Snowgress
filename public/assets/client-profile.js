//This is the file that has all the functions that
//goes allong with the user profile page
//It uses patch routers and get router.

//Token checking
const apiUrl = ''														
const authToken = 'Bearer ' + (getCookie('auth_token') || getCookie('task_manager_auth_token'))		
const profileForm = document.querySelector('#profile-form')
var userProfile = {}														
hookMessageTags()															

//All event listeners and query selectors
document.addEventListener('DOMContentLoaded', handlerDomLoaded)									
profileForm.addEventListener('submit', handleSubmitForm)										
document.querySelector('#btn-del-profile').addEventListener('click', handleDeleteProfile);				

//Loads all the relevent information from current user using get function
async function handlerDomLoaded() {
	//Get fucntion
	try {
		const response = await fetch(apiUrl + '/users/me', {			
			credentials: 'include',
			headers: { Authorization: authToken }
		})
		if (response.ok) {
			userProfile = await response.json()						
		} else {
			throw `Failed to retrieve Profile data! ${response.statusText} - ${response.status}`
		}
		//Error message if appilicable
	} catch (err) {
		message1.textContent = 'ERROR!'
		message2.textContent = err
		message3.textContent = "Unable to GET User Profile! Logout and Login then try again!"
		throw message3.textContent
	}
	//links all relevant info to html fields
	if (Object.keys(userProfile).length > 0) {
		document.querySelector('#name-field').value = userProfile.name
		document.querySelector('#email-field').value = userProfile.email
		if (userProfile.age && userProfile.age != 0) { document.querySelector('#age-field').value = userProfile.age.toString() }		// Default is 0, and if set to 0 will clear it
	}
 }

//Submit profile function
async function handleSubmitForm(event) {
	event.preventDefault()						
	clearMessages()			
	let formData = getFormData(profileForm, true)
	let result;

	removeEmptyProperties(formData)
	let updateEmailCookie = getCookie('task_manager_email') == userProfile.email ? true : false;
	//Get router
	try {
		const response = await fetch(apiUrl + '/users/me', {
			credentials: 'include',
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: authToken
			},
			body: JSON.stringify(formData)
		})
		result = await response.json()
		//Checking if response wa sann error of data			
		if (!response.ok) {
			throw `Failure Updating User Profile! ${response.statusText} - ${response.status}`
		}
	} catch (err) {
		message1.textContent = 'ERROR!'
		message2.textContent = err + " " + result.error
		message3.textContent = "Unable to PATCH User Profile! Check name, email, password, or age and try again!"
		throw message3.textContent
	}
	//Lets user know that the update was successful
	message1.textContent = 'SUCCESS!'
	message2.textContent = 'Updated your User Profile'
	if (updateEmailCookie) { setCookie('task_manager_email', result.email) }

}

//Allows user to delete their account
async function handleDeleteProfile(event) {
	clearMessages()

	let confirm = window.confirm("Click OK to delete your Profile")
	if (!confirm) { return; }

	try {
		const response = await fetch(apiUrl + '/users/me', {
			credentials: 'include',
			method: 'DELETE',
			headers: { Authorization: authToken }
		})
		if (!response.ok) {
			throw `Failed to delete Profile! ${response.statusText} - ${response.status}`
		}
		//Lets user know account is deleted and redirects them to login page
		setCookie('task_manager_auth_token', 'deleted', -1)			
		setCookie('auth_token', 'deleted', -1)							
		message1.textContent = 'SUCCESS!'
		message2.textContent = 'Your Profile has been deleted'
		message3.textContent = 'You will be returned to the main page in 3 seconds'
		setTimeout( () => {
			window.location.href = "index.html"
		}, 3000)
	} catch (err) {

		message1.textContent = 'ERROR!'
		message2.textContent = err
		message3.textContent = 'Unable to DELETE Profile!'
		throw message3.textContent
	}
}