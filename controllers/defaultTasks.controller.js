const DefaultTasks = require('../models/defaultTasks.model');

const createDefaultTask = (req, res) => {
	const taskData = req.body;

	const newDefaultTask = new DefaultTasks(taskData);

	newDefaultTask
		.save()
		.then(result => res.json({result}))
		.catch(err => {
			throw new Error(err);
		});
};

const getDefaultTasks = (req, res) => {
	DefaultTasks.find({})
		.then(result => res.json({result}))
		.catch(err => {
			throw new Error(err);
		});
};

module.exports = {
	createDefaultTask,
	getDefaultTasks
};
