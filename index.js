const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const app = express();

// Session setup
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Serialize/Deserialize
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/github/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await axios.get(`https://api.github.com/users/${profile.username}`);
    profile._json.created_at = user.data.created_at; // Attach created_at to profile for use later
    return done(null, profile);
  } catch (error) {
    return done(error);
  }
}));

// GitHub login route
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

// GitHub callback with age check and redirect
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    if (req.user) {
      const createdAt = new Date(req.user._json.created_at);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (createdAt <= oneYearAgo) {
        res.redirect(`http://localhost:5500/frontend.html?status=Account+Verified&github=${req.user.username}`);
      } else {
        res.redirect(`http://localhost:5500/frontend.html?status=Account+is+too+new&github=${req.user.username}`);
      }
    } else {
      res.redirect(`http://localhost:5500/frontend.html?status=Authentication+Failed`);
    }
  }
);

// Logout route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.redirect('/');
    }
    res.redirect('/');
  });
});


// Basic homepage for testing
app.get('/', (req, res) => {
  if (!req.isAuthenticated()) {
    res.send(`<a href="/auth/github">Login with GitHub</a>`);
  } else {
    res.send(`
      <h1>Hello ${req.user.username}</h1>
      <p>Your GitHub Profile: <a href="${req.user.profileUrl}">${req.user.profileUrl}</a></p>
      <a href="/logout">Logout</a>
    `);
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
