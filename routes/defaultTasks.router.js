const router = require('express').Router();
const passport = require('passport');
const passportUserCheck = passport.authenticate('jwt', {
	session: false
});

const defaultTasksController = require('../controllers/defaultTasks.controller');

router
	.get(
		'/:defaultTaskId',
		passportUserCheck,
		defaultTasksController.getDefaultTask
	)
	.get(
		'/',
		passportUserCheck,
		defaultTasksController.getDefaultTasks
	)
	.post(
		'/',
		passportUserCheck,
		defaultTasksController.createDefaultTask
	)
	.put(
		'/:defaultTaskId',
		passportUserCheck,
		defaultTasksController.updateDefaultTask
	)
	.delete(
		'/:defaultTaskId',
		passportUserCheck,
		defaultTasksController.deleteDefaultTask
	);

module.exports = router;
