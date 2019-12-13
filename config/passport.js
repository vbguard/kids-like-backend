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
        console.log('login :', email, ' ', password);
        Users.findOne({ email })
          .then(user => {
            console.log('user find in login pass :', user);
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
                console.log(userData);
                return done(null, userData, {
                  message: 'Logged In Successfully'
                });
              }
            });
          })
          .catch(err => {
            console.log('err :', err);
            done(null)
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
          const user = await User.findOne({ googleId: profile.id });
  
          if (user) {
            const token = user.getJWT();
            return done(null, { ...user, token });
          }
          if (!user) {
            const newUser = await new User({
              googleId: profile._json.sub,
              name: { fullName: profile._json.name },
              photo: profile._json.picture,
              email: profile._json.email
            });
  
            newUser.save((err, user) => {
              const token = user.getJWT();
              return done(err, { ...user, token });
            });
          }
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}
