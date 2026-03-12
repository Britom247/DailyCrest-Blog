import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Modal, Form, InputGroup, Pagination, Navbar, Nav } from 'react-bootstrap';
import { FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaCalendar, FaPlus, FaSort, FaSortUp, FaSortDown, FaExclamationTriangle, FaCheckCircle, FaClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';
import api from '../../services/api';
import moment from 'moment';
import './AllPosts.css';

const AllPosts = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalViews: 0
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 20;

  // Define filterAndSortPosts with useCallback
  const filterAndSortPosts = useCallback(() => {
    let filtered = [...posts];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => 
        statusFilter === 'published' ? p.published : !p.published
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => 
        p.categories?.includes(categoryFilter)
      );
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(term) ||
        p.excerpt?.toLowerCase().includes(term) ||
        p.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'createdAt' || sortConfig.key === 'publishedAt') {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredPosts(filtered);
    setTotalPages(Math.ceil(filtered.length / postsPerPage));
    setCurrentPage(1);
  }, [posts, searchTerm, statusFilter, categoryFilter, sortConfig, postsPerPage]);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterAndSortPosts();
  }, [filterAndSortPosts]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/posts?limit=1000');
      const allPosts = response.data.posts || [];
      setPosts(allPosts);
      setFilteredPosts(allPosts);
      
      // Calculate stats
      const stats = {
        total: allPosts.length,
        published: allPosts.filter(p => p.published).length,
        draft: allPosts.filter(p => !p.published).length,
        totalViews: allPosts.reduce((sum, p) => sum + (p.views || 0), 0)
      };
      setStats(stats);
      
      // Calculate pagination
      setTotalPages(Math.ceil(allPosts.length / postsPerPage));
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    // Extract unique categories from posts (you might want to fetch from API)
    try {
      const response = await api.get('/admin/posts?limit=1000');
      const allPosts = response.data.posts || [];
      const uniqueCategories = [...new Set(allPosts.flatMap(p => p.categories || []))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="sort-icon" />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="sort-icon active" /> : <FaSortDown className="sort-icon active" />;
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/posts/${selectedPost._id}`);
      await fetchPosts();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setDeleteLoading(false);
      setSelectedPost(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;
    setDeleteLoading(true);
    try {
      await Promise.all(selectedPosts.map(id => api.delete(`/admin/posts/${id}`)));
      await fetchPosts();
      setSelectedPosts([]);
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error('Error deleting posts:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === currentPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(currentPosts.map(p => p._id));
    }
  };

  const handleSelectPost = (postId) => {
    setSelectedPosts(prev => 
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const getStatusBadge = (published) => {
    return published 
      ? <Badge bg="success" className="status-badge"><FaCheckCircle /> Published</Badge>
      : <Badge bg="warning" className="status-badge"><FaClock /> Draft</Badge>;
  };

  // Get current page posts
  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirst, indexOfLast);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="all-posts">
      {/* Top Navigation */}
      <Navbar bg="light" expand="lg" className="posts-navbar px-4">
        <Container fluid>
          <Navbar.Brand href="#">
            <span className="brand-text">DailyCrest Admin</span>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="ms-auto align-items-center">
              <Nav.Link as={Link} to="/admin/dashboard" className="me-3">
                Dashboard
              </Nav.Link>
              <Nav.Link className="me-3 d-flex align-items-center">
                <Avatar src={user?.avatar} name={user?.name} size={32} />
                <span className="ms-2 d-none d-lg-inline">{user?.name}</span>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4 align-items-center">
          <Col>
            <h2>All Posts</h2>
            <p className="text-muted">Manage and edit all your blog posts</p>
          </Col>
          <Col xs="auto">
            <Button 
              variant="danger" 
              className="me-2"
              disabled={selectedPosts.length === 0}
              onClick={() => setShowBulkDeleteModal(true)}
            >
              <FaTrash className="me-2" /> 
              Delete Selected ({selectedPosts.length})
            </Button>
            <Button 
              variant="primary" 
              as={Link} 
              to="/admin/posts/new"
            >
              <FaPlus className="me-2" /> New Post
            </Button>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col xl={3} lg={6} md={6} sm={12}>
            <Card className="stat-card border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Total Posts</h6>
                    <h3 className="mb-0">{stats.total}</h3>
                  </div>
                  <div className="stat-icon-wrapper bg-primary bg-opacity-10">
                    <FaEye className="text-primary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6} sm={12}>
            <Card className="stat-card border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Published</h6>
                    <h3 className="mb-0 text-success">{stats.published}</h3>
                  </div>
                  <div className="stat-icon-wrapper bg-success bg-opacity-10">
                    <FaCheckCircle className="text-success" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6} sm={12}>
            <Card className="stat-card border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Drafts</h6>
                    <h3 className="mb-0 text-warning">{stats.draft}</h3>
                  </div>
                  <div className="stat-icon-wrapper bg-warning bg-opacity-10">
                    <FaClock className="text-warning" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6} sm={12}>
            <Card className="stat-card border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Total Views</h6>
                    <h3 className="mb-0 text-info">{stats.totalViews.toLocaleString()}</h3>
                  </div>
                  <div className="stat-icon-wrapper bg-info bg-opacity-10">
                    <FaEye className="text-info" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaFilter />
                  </InputGroup.Text>
                  <Form.Select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </Form.Select>
                </InputGroup>
              </Col>
              <Col md={3}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaFilter />
                  </InputGroup.Text>
                  <Form.Select 
                    value={categoryFilter} 
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </InputGroup>
              </Col>
              <Col md={2}>
                <div className="text-muted">
                  Found: <strong>{filteredPosts.length}</strong> posts
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Posts Table */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th width="40">
                      <Form.Check
                        type="checkbox"
                        checked={selectedPosts.length === currentPosts.length && currentPosts.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                      Title {getSortIcon('title')}
                    </th>
                    <th onClick={() => handleSort('published')} style={{ cursor: 'pointer' }}>
                      Status {getSortIcon('published')}
                    </th>
                    <th onClick={() => handleSort('views')} style={{ cursor: 'pointer' }}>
                      Views {getSortIcon('views')}
                    </th>
                    <th>Categories</th>
                    <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                      Date {getSortIcon('createdAt')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPosts.length > 0 ? (
                    currentPosts.map(post => (
                      <tr key={post._id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedPosts.includes(post._id)}
                            onChange={() => handleSelectPost(post._id)}
                          />
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {post.featuredImage && (
                              <img 
                                src={post.featuredImage} 
                                alt={post.title}
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                className="rounded me-3"
                              />
                            )}
                            <div>
                              <strong>{post.title}</strong>
                              <small className="d-block text-muted">
                                {post.excerpt?.substring(0, 60)}...
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>{getStatusBadge(post.published)}</td>
                        <td>
                          <Badge bg="info" pill>{post.views || 0}</Badge>
                        </td>
                        <td>
                          {post.categories?.map(cat => (
                            <Badge key={cat} bg="secondary" className="me-1 mb-1">
                              {cat}
                            </Badge>
                          ))}
                        </td>
                        <td>
                          <small>
                            <FaCalendar className="me-1 text-muted" />
                            {moment(post.createdAt).format('MMM D, YYYY')}
                          </small>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              as={Link}
                              to={`/admin/posts/edit/${post._id}`}
                              className="me-2"
                              title="Edit"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setSelectedPost(post);
                                setShowDeleteModal(true);
                              }}
                              title="Delete"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <FaEye size={48} className="text-muted mb-3" />
                        <h5>No posts found</h5>
                        <p className="text-muted">
                          {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Get started by creating your first post!'}
                        </p>
                        {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
                          <Button variant="primary" as={Link} to="/admin/posts/new">
                            <FaPlus className="me-2" /> Create New Post
                          </Button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
          {totalPages > 1 && (
            <Card.Footer className="bg-white border-0 d-flex justify-content-center py-3">
              <Pagination>
                <Pagination.Prev 
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next 
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </Card.Footer>
          )}
        </Card>
      </Container>

      {/* Delete Single Post Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">
            <FaExclamationTriangle className="me-2" />
            This action cannot be undone!
          </p>
          <p>Are you sure you want to delete "<strong>{selectedPost?.title}</strong>"?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeletePost}
            disabled={deleteLoading}
          >
            {deleteLoading ? <Spinner size="sm" /> : 'Delete Post'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal show={showBulkDeleteModal} onHide={() => setShowBulkDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Multiple Posts</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">
            <FaExclamationTriangle className="me-2" />
            This action cannot be undone!
          </p>
          <p>Are you sure you want to delete <strong>{selectedPosts.length}</strong> selected posts?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleBulkDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? <Spinner size="sm" /> : 'Delete All Selected'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AllPosts;