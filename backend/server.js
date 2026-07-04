require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);

// MongoDB Connection
// Notice we set autoIndex: true to ensure our optimized indexes are built on startup.
// In production, this should usually be done via migration scripts.
mongoose.connect(process.env.MONGO_URI, {
  autoIndex: true, // Build indexes specified in schemas
})
.then(() => {
  console.log('MongoDB connected successfully. Indexes built.');
  app.listen(PORT, () => {
    console.log(`NewsSense backend server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
