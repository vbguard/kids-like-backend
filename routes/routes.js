const express = require('express');
const router = express.Router();
const passport = require('passport');

// const userController = require('../controllers/user.controller');
const taskController = require('../controllers/tasks.controller');
const defaultTasksController = require('../controllers/defaultTasks.controller');
const taskPlanningController = require('../controllers/taskPlanning.controller');
const customTaskController = require('../controllers/customTaskController');
const passportUserCheck = passport.authenticate('jwt', {
  session: false
});

const authRouter = require('./auth.router');

router.use('/auth', authRouter);

router.post('/tasks/planning', passportUserCheck, taskPlanningController.createPlanningTask);
router.get('/tasks/planning', passportUserCheck, taskPlanningController.getTasks);

router.post('/tasks/planning/custom', passportUserCheck, customTaskController.customTaskCreate);

router.get('/tasks/default', passportUserCheck, defaultTasksController.getDefaultTasks);
router.get(
  '/tasks/default/:defaultTaskId', passportUserCheck,
  defaultTasksController.getDefaultTask
);
router.post('/tasks/default', passportUserCheck, defaultTasksController.createDefaultTask);
router.put(
  '/tasks/default/:defaultTaskId', passportUserCheck,
  defaultTasksController.updateDefaultTask
);
router.delete(
  '/tasks/default/:defaultTaskId', passportUserCheck,
  defaultTasksController.deleteDefaultTask
);

router.get('/tasks', passportUserCheck, taskController.getTasks);
router.get('/tasks/:taskId', passportUserCheck, taskController.getTask);
router.post('/tasks', passportUserCheck, taskController.postTasks);
router.post('/tasks/create/one', passportUserCheck, taskController.createTask);
router.patch('/tasks/:taskId', passportUserCheck, taskController.updateTask);
router.delete('/tasks/:taskId', passportUserCheck, taskController.deleteTask);

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
