const PlanningTasks = require('../models/planningTasks.model');
const Tasks = require('../models/tasks.model.js');
const moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId;

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

const getTasks = (req, res) => {
  const userId = req.user.id;

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
      });
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
    selectedDays.map(day => {
      return taskDaysArr.push({
        userId,
        task: taskId,
        date: moment(day, ['MM-DD-YYYY', 'DD-MM', 'DD-MM-YYYY'])
      });
    });
  });
  Tasks.insertMany(taskDaysArr)
    .then(result => {
      res.json({
        status: 'OK',
        planningTasks: result
      });
    })
    .catch(err => {
      throw new Error(err);
    });
};

const getPlannedTasks = (req, res) => {
  const userId = req.user._id;
  Tasks.aggregate([{
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
      $group: {
        _id: 1,
        totalAmount: {
          $sum: '$point'
        },
        totalDone: {
          $sum: {
            $cond: {
              if: "$isDone",
              then: 1,
              else: 0
            }
          }
        }
      }
    }
  ]).then(aggrResult => {
    Tasks.aggregate([{
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
        $project: {
          _id: "$_id",
          isDone: "$_isDone",
          point: "$point",
          date: "$date",
          task: "$task"
          // task: {
          //   $lookup: {
          //     from: "DefaultTasks",
          //     localField: "cardTitle",
          //     foreignField: "cardTitle",
          //     localField: "imageUrl",
          //     foreignField: "imageUrl",
          //     as: "defaultTask"
          //   }
          // }
        }
      }
    ]).then((transformedTasks) => {
      res.json({
        status: 'OK',
        userId: userId,
        today: today,
        fromDate: fromDate,
        weekRange: {
          fromDate: fromDate,
          toDate: toDate
        },
        tasksCount: aggrResult,
        plannedTasks: transformedTasks
      });
    })
  });
};

module.exports = {
  postTasks,
  getTasks,
  getPlannedTasks
};
