import React from 'react';
import { Modal } from 'react-bootstrap';
import { FaEye, FaCalendar, FaUser, FaFolder } from 'react-icons/fa';
import 'react-quill/dist/quill.snow.css';
import './PostPreview.css';

const PostPreview = ({ show, onHide, post, categories }) => {
  // Get category names from IDs
  const getCategoryNames = () => {
    if (!post.categories || post.categories.length === 0) return 'Uncategorized';
    return post.categories.map(catId => {
      const category = categories.find(c => c.id === catId);
      return category ? category.name : catId;
    }).join(', ');
  };

  // Format date
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const authorName = post.authorName || post.author?.name || 'Admin';

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      dialogClassName="preview-modal"
      scrollable
    >
      <Modal.Header closeButton className="preview-header">
        <Modal.Title>
          <FaEye className="me-2" style={{ color: '#f95738' }} />
          Post Preview
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="preview-body">
        <div className="preview-container">
          {/* Device Toolbar */}
          <div className="preview-device-toolbar">
            <span className="device-indicator">Desktop Preview</span>
          </div>

          {/* Blog Post Preview */}
          <article className="blog-post-preview">
            {/* Header */}
            <header className="post-header">
              <h1 className="post-title">{post.title || 'Untitled Post'}</h1>
              
              <div className="post-meta">
                <span className="meta-item">
                  <FaUser /> {authorName}
                </span>
                <span className="meta-item">
                  <FaCalendar /> {formattedDate}
                </span>
                <span className="meta-item">
                  <FaFolder /> {getCategoryNames()}
                </span>
              </div>
            </header>

            {/* Featured Image - This will now have proper spacing */}
            {post.featuredImage && (
              <div className="post-featured-image">
                <img 
                  src={post.featuredImage} 
                  alt={post.title}
                  className="img-fluid"
                />
              </div>
            )}

            {/* Content - This will now clear the image */}
            <div className="post-content-preview">
              {post.content ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: post.content }}
                  className="ql-editor"
                />
              ) : (
                <p className="text-muted text-center py-5">
                  No content to preview. Start writing in the editor above.
                </p>
              )}
            </div>

            {/* Excerpt Preview */}
            {post.excerpt && (
              <div className="post-excerpt-preview">
                <h5>Excerpt:</h5>
                <blockquote className="blockquote">
                  {post.excerpt}
                </blockquote>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="post-tags-preview">
                <h5>Tags:</h5>
                <div className="tags-list">
                  {post.tags.map(tag => (
                    <span key={tag} className="tag-badge-preview">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Preview */}
            <div className="seo-preview-box">
              <h5>Search Result Preview:</h5>
              <div className="google-preview">
                <div className="google-title">
                  {post.metaTitle || post.title || 'Post Title'}
                </div>
                <div className="google-url">
                  {window.location.origin}/post/{post.slug || 'post-url'}
                </div>
                <div className="google-description">
                  {post.metaDescription || post.excerpt || 'No description available'}
                </div>
              </div>
            </div>
          </article>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PostPreview;
