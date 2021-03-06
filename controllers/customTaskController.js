const DefaultTasks = require('../models/defaultTasks.model');
const Joi = require('@hapi/joi');

const customTaskCreate = (req, res, next) => {
  const taskData = req.body;
  const userId = req.user.id;

  const schema = Joi.object({
    cardTitle: Joi.string().required(),
    imageUrl: Joi.string()
      .uri({
        scheme: ['https']
      })
      .required()
  });

  const {
    error,
    value
  } = schema.validate(taskData);

  if (error) {
    return next(error);
  }

  const newCustomeTask = new DefaultTasks({...value, userId});

  newCustomeTask
    .save()
    .then(result => res.json({
      status: 'ok',
      result
    }))
    .catch(err => {
      throw new Error(err);
    });
};
module.exports = {
  customTaskCreate,
};
