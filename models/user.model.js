const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require("../config/config");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true,
    lowercase: true
  },
  nickname: {
    type: String,
    minlength: 5,
    maxlength: 15,
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  googleId: {
    type: String,
    unique: true,
    index: true
  },
  name: { fullName: String },
  photo: String,
  token: String
}, {
  timestamps: true
});

UserSchema.methods.getPublicFields = function() {
  const returnObject = {
    userData: {
      nickname: this.nickname,
      email: this.email

    },
    token: this.token
  };
  return returnObject;
};

UserSchema.pre(
  'save',
  function (next) {
    var user = this;
    if (!user.isModified('password')) {
      return next();
    }
    bcrypt.hash(user.password, 10).then(hashedPassword => {
      user.password = hashedPassword;
      next();
    });
  },
  function (err) {
    next(err);
  }
);

UserSchema.methods.comparePassword = function (candidatePassword, next) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return next(err);
    next(null, isMatch);
  });
};

UserSchema.methods.validatePassword = function(password) {
  const compare = bcrypt.compareSync(password, this.password);
  return compare;
};

UserSchema.methods.getJWT = function() {
  const preToken = jwt.sign(
    {
      id: this._id
    },
    config.jwtSecretKey
  );
  
  const token = preToken
  
  this.token = token;
  this.save();
  
  return token;
};

const Users = mongoose.model('Users', UserSchema);

module.exports = Users;
