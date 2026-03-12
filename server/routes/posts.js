const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const analyticsService = require('../services/analyticsService');

// Get all published posts
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search } = req.query;
    const query = { published: true };
    
    if (category) query.categories = category;
    if (tag) query.tags = tag;
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex },
        { tags: searchRegex }
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'name avatar')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get related posts by slug (based on shared categories/tags)
router.get('/:slug/related', async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const currentPost = await Post.findOne({
      slug: req.params.slug,
      published: true
    }).select('_id categories tags');

    if (!currentPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const categories = Array.isArray(currentPost.categories) ? currentPost.categories : [];
    const tags = Array.isArray(currentPost.tags) ? currentPost.tags : [];

    if (categories.length === 0 && tags.length === 0) {
      return res.json([]);
    }

    const relatedPosts = await Post.find({
      _id: { $ne: currentPost._id },
      published: true,
      $or: [
        { categories: { $in: categories } },
        { tags: { $in: tags } }
      ]
    })
      .populate('author', 'name avatar')
      .sort({ publishedAt: -1 })
      .limit(Number(limit) || 3);

    res.json(relatedPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single post by slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ 
      slug: req.params.slug,
      published: true 
    }).populate('author', 'name avatar bio');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Track the view asynchronously (don't await to avoid slowing response)
    analyticsService.trackPostView(post._id, req);

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
