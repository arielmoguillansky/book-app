function flip() {
	$('.register-card').toggleClass('flipped');
}

document.querySelectorAll('.book-card').forEach(item => {
	item.addEventListener('click', event => {
		item.classList.toggle('flipped');
	})
})

const postUserUrl = '/users';
const getUserUrl = '/users/login';
const getUserProfileUrl = '/users/dashboard';
const getBooksUrl = '/books';
const logOutUrl = 'users/logout';
let token;
let userDataObj;

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
		.then(res => res.json())
		.then(res => console.log(res));
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

const booksDataOptions = (token) => {
	return {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': token
		}
	}
}

function getBooksData(token) {
	fetch(getBooksUrl, booksDataOptions(token))
		.then(res => res.json().then((data) => {
			console.log(data);
			document.querySelector('.total-books').textContent = data.length;
			let readedBook = 0;
			let pausedBook = 0;
			console.log(data);
			for (let i = 0; i < data.length; i++) {
				if (data[i].readed === true) {
					readedBook++;
				} else {
					pausedBook++
				}
			}
			document.querySelector('.readed-books').textContent = readedBook;
			document.querySelector('.paused-books').textContent = pausedBook;

			// const getBooksCards = () => {
			// 	for (let i = 0; i < data.length; i++) {
			// 		let bookCard = document.createElement('div');
			// 		bookCard.setAttribute('class', '')
			// 	}
			// }
		}))
}

function getUserData(token) {

	fetch(getUserProfileUrl, userDataOptions(token))
		.then(res => res.json()
			.then((data) => {
				document.querySelector('.user-name').textContent = data.name;
				document.querySelector('.user-email').textContent = data.email;
				let avatar = document.querySelector('.avatar')
				avatar.style.backgroundImage = "url(data:image/png;base64," + data.avatar;
			}))
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
		.then(arrowRight())
		.catch((e) => {
			console.log(e)
		})


})

const logout = document.querySelector('.log-out-btn');
logout.addEventListener('click', (e) => {

	e.preventDefault();

	logOutUser(token);

})
