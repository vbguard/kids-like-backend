const router = require('express').Router();
const passport = require('passport');
const User = require('../models/user.model');

const {
  login,
  register,
  changePassword,
  logOut,
  me
} = require('../controllers/auth');

const passportCheck = passport.authenticate('jwt', {
  session: false
});

router
  .get('/users', (req, res) => {
    User.find({}).then(result => {
      res.json(result);
    });
  })
  .get('/me', passportCheck, me)
  .post('/login', login)
  .post('/register', register)
  .patch('/user', passportCheck, changePassword)
  .post('/logout', passportCheck, logOut)
  .get(
    '/google',
    passport.authenticate('google', {
      session: false,
      scope: ['profile']
    })
  )
  .get(
    '/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: 'http://localhost:3000/auth/callback?error="auth bad"'
    }),
    // on success
    (req, res) => {
      // return the token or you would wish otherwise give eg. a success message
      res.redirect(
        301,
        `http://localhost:3000/auth/callback?token=${req.user.token}&remove`
      );
    },

    // on error; likely to be something FacebookTokenError token invalid or already used token,
    // these errors occur when the user logs in twice with the same token
    (err, req, res) => {
      // You could put your own behavior in here, fx: you could force auth again...
      // res.redirect('/auth/facebook/');
      if (err) {
        res.status(400);
        res.render('error', { message: err.message });
      }
    }
  );

module.exports = router;
