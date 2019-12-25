function flip() {
	$('.book-card, .register-card').toggleClass('flipped');
}

const url = '/users';

// post body dummy data 
const user = {
	name: 'John',
	email: 'j@a.com',
	password: 'Blogger12345'
};

// request options
const options = {
	method: 'POST',
	body: JSON.stringify(user),
	headers: {
		'Content-Type': 'application/json'
	}
}

const submit = document.querySelector('#newUser')
submit.addEventListener('click', (e) => {
	e.preventDefault();
	fetch(url, options)
		.then(res => res.json())
		.then(res => console.log(res));
})