function flip() {
	$('.book-card, .register-card').toggleClass('flipped');
}

const url = '/users';

// post body data 
const user = {
	first_name: 'John',
	last_name: 'Doe',
	job_title: 'Blogger'
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