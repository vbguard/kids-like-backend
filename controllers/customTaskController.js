const PlanningTasks = require('../models/planningTasks.model');
const Joi = require('@hapi/joi');

const customTaskCreate = (req, res, next) => {
	const taskData = req.body;
	const userId = req.user.id;

	const schema = Joi.object({
		cardTitle: Joi.string().required(),
		imageUrl: Joi.string()
			.uri({
				scheme: ['https']
			})
			.required(),
		points: Joi.number().required()
	});

	const {error, value} = schema.validate(taskData);

	if (error) {
		return res.status(422).json({
			status: 'error',
			error: error.message,
			field: error.details.map(error => error.path[0])
		});
	}

	const newCustomeTask = new PlanningTasks({...value, userId});

	newCustomeTask
		.save()
		.then(result =>
			res.json({
				status: 'ok',
				result
			})
		)
		.catch(err => {
			throw new Error(err);
		});
};
module.exports = {
	customTaskCreate
};
