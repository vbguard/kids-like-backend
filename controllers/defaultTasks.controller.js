const DefaultTasks = require('../models/defaultTasks.model');
const Joi = require('@hapi/joi');

const getDefaultTasks = (req, res) => {

  DefaultTasks.find()
    .then(result => res.json({
      result
    }))
    .catch(err => {
      throw new Error(err);
    });
};

const getDefaultTask = (req, res) => {
  const defaultTaskId = req.params.defaultTaskId;

  DefaultTasks.findById(defaultTaskId)
    .then(result => res.json({
      result
    }))
    .catch(err => {
      throw new Error(err);
    });
};

const createDefaultTask = (req, res, next) => {
  const taskData = req.body;

  const schema = Joi.object({
    cardTitle: Joi.string().required(),
    imageUrl: Joi.string
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

  const newDefaultTask = new DefaultTasks(value);

  newDefaultTask
    .save()
    .then(result => res.json({
      result
    }))
    .catch(err => {
      throw new Error(err);
    });
};

const updateDefaultTask = (req, res) => {
  const defaultTaskId = req.params.defaultTaskId;
  const taskForUpdate = req.body;

  const schema = Joi.object({
    cardTitle: Joi.string().required(),
    imageUrl: Joi.string
      .uri({
        scheme: ['https']
      })
      .required()
  });
  const {
    error,
    value
  } = schema.validate(taskForUpdate);
  if (error) {
    return next(error);
  }

  DefaultTasks.findByIdAndUpdate({
      _id: defaultTaskId
    }, {
      $set: value
    })
    .then(result => {
      if (!result) {
        return res
          .status(404)
          .json({
            message: `Default task with id ${defaultTaskId} not found`
          });
      }
      res.json({
        result
      });
    })
    .catch(err => {
      throw new Error(err);
    });
};

const deleteDefaultTask = (req, res) => {
  const defaultTaskId = req.params.defaultTaskId;

  DefaultTasks.findByIdAndDelete(defaultTaskId)
    .then(result => res.json({
      result
    }))
    .catch(err => {
      throw new Error(err);
    });
};

module.exports = {
  createDefaultTask,
  getDefaultTasks,
  getDefaultTask,
  updateDefaultTask,
  deleteDefaultTask,
};
