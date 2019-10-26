const Users = require('../../models/user.model');

const me = (req, res) => {
const userId = req.user.id;

Users.findById(userId).then(user => {
  res.json(user.getPublicFields());
}).catch(err => {
  res.status(400).json({
    status: 'BAD',
    error: err,
    message: 'User don\'t found'
  })
})
};

module.exports = me;