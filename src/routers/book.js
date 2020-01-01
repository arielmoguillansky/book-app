const express = require('express');
const Book = require('../models/book');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

const upload = multer({
	limits: {
		fileSize: 1000000
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) return cb(new Error('Invalid format'));

		cb(undefined, true)
	}
}, (error, req, res, next) => {
	res.status(400).send({ error: error.message })
})

router.post('/books/:id/bookCover', auth, upload.single('bookCover'), async (req, res) => {
	const _id = req.params.id;
	const buffer = await sharp(req.file.buffer).resize({ width: 500, height: 500 }).png().toBuffer();

	const book = await Book.findOne({ _id, owner: req.user._id })

	if (!book) return res.status(404).send('Book not found')
	book.bookCover = buffer;
	book.save();
	res.send('File Uploaded')

}, (error, req, res, next) => {
	res.status(500).send({ error: error.message })
})

router.get('/books/:id/bookCover', auth, async (req, res) => {
	const _id = req.params.id;
	try {
		const book = await Book.findOne({ _id, owner: req.user._id })

		if (!book || !book.bookCover) throw new Error('Not cover image found');

		res.set('Content-type', 'application/png')
		res.send(book.bookCover)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

router.delete('/books/:id/bookCover', auth, async (req, res) => {
	const _id = req.params.id;
	const book = await Book.findOne({ _id, owner: req.user._id });
	if (!book) return res.status(404).send('Book not found');
	book.bookCover = undefined;
	await book.save();
	res.send('Cover image deleted')
})

router.post('/books', auth, upload.single('bookCover'), async (req, res) => {
	let buffer = ''
	if (req.file) {
		buffer = await sharp(req.file.buffer).resize({ width: 500, height: 500 }).png().toBuffer();
	}
	const book = new Book({
		...req.body,
		owner: req.user._id
	});

	book.bookCover = buffer;
	try {
		await book.save();
		res.status(201).send(book)
	} catch (e) {
		res.status(500).send(e);
	}
})

router.get('/books', auth, async (req, res) => {

	const match = {}
	const sort = {}

	if (req.query.readed) match.readed = req.query.readed === 'true';
	if (req.query.sortBy) {
		const parts = req.query.sortBy.split(':')
		sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
	}

	try {
		await req.user.populate({
			path: 'books',
			match,
			options: {
				limit: parseInt(req.query.limit),
				skip: parseInt(req.query.skip),
				sort
			}
		}).execPopulate();
		res.send(req.user.books);

	} catch (e) {
		res.status(500).send(e);
	}
})

router.get('/books/:id', auth, async (req, res) => {
	const _id = req.params.id;
	try {
		const book = await Book.findOne({ _id, owner: req.user._id })
		if (!book) return res.status(404).send('Book not found');
		res.send(book);
	} catch (e) {
		res.status(500).send(e)
	}

})

router.patch('/books/:id', auth, async (req, res) => {
	const _id = req.params.id;
	const updateItem = Object.keys(req.body);
	const bookItems = ['bookTitle', 'author', 'overview', '	editorial', 'category', 'readed', 'paused', 'lastPageReaded'];
	const isItem = updateItem.every((item) => {
		return bookItems.includes(item)
	})

	if (!isItem) return res.status(404).send('Book item not found')

	try {
		const book = await Book.findOne({ _id, owner: req.user._id });
		if (!book) return res.status(404).send('Book not found');

		updateItem.forEach((update) => {
			book[update] = req.body[update];
		})
		await book.save();

		res.send(book);
	} catch (e) { res.status(500).send(e) }
})

router.delete('/books/:id', auth, async (req, res) => {
	const _id = req.params.id;

	try {
		const book = await Book.findOneAndDelete({ _id, owner: req.user._id });
		if (!book) res.status(404).send('Book not found');
		res.send(book);
	} catch (e) { res.status(500).send(e) }
})



module.exports = router;