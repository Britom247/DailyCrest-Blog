const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Subscriber = require('../models/Subscriber');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { auth, isAdmin } = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get dashboard stats (combine counts with analytics data)
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    // basic content counts
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ published: true });
    const draftPosts = await Post.countDocuments({ published: false });
    const totalSubscribers = await Subscriber.countDocuments({ status: 'active' });
    const newSubscribers = await Subscriber.countDocuments({
      status: 'active',
      subscribedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const totalComments = await Comment.countDocuments();
    const pendingComments = await Comment.countDocuments({ status: 'pending' });
    const approvedComments = totalComments - pendingComments;

    // analytics-specific metrics
    const quick = await analyticsService.getQuickStats();

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalSubscribers,
      newSubscribers,
      totalComments,
      pendingComments,
      approvedComments,
      ...quick
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get posts with pagination
router.get('/posts', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await Post.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments();

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get single post by ID
router.get('/posts/:id', auth, isAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create new post
router.post('/posts', auth, isAdmin, upload.single('featuredImage'), async (req, res) => {
  try {
    let featuredImageUrl = '';
    let featuredImageId = '';

    console.log('User from auth:', req.user); // Debug log
    console.log('User ID:', req.user?._id); // Debug log

    // Upload image to Cloudinary if provided
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'dailycrest' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        
        featuredImageUrl = result.secure_url;
        featuredImageId = result.public_id;
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError);
      }
    }

    // Parse categories if they're sent as a string
    let categories = [];
    if (req.body.categories) {
      try {
        categories = JSON.parse(req.body.categories);
        // Validate categories against enum
        const validCategories = ['Technology', 'Business', 'Growth', 'Insights', 'AI', 'Programming'];
        categories = categories.filter(cat => validCategories.includes(cat));
      } catch (e) {
        console.error('Error parsing categories:', e);
      }
    }

    // Parse tags if they're sent as a string
    let tags = [];
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
      } catch (e) {
        console.error('Error parsing tags:', e);
      }
    }

    // Parse published status - handle both string and boolean
    let published = false;
    if (req.body.published) {
      if (typeof req.body.published === 'string') {
        published = req.body.published === 'true';
      } else if (typeof req.body.published === 'boolean') {
        published = req.body.published;
      }
    }

    // Ensure we have a valid author
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated properly' });
    }

    const postData = {
      title: req.body.title,
      content: req.body.content,
      excerpt: req.body.excerpt || '',
      authorName: (req.body.authorName || '').trim(),
      categories: categories,
      tags: tags,
      published: published,
      metaTitle: req.body.metaTitle || '',
      metaDescription: req.body.metaDescription || '',
      metaKeywords: req.body.metaKeywords || '',
      slug: req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      featuredImage: featuredImageUrl,
      featuredImageId: featuredImageId,
      author: req.user._id, // Use _id from the user object
      publishedAt: published ? new Date() : null
    };

    console.log('Creating post with data:', postData); // Debug log

    const post = new Post(postData);

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update post
router.put('/posts/:id', auth, isAdmin, upload.single('featuredImage'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Handle image upload
    if (req.file) {
      try {
        // Delete old image from Cloudinary if exists
        if (post.featuredImageId) {
          await cloudinary.uploader.destroy(post.featuredImageId);
        }

        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'dailycrest' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });

        post.featuredImage = result.secure_url;
        post.featuredImageId = result.public_id;
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError);
      }
    }

    // Parse categories if they're sent as a string
    if (req.body.categories) {
      try {
        const parsedCategories = JSON.parse(req.body.categories);
        const validCategories = ['Technology', 'Business', 'Growth', 'Insights', 'AI', 'Programming'];
        post.categories = parsedCategories.filter(cat => validCategories.includes(cat));
      } catch (e) {
        console.error('Error parsing categories:', e);
      }
    }

    // Parse tags if they're sent as a string
    if (req.body.tags) {
      try {
        post.tags = JSON.parse(req.body.tags);
      } catch (e) {
        console.error('Error parsing tags:', e);
      }
    }

    // Update other fields
    if (req.body.title) post.title = req.body.title;
    if (req.body.content) post.content = req.body.content;
    if (req.body.excerpt !== undefined) post.excerpt = req.body.excerpt;
    if (req.body.authorName !== undefined) post.authorName = String(req.body.authorName).trim();
    if (req.body.metaTitle !== undefined) post.metaTitle = req.body.metaTitle;
    if (req.body.metaDescription !== undefined) post.metaDescription = req.body.metaDescription;
    if (req.body.metaKeywords !== undefined) post.metaKeywords = req.body.metaKeywords;
    if (req.body.slug) post.slug = req.body.slug;

    // Handle published status
    if (req.body.published !== undefined) {
      if (typeof req.body.published === 'string') {
        post.published = req.body.published === 'true';
      } else if (typeof req.body.published === 'boolean') {
        post.published = req.body.published;
      }
    }

    // Update publishedAt if status changed to published
    if (post.published && !post.publishedAt) {
      post.publishedAt = new Date();
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete post
router.delete('/posts/:id', auth, isAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Delete image from Cloudinary
    if (post.featuredImageId) {
      await cloudinary.uploader.destroy(post.featuredImageId);
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all comments with pagination and filtering
router.get('/comments/all', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const comments = await Comment.find(query)
      .populate('post', 'title slug')
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments(query);

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update comment status
router.put('/comments/:id', auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.status = status;
    await comment.save();

    res.json(comment);
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete comment
router.delete('/comments/:id', auth, isAdmin, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Delete all replies too
    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get comment stats
router.get('/comments/stats', auth, isAdmin, async (req, res) => {
  try {
    const total = await Comment.countDocuments();
    const pending = await Comment.countDocuments({ status: 'pending' });
    const approved = await Comment.countDocuments({ status: 'approved' });
    const spam = await Comment.countDocuments({ status: 'spam' });

    res.json({
      total,
      pending,
      approved,
      spam
    });
  } catch (err) {
    console.error('Error fetching comment stats:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get comment counts for multiple posts (only count approved comments)
router.post('/posts/comments/count', auth, isAdmin, async (req, res) => {
  try {
    const { postIds } = req.body;
    
    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return res.json({});
    }
    
    // Convert valid string IDs to ObjectIds and skip malformed values
    const validObjectIds = postIds
      .filter(id => {
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) {
          console.log('Skipping invalid postId:', id);
        }
        return isValid;
      })
      .map(id => new mongoose.Types.ObjectId(id));
    
    if (validObjectIds.length === 0) {
      return res.json({});
    }
    
    const commentCounts = await Comment.aggregate([
      { 
        $match: { 
          post: { $in: validObjectIds },
          status: 'approved'  // Only count approved comments
        } 
      },
      { $group: { _id: '$post', count: { $sum: 1 } } }
    ]);
    
    const countsMap = {};
    commentCounts.forEach(item => {
      countsMap[item._id.toString()] = item.count;
    });
    
    res.json(countsMap);
  } catch (err) {
    console.error('Error fetching comment counts:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get subscribers
router.get('/subscribers', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const subscribers = await Subscriber.find({ status: 'active' })
      .sort({ subscribedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subscriber.countDocuments({ status: 'active' });

    res.json({
      subscribers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Error fetching subscribers:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete subscriber
router.delete('/subscribers/:id', auth, isAdmin, async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id);
    
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    await subscriber.deleteOne();
    res.json({ message: 'Subscriber deleted successfully' });
  } catch (err) {
    console.error('Error deleting subscriber:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
