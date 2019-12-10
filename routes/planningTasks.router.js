const router = require('express').Router();
const passport = require('passport');
const passportUserCheck = passport.authenticate('jwt', {
	session: false
});

const taskPlanningController = require('../controllers/taskPlanning.controller');
const customTaskController = require('../controllers/customTaskController');
const taskController = require('../controllers/tasks.controller');
// for planning
router
	.post(
		'/custom',
		passportUserCheck,
		customTaskController.customTaskCreate
	)
	.post(
		'/',
		passportUserCheck,
		taskPlanningController.createPlanningTask
	)
	.get('/', passportUserCheck, taskPlanningController.getTasks)
	.patch('/:taskId', passportUserCheck, taskController.updateTask)
	.post('/week', passportUserCheck, taskController.createTasks);

module.exports = router;
