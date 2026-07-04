const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';

// Basic JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Route: Summarize an article (Requires JWT)
router.post('/summarize', authenticateToken, articleController.summarizeArticle);

// Route: Get feed of articles (Public)
router.get('/feed', articleController.getFeed);

module.exports = router;
