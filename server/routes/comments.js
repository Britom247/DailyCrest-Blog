const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { body, validationResult } = require('express-validator');

// Get comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ 
      post: req.params.postId,
      status: 'approved',
      parentComment: null 
    })
    .sort({ createdAt: -1 })
    .populate('author', 'name avatar');

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ 
          parentComment: comment._id,
          status: 'approved'
        })
        .sort({ createdAt: 'asc' })
        .populate('author', 'name avatar');
        
        return {
          ...comment.toObject(),
          replies
        };
      })
    );

    res.json(commentsWithReplies);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Error loading comments' });
  }
});

// Create a comment
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('content').trim().notEmpty().withMessage('Comment is required').isLength({ min: 3, max: 1000 }),
  body('post').notEmpty().withMessage('Post ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, content, post, parentComment } = req.body;

    // Check if post exists
    const postExists = await Post.findById(post);
    if (!postExists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if parent comment exists (if replying)
    if (parentComment) {
      const parentExists = await Comment.findById(parentComment);
      if (!parentExists) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const comment = new Comment({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      content: content.trim(),
      post,
      parentComment,
      status: 'pending', // Auto-moderation
      likes: 0
    });

    await comment.save();

    // TODO: Send notification email to admin
    // TODO: Send email notification to comment author if reply

    res.status(201).json({
      ...comment.toObject(),
      message: 'Your comment has been submitted and is pending approval.'
    });
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ message: 'Error posting comment' });
  }
});

// Like a comment
router.post('/:id/like', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.likes = (comment.likes || 0) + 1;
    await comment.save();

    res.json({ likes: comment.likes });
  } catch (err) {
    console.error('Error liking comment:', err);
    res.status(500).json({ message: 'Error liking comment' });
  }
});

// Report a comment
router.post('/:id/report', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Add report count to comment (you might want to add a field for this)
    // comment.reports = (comment.reports || 0) + 1;
    // await comment.save();

    // TODO: Send notification email to admin about reported comment

    res.json({ message: 'Comment reported successfully' });
  } catch (err) {
    console.error('Error reporting comment:', err);
    res.status(500).json({ message: 'Error reporting comment' });
  }
});

// Admin: Get all comments (with pagination and filtering)
router.get('/admin/all', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
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
    res.status(500).json({ message: 'Error loading comments' });
  }
});

// Admin: Update comment status
router.put('/admin/:id', async (req, res) => {
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
    res.status(500).json({ message: 'Error updating comment' });
  }
});

// Admin: Delete comment
router.delete('/admin/:id', async (req, res) => {
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
    res.status(500).json({ message: 'Error deleting comment' });
  }
});

module.exports = router;