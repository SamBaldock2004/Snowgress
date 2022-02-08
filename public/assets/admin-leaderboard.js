//Allows instructor to see student in order by trick_complete
//Uses a merge sort as instructor can have many students.

const apiUrl = ''										
const authToken = 'Bearer ' + (getCookie('auth_token') || getCookie('task_manager_auth_token'))		
var userItems = []										
hookMessageTags()	

document.addEventListener('DOMContentLoaded', handlerDomLoaded)	
document.querySelector('#btn-logout').addEventListener('click', handleLogout);

//Merge sort to sort students by tricks complete
function merge(left, right) {
	let sorteduserItems = []; 
  
	while (left.length && right.length) {
	  if (left[0].completed_tricks < right[0].completed_tricks) {
		sorteduserItems.push(left.shift());
	  } else {
		sorteduserItems.push(right.shift());
	  }
	}
	return [...sorteduserItems, ...left, ...right];
  }

function mergeSort(arr) {
  const half = arr.length / 2;
  if (arr.length <= 1) {
    return arr;
  }

  const left = arr.splice(0, half); 
  const right = arr;
  return merge(mergeSort(left), mergeSort(right));
}

//Get users and render to frontend
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
	//Removes all unauthorized users
    for (var i = userItems.length - 1 ; i>= 0; i--){
		if (userItems[i].official == false){
			userItems.splice(i,1);
		}
	}
	//sorts students based on tricks complete
	console.log(userItems)
	const userItems_sorted = mergeSort(userItems)
    
	//Updates page dom with students
    if (userItems_sorted.length) {
		userItems_sorted.reverse().forEach( item => updatePageDom(item) )
	} 
}

//Updates the page with the student names and trick_complete count in order
//Order is decided by merge sort above
function updatePageDom(user) {
	
	let userList = document.querySelector('#user-leaderboard')
	const existingItem = userList.querySelector(`#item-${user._id}`)


    console.log(`${user.completed_tricks}`)
	let newListItem = document.createElement('li')
	newListItem.id = `item-${user._id}`	
	newListItem.name = 	`${user.name}`
    newListItem.completed_tricks= `${user.completed_tricks}`					
	newListItem.classList.add('w3-container')
    console.log(`${user.completed_tricks}`)
	newListItem.innerHTML = `
		<span class="user-leaderboard" name="user-text">${user.name}</span>
		<a >${user.completed_tricks}</a>
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