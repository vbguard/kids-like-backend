const User = require('../../models/user.model');
const PlanningTasks = require('../../models/planningTasks.model');
const DefaultTasks = require('../../models/defaultTasks.model');
const login = require('./login');
const Joi = require('@hapi/joi');
// const {ValidationError} = require('../../core/error');

// Register New User and Check this email have in DB
const userSignup = (req, res, next) => {
  const schema = Joi.object()
    .keys({
      email: Joi.string()
        .regex(
          /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        )
        .required(),
      password: Joi.string()
        .min(5)
        .max(12)
        .required(),
      nickname: Joi.string()
        .min(5)
        .max(15)
        .required()
    })
    .options({
      stripUnknown: true,
      abortEarly: false
    });

  const result = schema.validate(req.body);

  if (result.error) {
    return next(result.error);
  }

  const sendError = error => {
    const errMessage =
      error.message || 'must handle this error on registration';
    res.json({
      status: 'error',
      error: errMessage
    });
  };

  const newUser = new User(result.value);
  newUser
    .save()
    .then(() => {
      DefaultTasks.find({})
        .then(defaultTasks => {
          // console.log('defaultTasks :', defaultTasks);
          const defaultTasksWithUserId = defaultTasks.map(task => ({
            userId: newUser._id,
            cardTitle: task.cardTitle,
            imageUrl: task.imageUrl
          }));
          PlanningTasks.insertMany(defaultTasksWithUserId)
            .then(savingPlanTasks => {
              if (savingPlanTasks) {
                login(req, res);
              }
            })
            .catch(sendError);
        })
        .catch(sendError);
    })
    .catch(sendError);
};

module.exports = userSignup;
