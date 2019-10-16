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

router.get('/tasks/default', defaultTasksController.getDefaultTasks);
router.post('/tasks/default', defaultTasksController.createDefaultTask);
router.get('/tasks/default/:id', defaultTasksController.getDefaultTask);
router.put('/tasks/default/:id', defaultTasksController.updateDefaultTask);
router.delete('/tasks/default/:id', defaultTasksController.deleteDefaultTask);

router.get('/tasks', passportUserCheck, taskController.getTasks);

module.exports = router;
