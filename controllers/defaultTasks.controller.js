const DefaultTasks = require('../models/defaultTasks.model');
const Joi = require('joi');

const getDefaultTasks = (req, res) => {
	DefaultTasks.find({})
		.then(result => res.json({result}))
		.catch(err => {
			throw new Error(err);
		});
};

const getDefaultTask = (req, res) => {
	const taskId = req.params.taskId;

	DefaultTasks.findById(taskId)
		.then(result => res.json({result}))
		.catch(err => {
			throw new Error(err);
		});
};

const createDefaultTask = (req, res, next) => {
	const taskData = req.body;
	const schema = Joi.object({
		cardTitle: Joi.string()
			.alphanum()
			.required(),
		imageUrl: Joi.string()
			.uri({
				scheme: ['https']
			})
			.required()
	});

	const {error, value} = schema.validate(taskData);

	if (error) {
		return next(error);
	}

	const newDefaultTask = new DefaultTasks(value);

	newDefaultTask
		.save()
		.then(result => res.json({result}))
		.catch(err => {
			throw new Error(err);
		});
};

const updateDefaultTask = (req, res) => {
	const idForUpdate = req.params.id;
	const taskForUpdate = req.body;

	DefaultTasks.findByIdAndUpdate(idForUpdate, {$set: taskForUpdate}, { new: true })
		.then(result => {
			if (!result) {
				return res
					.status(404)
					.json({message: `Defaukt tasks by this id ${taskId}, not found`});
      }
      
      if (result) {
        res.json({result});
      }
		})
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
