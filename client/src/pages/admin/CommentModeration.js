import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Modal, Form, InputGroup, Navbar, Nav, Pagination } from 'react-bootstrap';
import { FaCheck, FaTimes, FaTrash, FaEye, FaSearch, FaFilter, FaEnvelope, FaComments, FaCalendar, FaClock, FaExclamationTriangle, FaCheckCircle, FaRegClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';
import api from '../../services/api';
import moment from 'moment';
import './CommentModeration.css';

const CommentModeration = () => {
  const { user } = useAuth(); // Remove logout since it's not used
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [postFilter, setPostFilter] = useState('all');
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    spam: 0
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const commentsPerPage = 20;

  // Define filterComments with useCallback
  const filterComments = useCallback(() => {
    let filtered = [...comments];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Apply post filter
    if (postFilter !== 'all') {
      filtered = filtered.filter(c => c.post?._id === postFilter);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.content.toLowerCase().includes(term) ||
        c.post?.title?.toLowerCase().includes(term)
      );
    }

    setFilteredComments(filtered);
    setTotalPages(Math.ceil(filtered.length / commentsPerPage));
    setCurrentPage(1);
  }, [comments, searchTerm, statusFilter, postFilter]);

  useEffect(() => {
    fetchComments();
    fetchPosts();
  }, []);

  useEffect(() => {
    filterComments();
  }, [filterComments]); // Now filterComments is stable due to useCallback

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/comments/all');
      const allComments = response.data.comments || [];
      setComments(allComments);
      setFilteredComments(allComments);
      
      // Calculate stats
      const stats = {
        total: allComments.length,
        pending: allComments.filter(c => c.status === 'pending').length,
        approved: allComments.filter(c => c.status === 'approved').length,
        spam: allComments.filter(c => c.status === 'spam').length
      };
      setStats(stats);
      
      // Calculate pagination
      setTotalPages(Math.ceil(allComments.length / commentsPerPage));
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await api.get('/admin/posts?limit=100');
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedComment) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/comments/${selectedComment._id}`, { status: 'approved' });
      await fetchComments();
      setShowApproveModal(false);
    } catch (error) {
      console.error('Error approving comment:', error);
    } finally {
      setActionLoading(false);
      setSelectedComment(null);
    }
  };

  const handleReject = async () => {
    if (!selectedComment) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/comments/${selectedComment._id}`, { status: 'spam' });
      await fetchComments();
      setShowRejectModal(false);
    } catch (error) {
      console.error('Error rejecting comment:', error);
    } finally {
      setActionLoading(false);
      setSelectedComment(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedComment) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/comments/${selectedComment._id}`);
      await fetchComments();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setActionLoading(false);
      setSelectedComment(null);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { bg: 'warning', icon: <FaRegClock />, text: 'Pending' },
      approved: { bg: 'success', icon: <FaCheckCircle />, text: 'Approved' },
      spam: { bg: 'danger', icon: <FaExclamationTriangle />, text: 'Spam' }
    };
    const variant = variants[status] || variants.pending;
    return (
      <Badge bg={variant.bg} className="status-badge">
        {variant.icon} {variant.text}
      </Badge>
    );
  };

  // Get current page comments
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = filteredComments.slice(indexOfFirstComment, indexOfLastComment);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="comment-moderation">
      {/* Top Navigation */}
      <Navbar bg="light" expand="lg" className="moderation-navbar px-4">
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
            <h2>Comment Moderation</h2>
            <p className="text-muted">Manage and moderate comments from your readers</p>
          </Col>
          <Col xs="auto">
            <Button variant="outline-secondary" onClick={fetchComments}>
              <FaEye className="me-2" /> Refresh
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
                    <h6 className="text-muted mb-2">Total Comments</h6>
                    <h3 className="mb-0">{stats.total}</h3>
                  </div>
                  <div className="stat-icon-wrapper bg-primary bg-opacity-10">
                    <FaComments className="text-primary" size={24} />
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
                    <h6 className="text-muted mb-2">Pending</h6>
                    <h3 className="mb-0 text-warning">{stats.pending}</h3>
                  </div>
                  <div className="stat-icon-wrapper bg-warning bg-opacity-10">
                    <FaRegClock className="text-warning" size={24} />
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
                    <h6 className="text-muted mb-2">Approved</h6>
                    <h3 className="mb-0 text-success">{stats.approved}</h3>
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
                    <h6 className="text-muted mb-2">Spam</h6>
                    <h3 className="mb-0 text-danger">{stats.spam}</h3>
                  </div>
                  <div className="stat-icon-wrapper bg-danger bg-opacity-10">
                    <FaExclamationTriangle className="text-danger" size={24} />
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
                    placeholder="Search comments..."
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
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="spam">Spam</option>
                  </Form.Select>
                </InputGroup>
              </Col>
              <Col md={3}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaComments />
                  </InputGroup.Text>
                  <Form.Select 
                    value={postFilter} 
                    onChange={(e) => setPostFilter(e.target.value)}
                  >
                    <option value="all">All Posts</option>
                    {posts.map(post => (
                      <option key={post._id} value={post._id}>
                        {post.title}
                      </option>
                    ))}
                  </Form.Select>
                </InputGroup>
              </Col>
              <Col md={2}>
                <div className="text-muted">
                  Found: <strong>{filteredComments.length}</strong> comments
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Comments Table */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Author</th>
                    <th>Comment</th>
                    <th>Post</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentComments.length > 0 ? (
                    currentComments.map(comment => (
                      <tr key={comment._id} className={comment.status === 'pending' ? 'table-warning' : ''}>
                        <td>
                          <div className="d-flex align-items-center">
                            <Avatar 
                              src={comment.author?.avatar} 
                              name={comment.name} 
                              size={40} 
                              className="me-3"
                            />
                            <div>
                              <strong>{comment.name}</strong>
                              <small className="d-block text-muted">
                                <FaEnvelope className="me-1" size={12} />
                                {comment.email}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="comment-content-cell">
                            <p className="mb-1">{comment.content}</p>
                            {comment.content.length > 100 && (
                              <small className="text-muted">
                                {comment.content.length} characters
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <Badge bg="info" pill>
                            {comment.post?.title || 'Unknown Post'}
                          </Badge>
                        </td>
                        <td>
                          <div>
                            <small>
                              <FaCalendar className="me-1 text-muted" />
                              {moment(comment.createdAt).format('MMM D, YYYY')}
                            </small>
                            <br />
                            <small className="text-muted">
                              <FaClock className="me-1" />
                              {moment(comment.createdAt).fromNow()}
                            </small>
                          </div>
                        </td>
                        <td>
                          {getStatusBadge(comment.status)}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {comment.status === 'pending' && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => {
                                    setSelectedComment(comment);
                                    setShowApproveModal(true);
                                  }}
                                  title="Approve"
                                >
                                  <FaCheck />
                                </Button>
                                <Button
                                  variant="warning"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => {
                                    setSelectedComment(comment);
                                    setShowRejectModal(true);
                                  }}
                                  title="Mark as Spam"
                                >
                                  <FaTimes />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setSelectedComment(comment);
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
                      <td colSpan="6" className="text-center py-5">
                        <FaComments size={48} className="text-muted mb-3" />
                        <h5>No comments found</h5>
                        <p className="text-muted">
                          {searchTerm || statusFilter !== 'all' || postFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Comments will appear here when readers start commenting'}
                        </p>
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

      {/* Approve Modal */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Approve Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to approve this comment? It will become visible to all readers.</p>
          {selectedComment && (
            <div className="border rounded p-3 bg-light">
              <strong>{selectedComment.name}</strong>
              <p className="mb-0 mt-2">{selectedComment.content}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleApprove}
            disabled={actionLoading}
          >
            {actionLoading ? <Spinner size="sm" /> : 'Approve Comment'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Mark as Spam</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to mark this comment as spam? It will be hidden from the site.</p>
          {selectedComment && (
            <div className="border rounded p-3 bg-light">
              <strong>{selectedComment.name}</strong>
              <p className="mb-0 mt-2">{selectedComment.content}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="warning" 
            onClick={handleReject}
            disabled={actionLoading}
          >
            {actionLoading ? <Spinner size="sm" /> : 'Mark as Spam'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">
            <FaExclamationTriangle className="me-2" />
            This action cannot be undone!
          </p>
          <p>Are you sure you want to permanently delete this comment?</p>
          {selectedComment && (
            <div className="border rounded p-3 bg-light">
              <strong>{selectedComment.name}</strong>
              <p className="mb-0 mt-2">{selectedComment.content}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={actionLoading}
          >
            {actionLoading ? <Spinner size="sm" /> : 'Delete Permanently'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CommentModeration;