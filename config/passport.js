/* eslint-disable func-names */
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;

const jwtSecretKey = require('../config/config').jwtSecretKey;
const Users = require('../models/user.model');

passport.use(
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
			session: false
		},
		(email, password, done) => {
			Users.findOne({email})
				.then(user => {
					if (!user) {
						return done(null, false, {
							errors: {message: 'Incorrect email or password'}
						});
					}
					user.comparePassword(password, function(err, isMatch) {
						if (!isMatch) {
							return done(null, false, {
								message: 'Incorrect email or password'
							});
						}

						if (isMatch && !err) {
							user.getJWT();
							const userData = user.getPublicFields();
							return done(null, userData, {
								message: 'Logged In Successfully'
							});
						}
					});
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
			Users.findById(jwtPayload.id)
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
