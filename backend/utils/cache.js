const NodeCache = require('node-cache');

// Initialize cache with a Time-To-Live (TTL) of 24 hours (86400 seconds).
// This serves as our L1 Cache for real-time article summarization.
// It instantly returns pre-summarized articles, avoiding Gemini API limits and MongoDB I/O.
const cache = new NodeCache({
  stdTTL: 86400, // 24 hours
  checkperiod: 3600, // Check for expired keys every hour
  useClones: false // performance optimization to avoid deep copying
});

module.exports = cache;
