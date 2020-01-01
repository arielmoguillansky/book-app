const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');


const upload = multer({
	limits: {
		fileSize: 1000000
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) return cb(new Error('Image must be JPG'));

		cb(undefined, true)
	}
})


router.post('/users/dashboard/avatar', auth, upload.single('avatar'), async (req, res) => {

	if (req.file) {
		const buffer = await sharp(req.file.buffer).resize({ width: 150, height: 150 }).png().toBuffer()

		req.user.avatar = buffer;
		await req.user.save();
		res.send('Image Uploaded');
	}

}, (error, req, res, next) => {
	res.status(400).send({ error: error.message })
})

router.delete('/users/dashboard/avatar', auth, async (req, res) => {
	req.user.avatar = undefined;
	await req.user.save();
	res.send('Image deleted')
})

router.get('/users/:id/avatar', async (req, res) => {
	try {
		const user = await User.findById(req.params.id)

		if (!user || !user.avatar) throw new Error()

		res.set('Content-Type', 'image/png')
		res.send(user.avatar)
	} catch (e) {
		res.status(404).send(e)
	}
})

router.post('/users', async (req, res) => {

	const user = new User(req.body);

	try {
		await user.save()
		const token = await user.generateToken()
		res.status(201).send({ user, token })
	} catch (e) {
		res.status(400).send(e)
	}

	// user.save().then(() => {
	// 	res.status(201).send(user)
	// }).catch((e) => {
	// 	res.status(400).send(e);
	// })
})

router.post('/users/login', async (req, res) => {

	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateToken();
		res.send({ user, token });
	} catch (e) {
		res.status(400).send(e);
	}
})

router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token
		})
		await req.user.save();
		res.sendStatus(200);
	} catch (e) {
		res.status(500).send(e);
	}
})

router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = [];
		console.log(req.user.tokens)
		await req.user.save();
		res.send()
	} catch (e) {
		res.status(500).send(e);
	}
})


router.get('/users/dashboard', auth, async (req, res) => {
	res.send(req.user);
})

router.patch('/users/dashboard', auth, async (req, res) => {
	const id = req.user._id;

	const updates = Object.keys(req.body)
	const userFeatures = ['name', 'email', 'password', 'age'];

	const isValidFeature = updates.every((feature) => {
		return userFeatures.includes(feature)
	})

	if (!isValidFeature) { return res.status(400).send('Item not found') }

	try {

		updates.forEach((update) => {
			req.user[update] = req.body[update];
		})

		await req.user.save();

		//const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

		res.send(req.user);
	} catch (e) { res.status(400).send(e); }
})

router.delete('/users/dashboard', auth, async (req, res) => {

	try {
		await req.user.remove()
		res.send(req.user);
	} catch (e) { res.status(500).send(e); }
})

module.exports = router;