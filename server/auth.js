import express from 'express';
import storage from '../test.json';

const path = require('path');

const router = express.Router();

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../login.html'));
});
router.post('/login', (req, res) => {
  console.log(`${req.body.username} is trying to login.(auth.js)`);
  const userData = storage.user.find(item => (item.username === req.body.username));
  if (userData && (req.body.password === userData.password)) {
    userData.password = 'undefined';
    req.logIn(userData, () => {
      res.redirect('/');
    });
  } else {
    res.redirect('/login');
  }
});
router.get('/logout', (req, res) => {
  console.log(`${req.user.username} logout.(auth.js)`);
  req.logOut();
  res.redirect('/login');
});

module.exports = router;