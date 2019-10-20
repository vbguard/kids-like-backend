const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/user.controller');
const taskController = require('../controllers/tasks.controller');
const defaultTasksController = require('../controllers/defaultTasks.controller');
const taskPlanningController = require('../controllers/taskPlanning.controller');
const passportUserCheck = passport.authenticate('jwt', {
	session: false
});

const authRouter = require('./auth.router');

router.use('/auth', authRouter);

router.get('/tasks/planning', passportUserCheck, taskPlanningController.getTasks);
router.get('/tasks/default', passportUserCheck, defaultTasksController.getDefaultTasks);
router.get(
	'/tasks/default/:defaultTaskId',
	defaultTasksController.getDefaultTask
);
router.post('/tasks/default', defaultTasksController.createDefaultTask);
router.put(
	'/tasks/default/:defaultTaskId',
	defaultTasksController.updateDefaultTask
);
router.delete(
	'/tasks/default/:defaultTaskId',
	defaultTasksController.deleteDefaultTask
);

router.get('/tasks', passportUserCheck, taskController.getTasks);
router.get('/tasks/:taskId', taskController.getTask);
router.post('/tasks', passportUserCheck, taskController.createTask);
router.put('/tasks/:taskId', taskController.updateTask);
router.delete('/tasks/:taskId', taskController.deleteTask);


// router.get('/tasks', passportUserCheck, taskController.getTasks);
// router.get('/tasks/:id', passportUserCheck, taskController.getTask);
// router.post('/tasks/:id', passportUserCheck, taskController.createTask);
// router.put('/tasks/:id', passportUserCheck, taskController.updateTask);
// router.put('/tasks/:id', passportUserCheck, taskController.deleteTask);

module.exports = router;

/*
test user
{
"email":"testUser@testUser.com",
"nickname":"testUser",
"password":"password"
}
{
		"nickname": "testuser",
		
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGE3ZjFhMmI0ZmFhODMyZDg2MzQ2YTUiLCJpYXQiOjE1NzEyODc0NTh9.xefwWHj0hvC42yqJuhFJ7ivzqsmjpDjv8bur9YXWq78"
}

*/
