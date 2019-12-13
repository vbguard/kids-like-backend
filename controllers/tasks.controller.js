// **   TODO:        */
//! @ GET --- userId => find sets by userId => sets of User populate tasks === Finish😀
//!
//!
const Tasks = require('../models/tasks.model');
const ObjectId = require('mongoose').Types.ObjectId;
const moment = require('moment');
const Joi = require('joi');

const getNextWeekDay = require('./helpers/getNextWeekDay.js');
const aggregateTasks = require('./helpers/aggregateTasks.js');

const getTasks = (req, res) => {
	const userId = req.user.id;
	const todayDate = new Date();
	const nextWeekDay = getNextWeekDay(todayDate);
	const today = moment().locale('uk', {
		week: {
			dow: 1 // Monday is the first day of the week
		}
	});

	const momentNextWeekDay = moment(nextWeekDay).locale('uk', {
		week: {
			dow: 1 // Monday is the first day of the week
		}
	});

	aggregateTasks(today, userId)
		.then(result => {
			aggregateTasks(momentNextWeekDay, userId).then(nextWeekResult => {
				const fromDate = today
					.set({
						hour: 3,
						minute: 0,
						second: 0,
						millisecond: 0
					})
					.weekday(0)
					.toISOString();
				const toDate = today
					.set({
						hour: 23,
						minute: 59,
						second: 59
					})
					.weekday(6)
					.toISOString();
				// crutchDate is placed for tasks collection because tasks at the last day of the week is missed
				const crutchDate = today
					.set({
						hour: 23,
						minute: 59,
						second: 59
					})
					.weekday(7)
					.toISOString();
				const momentNextWeekDay = moment(nextWeekDay).locale('uk', {
					week: {
						dow: 1 // Monday is the first day of the week
					}
				});
				const nextWeekFromDate = momentNextWeekDay
					.set({
						hour: 3,
						minute: 0,
						second: 0,
						millisecond: 0
					})
					.weekday(0)
					.toISOString();
				const nextWeekToDate = momentNextWeekDay
					.set({
						hour: 23,
						minute: 59,
						second: 59
					})
					.weekday(6)
					.toISOString();
				res.json({
					today: todayDate,
					weekRange: {
						fromDate: fromDate,
						toDate: toDate
					},
					tasks: result.length === 0 ? [] : result[0].tasks,
					totalAmount: result.length === 0 ? 0 : result[0].totalAmount,
					totalDone: result.length === 0 ? 0 : result[0].totalDone,
					nextWeekRange: {
						fromDate: nextWeekFromDate,
						toDate: nextWeekToDate
					},
					nextWeekDay: nextWeekDay,
					nextWeekTasks:
						nextWeekResult.length === 0 ? [] : nextWeekResult[0].tasks,
					nextWeekTotalAmount:
						nextWeekResult.length === 0 ? 0 : nextWeekResult[0].totalAmount,
					nextWeekTotalDone:
						nextWeekResult.length === 0 ? 0 : nextWeekResult[0].totalDone
				});
			});
		})
		.catch(err => {
			throw new Error(err);
		});
};

const getTask = (req, res) => {
	const taskId = req.params.taskId;

	Tasks.findById(taskId)
		.then(result =>
			res.json({
				result
			})
		)
		.catch(err => {
			throw new Error(err);
		});
};

const postTasks = async (req, res) => {
	const tasksFromReq = req.body.tasks;
	const userId = req.user._id;
	const taskDaysArr = [];
	await tasksFromReq.forEach(({taskId, selectedDays}) => {
		selectedDays.forEach(day => {
			return taskDaysArr.push({
				userId,
				task: taskId,
				date: moment(day, ['DD-MM-YYYY'])
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

	const newTask = new Tasks({
		task: value.taskId,
		date: value.date,
		userId
	});

	newTask
		.save()
		.then(result =>
			res.json({
				result
			})
		)
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

	const today = moment().locale('uk', {
		week: {
			dow: 1 // Monday is the first day of the week
		}
	});

	Tasks.findByIdAndUpdate(
		{
			_id: taskId
		},
		{
			$set: value
		},
		{
			new: true
		}
	)
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
			const fromDate = today
				.set({
					hour: 0,
					minute: 0,
					second: 0,
					millisecond: 0
				})
				.weekday(0)
				.toISOString();
			const toDate = today
				.set({
					hour: 23,
					minute: 59,
					second: 59
				})
				.weekday(6)
				.toISOString();

			Tasks.aggregate([
				{
					$match: {
						userId: ObjectId(userId)
					}
				},
				{
					$match: {
						date: {
							$gte: new Date(fromDate),
							$lte: new Date(toDate)
						}
					}
				},
				{
					$group: {
						_id: false,
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
				}
			])
				.then(aggregate => {
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
				})
				.catch(err => {
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
		.then(result =>
			res.json({
				result
			})
		)
		.catch(err => {
			throw new Error(err);
		});
};

const createTasks = (req, res) => {
	const tasksFromReq = req.body.tasks;
	const userId = req.user.id;
	const taskDaysArr = [];
	tasksFromReq.map(({taskId, selectedDays}) => {
		selectedDays.map(day => {
			const fromIncomingDateToString = moment(day, 'DD-MM-YYYY').format(
				'YYYY-MM-DD-HH-mm-ss'
			);
			const dateToUTC = fromIncomingDateToString.split('-');
			const fromDateStringToUTCDate = new Date(
				Date.UTC(+dateToUTC[0], +dateToUTC[1] - 1, +dateToUTC[2], 0, 0, 0)
			);
			return taskDaysArr.push({
				userId,
				task: taskId,
				date: fromDateStringToUTCDate
			});
		});
	});
	Tasks.insertMany(taskDaysArr)
		.then(result => {
			res.json({
				status: 'OK',
				planningTasks: result
			});
		})
		.catch(err => {
			res.status(400).json({
				status: 'BAD',
				error: err,
				message: err.message
			});
		});
};

module.exports = {
	getTasks,
	getTask,
	createTask,
	updateTask,
	deleteTask,
	postTasks,
	createTasks
};
