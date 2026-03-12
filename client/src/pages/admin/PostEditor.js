import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge, InputGroup, Breadcrumb } from 'react-bootstrap';
import { FaSave, FaEye, FaClock, FaTags, FaFolderOpen, FaImage, FaTrash, FaArrowLeft, FaSearch, FaPlus, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../services/api';
import PostPreview from '../../components/PostPreview';
import './PostEditor.css';

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  const [post, setPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    authorName: '',
    categories: [],
    tags: [],
    published: false,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    slug: '',
    featuredImage: ''
  });

  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [tagInput, setTagInput] = useState('');

  const categories = [
  { id: 'Technology', name: 'Technology', color: 'primary' },
  { id: 'Business', name: 'Business', color: 'success' },
  { id: 'Growth', name: 'Growth', color: 'warning' },
  { id: 'Insights', name: 'Insights', color: 'info' },
  { id: 'AI', name: 'AI', color: 'danger' },
  { id: 'Programming', name: 'Programming', color: 'secondary' }
];

  const fetchPost = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/admin/posts/${id}`);
      setPost(response.data);
      if (response.data.featuredImage) {
        setImagePreview(response.data.featuredImage);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id, fetchPost]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPost(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate slug from title
    if (name === 'title' && !id) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setPost(prev => ({ ...prev, slug }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setFeaturedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeImage = () => {
    setFeaturedImage(null);
    setImagePreview('');
    setPost(prev => ({ ...prev, featuredImage: '' }));
  };

  const handleCategoryChange = (categoryId) => {
    setPost(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    // Validation
    if (!post.title.trim()) {
      setError('Title is required');
      setSaving(false);
      return;
    }

    if (!post.content.trim()) {
      setError('Content is required');
      setSaving(false);
      return;
    }
    
    const formData = new FormData();
    
    // Append all post data with proper formatting
    Object.keys(post).forEach(key => {
      // Handle different data types correctly
      if (key === 'categories' || key === 'tags') {
        // Send categories and tags as JSON strings
        formData.append(key, JSON.stringify(post[key]));
      } else if (key === 'published') {
        // Send published as a string 'true' or 'false'
        formData.append(key, publish ? 'true' : 'false');
      } else if (post[key] !== null && post[key] !== undefined) {
        // Send other fields as is
        formData.append(key, post[key]);
      }
    });
    
    // Append image if new one is selected
    if (featuredImage) {
      formData.append('featuredImage', featuredImage);
    }

    try {
      let response;
      if (id) {
        response = await api.put(`/admin/posts/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/admin/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess(`Post ${publish ? 'published' : 'saved as draft'} successfully!`);
      
      // If this is a new post, navigate to edit mode
      if (!id && response.data._id) {
        setTimeout(() => {
          navigate(`/admin/posts/edit/${response.data._id}`);
        }, 1500);
      } else {
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      console.error('Error response:', error.response?.data); 
      setError(error.response?.data?.message || 'Error saving post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ]
  };

  if (loading) {
    return (
      <Container className="loading-container">
        <div className="loading-spinner" />
        <p className="text-muted mt-3">Loading post...</p>
      </Container>
    );
  }

  return (
    <div className="post-editor">
      <Container fluid className="post-editor-container">
        {/* Header */}
        <Row className="editor-header align-items-center">
          <Col>
            <Breadcrumb>
              <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/admin/dashboard' }}>
                Dashboard
              </Breadcrumb.Item>
              <Breadcrumb.Item active>
                {id ? 'Edit Post' : 'Create New Post'}
              </Breadcrumb.Item>
            </Breadcrumb>
            <h1>{id ? 'Edit Post' : 'Create New Post'}</h1>
            <p className="text-muted">
              {id ? 'Update your existing post' : 'Write something amazing for your readers'}
            </p>
          </Col>
          <Col xs="auto">
            <Button 
              variant="outline-secondary" 
              as={Link} 
              to="/admin/dashboard"
              className="me-2"
            >
              <FaArrowLeft className="me-2" /> Cancel
            </Button>
          </Col>
        </Row>

        {/* Alerts */}
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            <FaExclamationCircle className="me-2" /> {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" onClose={() => setSuccess('')} dismissible>
            <FaCheckCircle className="me-2" /> {success}
          </Alert>
        )}

        {/* Editor Layout */}
        <div className="editor-layout">
          {/* Main Content Area */}
          <div className="editor-main">
            <Form onSubmit={(e) => handleSubmit(e, post.published)}>
              {/* Title */}
              <Form.Group className="mb-4">
                <Form.Label>
                  Post Title <span className="required">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={post.title}
                  onChange={handleInputChange}
                  placeholder="Enter an engaging title"
                  required
                  size="lg"
                />
                <Form.Text className="text-muted">
                  {post.title?.length}/100 characters
                </Form.Text>
              </Form.Group>

              {/* Author */}
              <Form.Group className="mb-4">
                <Form.Label>Author Name</Form.Label>
                <Form.Control
                  type="text"
                  name="authorName"
                  value={post.authorName}
                  onChange={handleInputChange}
                  placeholder="Enter author name"
                />
                <Form.Text className="text-muted">
                  Leave blank to use the logged-in admin account.
                </Form.Text>
              </Form.Group>

              {/* Slug */}
              <Form.Group className="mb-4">
                <Form.Label>URL Slug</Form.Label>
                <InputGroup>
                  <InputGroup.Text>{window.location.origin}/post/</InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="slug"
                    value={post.slug}
                    onChange={handleInputChange}
                    placeholder="url-friendly-post-title"
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Auto-generated from title if left empty
                </Form.Text>
              </Form.Group>

              {/* Content */}
              <Form.Group className="mb-4">
                <Form.Label>
                  Content <span className="required">*</span>
                </Form.Label>
                <div className="quill-editor">
                  <ReactQuill
                    theme="snow"
                    value={post.content}
                    onChange={(content) => setPost(prev => ({ ...prev, content }))}
                    modules={quillModules}
                    placeholder="Write your post content here..."
                  />
                </div>
              </Form.Group>

              {/* Excerpt */}
              <Form.Group className="mb-4">
                <Form.Label>Excerpt</Form.Label>
                <Form.Control
                  as="textarea"
                  name="excerpt"
                  value={post.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Brief summary of your post (appears in previews)"
                />
                <Form.Text className="text-muted">
                  {post.excerpt?.length}/160 characters recommended for SEO
                </Form.Text>
              </Form.Group>

              {/* SEO Section */}
              <Card className="mb-4">
                <Card.Header>
                  <h3><FaSearch className="me-2" /> SEO Settings</h3>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Meta Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="metaTitle"
                      value={post.metaTitle}
                      onChange={handleInputChange}
                      placeholder="SEO title (leave empty to use post title)"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Meta Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="metaDescription"
                      value={post.metaDescription}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Meta description for search engines"
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Meta Keywords</Form.Label>
                    <Form.Control
                      type="text"
                      name="metaKeywords"
                      value={post.metaKeywords}
                      onChange={handleInputChange}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Form>
          </div>

          {/* Sidebar */}
          <div className="editor-sidebar">
            {/* Publish Card */}
            <Card className="sidebar-card">
              <Card.Header>
                <h3><FaSave className="me-2" /> Publish</h3>
              </Card.Header>
              <Card.Body>
                <div className="publish-actions">
                  <Button
                    variant="primary"
                    className="btn-publish"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner size="sm" /> Publishing...
                      </>
                    ) : (
                      <>
                        <FaSave /> {id ? 'Update & Publish' : 'Publish Now'}
                      </>
                    )}
                  </Button>

                  <Button
                    variant="secondary"
                    className="btn-draft"
                    onClick={(e) => handleSubmit(e, false)}
                    disabled={saving}
                  >
                    <FaClock /> Save as Draft
                  </Button>

                  <Button
                    variant="outline-primary"
                    className="btn-preview"
                    onClick={handlePreview}
                  >
                    <FaEye /> Preview
                  </Button>

                  <Form.Group className="mt-3">
                    <Form.Check
                      type="switch"
                      id="published-switch"
                      label="Published"
                      checked={post.published}
                      onChange={(e) => setPost(prev => ({ ...prev, published: e.target.checked }))}
                    />
                  </Form.Group>
                </div>
              </Card.Body>
            </Card>

            {/* Categories Card */}
            <Card className="sidebar-card">
              <Card.Header>
                <h3><FaFolderOpen className="me-2" /> Categories</h3>
              </Card.Header>
              <Card.Body>
                <div className="checkbox-group">
                  {categories.map(category => (
                    <label key={category.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={post.categories.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                      />
                      <span>{category.name}</span>
                      {post.categories.includes(category.id) && (
                        <Badge bg={category.color} pill className="ms-2">selected</Badge>
                      )}
                    </label>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {/* Tags Card */}
            <Card className="sidebar-card">
              <Card.Header>
                <h3><FaTags className="me-2" /> Tags</h3>
              </Card.Header>
              <Card.Body>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button 
                    variant="outline-primary" 
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    <FaPlus />
                  </Button>
                </InputGroup>

                <div className="tags-container">
                  {post.tags.map(tag => (
                    <span key={tag} className="tag-badge">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>
                        <FaTimes />
                      </button>
                    </span>
                  ))}
                  {post.tags.length === 0 && (
                    <small className="text-muted">No tags added yet</small>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Featured Image Card */}
            <Card className="sidebar-card">
              <Card.Header>
                <h3><FaImage className="me-2" /> Featured Image</h3>
              </Card.Header>
              <Card.Body>
                <div 
                  className="image-upload-area"
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  <FaImage />
                  <p>Click to upload or drag and drop</p>
                  <small>PNG, JPG, GIF up to 5MB</small>
                </div>
                <Form.Control
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />

                {imagePreview && (
                  <div style={{ position: 'relative', marginTop: '1rem' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="image-preview"
                    />
                    <button 
                      className="remove-image"
                      onClick={removeImage}
                      type="button"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Stats Card */}
            {id && (
              <Card className="sidebar-card">
                <Card.Header>
                  <h3><FaEye className="me-2" /> Post Stats</h3>
                </Card.Header>
                <Card.Body>
                  <div className="stat-item">
                    <span className="stat-label">Views</span>
                    <Badge bg="info" pill>{post.views || 0}</Badge>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Created</span>
                    <small>{new Date(post.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Last Updated</span>
                    <small>{new Date(post.updatedAt).toLocaleDateString()}</small>
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>
        </div>
      </Container>

      {/* Preview Modal */}
      <PostPreview 
        show={showPreview}
        onHide={() => setShowPreview(false)}
        post={post}
        categories={categories}
      />
    </div>
  );
};

export default PostEditor;
