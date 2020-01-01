const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const taskSchema = new mongoose.Schema({
	bookTitle: {
		type: String,
		trim: true,
		required: true
	},
	author: {
		type: String,
		trim: true,
		required: true
	},
	overview: {
		type: String,
		trim: true
	},
	editorial: {
		type: String,
		trim: true
	},
	category: {
		type: String,
		required: true,
		trim: true
	},
	readed: {
		type: Boolean,
		default: true
	},
	paused: {
		type: Boolean,
		default: false
	},
	lastPageReaded: {
		type: Number
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	},
	bookCover: {
		type: Buffer
	}
})

const Book = mongoose.model('Book', taskSchema);

// const task1 = new Book({
// 	description: 'Do shopping',
// 	completed: true
// })

// task1.save().then(() => {
// 	console.log(task1)
// }).catch((error) => {
// 	console.log('ERROR', error)
// })

module.exports = Book;