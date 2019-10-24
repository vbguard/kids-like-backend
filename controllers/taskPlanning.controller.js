const PlanningTasks = require('../models/planningTasks.model');
const moment = require('moment');

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
  // Add Joi validation

  PlanningTasks.create({userId, cardTitle, imageUrl})
  .select({__v: 0, userId: 0})
  .then(result => {
    res.json({status: 'OK', planningTasks: result});
  })
  .catch(err => {
    throw new Error(err);
  });
};

module.exports = {
	createPlanningTask,
	getTasks
};
