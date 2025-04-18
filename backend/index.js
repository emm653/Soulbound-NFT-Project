const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Your existing backend routes (for GitHub OAuth, etc.)
app.get('/auth/github', /* GitHub authentication routes */);
app.get('/auth/github/callback', /* Callback after GitHub login */);

// Default route (serving the index.html from frontend)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${process.env.BASE_URL}`);
});
app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    const frontend = process.env.FRONTEND_URL;
    if (req.user) {
      const createdAt = new Date(req.user._json.created_at);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const status = createdAt <= oneYearAgo ? 'Account+Verified' : 'Account+is+too+new';
      res.redirect(`${frontend}/?status=${status}&github=${req.user.username}`);
    } else {
      res.redirect(`${frontend}/?status=Authentication+Failed`);
    }
  }
);
