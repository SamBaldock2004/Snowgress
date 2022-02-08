
var message1, message2, message3


function hookMessageTags() {
	message1 = document.querySelector('#message-1')		
	message2 = document.querySelector('#message-2')		
	message3 = document.querySelector('#message-3')	
}

function clearMessages() {
	message1.textContent = ''
	message2.textContent = ''
	message3.textContent = ''
}

function stripHTML(html) {
	if (!html) { return '' }
	const STANDARD_HTML_ENTITIES = {	
		nbsp: String.fromCharCode(160),
		amp: "&",
		quot: '"',
		apos: "'",
		lt: "<",
		gt: ">"
	};
	html = html.replace(/<style([\s\S]*?)<\/style>/gi, '')
		.replace(/<script([\s\S]*?)<\/script>/gi, '')
		.replace(/<\/div>/ig, '\n')
		.replace(/<\/li>/ig, '\n')
		.replace(/<li>/ig, '  *  ')
		.replace(/<\/ul>/ig, '\n')
		.replace(/<\/p>/ig, '\n')
		.replace(/<br\s*[\/]?>/gi, "\n")
		.replace(/<[^>]+>/ig, '')
		.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec) )
		.replace(/&(nbsp|amp|quot|apos|lt|gt);/g, (a, b) => STANDARD_HTML_ENTITIES[b] );

	return html
}

function sanitizeHTML(string) {
	var dummyDiv = document.createElement('div')
	dummyDiv.textContent = string
	return dummyDiv.innerHTML
}

function getCookie(name) {
	const cookieName = name + '='
	const allCookies = decodeURIComponent(document.cookie).split(';')
	for(let cookie of allCookies) {
		while (cookie.charAt(0) == ' ') {
			cookie = cookie.substring(1)	
		}
		if (cookie.indexOf(cookieName) == 0) {
			return cookie.substring(cookieName.length, cookie.length);
		}
	}
	return '';
}

function setCookie(name, value, expiresInDays = null, path = '/', sameSite = 'Lax', secure = false) {
	let expires = ''
	if (expiresInDays) {
		let today = new Date()
		today.setTime(today.getTime() + (1000 * 60 * 60 * 24 * expiresInDays))
		expires = "; Expires="+ today.toUTCString()
	}
	document.cookie = name + "=" + encodeURIComponent(value) + expires + '; Path=' + path + '; SameSite=' + sameSite + (secure ? ' Secure' : '')
}

function getFormData(formElement, trim = false) { 
	const formData = new FormData(formElement)
    let tempObject = {}

    formData.forEach((value, key) => { 
        tempObject[key] = trim ? value.trim() : value;
    })
    return tempObject;
}

function removeEmptyProperties(obj) {
	for (let prop of Object.keys(obj)) {
		if (obj[prop] === '' || obj[prop] === null || obj[prop] === undefined ) { delete obj[prop] }
	}
	return obj;
}