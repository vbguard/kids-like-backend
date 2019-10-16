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

const getDefaultTask = (req, res) => {
	const idForSearch = req.params.id;

	DefaultTasks.find({_id: idForSearch})
		.then(result => res.json({result}))
		.catch(err => {
			throw new Error(err);
		});
};

const updateDefaultTask = (req, res) => {
	const idForUpdate = req.params.id;
	const taskForUpdate = req.body;

	DefaultTasks.findOneAndReplace({_id: idForUpdate}, taskForUpdate)
		.then(result => res.json({result}))
		.catch(err => {
			throw new Error(err);
		});
};

const deleteDefaultTask = (req, res) => {
	const idForDelete = req.params.id;

	DefaultTasks.findOneAndDelete({_id: idForDelete})
		.then(result => res.json({result}))
		.catch(err => {
			throw new Error(err);
		});
};

module.exports = {
	createDefaultTask,
	getDefaultTasks,
	getDefaultTask,
	updateDefaultTask,
	deleteDefaultTask
};
