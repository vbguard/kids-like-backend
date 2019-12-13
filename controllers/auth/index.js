const login = require('./login');
const register = require('./register');
const logOut = require('./logout');
const me = require('./me');
const changePassword = require('./changePassword');

module.exports = {
  login,
  register,
  changePassword,
  logOut,
  me
};
