const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/user.controller');
const taskController = require('../controllers/tasks.controller');
const defaultTasksController = require('../controllers/defaultTasks.controller');

const passportUserCheck = passport.authenticate('jwt', {
	session: false
});

router.post('/auth', userController.getUser);
//CRUD for defaultTasks
router.get('/tasks/default', defaultTasksController.getDefaultTasks);
router.post('/tasks/default', defaultTasksController.createDefaultTask);
router.delete('/tasks/default/:defaultTaskId')
// CRUD for tasks
router.get('/tasks', passportUserCheck, taskController.getTasks);


module.exports = router;
