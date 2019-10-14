// **   TODO:        */
//! @ GET --- userId => find sets by userId => sets of User populate tasks === Finish😀
//!
//!
const Tasks = require('../models/task.model');
const Users = require('../models/user.model');

const updateTask = (req, res) => {
  const taskId = req.params.taskId;
  
	if (req.body.isComplete) {
		const taskDayId = req.body.taskDayId;
		return Tasks.findOneAndUpdate(
			{'dates._id': taskDayId},
			//{$set: {'dates.$[element]': req.body.isComplete}},
			//{arrayFilters: [{element: {$gte: 100}}]},
			{$set: {'dates.$[elem].isComplete': req.body.isComplete}},
			{
        arrayFilters: [{'elem._id': taskDayId}],
        new: true
			}
		)
			.then(result => {
				if (result) {
					res.json({taskId: result._id, taskDayId});
				}
			})
			.catch(err => {
				console.log(err);
				return res
					.status(400)
					.json({success: false, error: err, message: err.message});
			});
  }

  Tasks.findOneAndUpdate({_id: taskId}, {$set: {...req.body}}, {new:true}).then(result => {
    return res.json({ status: "OK", task: result})
  }).catch(err => res
    .status(400)
    .json({success: false, error: err, message: err.message}))

	//	Tasks.findOneAndUpdate({_id: taskId}, {$set: newFields}, {new: true})
	//	.then(result => {
	//		if (result) {
	//			getTasks(req, res);
	//			}
	//		})
	//		.catch(err =>
	//			res.status(400).json({success: false, error: err, message: err.message})
	//		);
};

const deleteTask = (req, res) => {
	//TODO:
	//! delete SET and delete taskId if have - many task delete ALL
	//?  get dates task from request
	//! delete task from set and check by dates
	const taskId = req.params.taskId;
	const userId = req.user.id;
	console.log(taskId);

	Tasks.findOneAndRemove({_id: taskId}, (err, doc) => {
		if (err) {
			res.status(400).json({
				status: 'BAD',
				message: `Not task found`
			});
		}
		if (doc) {
			Users.findByIdAndUpdate(userId, {$pull: {userTasks: taskId}})
				.then(user => {
					if (user) {
						res.status(200).json({
							status: 'OK',
							message: `Task ${doc._id} deleted successful`,
							taskId: doc._id
						});
					}
				})
				.catch(err => {
					throw new Error(err);
				});
		}
	});
};

const getTasks = async (req, res) => {
	const userId = req.user._id;

	try {
		const calendar = await Tasks.aggregate([
			{$match: {userId: userId}},
			{$unwind: '$dates'},
			{
				$addFields: {
					'dates.taskId': '$_id'
				}
			},
			{
				$group: {
					_id: {
						$toDate: '$dates.date'
					},
					countRepeat: {$sum: {$cond: ['$isRepeat', 1, 0]}},
					countOne: {$sum: {$cond: ['$isRepeat', 0, 1]}},
					repeatTasks: {
						$addToSet: {taskId: {$cond: ['$isRepeat', '$_id', null]}}
					},
					oneTasks: {$addToSet: {taskId: {$cond: ['$isRepeat', null, '$_id']}}}
				}
			},
			{
				$project: {
					repeatTasks: {
						tasks: {
							$map: {
								input: '$repeatTasks',
								as: 'task',
								in: '$$task.taskId'
							}
						},
						count: '$countRepeat'
					},
					oneTasks: {
						tasks: {
							$map: {
								input: '$oneTasks',
								as: 'task',
								in: '$$task.taskId'
							}
						},
						count: '$countOne'
					}
				}
			},
			{
				$project: {
					repeatTasks: {$arrayElemAt: ['$repeatTasks', 0]},
					oneTasks: {$arrayElemAt: ['$oneTasks', 0]}
				}
			},
			{
				$lookup: {
					from: 'tasks',
					localField: 'repeatTasks.tasks',
					foreignField: '_id',
					as: 'repeatTasks.tasks'
				}
			},
			{
				$lookup: {
					from: 'tasks',
					localField: 'oneTasks.tasks',
					foreignField: '_id',
					as: 'oneTasks.tasks'
				}
			},
			{$sort: {_id: 1}},
			{
				$project: {
					_id: 0,
					date: {
						$dateToString: {
							date: '$_id',
							format: '%d-%m-%Y',
							timezone: '+03:00',
							onNull: 0.0
						}
					},
					repeatTasks: {tasks: {title: 1, isRepeat: 1, _id: 1}, count: 1},
					oneTasks: {tasks: {title: 1, isRepeat: 1, _id: 1}, count: 1}
				}
			}
		]);
		const userTasks = await Tasks.find(
			{userId: userId},
			{__v: 0, userId: 0, createdAt: 0, updatedAt: 0}
		).sort({'$dates.date': 'desc'});

		return res.status(200).json({
			success: true,
			tasks: userTasks,
			calendar,
			message: 'get user tasks and dat for calendar'
		});
	} catch (error) {
		res.status(400).json({success: false, error: err, message: err.message});
	}
};

const createTask = async (req, res) => {
	const userId = req.user.id;
	const title = req.body.title;
	const description = req.body.description;
	const dates = req.body.dates;

	Tasks.create({title, description, dates, userId})
		.then(task => {
			if (task) {
				Users.findByIdAndUpdate(userId, {$push: {userTasks: task._id}})
					.then(user => {
						if (user) {
							res.status(201).json({success: true, task: task});
						}
					})
					.catch(err => {
						throw new Error(err);
					});
			}
		})
		.catch(err =>
			res.status(400).json({success: false, error: err, message: err.message})
		);
};

const getTasksSup = async (req, res) => {
	const userId = req.user._id;
	try {
		const calendar = await Tasks.aggregate([
			{$match: {userId: userId}},
			{$unwind: '$dates'},
			{
				$addFields: {
					'dates.taskId': '$_id'
				}
			},
			{
				$group: {
					_id: {
						$toDate: '$dates.date'
					},
					countRepeat: {$sum: {$cond: ['$isRepeat', 1, 0]}},
					countOne: {$sum: {$cond: ['$isRepeat', 0, 1]}},
					repeatTasks: {
						$addToSet: {taskId: {$cond: ['$isRepeat', '$_id', null]}}
					},
					oneTasks: {$addToSet: {taskId: {$cond: ['$isRepeat', null, '$_id']}}}
				}
			},
			{
				$project: {
					repeatTasks: {
						tasks: {
							$map: {
								input: '$repeatTasks',
								as: 'task',
								in: '$$task.taskId'
							}
						},
						count: '$countRepeat'
					},
					oneTasks: {
						tasks: {
							$map: {
								input: '$oneTasks',
								as: 'task',
								in: '$$task.taskId'
							}
						},
						count: '$countOne'
					}
				}
			},
			{
				$project: {
					repeatTasks: {$arrayElemAt: ['$repeatTasks', 0]},
					oneTasks: {$arrayElemAt: ['$oneTasks', 0]}
				}
			},
			{
				$lookup: {
					from: 'tasks',
					localField: 'repeatTasks.tasks',
					foreignField: '_id',
					as: 'repeatTasks.tasks'
				}
			},
			{
				$lookup: {
					from: 'tasks',
					localField: 'oneTasks.tasks',
					foreignField: '_id',
					as: 'oneTasks.tasks'
				}
			},
			{$sort: {_id: 1}},
			{
				$project: {
					_id: 0,
					date: {
						$dateToString: {
							date: '$_id',
							format: '%d-%m-%Y',
							timezone: '+03:00',
							onNull: 0.0
						}
					},
					repeatTasks: {tasks: {title: 1, isRepeat: 1, _id: 1}, count: 1},
					oneTasks: {tasks: {title: 1, isRepeat: 1, _id: 1}, count: 1}
				}
			}
		]);

		const userTasks = await Tasks.aggregate([
			{$match: {userId: userId}},
			{$unwind: '$dates'},
			{$match: {'dates.date': {$gte: new Date()}}},
			{
				$group: {
					_id: {
						$toDate: '$dates.date'
					},
					dayTasks: {
						$addToSet: {
							idTaskDay: '$dates._id',
							taskIsComplete: '$dates.isComplete',
							title: '$title',
							description: '$description',
							dates: '$dates',
							isRepeat: '$isRepeat'
						}
					}
				}
			},
			{$sort: {_id: 1}},
			{
				$project: {
					_id: 0,
					date: {
						$dateToString: {
							date: '$_id',
							format: '%d-%m-%Y',
							timezone: '+03:00',
							onNull: 0.0
						}
					},
					dayTasks: 1
				}
			}
		]);

		return res.status(200).json({
			success: true,
			tasks: userTasks,
			calendar,
			message: 'get user tasks and dat for calendar'
		});
	} catch (error) {
		res.status(400).json({success: false, error: err, message: err.message});
	}
};

module.exports = {
	getTasks,
	updateTask,
	createTask,
	deleteTask,
	getTasksSup
};
