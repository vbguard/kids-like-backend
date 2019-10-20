const router = require('express').Router();
const passport = require('passport');
const User = require('../models/user.model');

const {login, register, logOut} = require('../controllers/auth');

const passportCheck = passport.authenticate('jwt', {
	session: false
});

router
	.get('/users', (req, res) => {
		User.find({}).then(result => {
			res.json(result);
		});
	})
	.post('/login', login)
	.post('/register', register)
	.post('/logout', passportCheck, logOut);

module.exports = router;
