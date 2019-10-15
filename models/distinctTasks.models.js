const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DistinctTasksSchema = new Schema(
	{
		cardTitle: String,
		imageUrl: String,
		isDone: {type: Boolean, default: false},
		point: {type: Number, default: 1},
		date: Date,
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'Users'
		}
	},
	{
		timestamps: true
	}
);

DistinctTasksSchema.pre('findOneAndUpdate', function() {
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

const DistinctTasks = mongoose.model('DistinctTasks', DistinctTasksSchema);

module.exports = DistinctTasks;
