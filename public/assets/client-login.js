//This file utilises the user post function that adds another json token
//It connects to a front end html file to allow the user to input credentials
//It either redirects the user to their respective home page or throws an error

const apiUrl = ''												
const loginForm = document.querySelector('#login-form') //Referrences front end form
hookMessageTags()												

//These wait for the webpage to load and then the login form to be submitted
document.addEventListener('DOMContentLoaded', handlerDomLoaded)			
loginForm.addEventListener('submit', handleSubmitForm)						

//This is the remember me function that will keep the emial that loggged in last
 function handlerDomLoaded() {
	const rememberedEmail = getCookie('task_manager_email')
	
	if (rememberedEmail != '') {
		document.querySelector('#email-field').value = rememberedEmail
		document.querySelector('#remember-checkbox').checked = true
	}
 }

 //The login function
async function handleSubmitForm(event) {

	event.preventDefault()							
	clearMessages()									
	const formData = getFormData(loginForm, true)	
	let result;

	try { //Utilising the post router
		const response = await fetch(apiUrl + '/users/login', {			
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formData)			
		}) //Checking if the response is an error or not
		if (response.ok) {
			result = await response.json()	
		} else {
			throw `Failure logging in! ${response.statusText} - ${response.status}`
		}
	} catch (err) { //Returns error to the user
		setCookie('auth_token', 'deleted', -1)						
		setCookie('task_manager_auth_token', 'deleted', -1)
		message1.textContent = 'ERROR!'
		message2.textContent = err						
		message3.textContent = "Unable to POST Login request! Check email / password and try again!"
		throw message3.textContent
	}

	//If the remember me button is checked keep the user email
	if (formData.remember) {
		setCookie('task_manager_email', result.user.email, 30)
	} else {
		setCookie('task_manager_email', 'deleted', -1)
	}
	
	//Give the logged in use a webtoken
	setCookie('task_manager_auth_token', result.token)				
	if (result.user.admin){ //Checking if admin or not
		window.location.href = "admin.html"
	} else {
		window.location.href = "home.html"
	}									
}