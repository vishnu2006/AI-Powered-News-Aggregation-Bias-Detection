const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';

// Simulate User Registration
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // In a real app, hash password with bcrypt here
    const user = new User({ email, passwordHash: password }); 
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

// Simulate User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate credentials
    const user = await User.findOne({ email });
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};
