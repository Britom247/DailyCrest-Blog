import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Modal, Form, InputGroup, Navbar, Nav, Pagination } from 'react-bootstrap';
import { FaUsers, FaEnvelope, FaCalendar, FaSearch, FaFilter, FaTrash, FaEye, FaCheckCircle, FaExclamationTriangle, FaUserPlus, FaUserTimes, FaDownload, FaEnvelopeOpen } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';
import api from '../../services/api';
import moment from 'moment';
import './SubscriberManagement.css';

const SubscriberManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0,
    newThisWeek: 0,
    newThisMonth: 0
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const subscribersPerPage = 20;

  // Define filterSubscribers with useCallback
  const filterSubscribers = useCallback(() => {
    let filtered = [...subscribers];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        (s.name?.toLowerCase().includes(term) || 
         s.email.toLowerCase().includes(term))
      );
    }

    setFilteredSubscribers(filtered);
    setTotalPages(Math.ceil(filtered.length / subscribersPerPage));
    setCurrentPage(1);
  }, [subscribers, searchTerm, statusFilter, subscribersPerPage]);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  useEffect(() => {
    filterSubscribers();
  }, [filterSubscribers]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/subscribers?limit=1000');
      const allSubscribers = response.data.subscribers || [];
      setSubscribers(allSubscribers);
      setFilteredSubscribers(allSubscribers);
      
      // Calculate stats
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      const stats = {
        total: allSubscribers.length,
        active: allSubscribers.filter(s => s.status === 'active').length,
        unsubscribed: allSubscribers.filter(s => s.status === 'unsubscribed').length,
        newThisWeek: allSubscribers.filter(s => 
          s.status === 'active' && new Date(s.subscribedAt) > weekAgo
        ).length,
        newThisMonth: allSubscribers.filter(s => 
          s.status === 'active' && new Date(s.subscribedAt) > monthAgo
        ).length
      };
      setStats(stats);
      
      // Calculate pagination
      setTotalPages(Math.ceil(allSubscribers.length / subscribersPerPage));
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!selectedSubscriber) return;
    setActionLoading(true);
    try {
      await api.post('/newsletter/unsubscribe', { 
        email: selectedSubscriber.email 
      });
      await fetchSubscribers();
      setShowUnsubscribeModal(false);
    } catch (error) {
      console.error('Error unsubscribing:', error);
    } finally {
      setActionLoading(false);
      setSelectedSubscriber(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedSubscriber) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/subscribers/${selectedSubscriber._id}`);
      await fetchSubscribers();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting subscriber:', error);
    } finally {
      setActionLoading(false);
      setSelectedSubscriber(null);
    }
  };

  const exportSubscribers = () => {
    const data = filteredSubscribers.map(s => ({
      Name: s.name || 'Anonymous',
      Email: s.email,
      Status: s.status,
      Subscribed: moment(s.subscribedAt).format('YYYY-MM-DD HH:mm:ss')
    }));
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: { bg: 'success', icon: <FaCheckCircle />, text: 'Active' },
      unsubscribed: { bg: 'secondary', icon: <FaUserTimes />, text: 'Unsubscribed' }
    };
    const variant = variants[status] || variants.active;
    return (
      <Badge bg={variant.bg} className="status-badge">
        {variant.icon} {variant.text}
      </Badge>
    );
  };

  // Get current page subscribers
  const indexOfLast = currentPage * subscribersPerPage;
  const indexOfFirst = indexOfLast - subscribersPerPage;
  const currentSubscribers = filteredSubscribers.slice(indexOfFirst, indexOfLast);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3">Loading subscribers...</p>
      </div>
    );
  }

  return (
    <div className="subscriber-management">
      {/* Top Navigation */}
      <Navbar bg="light" expand="lg" className="management-navbar px-4">
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
            <h2>Subscriber Management</h2>
            <p className="text-muted">Manage your email newsletter subscribers</p>
          </Col>
          <Col xs="auto">
            <Button 
              variant="success" 
              onClick={exportSubscribers}
              className="me-2"
              disabled={filteredSubscribers.length === 0}
            >
              <FaDownload className="me-2" /> Export CSV
            </Button>
            <Button variant="outline-secondary" onClick={fetchSubscribers}>
              <FaEye className="me-2" /> Refresh
            </Button>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col xl={2} lg={4} md={6} sm={12}>
            <Card className="stat-card border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Total</h6>
                    <h3 className="mb-0">{stats.total}</h3>
                  </div>
                  <div className="stat-icon-wrapper bg-primary bg-opacity-10">
                    <FaUsers className="text-primary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={2} lg={4} md={6} sm={12}>
            <Card className="stat-card border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Active</h6>
                    <h3 className="mb-0 text-success">{stats.active}</h3>
                  </div>
                  <div className="stat-icon-wrapper bg-success bg-opacity-10">
                    <FaCheckCircle className="text-success" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={2} lg={4} md={6} sm={12}>
            <Card className="stat-card border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Unsubscribed</h6>
                    <h3 className="mb-0 text-secondary">{stats.unsubscribed}</h3>
                  </div>
                  <div className="stat-icon-wrapper bg-secondary bg-opacity-10">
                    <FaUserTimes className="text-secondary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={4} md={6} sm={12}>
            <Card className="stat-card border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">New This Week</h6>
                    <h3 className="mb-0 text-info">{stats.newThisWeek}</h3>
                  </div>
                  <div className="stat-icon-wrapper bg-info bg-opacity-10">
                    <FaUserPlus className="text-info" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={4} md={6} sm={12}>
            <Card className="stat-card border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">New This Month</h6>
                    <h3 className="mb-0 text-warning">{stats.newThisMonth}</h3>
                  </div>
                  <div className="stat-icon-wrapper bg-warning bg-opacity-10">
                    <FaUserPlus className="text-warning" size={24} />
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
              <Col md={8}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaFilter />
                  </InputGroup.Text>
                  <Form.Select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Subscribers</option>
                    <option value="active">Active</option>
                    <option value="unsubscribed">Unsubscribed</option>
                  </Form.Select>
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Subscribers Table */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Subscriber</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Subscribed Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSubscribers.length > 0 ? (
                    currentSubscribers.map(sub => (
                      <tr key={sub._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <Avatar 
                              name={sub.name || 'A'} 
                              size={40} 
                              className="me-3"
                            />
                            <strong>{sub.name || 'Anonymous'}</strong>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaEnvelope className="me-2 text-muted" />
                            <a href={`mailto:${sub.email}`}>{sub.email}</a>
                          </div>
                        </td>
                        <td>
                          {getStatusBadge(sub.status)}
                        </td>
                        <td>
                          <div>
                            <small>
                              <FaCalendar className="me-1 text-muted" />
                              {moment(sub.subscribedAt).format('MMM D, YYYY')}
                            </small>
                            <br />
                            <small className="text-muted">
                              {moment(sub.subscribedAt).fromNow()}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              href={`mailto:${sub.email}`}
                              className="me-2"
                              title="Send Email"
                            >
                              <FaEnvelopeOpen />
                            </Button>
                            {sub.status === 'active' && (
                              <Button
                                variant="warning"
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                  setSelectedSubscriber(sub);
                                  setShowUnsubscribeModal(true);
                                }}
                                title="Unsubscribe"
                              >
                                <FaUserTimes />
                              </Button>
                            )}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setSelectedSubscriber(sub);
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
                      <td colSpan="5" className="text-center py-5">
                        <FaUsers size={48} className="text-muted mb-3" />
                        <h5>No subscribers found</h5>
                        <p className="text-muted">
                          {searchTerm || statusFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Subscribers will appear here when people sign up for your newsletter'}
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

      {/* Unsubscribe Modal */}
      <Modal show={showUnsubscribeModal} onHide={() => setShowUnsubscribeModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Unsubscribe User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to unsubscribe <strong>{selectedSubscriber?.email}</strong>?</p>
          <p className="text-muted small">They will stop receiving newsletter emails.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUnsubscribeModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="warning" 
            onClick={handleUnsubscribe}
            disabled={actionLoading}
          >
            {actionLoading ? <Spinner size="sm" /> : 'Unsubscribe'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Subscriber</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">
            <FaExclamationTriangle className="me-2" />
            This action cannot be undone!
          </p>
          <p>Are you sure you want to permanently delete <strong>{selectedSubscriber?.email}</strong>?</p>
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

export default SubscriberManagement;