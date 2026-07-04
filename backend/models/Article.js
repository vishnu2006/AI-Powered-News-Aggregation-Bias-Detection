const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  content: { type: String, required: true }, // The heavy text payload
  summary: { type: String, required: true },
  category: { type: String, required: true, index: true },
  source: { type: String, default: 'Unknown' },
  publishedAt: { type: Date, default: Date.now },
});

// ==========================================
// OPTIMIZED MONGODB INDEXING STRATEGY
// ==========================================

// 1. Unique Index on URL (Prevents COLLSCAN during real-time summarization)
// This ensures that when we check if an article URL has already been summarized,
// it uses an O(log N) B-Tree lookup instead of scanning the entire collection.
articleSchema.index({ url: 1 }, { unique: true, background: true });

// 2. Compound Index for Feed Aggregation/Sorting
// Optimizes fetching articles by a specific category, sorted by the newest first.
articleSchema.index({ category: 1, publishedAt: -1 }, { background: true });

// 3. Text Index (Optional but highly recommended for news searching)
articleSchema.index({ title: 'text', content: 'text' }, { background: true });

module.exports = mongoose.model('Article', articleSchema);
