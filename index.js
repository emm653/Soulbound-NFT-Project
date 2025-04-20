const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const app = express();

// GitHub OAuth config
passport.use(new GitHubStrategy({
  clientID: 'Ov23liyBjJalnOlqTUls',
  clientSecret: 'cbeeb5d5e84c6a2759e8b3aee6a7848fc1d05833',
  callbackURL: "https://soulbound-nft-project.onrender.com/auth/github/callback"
}, function(accessToken, refreshToken, profile, done) {
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// GitHub authentication route
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub callback route
app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    const createdAt = new Date(req.user._json.created_at);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const status = createdAt <= oneYearAgo ? 'Account Verified' : 'Account is too new';

    const redirectURL = `http://localhost:5500/frontend.html?status=${encodeURIComponent(status)}&github=${encodeURIComponent(req.user.username)}`;

    res.redirect(redirectURL);
  });
  app.get('/logout', (req, res) => {
    req.logout(() => {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
  
        // Redirect to a special frontend "logged out" page that then redirects to main
        res.redirect('http://localhost:5500/loggedout.html');
      });
    });
  });
  


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
