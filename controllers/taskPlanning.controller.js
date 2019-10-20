const PlanningTasks = require('../models/planningTasks.model');

exports.getTasks = (req, res) => {
	const userId = req.user.id;
	PlanningTasks.find({userId})
		.select({__v: 0})
		.then(result => {
			res.json({status: 'OK', planningTasks: result });
		})
		.catch(err => {
			throw new Error(err);
		});
};
