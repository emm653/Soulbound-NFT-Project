const dotenv = require('dotenv');
dotenv.config();
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID);
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET);
console.log('BASE_URL:', process.env.BASE_URL);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;
const axios = require('axios');

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

const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL,  // Allow requests from your frontend URL
  methods: ['GET', 'POST'],
  credentials: true,
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${process.env.BASE_URL}/auth/github/callback`, // dynamic URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await axios.get(`https://api.github.com/users/${profile.username}`, {
      headers: {
        Authorization: `token ${accessToken}`, // Pass the access token here
      }
    });

    profile._json.created_at = user.data.created_at;
    return done(null, profile);
  } catch (error) {
    return done(error);
  }
}));

// GitHub login route
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub callback route (keep this one only)
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    // Redirect logic after successful authentication
    const frontend = process.env.FRONTEND_URL;
    if (req.user) {
      const createdAt = new Date(req.user._json.created_at);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const status = createdAt <= oneYearAgo ? 'Account+Verified' : 'Account+is+too+new';
      res.redirect(`${frontend}?status=${status}&github=${req.user.username}`);
    } else {
      res.redirect(`${frontend}?status=Authentication+Failed`);
    }
  }
);

// Logout
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Basic route
app.get('/', (req, res) => {
  if (!req.isAuthenticated()) {
    res.send(`<a href='/auth/github'>Login with GitHub</a>`);
  } else {
    res.send(`
      <h1>Hello ${req.user.username}</h1>
      <p>Your GitHub Profile: <a href="${req.user.profileUrl}">${req.user.profileUrl}</a></p>
      <a href="/logout">Logout</a>
    `);
  }
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${process.env.BASE_URL}`);
});
