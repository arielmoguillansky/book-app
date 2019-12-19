const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Book = require('./book');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	age: {
		type: Number,
		default: 0,
		validate(value) {
			if (value < 0) throw new Error('Age must be a positive number')
		}
	},
	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		unique: true,
		validate(value) {
			if (!validator.isEmail(value)) throw new Error('Email is invalid')
		}
	},
	password: {
		type: String,
		required: true,
		trim: true,
		validate(value) {
			if (value.length < 6) throw new Error('Password too short. Minimun length allowed is 6')
			if (value.toLowerCase().includes('password')) throw new Error('Invalid password')
		}
	},
	tokens: [{
		token: {
			type: String,
			required: true
		}
	}],
	avatar: {
		type: Buffer
	}
}, {
	timestamps: true
})

userSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;
	delete userObject.avatar;
	return userObject;
}

userSchema.methods.generateToken = async function () {
	const user = this;
	const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET);

	user.tokens = user.tokens.concat({ token });
	await user.save();

	return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });
	if (!user) throw new Error('User not found');

	const isMatch = await bcrypt.compare(password, user.password)
	if (!isMatch) throw new Error('Password is incorrect')
	return user
}

userSchema.pre('save', async function (next) {
	const user = this;

	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}

	next()
})

userSchema.virtual('books', {
	ref: 'Book',
	localField: '_id',
	foreignField: 'owner'
}) //not store in DB, is for mongoose to know how user and task are related

userSchema.pre('remove', async function (next) {
	const user = this;
	await Book.deleteMany({ owner: user._id })
	next();
})

const User = mongoose.model('User', userSchema)

// const user3 = new User({
// 	name: 'Fedor',
// 	email: 'Fedor@gmail.com',
// 	password: 'validpass1564'
// })

// user3.save().then(() => {
// 	console.log('This is', user3)
// }).catch((error) => {
// 	console.log('ERRORR', error)
// })

module.exports = User;
