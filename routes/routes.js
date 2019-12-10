const express = require('express');
const router = express.Router();

const authRouter = require('./auth.router');
const defaultTasksRouter = require('./defaultTasks.router');
const planningTasksRouter = require('./planningTasks.router');
const tasksRouter = require('./tasks.router');

router
	.use('/auth', authRouter)
	// for default tasks
	.use('/tasks/default', defaultTasksRouter)
	// for planning
	.use('/tasks/planning', planningTasksRouter)
	// for displaying tasks
	.use('/tasks', tasksRouter);

module.exports = router;

/*
test user
{
"email":"testUser@testUser.com",
"nickname":"testUser",
"password":"password"
}
*/
