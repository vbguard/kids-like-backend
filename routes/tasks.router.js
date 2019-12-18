const router = require('express').Router();
const passport = require('passport');
const passportUserCheck = passport.authenticate('jwt', {
	session: false
});

const taskController = require('../controllers/tasks.controller');
// for displaying tasks
router
	.get('/', passportUserCheck, taskController.getTasks)
	.patch('/:taskId', passportUserCheck, taskController.updateTask);
module.exports = router;
