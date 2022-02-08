//This file allows users to register. 
//It uses the creat user router I have built
//It has one function as all its utility is registering

const apiUrl = ''														
const registerForm = document.querySelector('#register-form') //Links to html form
hookMessageTags()														

//Makes sure it triggers when submit is pressed 'event'
registerForm.addEventListener('submit', handleSubmitForm)		

async function handleSubmitForm(event) {
	event.preventDefault()								
	clearMessages()										
	const formData = getFormData(registerForm, true)	
	let result = {message: ''}
	const instructor = {"instructor": formData.instructor}
	delete formData.instructor
	
	//This uses the post router to create a user
	try {
		const response = await fetch(apiUrl + '/users', {			
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formData)
			
		})
		result = await response.json()
		//If the response is an error display the error to user	
		if (!response.ok) {
			throw `Failure creating new User! ${response.statusText} - ${response.status}`
		}
	} catch (err) {
		//Authorization checker
		setCookie('auth_token', 'deleted', -1)			
		message1.textContent = 'ERROR!'
		message2.textContent = err + " " + result.error
		message3.textContent = "Unable to POST new User request! Check name / email / password and try again!"
		throw message3.textContent
	}
	result1 = {"result": result, "instructor" : instructor}
	//Adds the instructor picked to the user created
	try{
		//Using patch router
		const response = await fetch(apiUrl + '/users', {			
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(result1)
				
			})
		if (!response.ok) {
			throw `Failure creating new User! 2`
		} 
	} catch(err) {
		//Authorization checker
		setCookie('auth_token', 'deleted', -1)			
		message1.textContent = 'ERROR!'
		message2.textContent = err + " " + result.error
		message3.textContent = "Unable to PATCH new User request! Check name / email / password and try again!"
		throw message3.textContent
	}
	//If no errors use json web token and redirect to index.html
	setCookie('task_manager_auth_token', result.token)				
	window.location.href = "/index.html"										
}