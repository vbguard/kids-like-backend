const Tasks = require('../../models/tasks.model');
const ObjectId = require('mongoose').Types.ObjectId;

const aggregateTasks = (day, userId) => {
	const fromDate = day
		.set({
			hour: 0,
			minute: 0,
			second: 0,
			millisecond: 0
		})
		.weekday(0)
		.toISOString();

	console.log('fromDate :', fromDate);
	const toDate = day
		.set({
			hour: 23,
			minute: 59,
			second: 59
		})
		.weekday(6)
		.toISOString();

	console.log('toDate :', toDate);
	return Tasks.aggregate([
		// {
		// 	$match: {}
		// }
		{
			$match: {
				userId: ObjectId(userId),
				date: {
					$gte: new Date(fromDate),
					$lte: new Date(toDate)
				}
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
			$unwind: {
				path: '$task',
				preserveNullAndEmptyArrays: true
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
				points: true
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
				'dayTasks.points': true
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
					$sum: '$dayTasks.points'
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
		},
		{
			$project: {
				_id: true,
				tasks: true,
				totalAmount: true,
				totalDone: true,
				'weekRange.fromDate': fromDate,
				'weekRange.toDate': toDate
			}
		}
	]);
};

module.exports = aggregateTasks;
