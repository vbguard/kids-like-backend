const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const jwtSecretKey = require('../config/config').jwtSecretKey;

const getUser = (req, res) => {
	const nickname = req.body.nickname;
	const password = req.body.password;

	console.log({nickname: req.body.nickname, password: req.body.password});

	if (!nickname) {
		console.log('1');

		res
			.status(422)
			.json({
				success: false,
				message: 'Field nickname empty'
			})
			.end();
	}

	if (!password) {
		console.log('2');

		res
			.status(422)
			.json({
				success: false,
				message: 'Field password empty'
			})
			.end();
	}

	if (4 < nickname.length > 16) {
		console.log('3');
		res
			.status(400)
			.json({
				success: false,
				length: nickname.length,
				message: 'Nickname length short then 5 or more then 15'
			})
			.end();
	}

	if (4 < password.length > 13) {
		console.log('4');
		res
			.status(400)
			.json({
				success: false,
				length: password.length,
				message: 'Password length short then 5 or more then 12'
			})
			.end();
	} else {
		console.log('5');

		User.findOne({nickname: nickname})
			.then(user => {
				if (!user) {
					//! if not have user in DB - created him!!! and token
					const newUser = new User({nickname: nickname, password: password});
					newUser
						.save()
						.then(user => {
							const token = jwt.sign({userId: user._id}, jwtSecretKey);
							res
								.status(200)
								.json({
									nickname: user.nickname,
									token
								})
								.end();
						})
						.catch(err => {
							res
								.status(500)
								.json({
									success: false,
									message: err.message,
									error: err
								})
								.end();
						});
				} else {
					user.comparePassword(password, (err, isMatch) => {
						if (err) {
							res
								.status(500)
								.json({
									success: false,
									message: err.message,
									error: err
								})
								.end();
						}

						if (isMatch) {
							const token = jwt.sign({userId: user._id}, jwtSecretKey);
							res
								.status(200)
								.json({
									nickname: user.nickname,
									userId: user._id,
									token
								})
								.end();
						} else {
							res
								.status(400)
								.json({
									success: false,
									message: 'Invalid Password'
								})
								.end();
						}
					});
				}
			})
			.catch(err => {
				res
					.status(400)
					.json({message: 'Invalid Password/Username'})
					.end();
			});
	}
};

module.exports = {
	getUser
};
