const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TasksSchema = new Schema(
	{
		task: {
			type: Schema.Types.ObjectId,
			ref: 'PlanningTasks'
		},
		isDone: {
			type: Boolean,
			default: false
		},
		points: {
			type: Number,
			default: 1
		},
		date: {
			type: Date,
			required: true
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'Users'
		}
	},
	{
		timestamps: true
	}
);

TasksSchema.pre('findOneAndUpdate', function() {
	const update = this.getUpdate();
	if (update.__v != null) {
		delete update.__v;
	}
	const keys = ['$set', '$setOnInsert'];
	for (const key of keys) {
		if (update[key] != null && update[key].__v != null) {
			delete update[key].__v;
			if (Object.keys(update[key]).length === 0) {
				delete update[key];
			}
		}
	}
	update.$inc = update.$inc || {};
	update.$inc.__v = 1;
});

const Tasks = mongoose.model('Tasks', TasksSchema);

module.exports = Tasks;
