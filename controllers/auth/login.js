const passport = require('passport');
const Joi = require('@hapi/joi');
// const {ValidationError} = require('../../core/error');

// Login User and get him Token for access to some route action
const userLogin = (req, res, next) => {
	const schema = Joi.object()
		.keys({
			email: Joi.string()
				.regex(
					/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
				)
				.required(),
			password: Joi.string()
				.min(6)
				.max(16)
				.required()
		})
		.options({
			presence: 'required',
			stripUnknown: true,
			abortEarly: false
		});

	const result = schema.validate(req.body);

	if (result.error) {
		return res.status(422).json({
			status: 'error',
			error: result.error.message,
			field: result.error.details.map(error => error.path[0])
		});
	}

	const sendResponse = user => {
		res.json({
			status: 'success',
			...user
		});
	};

	const sendError = error => {
		const errMessage = error.message || 'User not found';
		res.status(404).json({
			status: 'error',
			error: errMessage
		});
	};

	passport.authenticate(
		'local',
		{
			session: false
		},
		(err, user, info) => {
			if (err || !user) {
				const infoMessage = info
					? info
					: {
							message: 'Login failed'
					  };
				sendError(infoMessage);
				return;
			}

			req.login(
				user,
				{
					session: false
				},
				err => {
					if (err) {
						console.log('err :', err);
						res.status(400).json(err);
					}

					sendResponse(user);
				}
			);
		}
	)(req, res);
};

module.exports = userLogin;
