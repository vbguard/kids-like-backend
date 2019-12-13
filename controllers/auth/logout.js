const User = require('../../models/user.model');

const logOut = (req, res) => {
	const userId = req.user.id;

	const sendResponse = () => {
		res.json({
			status: 'success'
		});
	};

	const sendError = error => {
		const errMessage = error.message || 'must handle error message';
		res.json({
			status: 'error',
			message: errMessage
		});
	};

	User.findByIdAndUpdate(userId, {$unset: {token: ''}})
		.then(sendResponse)
		.catch(sendError);
};

module.exports = logOut;
