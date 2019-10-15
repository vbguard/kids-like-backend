const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomTasksSchema = new Schema({
	id: String,
	cardTitle: String,
	imageUrl: String,
	point: {type: Number, default: 1},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'Users'
	}
});

CustomTasksSchema.pre('findOneAndUpdate', function() {
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

const CustomTasks = mongoose.model('customTasks', CustomTasksSchema);

module.exports = customTasks;
