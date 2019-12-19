const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const mongooseValidationErrorTransform = require('mongoose-validation-error-transform');

const UserSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			index: true,
			lowercase: true
		},
		nickname: {
			type: String,
			minlength: 5,
			maxlength: 15
		},
		password: {
			type: String,
			trim: true
		},
		googleId: {
			type: String,
			unique: true,
			index: true
		},
		name: {
			fullName: String,
			firstName: String,
			lastName: String
		},
		locale: String,
		photo: String,
		token: String,
		points: {
			type: Number,
			validate: {
				validator: function(v) {
					return v >= 0;
				},
				message: props => `${props.value} points is not less then 0!`
			}
		}
	},
	{
		timestamps: true
	}
);

UserSchema.methods.getPublicFields = function() {
	const returnObject = {
		userData: {
			nickname: this.nickname,
			email: this.email,
			name: this.name
		},
		token: this.token
	};
	return returnObject;
};

UserSchema.pre(
	'save',
	function(next) {
		var user = this;
		if (!user.isModified('password')) {
			return next();
		}
		bcrypt.hash(user.password, 10).then(hashedPassword => {
			user.password = hashedPassword;
			next();
		});
	},
	function(err) {
		next(err);
	}
);

UserSchema.post('save', function(error, doc, next) {
	if (error.name === 'MongoError' && error.code === 11000) {
		next(new Error('There was a duplicate key error'));
	} else {
		next();
	}
});

UserSchema.methods.comparePassword = function(candidatePassword, next) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if (err) return next(err);
		next(null, isMatch);
	});
};

UserSchema.methods.validatePassword = function(password) {
	const compare = bcrypt.compareSync(password, this.password);
	return compare;
};

UserSchema.methods.getJWT = function() {
	const preToken = jwt.sign(
		{
			id: this._id
		},
		config.jwtSecretKey
	);

	const token = preToken;

	this.token = token;
	this.save();

	return token;
};

// UserSchema.plugin(mongooseValidationErrorTransform, {
// 	//
// 	// these are the default options you can override
// 	// (you don't need to specify this object otherwise)
// 	//

// 	// should we capitalize the first letter of the message?
// 	// capitalize: true,

// 	// should we convert `full_name` => `Full name`?
// 	// humanize: true,

// 	// how should we join together multiple validation errors?
// 	transform: function(messages) {
// 		if (messages.length === 1) return messages[0];
// 		return `<ul><li>${messages.join('</li><li>')}</li></ul>`;
// 	}
// });

const Users = mongoose.model('Users', UserSchema);

module.exports = Users;
