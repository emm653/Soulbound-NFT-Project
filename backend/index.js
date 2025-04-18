const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const app = express();

// GitHub OAuth config
passport.use(new GitHubStrategy({
  clientID: 'Ov23liyBjJalnOlqTUls',
  clientSecret: 'cbeeb5d5e84c6a2759e8b3aee6a7848fc1d05833',
  callbackURL: "https://https://soulbound-nft-project.onrender.com/auth/github/callback"
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
    const frontend = 'http://127.0.0.1:5500';
    const createdAt = new Date(req.user._json.created_at);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const status = createdAt <= oneYearAgo ? 'Account+Verified' : 'Account+is+too+new';
    
    // Redirect back to frontend with status
    res.redirect(`${frontend}/?status=${status}&github=${req.user.username}`);
  });
  window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");
    const githubUsername = urlParams.get("github");
  
    if (status) {
      const decodedStatus = decodeURIComponent(status.replace(/\+/g, ' '));
      const statusMessage = document.getElementById("status-message");
  
      if (decodedStatus === "Account Verified") {
        statusMessage.textContent = `✅ GitHub account "${githubUsername}" is verified. You can now mint.`;
        document.getElementById("mint-btn").style.display = "inline-block";
      } else {
        statusMessage.textContent = `❌ GitHub account "${githubUsername}" is too new. Cannot mint.`;
      }
    }
  
    document.getElementById("github-login").onclick = () => {
      window.location.href = "https://soulbound-nft-project.onrender.com/auth/github";
    };
  
    document.getElementById("mint-btn").onclick = () => {
      alert("Minting now...");
    };
  });
  

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
