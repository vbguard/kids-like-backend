// **   TODO:        */
//! @ GET --- userId => find sets by userId => sets of User populate tasks === Finish😀
//!
//!
const Tasks = require('../models/tasks.model');
const ObjectId = require('mongoose').Types.ObjectId;
const moment = require('moment');
const Joi = require('joi');

const getTasks = (req, res) => {
	// console.log('inside getTasks');
	const userId = req.user.id;

	// const firstDay = moment().get;
	// console.log('firstDay :', firstDay);
	const today = moment().locale('uk', {
		week: {
			dow: 1 // Monday is the first day of the week
		}
	});

	const fromDate = today
		.set({hour: 3, minute: 0, second: 0, millisecond: 0})
		.weekday(0)
		.toISOString();
	const toDate = today
		.set({hour: 23, minute: 59, second: 59})
		.weekday(6)
		.toISOString();

	Tasks.aggregate([
		{$match: {userId: ObjectId(userId)}},
		{$match: {date: {$gte: new Date(fromDate), $lte: new Date(toDate)}}},
		{
			$lookup: {
				from: 'planningtasks',
				localField: 'task',
				foreignField: '_id',
				as: 'task'
			}
		},
		{
			$unwind: '$task'
		},
		{
			$addFields: {
				cardTitle: '$task.cardTitle',
				imageUrl: '$task.imageUrl',
				totalAmount: {
					$sum: '$point'
				},
				totalDone: {
					$sum: {
						$cond: {
							if: '$isDone',
							then: 1,
							else: 0
						}
					}
				}
			}
		},
		{
			$project: {
				_id: true,
				date: true,
				cardTitle: true,
				imageUrl: true,
				isDone: true,
				point: true,
				totalDone: true,
				totalAmount: true
			}
		},
		// {
		// 	$addFields: {
		// 		totalAmount: {
		// 			$sum: '$point'
		// 		},
		// 		totalDone: {
		// 			$sum: {
		// 				$cond: {
		// 					if: '$isDone',
		// 					then: 1,
		// 					else: 0
		// 				}
		// 			}
		// 		}
		// 	}
		// },
		{
			$group: {
				_id: '$date',
				dayTasks: {$push: '$$ROOT'},
				totalAmount: {$sum: '$point'},
				totalDone: {
					$sum: {
						$cond: {
							if: '$isDone',
							then: 1,
							else: 0
						}
					}
				}
			}
		},
		{
			$project: {
				_id: false,
				day: {
					$dateToParts: {date: '$_id', iso8601: true}
				},
				dayTasks: true,
				totalAmount: true,
				totalDone: true
			}
		},
		{
			$project: {
				_id: false,
				day: '$day.isoDayOfWeek',
				'dayTasks._id': true,
				'dayTasks.cardTitle': true,
				'dayTasks.imageUrl': true,
				'dayTasks.isDone': true,
				'dayTasks.point': true,
				totalAmount: true,
				totalDone: true
			}
		},
		{
			$group: {
				_id: false,
				tasks: {$push: '$$ROOT'},
				totalAmount: {$sum: '$totalAmount'},
				totalDone: {$sum: '$totalDone'}
			}
		}
	])
		.then(result =>
			res.json({
				today: today,
				weekRange: {
					fromDate: fromDate,
					toDate: toDate
				},
				tasks: result[0].tasks,
				totalAmount: result[0].totalAmount,
				totalDone: result[0].totalDone
			})
		)
		.catch(err => {
			throw new Error(err);
		});
};

const getTask = (req, res) => {
	const taskId = req.params.taskId;

	Tasks.findById(taskId)
		.then(result => res.json({result}))
		.catch(err => {
			throw new Error(err);
		});
};

const postTasks = async (req, res) => {
	const tasksFromReq = req.body.tasks;
	const userId = req.user._id;
	const taskDaysArr = [];
	console.log('tasksFromReq :', tasksFromReq);
	await tasksFromReq.forEach(({taskId, selectedDays}) => {
		selectedDays.forEach(day => {
			return taskDaysArr.push({
				userId,
				task: taskId,
				date: moment(day, ['MM-DD-YYYY', 'DD-MM', 'DD-MM-YYYY'])
			});
		});
	});

	Tasks.insertMany(await taskDaysArr)
		.then(result => {
			res.status(201).json({
				status: 'OK',
				newTasks: result
			});
		})
		.catch(err => {
			throw new Error(err);
		});
};

const createTask = (req, res) => {
	const taskData = req.body;
	const userId = req.user.id;

	const schema = Joi.object({
		taskId: Joi.string().required(),
		date: Joi.date().required()
	});

	const {error, value} = schema.validate(taskData);

	if (error) {
		return next(error);
	}

	const newTask = new Tasks({task: value.taskId, date: value.date, userId});

	newTask
		.save()
		.then(result => res.json({result}))
		.catch(err => {
			throw new Error(err);
		});
};

const updateTask = (req, res) => {
  const userId = req.user.id;
	const taskId = req.params.taskId;
	const taskForUpdate = req.body;

	const schema = Joi.object({
		cardId: Joi.string(),
		isDone: Joi.boolean(),
		point: Joi.number(),
		date: Joi.date(),
		userId: Joi.string()
	});

	const {error, value} = schema.validate(taskForUpdate);
	if (error) {
		return next(error);
	}

	Tasks.findByIdAndUpdate({_id: taskId}, {$set: value}, {new: true})
		.populate('task')
		.select({
			__v: 0,
			userId: 0,
			'task._id': 0,
			'task.userId': 0,
			'task.__v': 0,
			createdAt: 0,
			updatedAt: 0
		})
		.then(result => {
			const today = moment().locale('uk', {
				week: {
					dow: 1 // Monday is the first day of the week
				}
			});

			const fromDate = today
				.set({hour: 3, minute: 0, second: 0, millisecond: 0})
				.weekday(0)
				.toISOString();
			const toDate = today
				.set({hour: 23, minute: 59, second: 59})
				.weekday(6)
        .toISOString();
      
			Tasks.aggregate([
				{$match: {userId: ObjectId(userId)}},
				{$match: {date: {$gte: new Date(fromDate), $lte: new Date(toDate)}}},
        {$group: {
          '_id': false,
          totalAmount: { $sum: '$point'},
          totalDone: {$sum: {
            $cond: {
              if: "$isDone",
              then: 1,
              else: 0
            }
          }}
        }}
      ]).then(aggregate => {
        res.json({
          status: 'OK',
          totalAmount: aggregate[0].totalAmount,
          totalDone: aggregate[0].totalDone,
          updatedTasks: {
            _id: result._id,
            isDone: result.isDone,
            point: result.point,
            cardTitle: result.task.cardTitle,
            imageUrl: result.task.imageUrl
          }
        });
      }).catch(err => {
        throw new Error(err);
      });
		})
		.catch(err => {
			throw new Error(err);
		});
};

const deleteTask = (req, res) => {
	const taskId = req.params.taskId;

	Tasks.findByIdAndDelete(taskId)
		.then(result => res.json({result}))
		.catch(err => {
			throw new Error(err);
		});
};

module.exports = {
	getTasks,
	getTask,
	createTask,
	updateTask,
	deleteTask,
	postTasks
	// getTasksSup
};

/*
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

	Tasks.findOneAndUpdate({_id: taskId}, {$set: {...req.body}}, {new: true})
		.then(result => {
			return res.json({status: 'OK', task: result});
		})
		.catch(err =>
			res.status(400).json({success: false, error: err, message: err.message})
		);

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

*/
