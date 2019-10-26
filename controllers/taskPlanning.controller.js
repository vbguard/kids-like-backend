const PlanningTasks = require('../models/planningTasks.model');
const Joi = require('@hapi/joi');

const getTasks = (req, res) => {
	const userId = req.user.id;
	PlanningTasks.find({userId})
		.select({__v: 0, userId: 0})
		.then(result => {
			res.json({status: 'OK', planningTasks: result});
		})
		.catch(err => {
			throw new Error(err);
		});
};

const createPlanningTask = (req, res) => {
  const userId = req.user.id;
  const taskData = req.body;

  const schema = Joi.object({
    cardTitle: Joi.string().required(),
    imageUrl: Joi.string()
      .uri({
        scheme: ['https']
      })
      .required()
  });

  const {
    error,
    value
  } = schema.validate(taskData);

  if (error) {
    return next(error);
  }

  PlanningTasks.insertOne({userId, cardTitle: value.cardTitle, imageUrl: value.imageUrl})
  .select({__v: 0, userId: 0})
  .then(result => {
    res.json({status: 'OK', planningTask: result});
  })
  .catch(err => {
    throw new Error(err);
  });
};

module.exports = {
	createPlanningTask,
	getTasks
};
