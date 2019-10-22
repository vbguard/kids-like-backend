const PlanningTasks = require('../models/planningTasks.model');
const Tasks = require('../models/tasks.model.js');
const moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId;

const getTasks = (req, res) => {
  const userId = req.user.id;
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

  PlanningTasks.find({
      userId
    })
    .select({
      __v: 0
    })
    .select({
      userId: 0
    })
    .then(result => {
      PlanningTasks.aggregate([{
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
        }
      ]).then(aggrResult => {
        res.json({
          status: 'OK',
          weekRange: {
            fromDate: fromDate,
            toDate: toDate
          },
          aggrResult: aggrResult,
          planningTasks: result
        });
      })

    })
    .catch(err => {
      throw new Error(err);
    });
};

const postTasks = (req, res) => {
  // console.log('req.body.tasks', req.body.tasks)
  const tasksFromReq = req.body.tasks;
  const userId = req.user._id;
  const taskDaysArr = [];
  tasksFromReq.map(({
    taskId,
    selectedDays
  }) => {
    selectedDays.map((day) => {
      return taskDaysArr.push({
        userId,
        task: taskId,
        date: moment(day, ["MM-DD-YYYY", "DD-MM", "DD-MM-YYYY"])
      })
    })
  })
  // console.log('taskDaysArr', taskDaysArr)
  Tasks.insertMany(taskDaysArr).then(
    (result) => {
      res.json({
        status: 'OK',
        planningTasks: result
      });
    }

  ).catch(err => {
    throw new Error(err);
  })
  // console.log('taskDaysArr', taskDaysArr)
}
module.exports = {
  postTasks,
  getTasks,
};
