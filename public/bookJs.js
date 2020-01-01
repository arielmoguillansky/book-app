function flip() {
	document.querySelector('.register-card').classList.toggle('flipped');
	document.querySelector('.new-book-card').classList.toggle('flipped');
}

const postUserUrl = '/users';
const getUserUrl = '/users/login';
const getUserProfileUrl = '/users/dashboard';
const uploadAvatarUrl = '/users/dashboard/avatar';
const getBooksUrl = '/books';
const logOutUrl = 'users/logout';
const postNewBookUrl = '/books';
let token, userDataObj;
let readed = true;
let paused = false;

const outCard = (callback) => {

	document.querySelectorAll('button')[0].classList.add('d-none');
	document.querySelectorAll('button')[1].classList.add('d-none');
	document.querySelector('.register-card-container').classList.remove('register-card-start');
	document.querySelector('.register-card-container').classList.add('card-out');

	callback;
}

const getDashboard = () => {

	document.querySelector('.user-card-container').classList.remove('d-none');
	document.querySelector('.log-out-btn').classList.remove('d-none');
	document.querySelector('.arrow-container').classList.remove('d-none');
	const cardContainer = document.querySelectorAll('.card-container')
	for (let i = 0; i < cardContainer.length; i++) {
		cardContainer[i].classList.remove('d-none');

	}
	document.querySelector('.user-card-container').classList.add('card-in');

	setTimeout(() => {
		document.querySelector('.register-card-container').classList.add('d-none');
	}, 2000)


}


const arrowRight = () => {

	const rightArrow = document.querySelector('.arrow-right');
	rightArrow.classList.remove('d-none');
	rightArrow.onclick = () => rightArrow.classList.toggle('arrow-left');
	rightArrow.addEventListener('click', (e) => {
		e.preventDefault();
		document.querySelectorAll('.main-card')[0].classList.toggle('moveToLeft');
		document.querySelectorAll('.main-card')[1].classList.toggle('moveToLeft');
	})

}

const arrowLeft = () => {

	const leftArrow = document.querySelector('.arrow-left');
	leftArrow.onclick = () => leftArrow.classList.toggle('arrow-left');
	leftArrow.addEventListener('click', (e) => {
		e.preventDefault();
		document.querySelectorAll('.main-card')[0].classList.toggle('moveToLeft');
		document.querySelectorAll('.main-card')[1].classList.toggle('moveToLeft');
	})

}

const createBookOptions = (token, coverFormData) => {
	return {
		method: 'POST',
		body: coverFormData,
		headers: {
			//'Content-Type': 'application/json',
			'Authorization': token
		}
	}
}

const singInOptions = () => {
	return {
		method: 'POST',
		body: JSON.stringify({
			name: document.querySelector('input[name="name"]').value,
			email: document.querySelector('input[name="email"]').value,
			password: document.querySelector('input[name="password"]').value
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	}
}

const logInOptions = () => {
	return {
		method: 'POST',
		body: JSON.stringify({
			email: document.querySelector('input[name="userEmail"]').value,
			password: document.querySelector('input[name="userPassword"]').value
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	}
}

const logOutOptions = (token) => {
	return {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': token
		}
	}
}

const uploadAvatarOptions = (token, formData) => {
	return {
		method: 'POST',
		body: formData,
		headers: {
			//'Content-Type': 'multipart/form-data',
			'Authorization': token
		}
	}
}

function handleErrors(response) {
	if (!response.ok) {
		return document.querySelector('.errorMsg').classList.remove('d-none');
	}
	return response;
}

const signin = document.querySelector('#newUser')
signin.addEventListener('click', (e) => {
	e.preventDefault();

	fetch(postUserUrl, singInOptions())
		.then((res) => {
			console.log(res)
			if (res.status == 201) {
				res.json().then((data) => {
					window.localStorage.setItem('access_token', data.token);
					token = 'Bearer ' + data.token;
					outCard(getDashboard());
					getUserData(token);
					getBooksData(token);
				})
			}
		}
		)

})

const userDataOptions = (token) => {
	return {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': token
		}
	}
}

const bookCoverOptions = (token) => {
	return {
		method: 'GET',
		headers: {
			'Content-Type': 'application/png',
			'Authorization': token
		}
	}
}

const booksDataOptions = (token) => {
	return {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': token
		}
	}
}

const getBooksCards = (data) => {
	let siblingDom = document.querySelector('.new-book-li');
	let status, bookCover, buffImg;

	if (data.length > 0) {

		for (let i = 0; i < data.length; i++) {

			if (data[i].readed) {
				status = '<div class="section completed-section"><h2 class="completed-msg">Completed</h2></div>';
			} else {
				status = '<div class="section"><h2>Page mark:</h2><span>' + data[i].lastPageReaded + '</span></div>';
			}

			if (data[i].bookCover) {
				bookCover = '<div class="back" style="background-image:url(' + base64data + '"></div>';
			} else {
				bookCover = '<div class="back"><span class="no-cover c-custom-white">Book Cover</span></div></div>';
			}

			let parser = new DOMParser();
			let domString = '<li><div class="card-container"><div class="book-card"><div class="front"><div class="c-custom-white book-form"><div class="section section-title"><h1>' + data[i].bookTitle + '</h1></div><hr class="c-custom-white"><div class="section"><h2>Author:</h2><span>' + data[i].author + '</span></div><div class="section"><h2>Category:</h2><span>' + data[i].category + '</span></div><div class="section"><h2>Editorial:</h2><span>' + data[i].editorial + '</span></div><div><h2>Overwiew:</h2><p class="scrollbar">' + data[i].overview + '</p></div>' + status + '</div></div>' + bookCover + '</div></div></li>';
			let html = parser.parseFromString(domString, 'text/html')
			siblingDom.insertAdjacentHTML('afterend', domString)
		}
		document.querySelectorAll('.book-card').forEach(item => {
			item.addEventListener('click', event => {
				item.classList.toggle('flipped');
			})
		})
	} else {
		document.querySelector('.grid').classList.add('new-grid')
	}
}

const getBooksCover = (data) => {

	for (let i = 0; i < data.length; i++) {
		let id = data[i]._id;
		fetch('/books/' + id + '/bookCover', bookCoverOptions(token))
			.then((res) => { return res.blob() }).then(blob => {
				let reader = new FileReader();
				reader.readAsDataURL(blob);
				reader.onload = async function () {
					base64data = reader.result;
					await getBooksCards(data, base64data)
				}
			})
		// buffImg = data[i].bookCover.data;
		// let base64data;
		// let blob = new Blob([buffImg], { type: 'image/png' }); // pass a useful mime type here

		// let reader = new FileReader();
		// reader.readAsDataURL(blob);
		// reader.onload = async function () {
		// 	base64data = reader.result;
		// 	await getBooksCards(data, base64data)
		// }
	}

}

function getBooksData(token) {
	fetch(getBooksUrl, booksDataOptions(token))
		.then(res => res.json().then((data) => {
			console.log(data);
			document.querySelector('.total-books').textContent = data.length;
			let readedBook = 0;
			let pausedBook = 0;
			for (let i = 0; i < data.length; i++) {
				if (data[i].readed === true) {
					readedBook++;
				} else {
					pausedBook++
				}
			}
			document.querySelector('.readed-books').textContent = readedBook;
			document.querySelector('.paused-books').textContent = pausedBook;

			getBooksCover(data);


		}))
}


function openFileAvatar() {
	document.querySelector('#avatarImg').click();
}

function openFileCover() {
	document.querySelector('#coverImg').click();
}

function uploadImg(event) {

	let input = event.target;

	let reader = new FileReader();

	reader.onload = () => {
		let dataURL = reader.result;
		let avatarPreview = document.getElementById('avatarPreview');
		avatarPreview.classList.remove('d-none')
		avatarPreview.src = dataURL;
	}
	reader.readAsDataURL(input.files[0]);
	if (input) {
		document.querySelector('.cam-icon-edit').classList.remove('d-none')
	}
	const formData = new FormData()
	formData.append('avatar', document.querySelector('input[name="avatar"]').files[0])
	fetch(uploadAvatarUrl, uploadAvatarOptions(token, formData))
		.then(res => console.log(res))
		.catch(e => console.log(e))
}

function uploadCover(event) {

	let input = event.target;

	let reader = new FileReader();

	reader.onload = () => {
		let dataURL = reader.result;
		let coverPreview = document.querySelector('.cover-back');
		coverPreview.style.backgroundImage = 'url(' + dataURL + ')';
		//coverPreview.classList.remove('d-none')
		//coverPreview.src = dataURL;
	}
	reader.readAsDataURL(input.files[0]);
}

function getUserData(token) {

	fetch(getUserProfileUrl, userDataOptions(token))
		.then(res => res.json()
			.then((data) => {
				console.log('AVATAR', data)
				document.querySelector('.user-name').textContent = data.name;
				document.querySelector('.user-email').textContent = data.email;
				let avatar = document.querySelector('.avatar')
				if (!data.avatar) {
					document.querySelector('.cam-icon').classList.remove('d-none');
				} else {
					avatar.style.backgroundImage = "url(data:image/png;base64," + data.avatar;
					document.querySelector('.cam-icon-edit').classList.remove('d-none');
				}
				arrowRight();
			}))
		.catch((e) => {
			console.log(e)
		})
}

function logOutUser(token) {
	fetch(logOutUrl, logOutOptions(token))
		.then((res) => {

			if (res.status === 200) {
				location.reload();
			}
		}
		)
}

const login = document.querySelector('.submit-login');
login.addEventListener('click', (e) => {

	e.preventDefault();

	fetch(getUserUrl, logInOptions())
		.then(handleErrors)
		.then(res => res.json().then((data) => {

			window.localStorage.setItem('access_token', data.token);
			token = 'Bearer ' + data.token;
			outCard(getDashboard());
			getUserData(token);
			getBooksData(token);
		}))
		.catch((e) => {
			console.log(e)
		})


})

const logout = document.querySelector('.log-out-btn');
logout.addEventListener('click', (e) => {

	e.preventDefault();

	logOutUser(token);

})

document.querySelector('.add-icon').addEventListener('click', (e) => {
	document.querySelector('.new-book-container').classList.remove('d-none')
	document.querySelectorAll('.main-card')[0].classList.add('moveToNewBook');
	document.querySelectorAll('.main-card')[1].classList.add('moveToNewBook');
	document.querySelectorAll('.main-card')[2].classList.add('moveToNewBook');
	document.querySelector('.cards-display').style.overflow = "hidden";
	document.querySelector('.arrow-left').classList.add('d-none');
	document.querySelector('.arrow-left-back').classList.remove('d-none');
})

document.querySelector('.arrow-left-back').addEventListener('click', (e) => {
	document.querySelector('.new-book-container').classList.add('d-none')
	document.querySelectorAll('.main-card')[0].classList.remove('moveToNewBook');
	document.querySelectorAll('.main-card')[1].classList.remove('moveToNewBook');
	document.querySelectorAll('.main-card')[2].classList.remove('moveToNewBook');
	document.querySelector('.arrow-left').classList.remove('d-none');
	document.querySelector('.arrow-left-back').classList.add('d-none');
})

document.querySelector('input[name="cbox1"]').onclick = function () {

	if (this.checked) {
		document.querySelector('.paused-input').style.visibility = "visible";
		readed = false;
		paused = true;
	} else {
		document.querySelector('.paused-input').style.visibility = "hidden";
		readed = true;
		paused = false;
	}
}

const createNewBook = document.querySelector('.submit-book').addEventListener('click', (e) => {
	e.preventDefault();

	let coverFormData = new FormData()

	coverFormData.append('bookTitle', document.querySelector('input[name="newTitle"]').value);
	coverFormData.append('author', document.querySelector('input[name="newAuthor"]').value);
	coverFormData.append('overview', document.querySelector('textarea[name="newOverview"]').value);
	coverFormData.append('editorial', document.querySelector('input[name="newEdit"]').value);
	coverFormData.append('category', document.querySelector('input[name="newCat"]').value);
	coverFormData.append('readed', readed);
	coverFormData.append('paused', paused);
	coverFormData.append('lastPageReaded', document.querySelector('input[name="newPageMark"]').value);
	coverFormData.append('bookCover', document.querySelector('input[name="bookCover"]').files[0]);


	fetch(postNewBookUrl, createBookOptions(token, coverFormData))
		.then((res) => {
			if (res.status === 201) {
				getBooksData(token);
				document.querySelector('.new-book-container').classList.add('d-none')
				document.querySelectorAll('.main-card')[0].classList.remove('moveToNewBook');
				document.querySelectorAll('.main-card')[1].classList.remove('moveToNewBook');
				document.querySelectorAll('.main-card')[2].classList.remove('moveToNewBook');
				document.querySelector('.arrow-left').classList.remove('d-none');
				document.querySelector('.arrow-left-back').classList.add('d-none');
				document.querySelector('.cards-display').style.overflow = "hidden";
			} else {
				for (var key of coverFormData.keys()) {
					coverFormData.delete(key)
				}
			}
		}).catch((e) => console.log(e))


})