/* eslint-disable func-names */
const passport = require('passport');
const JwtStrategy  = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;

const jwtSecretKey = require('../config/config').jwtSecretKey;
const User = require('../models/user.model');

passport.use(
	new LocalStrategy(
		{
			usernameField: 'user[email]',
			passwordField: 'user[password]'
		},
		(email, password, done) => {
			Users.findOne({email})
				.then(user => {
					if (!user || !user.validatePassword(password)) {
						return done(null, false, {
							errors: {'email or password': 'is invalid'}
						});
					}
					return done(null, user);
				})
				.catch(done);
		}
	)
);

passport.use(
	new JwtStrategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: jwtSecretKey
		},
		function(jwtPayload, cb) {
			//find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
			Users.findById(jwtPayload.userId)
				.then(user => {
					return cb(null, user);
				})
				.catch(err => {
					return cb(err);
				});
		}
	)
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
