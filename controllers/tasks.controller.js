// **   TODO:        */
//! @ GET --- userId => find sets by userId => sets of User populate tasks === Finish😀
//!
//!
const Tasks = require('../models/tasks.model');
const ObjectId = require('mongoose').Types.ObjectId;
const moment = require('moment');
const Joi = require('joi');

const getTasks = (req, res) => {
  // console.log('inside getTasks');
  const userId = req.user.id;

  // const firstDay = moment().get;
  // console.log('firstDay :', firstDay);
  const today = moment().locale('uk', {
    week: {
      dow: 1 // Monday is the first day of the week
    }
  });

  const fromDate = today
    .set({
      hour: 3,
      minute: 0,
      second: 0,
      millisecond: 0
    })
    .weekday(0)
    .toISOString();
  const toDate = today
    .set({
      hour: 23,
      minute: 59,
      second: 59
    })
    .weekday(6)
    .toISOString();

  // console.log('toDate', toDate);
  // crutchDate is placed for tasks collection because tasks at the last day of the week are missed
  const crutchDate = today
    .set({
      hour: 23,
      minute: 59,
      second: 59
    })
    .weekday(7)
    .toISOString();

  Tasks.aggregate([{
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
    ])
    .then(result => {
      console.log('result :', result);
      if (result.length === 0) {
        res.json({
          today: today,
          weekRange: {
            fromDate: fromDate,
            toDate: toDate
          },
          tasks: [],
          totalAmount: 0,
          totalDone: 0
        });
      } else {
        res.json({
          today: today,
          weekRange: {
            fromDate: fromDate,
            toDate: toDate
          },
          tasks: result[0].tasks,
          totalAmount: result[0].totalAmount,
          totalDone: result[0].totalDone
        });
      }
    })
    .catch(err => {
      throw new Error(err);
    });
};

const getTask = (req, res) => {
  const taskId = req.params.taskId;

  Tasks.findById(taskId)
    .then(result =>
      res.json({
        result
      })
    )
    .catch(err => {
      throw new Error(err);
    });
};

const postTasks = async (req, res) => {
  const tasksFromReq = req.body.tasks;
  const userId = req.user._id;
  const taskDaysArr = [];
  console.log('tasksFromReq :', tasksFromReq);
  await tasksFromReq.forEach(({
    taskId,
    selectedDays
  }) => {
    selectedDays.forEach(day => {
      return taskDaysArr.push({
        userId,
        task: taskId,
        date: moment(day, ['DD-MM-YYYY'])
      });
    });
  });

  Tasks.insertMany(await taskDaysArr)
    .then(result => {
      res.status(201).json({
        status: 'OK',
        newTasks: result
      });
    })
    .catch(err => {
      throw new Error(err);
    });
};

const createTask = (req, res) => {
  const taskData = req.body;
  const userId = req.user.id;

  const schema = Joi.object({
    taskId: Joi.string().required(),
    date: Joi.date().required()
  });

  const {
    error,
    value
  } = schema.validate(taskData);

  if (error) {
    return next(error);
  }

  const newTask = new Tasks({
    task: value.taskId,
    date: value.date,
    userId
  });

  newTask
    .save()
    .then(result =>
      res.json({
        result
      })
    )
    .catch(err => {
      throw new Error(err);
    });
};

const updateTask = (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.taskId;
  const taskForUpdate = req.body;
  console.log('taskForUpdate', taskForUpdate)
  const schema = Joi.object({
    cardId: Joi.string(),
    isDone: Joi.boolean(),
    point: Joi.number(),
    date: Joi.date(),
    userId: Joi.string()
  });

  const {
    error,
    value
  } = schema.validate(taskForUpdate);
  if (error) {
    return next(error);
  }

  Tasks.findByIdAndUpdate({
      _id: taskId
    }, {
      $set: value
    }, {
      new: true
    })
    .populate('task')
    .select({
      __v: 0,
      userId: 0,
      'task._id': 0,
      'task.userId': 0,
      'task.__v': 0,
      createdAt: 0,
      updatedAt: 0
    })
    .then(result => {
      const today = moment().locale('uk', {
        week: {
          dow: 1 // Monday is the first day of the week
        }
      });

      const fromDate = today
        .set({
          hour: 3,
          minute: 0,
          second: 0,
          millisecond: 0
        })
        .weekday(0)
        .toISOString();
      const toDate = today
        .set({
          hour: 23,
          minute: 59,
          second: 59
        })
        .weekday(6)
        .toISOString();

      // crutchDate is placed because tasks at the last day of the week are missed
      const crutchDate = today
        .set({
          hour: 23,
          minute: 59,
          second: 59
        })
        .weekday(7)
        .toISOString();

      Tasks.aggregate([{
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
            $group: {
              _id: false,
              totalAmount: {
                $sum: '$point'
              },
              totalDone: {
                $sum: {
                  $cond: {
                    if: '$isDone',
                    then: 1,
                    else: 0
                  }
                }
              }
            }
          }
        ])
        .then(aggregate => {
          console.log('aggregate', aggregate)
          console.log('result', result)
          res.json({
            status: 'OK',
            totalAmount: aggregate[0].totalAmount,
            totalDone: aggregate[0].totalDone,
            updatedTasks: {
              _id: result._id,
              isDone: result.isDone,
              point: result.point,
              cardTitle: result.task.cardTitle,
              imageUrl: result.task.imageUrl
            }
          });
        })
        .catch(err => {
          throw new Error(err);
        });
    })
    .catch(err => {
      throw new Error(err);
    });
};

const deleteTask = (req, res) => {
  const taskId = req.params.taskId;

  Tasks.findByIdAndDelete(taskId)
    .then(result =>
      res.json({
        result
      })
    )
    .catch(err => {
      throw new Error(err);
    });
};

const createTasks = (req, res) => {
  // console.log('req.body.tasks', req.body.tasks)
  const tasksFromReq = req.body.tasks;
  const userId = req.user.id;
  const taskDaysArr = [];
  tasksFromReq.map(({
    taskId,
    selectedDays
  }) => {
    selectedDays.map(day => {
      return taskDaysArr.push({
        userId,
        task: taskId,
        date: new Date(moment(day, ['DD-MM-YYYY']))
      });
    });
  });
  // console.log('taskDaysArr', taskDaysArr)
  Tasks.insertMany(taskDaysArr)
    .then(result => {
      res.json({
        status: 'OK',
        planningTasks: result
      });
    })
    .catch(err => {
      res.status(400).json({
        status: 'BAD',
        error: err,
        message: err.message
      });
    });
  // console.log('taskDaysArr', taskDaysArr)
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  postTasks,
  createTasks
};
