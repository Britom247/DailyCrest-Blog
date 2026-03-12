import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';
import { FaUsers, FaFileAlt, FaComments, FaEye, FaPlus, FaSignOutAlt, FaEdit, FaTrash, FaCheck, FaTimes, FaSpinner, FaSearch, FaFilter,FaUserPlus, FaEnvelope, FaCalendar } from 'react-icons/fa';
import api from '../../services/api';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Modal, Form, InputGroup, Dropdown, ProgressBar, Navbar, Nav } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import './Dashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalSubscribers: 0,
    newSubscribers: 0,
    totalComments: 0,
    pendingComments: 0,
    approvedComments: 0,
    totalViews: 0,
    viewsToday: 0,
    viewsThisWeek: 0,
    viewsThisMonth: 0,
    avgReadTime: 0,
    bounceRate: 0,
    returningReaders: 0
  });

  const [recentPosts, setRecentPosts] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [allSubscribers, setAllSubscribers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCommentNotificationsModal, setShowCommentNotificationsModal] = useState(false);
  const [showAppNotificationsModal, setShowAppNotificationsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [timeRange, setTimeRange] = useState('week');
  const [chartData, setChartData] = useState(null);
  const [loadingTraffic, setLoadingTraffic] = useState(false);
  const [dismissedAppNotifications, setDismissedAppNotifications] = useState(() => {
    try {
      if (typeof window === 'undefined') {
        return [];
      }
      const raw = localStorage.getItem('dailycrest_admin_dismissed_notifications');
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  });
  const [readAppNotifications, setReadAppNotifications] = useState(() => {
    try {
      if (typeof window === 'undefined') {
        return [];
      }
      const raw = localStorage.getItem('dailycrest_admin_read_notifications');
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Use allSettled so one failing request doesn't cancel the others.
      const results = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/posts?limit=10'),
        api.get('/admin/comments/all?limit=10'),
        api.get('/admin/subscribers?limit=10')
      ]);

      const [statsRes, postsRes, commentsRes, subsRes] = results.map(r =>
        r.status === 'fulfilled' ? r.value : null
      );

      if (statsRes) {
        setStats(statsRes.data);
      }

      const posts = (postsRes?.data?.posts || []).slice(0, 10);

      // DEBUG: Log comments to see their structure
      console.log('Comments from API:', commentsRes?.data?.comments);
      console.log('Posts from API:', posts);

      if (posts.length > 0) {
        const postIds = posts.map(p => p._id);
        console.log('Post IDs:', postIds);

        let postsWithCommentCounts = posts;
        try {
          const commentCountsRes = await api.post('/admin/posts/comments/count', { postIds });
          const commentCounts = commentCountsRes.data || {};

          // DEBUG: Log the comment counts response
          console.log('Comment counts from backend:', commentCounts);

          postsWithCommentCounts = posts.map(post => {
            console.log(`Post ${post.title} (${post._id}) has comment count:`, commentCounts[post._id]);
            return {
              ...post,
              views: Number(post.views) || 0,
              commentCount: commentCounts[post._id] || 0
            };
          });
        } catch (countError) {
          console.error('Failed to fetch comment counts:', countError);
          postsWithCommentCounts = posts.map(p => ({ ...p, views: Number(p.views) || 0, commentCount: 0 }));
        }

        setRecentPosts(postsWithCommentCounts);
      } else {
        setRecentPosts(posts);
      }

      if (commentsRes) {
        const comments = commentsRes.data.comments || [];
        setAllComments(comments);
        setRecentComments(comments.slice(0, 3));
      }
      if (subsRes) {
        const subscriberItems = subsRes.data.subscribers || [];
        setAllSubscribers(subscriberItems);
        setSubscribers(subscriberItems.slice(0, 3));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (timeRange) {
      fetchTrafficData(timeRange);
    }
  }, [timeRange]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(
      'dailycrest_admin_dismissed_notifications',
      JSON.stringify(dismissedAppNotifications)
    );
  }, [dismissedAppNotifications]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(
      'dailycrest_admin_read_notifications',
      JSON.stringify(readAppNotifications)
    );
  }, [readAppNotifications]);

  const fetchTrafficData = async (range) => {
    setLoadingTraffic(true);
    try {
      const response = await api.get(`/analytics/traffic?range=${range}`);
      const trafficData = response.data;
      
      const data = {
        labels: trafficData.labels,
        datasets: [
          {
            label: 'Page Views',
            data: trafficData.views,
            borderColor: '#f95738',
            backgroundColor: 'rgba(249, 87, 56, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#f95738',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Unique Visitors',
            data: trafficData.visitors,
            borderColor: '#0a2472',
            backgroundColor: 'rgba(10, 36, 114, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#0a2472',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      };
      setChartData(data);
    } catch (error) {
      console.error('Error fetching traffic data:', error);
    } finally {
      setLoadingTraffic(false);
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/posts/${selectedPost._id}`);
      setRecentPosts(recentPosts.filter(p => p._id !== selectedPost._id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setDeleteLoading(false);
      setSelectedPost(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getStatusBadge = (status) => {
    const variants = {
      published: 'success',
      draft: 'warning',
      pending: 'danger',
      approved: 'success'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const filteredPosts = recentPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || post.published === (filterStatus === 'published');
    return matchesSearch && matchesFilter;
  });

  const pendingRecentComments = allComments.filter(comment => comment.status === 'pending');

  const allAppNotifications = [
    ...(stats.newSubscribers > 0
      ? [{
          id: `metric-new-subscribers-${stats.newSubscribers}`,
          title: `${stats.newSubscribers} new subscriber${stats.newSubscribers > 1 ? 's' : ''} this week`,
          description: 'Subscriber growth is trending up this week.',
          createdAt: new Date().toISOString()
        }]
      : []),
    ...(stats.draftPosts > 0
      ? [{
          id: `metric-drafts-${stats.draftPosts}`,
          title: `${stats.draftPosts} draft post${stats.draftPosts > 1 ? 's' : ''} pending publication`,
          description: 'Draft content is waiting for review or publish.',
          createdAt: new Date().toISOString()
        }]
      : []),
    ...(stats.viewsToday > 0
      ? [{
          id: `metric-views-today-${stats.viewsToday}`,
          title: `${stats.viewsToday.toLocaleString()} view${stats.viewsToday > 1 ? 's' : ''} today`,
          description: 'Traffic signal updated from today\'s post activity.',
          createdAt: new Date().toISOString()
        }]
      : []),
    ...recentPosts.slice(0, 5).map(post => ({
      id: `post-${post._id}-${post.updatedAt || post.createdAt}`,
      title: post.published ? `Post published: ${post.title}` : `Post saved as draft: ${post.title}`,
      description: `${(Number(post.views) || 0).toLocaleString()} views and ${(post.commentCount || 0).toLocaleString()} comments.`,
      createdAt: post.updatedAt || post.createdAt
    })),
    ...allComments.slice(0, 10).map(comment => ({
      id: `comment-${comment._id}-${comment.status}`,
      title: `Comment ${comment.status}: ${comment.name || 'Anonymous'}`,
      description: `On "${comment.post?.title || 'Unknown post'}"`,
      createdAt: comment.createdAt
    })),
    ...allSubscribers.slice(0, 10).map(subscriber => ({
      id: `subscriber-${subscriber._id}`,
      title: `New subscriber: ${subscriber.name || subscriber.email}`,
      description: subscriber.email,
      createdAt: subscriber.subscribedAt
    }))
  ]
    .filter(notification => !dismissedAppNotifications.includes(notification.id))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const appNotifications = allAppNotifications.slice(0, 20);
  const unreadAppNotificationCount = appNotifications.filter(
    notification => !readAppNotifications.includes(notification.id)
  ).length;

  const handleDeleteNotification = (notificationId) => {
    setDismissedAppNotifications(prev => (
      prev.includes(notificationId) ? prev : [...prev, notificationId]
    ));
    setReadAppNotifications(prev => prev.filter(id => id !== notificationId));
  };

  const handleToggleReadNotification = (notificationId) => {
    setReadAppNotifications(prev => (
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    ));
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Top Navigation */}
      <Navbar bg="light" expand="lg" className="dashboard-navbar px-4">
        <Container fluid>
          <Navbar.Brand href="#">
            <span className="brand-text">DailyCrest Admin</span>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
              <Nav className="ms-auto align-items-center">
              <Nav.Link
                onClick={() => setShowAppNotificationsModal(true)}
                className="position-relative me-3"
                style={{ cursor: 'pointer' }}
                title="App notifications"
              >
                <FaEnvelope />
                <Badge bg="danger" pill className="notification-badge">{unreadAppNotificationCount}</Badge>
              </Nav.Link>
              <Nav.Link
                onClick={() => setShowCommentNotificationsModal(true)}
                className="position-relative me-3"
                style={{ cursor: 'pointer' }}
                title="Comments waiting moderation"
              >
                <FaComments />
                <Badge bg="warning" pill className="notification-badge">{stats.pendingComments}</Badge>
              </Nav.Link>
              <Nav.Link className="me-3 d-flex align-items-center">
                <Avatar src={user?.avatar} name={user?.name} size={32} />
                <span className="ms-2 d-none d-lg-inline">{user?.name}</span>
              </Nav.Link>
              <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="py-4">
        {/* Welcome Section */}
        <Row className="mb-4 align-items-center">
          <Col>
            <h2>Welcome back, {user?.name}!</h2>
            <p className="text-muted">Here's what's happening with your blog today.</p>
          </Col>
          <Col xs="auto">
            <Button variant="primary" as={Link} to="/admin/posts/new">
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
                    <h3 className="mb-0">{stats.totalPosts}</h3>
                    <small className="text-success">
                      <FaCheck className="me-1" /> {stats.publishedPosts} published
                    </small>
                    <small className="text-warning ms-2">
                      <FaTimes className="me-1" /> {stats.draftPosts} drafts
                    </small>
                  </div>
                  <div className="stat-icon-wrapper bg-primary bg-opacity-10">
                    <FaFileAlt className="text-primary" size={24} />
                  </div>
                </div>
                <ProgressBar 
                  now={(stats.publishedPosts / stats.totalPosts) * 100} 
                  variant="success" 
                  className="mt-3"
                  style={{ height: '4px' }}
                />
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6} sm={12}>
            <Card className="stat-card border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Subscribers</h6>
                    <h3 className="mb-0">{stats.totalSubscribers}</h3>
                    <small className="text-success">
                      <FaUserPlus className="me-1" /> +{stats.newSubscribers} this week
                    </small>
                  </div>
                  <div className="stat-icon-wrapper bg-success bg-opacity-10">
                    <FaUsers className="text-success" size={24} />
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
                    <h6 className="text-muted mb-2">Comments</h6>
                    <h3 className="mb-0">{stats.totalComments}</h3>
                    {stats.pendingComments > 0 && (
                      <Badge bg="warning" pill className="mt-2">
                        {stats.pendingComments} pending moderation
                      </Badge>
                    )}
                  </div>
                  <div className="stat-icon-wrapper bg-warning bg-opacity-10">
                    <FaComments className="text-warning" size={24} />
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
                    <h3 className="mb-0">{stats.totalViews.toLocaleString()}</h3>
                    <small className="text-info">
                      <FaEye className="me-1" /> {stats.viewsToday} today
                    </small>
                  </div>
                  <div className="stat-icon-wrapper bg-info bg-opacity-10">
                    <FaEye className="text-info" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row className="mb-4">
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center pt-3">
                <h5 className="mb-0">Traffic Overview</h5>
                <div>
                  <Button 
                    variant={timeRange === 'week' ? 'primary' : 'outline-secondary'} 
                    size="sm"
                    onClick={() => setTimeRange('week')}
                    className="me-2"
                    disabled={loadingTraffic}
                  >
                    Week
                  </Button>
                  <Button 
                    variant={timeRange === 'month' ? 'primary' : 'outline-secondary'} 
                    size="sm"
                    onClick={() => setTimeRange('month')}
                    className="me-2"
                    disabled={loadingTraffic}
                  >
                    Month
                  </Button>
                  <Button 
                    variant={timeRange === 'year' ? 'primary' : 'outline-secondary'} 
                    size="sm"
                    onClick={() => setTimeRange('year')}
                    disabled={loadingTraffic}
                  >
                    Year
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {loadingTraffic ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Loading traffic data...</p>
                  </div>
                ) : chartData ? (
                  <Line 
                    data={chartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            padding: 20
                          }
                        },
                        tooltip: {
                          mode: 'index',
                          intersect: false,
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          titleColor: '#0a2472',
                          bodyColor: '#1e293b',
                          borderColor: '#e2e8f0',
                          borderWidth: 1,
                          padding: 12,
                          boxPadding: 6
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0,0,0,0.05)',
                            drawBorder: false
                          },
                          ticks: {
                            callback: function(value) {
                              return value.toLocaleString();
                            }
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      },
                      interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                      }
                    }}
                    height={300}
                  />
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted">No traffic data available</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0">
                <h5 className="mb-0">Quick Stats</h5>
              </Card.Header>
              <Card.Body>
                <div className="quick-stats-list">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Today's Views</span>
                    <strong>{stats.viewsToday.toLocaleString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">This Week</span>
                    <strong>{stats.viewsThisWeek.toLocaleString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">This Month</span>
                    <strong>{stats.viewsThisMonth.toLocaleString()}</strong>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Avg. Read Time</span>
                    <strong>{stats.avgReadTime} min</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Bounce Rate</span>
                    <strong>{stats.bounceRate}%</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Returning Readers</span>
                    <strong>{stats.returningReaders}%</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Posts Table */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center flex-wrap pt-3">
                <h5 className="mb-0">Recent Posts</h5>
                <div className="d-flex gap-2 mt-2 mt-md-0">
                  <InputGroup size="sm" style={{ width: '250px' }}>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                      <FaFilter className="me-1" /> {filterStatus}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setFilterStatus('all')}>All</Dropdown.Item>
                      <Dropdown.Item onClick={() => setFilterStatus('published')}>Published</Dropdown.Item>
                      <Dropdown.Item onClick={() => setFilterStatus('draft')}>Drafts</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Comments</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPosts.length > 0 ? (
                        filteredPosts.map(post => (
                          <tr key={post._id}>
                            <td data-label="Title">
                              <div className="d-flex align-items-center">
                                {post.featuredImage && (
                                  <img 
                                    src={post.featuredImage} 
                                    alt={post.title}
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    className="rounded me-2"
                                  />
                                )}
                                <div>
                                  <strong>{post.title}</strong>
                                  <small className="d-block text-muted">{post.excerpt?.substring(0, 50)}...</small>
                                </div>
                              </div>
                            </td>
                            <td data-label="Status">{getStatusBadge(post.published ? 'published' : 'draft')}</td>
                            <td data-label="Views">
                              <Badge bg="info" pill>{(Number(post.views) || 0).toLocaleString()}</Badge>
                            </td>
                            <td data-label="Comments">
                              <Badge bg="secondary" pill>{post.commentCount || 0}</Badge>
                            </td>
                            <td data-label="Date">
                              <small>
                                <FaCalendar className="me-1 text-muted" />
                                {new Date(post.createdAt).toLocaleDateString()}
                              </small>
                            </td>
                            <td data-label="Actions">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                as={Link}
                                to={`/admin/posts/edit/${post._id}`}
                                className="me-2"
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
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            No posts found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
              <Card.Footer className="bg-white border-0 d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                  Total: <strong>{stats.totalPosts}</strong> posts
                </span>
                <Button 
                  variant="primary"
                  as={Link} 
                  to="/admin/posts"
                  className="view-all-btn"
                >
                  <FaEye className="me-2" />
                  View All Posts
                  {stats.totalPosts > 10 && (
                    <Badge bg="light" text="primary" className="ms-2">
                      {stats.totalPosts}
                    </Badge>
                  )}
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity Section */}
        <Row className="g-4">
          {/* Recent Comments Card */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Comments</h5>
                {stats.pendingComments > 0 && (
                  <Badge bg="warning" pill className="pending-count-badge">
                    {stats.pendingComments} pending
                  </Badge>
                )}
              </Card.Header>
              <Card.Body>
                {recentComments.length > 0 ? (
                  recentComments.map(comment => (
                    <div key={comment._id} className="comment-item d-flex mb-3 pb-3 border-bottom">
                      <div className="me-3">
                        <Avatar src={comment.author?.avatar} name={comment.name} size={40} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>{comment.name}</strong>
                          <small className="text-muted">{new Date(comment.createdAt).toLocaleDateString()}</small>
                        </div>
                        <p className="mb-1 text-muted small">{comment.content.substring(0, 100)}...</p>
                        <div className="d-flex gap-2 mt-1">
                          <Badge bg="secondary">{comment.post?.title}</Badge>
                          {comment.status === 'pending' && (
                            <Badge bg="warning">Pending</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center py-3">No recent comments</p>
                )}
              </Card.Body>
              <Card.Footer className="bg-white border-0 d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                  Total: <strong>{stats.totalComments}</strong> comments
                </span>
                <Button 
                  variant={stats.pendingComments > 0 ? "warning" : "outline-primary"}
                  as={Link} 
                  to="/admin/comments"
                  className="moderate-btn"
                >
                  <FaComments className="me-2" />
                  Moderate Comments
                  {stats.pendingComments > 0 && (
                    <Badge bg="light" text="dark" className="ms-2 pending-badge">
                      {stats.pendingComments}
                    </Badge>
                  )}
                </Button>
              </Card.Footer>
            </Card>
          </Col>

          {/* Recent Subscribers Card */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Subscribers</h5>
                {stats.newSubscribers > 0 && (
                  <Badge bg="success" pill className="new-subscribers-badge">
                    <FaUserPlus className="me-1" /> +{stats.newSubscribers} new
                  </Badge>
                )}
              </Card.Header>
              <Card.Body>
                {subscribers.length > 0 ? (
                  subscribers.map(sub => (
                    <div key={sub._id} className="subscriber-item d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                      <div>
                        <strong>{sub.name || 'Anonymous'}</strong>
                        <small className="d-block text-muted">
                          <FaEnvelope className="me-1" size={12} />
                          {sub.email}
                        </small>
                      </div>
                      <small className="text-muted">
                        <FaCalendar className="me-1" />
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </small>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center py-3">No recent subscribers</p>
                )}
              </Card.Body>
              <Card.Footer className="bg-white border-0 d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                  Total: <strong>{stats.totalSubscribers}</strong> subscribers
                </span>
                <Button 
                  variant={stats.totalSubscribers > 0 ? "success" : "outline-success"}
                  as={Link} 
                  to="/admin/subscribers"
                  className="manage-btn"
                >
                  <FaUsers className="me-2" />
                  Manage Subscribers
                  {stats.newSubscribers > 0 && (
                    <Badge bg="light" text="success" className="ms-2 new-badge">
                      {stats.newSubscribers} new
                    </Badge>
                  )}
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        </Row>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete "{selectedPost?.title}"? This action cannot be undone.
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
              {deleteLoading ? (
                <>
                  <FaSpinner className="spinner" /> Deleting...
                </>
              ) : (
                'Delete Post'
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showCommentNotificationsModal}
          onHide={() => setShowCommentNotificationsModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Comment Notifications</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {stats.pendingComments > 0 ? (
              <>
                <div className="mb-3">
                  <Badge bg="warning" pill>
                    {stats.pendingComments} waiting for moderation
                  </Badge>
                </div>
                {pendingRecentComments.length > 0 ? (
                  pendingRecentComments.map(comment => (
                    <div key={comment._id} className="mb-3 pb-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong>{comment.name}</strong>
                        <small className="text-muted">{new Date(comment.createdAt).toLocaleString()}</small>
                      </div>
                      <div className="small text-muted mb-2">
                        On: {comment.post?.title || 'Unknown post'}
                      </div>
                      <div className="small">{comment.content.substring(0, 120)}...</div>
                    </div>
                  ))
                ) : (
                  <p className="mb-0">You have pending comments waiting for moderation.</p>
                )}
              </>
            ) : (
              <p className="mb-0">No new comments waiting for moderation.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCommentNotificationsModal(false)}>
              Close
            </Button>
            <Button
              variant="warning"
              as={Link}
              to="/admin/comments"
              onClick={() => setShowCommentNotificationsModal(false)}
            >
              Moderate Comments
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showAppNotificationsModal}
          onHide={() => setShowAppNotificationsModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>App Notifications</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {appNotifications.length > 0 ? (
              appNotifications.map(notification => {
                const isRead = readAppNotifications.includes(notification.id);
                return (
                <div key={notification.id} className={`mb-3 pb-3 border-bottom ${isRead ? 'opacity-75' : ''}`}>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div className="flex-grow-1">
                      <div className="fw-semibold d-flex align-items-center gap-2">
                        {notification.title}
                        <Badge bg={isRead ? 'secondary' : 'primary'}>
                          {isRead ? 'Read' : 'Unread'}
                        </Badge>
                      </div>
                      <div className="small text-muted">{notification.description}</div>
                      <div className="small text-muted mt-1">
                        {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
                      </div>
                    </div>
                    <Button
                      variant={isRead ? 'outline-primary' : 'outline-secondary'}
                      size="sm"
                      onClick={() => handleToggleReadNotification(notification.id)}
                      title={isRead ? 'Mark as unread' : 'Mark as read'}
                    >
                      {isRead ? 'Unread' : 'Read'}
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      title="Delete notification"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              )})
            ) : (
              <p className="mb-0">No new app notifications.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            {appNotifications.length > 0 && (
              <Button
                variant="outline-primary"
                onClick={() => setReadAppNotifications(prev => [
                  ...new Set([...prev, ...appNotifications.map(notification => notification.id)])
                ])}
              >
                Mark All Read
              </Button>
            )}
            {appNotifications.length > 0 && (
              <Button
                variant="outline-secondary"
                onClick={() => setReadAppNotifications(prev => (
                  prev.filter(id => !appNotifications.some(notification => notification.id === id))
                ))}
              >
                Mark All Unread
              </Button>
            )}
            {appNotifications.length > 0 && (
              <Button
                variant="outline-danger"
                onClick={() => setDismissedAppNotifications(prev => [
                  ...new Set([...prev, ...appNotifications.map(notification => notification.id)])
                ])}
              >
                Delete All
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowAppNotificationsModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              as={Link}
              to="/admin/dashboard"
              onClick={() => setShowAppNotificationsModal(false)}
            >
              Refresh Dashboard
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Dashboard;
