// const Tasks = require('../models/tasks.model');
const Tasks = require('../../models/tasks.model');
const ObjectId = require('mongoose').Types.ObjectId;
const moment = require('moment');

const aggregateTasks = (day, userId) => {
	// console.log('inside aggregationTasks');
	// console.log('day', day);
	// console.log('typeof day', typeof day);
	// let bufferStartDate = {...day};
	// console.log('fromDate', fromDate);
	// console.log('moment', moment);
	// console.log('day instanceof moment', day instanceof moment);
	const fromDate = day
		.set({
			hour: 0,
			minute: 0,
			second: 0,
			millisecond: 0
		})
		.weekday(0)
		.toISOString();
	// const toDate = today
	//     .set({
	//         hour: 23,
	//         minute: 59,
	//         second: 59
	//     })
	//     .weekday(6)
	//     .toISOString();
	// let bufferCrutchDate = {...day};
	// crutchDate is placed for tasks collection because tasks at the last day of the week are missed
	const crutchDate= day
		.set({
			hour: 23,
			minute: 59,
			second: 59
		})
		.weekday(6)
		.toISOString();
	// console.log('fromDate', fromDate);
	// console.log('typeof fromDate', typeof fromDate);
	// console.log('crutchDate', crutchDate);
	// console.log('typeof crutchDate', typeof crutchDate);
	return Tasks.aggregate([
		{
			$match: {
				userId: ObjectId(userId)
			}
		},
		{
			$match: {
				date: {
					$gte: new Date(fromDate),
					$lte: new Date(crutchDate)
				}
			}
		},
		{
			$sort: {
				date: 1
			}
		},
		{
			$lookup: {
				from: 'planningtasks',
				localField: 'task',
				foreignField: '_id',
				as: 'task'
			}
		},
		{
			$sort: {
				date: 1
			}
		},
		{
			$unwind: {
				path: '$task',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$sort: {
				date: 1
			}
		},
		{
			$addFields: {
				cardTitle: '$task.cardTitle',
				imageUrl: '$task.imageUrl'
			}
		},
		{
			$project: {
				_id: true,
				date: true,
				cardTitle: true,
				imageUrl: true,
				isDone: true,
				point: true
			}
		},
		{
			$group: {
				_id: '$date',
				dayTasks: {
					$push: '$$ROOT'
				}
			}
		},
		{
			$project: {
				_id: false,
				day: {
					$dateToParts: {
						date: '$_id',
						iso8601: true
					}
				},
				dayTasks: true
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
				'dayTasks.point': true
			}
		},
		{
			$sort: {
				day: 1
			}
		},
		{
			$group: {
				_id: '$day',
				dayTasks: {
					$addToSet: '$dayTasks'
				}
			}
		},
		{
			$sort: {
				_id: 1
			}
		},
		{
			$project: {
				_id: false,
				day: '$_id',
				dayTasks: true
			}
		},
		{
			$unwind: {
				path: '$dayTasks',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$unwind: {
				path: '$dayTasks',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$group: {
				_id: '$day',
				dayTasks: {
					$push: '$dayTasks'
				},
				totalAmount: {
					$sum: '$dayTasks.point'
				},
				totalDone: {
					$sum: {
						$cond: {
							if: '$dayTasks.isDone',
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
				day: '$_id',
				dayTasks: true,
				totalAmount: true,
				totalDone: true
			}
		},
		{
			$sort: {
				day: 1
			}
		},
		{
			$group: {
				_id: false,
				tasks: {
					$push: '$$ROOT'
				},
				totalAmount: {
					$sum: '$totalAmount'
				},
				totalDone: {
					$sum: '$totalDone'
				}
			}
		}
	]);
};

module.exports = aggregateTasks;
