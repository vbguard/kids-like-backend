const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/user.controller');
const taskController = require('../controllers/tasks.controller');

const passportUserCheck = passport.authenticate('jwt', {
	session: false
});

router.post('/auth', userController.getUser);

router.get('/tasks', passportUserCheck, taskController.getTasks);


module.exports = router;
