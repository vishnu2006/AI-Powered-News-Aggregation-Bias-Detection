const Article = require('../models/Article');
const cache = require('../utils/cache');

// Mock function for Gemini API call
const callGeminiAPI = async (url) => {
  // Simulating external API latency
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`AI generated summary for ${url}`);
    }, 1500); // 1.5s simulated latency
  });
};

exports.summarizeArticle = async (req, res) => {
  try {
    const { url, title, content, category } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const cacheKey = `ArticleSummary:${url}`;

    // L1 Cache: Check in-memory node-cache (0 latency)
    const cachedArticle = cache.get(cacheKey);
    if (cachedArticle) {
      return res.json({ source: 'memory-cache', data: cachedArticle });
    }

    // L2 Cache: Check MongoDB. 
    // This utilizes the O(log N) `{ url: 1 }` index preventing a COLLSCAN.
    // We use .lean() because we only need to read data, not modify/save it immediately,
    // which bypasses Mongoose document instantiation and speeds up the query.
    let article = await Article.findOne({ url }).lean();

    if (article) {
      // It was in DB but not in memory cache. Cache it now for next time.
      cache.set(cacheKey, article);
      return res.json({ source: 'mongodb-index', data: article });
    }

    // Not in cache, not in DB. We must do the heavy Gemini summarization.
    const summary = await callGeminiAPI(url);
    
    // Save to MongoDB
    const newArticle = new Article({
      title: title || 'Scraped Title',
      url,
      content: content || 'Scraped full content text goes here...',
      summary,
      category: category || 'Technology'
    });
    
    await newArticle.save();
    
    // Cache the newly created article as a plain JS object
    cache.set(cacheKey, newArticle.toObject());
    
    return res.status(201).json({ source: 'gemini-api', data: newArticle });
  } catch (err) {
    res.status(500).json({ error: 'Summarization failed', details: err.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const { category } = req.query;
    
    const query = category ? { category } : {};
    
    // PERF OPTIMIZATION: 
    // 1. .lean() skips Mongoose hydration (2-3x faster for reads)
    // 2. Projection (.select) excludes the massive 'content' field, returning only what the UI needs.
    // 3. The query hits the { category: 1, publishedAt: -1 } compound index natively.
    const articles = await Article.find(query)
      .select('title url summary category publishedAt -_id')
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean();
      
    res.json({ count: articles.length, articles });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feed', details: err.message });
  }
};
