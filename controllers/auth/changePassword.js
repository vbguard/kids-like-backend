const User = require('../../models/user.model');
const Joi = require('@hapi/joi');
const passport = require('passport');

const changePassword = (req, res, next) => {
  console.log('changePassword route');
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
      newPassword: Joi.string()
        .min(5)
        .max(12)
        .required(),
      confirmedPassword: Joi.string()
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
  const userId = req.user.id;

  const result = schema.validate(req.body);

  if (result.error) {
    return next(result.error);
  }

  const sendError = error => {
    const errMessage =
      error.message;
    res.json({
      status: 'Error',
      error: errMessage
    });
  };

  const {
    newPassword,
    confirmedPassword
  } = result.value;

  const upadtedUser = {
    password: newPassword
  };

  User.findByIdAndUpdate({
      _id: userId
    }, {
      $set: upadtedUser
    }, {
      new: true
    })
    .then(findedUser => {
      if (newPassword !== confirmedPassword) {
        return res.status(403).json({
          status: 'Error',
          result: 'Введенные новые пароли не совпадают.'
        });
      }
      res.json({
        status: 'success',
        result: findedUser,
      });
    })
    .catch(sendError);
};

module.exports = changePassword;

/* 
       "nickname": "test1",
        "email": "test1@test.com",
        "password": "password",
        "newPassword": "password1",
        "confirmedPassword": "password1"
*/
