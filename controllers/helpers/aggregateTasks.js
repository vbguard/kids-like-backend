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
	const toDate = day
	    .set({
	        hour: 23,
	        minute: 59,
	        second: 59
	    })
	    .weekday(6)
	    .toISOString();
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
					$lte: new Date(toDate)
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
