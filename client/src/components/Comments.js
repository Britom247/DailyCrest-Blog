import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaThumbsUp, FaReply, FaFlag, FaCheck, FaExclamationCircle, FaUser, FaClock } from 'react-icons/fa';
import moment from 'moment';
import './Comments.css';

const Comments = ({ postId, postTitle }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ name: '', email: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [likedComments, setLikedComments] = useState(new Set());

  const fetchComments = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/comments/${postId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewComment(prev => ({ ...prev, [name]: value }));
    // Clear any previous errors when user starts typing
    if (error) setError('');
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!newComment.name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!validateEmail(newComment.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!newComment.content.trim()) {
      setError('Please enter your comment');
      return;
    }

    if (newComment.content.length < 3) {
      setError('Comment must be at least 3 characters long');
      return;
    }

    setSubmitting(true);

    try {
      const commentData = {
        name: newComment.name.trim(),
        email: newComment.email.trim(),
        content: newComment.content.trim(),
        post: postId,
        parentComment: replyTo?._id
      };

      const response = await api.post('/comments', commentData);
      
      if (replyTo) {
        // Add reply to nested structure
        setComments(prev => 
          prev.map(c => 
            c._id === replyTo._id 
              ? { 
                  ...c, 
                  replies: [...(c.replies || []), { 
                    ...response.data,
                    createdAt: new Date().toISOString()
                  }] 
                }
              : c
          )
        );
        setSuccess('Reply posted successfully! It will appear after moderation.');
        setReplyTo(null);
      } else {
        setComments(prev => [{
          ...response.data,
          createdAt: new Date().toISOString(),
          replies: []
        }, ...prev]);
        setSuccess('Comment posted successfully! It will appear after moderation.');
      }

      // Reset form
      setNewComment({ name: '', email: '', content: '' });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error posting comment:', error);
      setError(error.response?.data?.message || 'Error posting comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId) => {
    // Prevent double liking
    if (likedComments.has(commentId)) {
      setError('You have already liked this comment');
      setTimeout(() => setError(''), 2000);
      return;
    }

    try {
      await api.post(`/comments/${commentId}/like`);
      
      // Update comments state
      setComments(prev =>
        prev.map(c => {
          if (c._id === commentId) {
            return { ...c, likes: (c.likes || 0) + 1 };
          }
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map(r => 
                r._id === commentId ? { ...r, likes: (r.likes || 0) + 1 } : r
              )
            };
          }
          return c;
        })
      );

      // Add to liked set
      setLikedComments(prev => new Set(prev).add(commentId));
    } catch (error) {
      console.error('Error liking comment:', error);
      setError('Failed to like comment. Please try again.');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleReport = (commentId) => {
    // Implement report functionality
    setError('Thank you for reporting. Our team will review this comment.');
    setTimeout(() => setError(''), 3000);
  };

  const renderComment = (comment, isReply = false) => (
    <div key={comment._id} className={`comment ${isReply ? 'reply' : ''}`}>
      <div className="comment-header">
        <strong>
          <FaUser className="me-1" style={{ color: '#f95738', fontSize: '0.9rem' }} />
          {comment.name}
        </strong>
        <span className="comment-date">
          <FaClock className="me-1" />
          {moment(comment.createdAt).fromNow()}
        </span>
      </div>
      
      <div className="comment-content">{comment.content}</div>
      
      <div className="comment-actions">
        <button 
          onClick={() => handleLike(comment._id)} 
          className="like-btn"
          disabled={likedComments.has(comment._id)}
        >
          <FaThumbsUp /> 
          {comment.likes > 0 && comment.likes}
          {likedComments.has(comment._id) && ' (Liked)'}
        </button>
        
        <button onClick={() => setReplyTo(comment)} className="reply-btn">
          <FaReply /> Reply
        </button>
        
        <button onClick={() => handleReport(comment._id)} className="report-btn">
          <FaFlag /> Report
        </button>
      </div>
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="comments-section">
      <h3>Comments ({comments.length})</h3>

      {/* Success/Error Messages */}
      {success && (
        <div className="comment-success">
          <FaCheck /> {success}
        </div>
      )}
      
      {error && (
        <div className="comment-error">
          <FaExclamationCircle /> {error}
        </div>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="comment-form">
        {replyTo && (
          <div className="replying-to">
            <span>
              <strong>Replying to {replyTo.name}</strong>
            </span>
            <button 
              type="button" 
              onClick={() => {
                setReplyTo(null);
                setError('');
              }}
            >
              Cancel
            </button>
          </div>
        )}
        
        <div className="form-row">
          <input
            type="text"
            name="name"
            placeholder="Your name *"
            value={newComment.name}
            onChange={handleInputChange}
            required
            disabled={submitting}
          />
          <input
            type="email"
            name="email"
            placeholder="Your email *"
            value={newComment.email}
            onChange={handleInputChange}
            required
            disabled={submitting}
          />
        </div>
        
        <textarea
          name="content"
          placeholder="Your comment *"
          value={newComment.content}
          onChange={handleInputChange}
          required
          rows="4"
          disabled={submitting}
        />
        
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spinner-small"></span> 
              {replyTo ? 'Posting Reply...' : 'Posting Comment...'}
            </>
          ) : (
            replyTo ? 'Post Reply' : 'Post Comment'
          )}
        </button>

        <p className="text-white mt-2" style={{ fontSize: '0.85rem' }}>
          Your email address will not be published. Required fields are marked *
        </p>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="spinner"></div>
      ) : comments.length === 0 ? (
        <div className="no-comments">
          <p>Be the first to comment!</p>
          <small style={{ color: '#64748b' }}>
            Share your thoughts and start the discussion.
          </small>
        </div>
      ) : (
        <div className="comments-list">
          {comments
            .filter(c => !c.parentComment)
            .map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default Comments;