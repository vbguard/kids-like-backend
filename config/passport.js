/* eslint-disable func-names */
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Users = require('../models/user.model');
const { jwtSecretKey, googleClientId, googleClientKey } = require('./config');


module.exports = function(passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        session: false
      },
      (email, password, done) => {
        Users.findOne({ email })
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
          .catch(err => {
            done(null, false, err)
          });
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
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientKey,
        callbackURL: `https://kidslike.goit.co.ua/api/v1/auth/google/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('profile :', profile);
          const user = await Users.findOne({ googleId: profile.id });
  
          if (user) {
            const token = user.getJWT();
            return done(null, { ...user, token });
          }
          if (!user) {
            const newUser = await new Users({
              googleId: profile._json.sub,
              name: { fullName: profile._json.name },
              photo: profile._json.picture,
              email: profile._json.email
            });
  
            newUser.save((err, user) => {
              if (err) return done(err, null);
              const token = user.getJWT();
              return done(null, { ...user, token });
            });
          }
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}
