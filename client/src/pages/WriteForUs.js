import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaPenFancy, FaCheckCircle, FaExclamationCircle, FaLightbulb, FaUsers, FaRocket, FaPaperPlane, FaRegListAlt, FaRegClock, FaRegStar, FaRegCopy, FaUpload, FaArrowRight } from 'react-icons/fa';
import api from '../services/api';
import './WriteForUs.css';

const WriteForUs = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    topic: '',
    articleTitle: '',
    articleSummary: '',
    message: '',
    agreeToTerms: false
  });

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setStatus('error');
        setMessage('File size should be less than 5MB');
        return;
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setStatus('error');
        setMessage('Please upload PDF, DOC, DOCX, or TXT files only');
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
      setStatus('idle');
      setMessage('');
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileName('');
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validation
    if (!formData.fullName.trim()) {
      setStatus('error');
      setMessage('Please enter your full name');
      return;
    }

    if (!validateEmail(formData.email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    if (!formData.topic) {
      setStatus('error');
      setMessage('Please select a topic category');
      return;
    }

    if (!formData.articleTitle.trim()) {
      setStatus('error');
      setMessage('Please enter your article title');
      return;
    }

    if (!formData.articleSummary.trim()) {
      setStatus('error');
      setMessage('Please provide a summary of your article');
      return;
    }

    if (formData.articleSummary.length < 50) {
      setStatus('error');
      setMessage('Summary must be at least 50 characters long');
      return;
    }

    if (!formData.message.trim()) {
      setStatus('error');
      setMessage('Please tell us a bit about yourself');
      return;
    }

    if (!formData.agreeToTerms) {
      setStatus('error');
      setMessage('You must agree to the terms and conditions');
      return;
    }

    setStatus('loading');

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      if (file) {
        submitData.append('article', file);
      }

      // You'll need to create this endpoint
      const response = await api.post('/write-for-us', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStatus('success');
      setMessage(response.data.message || 'Your proposal has been submitted successfully! We\'ll review it and get back to you within 3-5 business days.');
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        topic: '',
        articleTitle: '',
        articleSummary: '',
        message: '',
        agreeToTerms: false
      });
      setFile(null);
      setFileName('');
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again later.');
    }
  };

  const topics = [
    'Technology',
    'Business',
    'Growth',
    'AI',
    'Programming',
    'Career Advice',
    'Productivity',
    'Other'
  ];

  const benefits = [
    {
      icon: <FaUsers />,
      title: 'Reach 50K+ Readers',
      description: 'Get your work in front of our engaged audience of professionals and learners.'
    },
    {
      icon: <FaRocket />,
      title: 'Build Your Portfolio',
      description: 'Showcase your expertise and add published work to your portfolio.'
    },
    {
      icon: <FaRegStar />,
      title: 'Author Recognition',
      description: 'Get featured with your photo, bio, and links to your social media.'
    },
    {
      icon: <FaRegClock />,
      title: 'Flexible Schedule',
      description: 'Write at your own pace with no strict deadlines.'
    }
  ];

  const guidelines = [
    'Original content only – no plagiarism or AI-generated articles',
    'Well-researched, accurate, and up-to-date information',
    'Minimum 1500 words for in-depth coverage',
    'Proper grammar, spelling, and formatting',
    'Include credible sources and citations where applicable',
    'No promotional or sales-focused content',
    'Family-friendly content suitable for all audiences'
  ];

  return (
    <>
      <Helmet>
        <title>Write For Us | DailyCrest</title>
        <meta name="description" content="Share your expertise with the DailyCrest community. Learn about our guest posting guidelines and how to submit your article." />
      </Helmet>

      <div className="write-for-us-page">
        {/* Hero Section */}
        <section className="write-hero">
          <div className="container">
            <div className="write-hero-content">
              <h1>Write For Us</h1>
              <p className="hero-subtitle">Share Your Knowledge with the World</p>
              <p className="hero-description">
                Join our community of expert writers and reach thousands of readers eager to learn from your insights.
              </p>
            </div>
          </div>
          <div className="hero-peak-decoration">▲</div>
        </section>

        {/* Benefits Section */}
        <section className="benefits-section">
          <Container>
            <h2 className="section-title">Why Write for DailyCrest?</h2>
            <p className="section-subtitle">Share your expertise and grow your audience</p>
            
            <Row className="g-4">
              {benefits.map((benefit, index) => (
                <Col key={index} md={6} lg={3}>
                  <Card className="benefit-card h-100">
                    <Card.Body>
                      <div className="benefit-icon">{benefit.icon}</div>
                      <h3>{benefit.title}</h3>
                      <p>{benefit.description}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Guidelines Section */}
        <section className="guidelines-section">
          <Container>
            <Row className="align-items-center">
              <Col lg={6} className="mb-4 mb-lg-0">
                <div className="guidelines-content">
                  <h2>Our Guidelines</h2>
                  <p className="lead">
                    We're looking for high-quality, original content that provides value to our readers.
                  </p>
                  
                  <div className="guidelines-list">
                    {guidelines.map((guideline, index) => (
                      <div key={index} className="guideline-item">
                        <FaCheckCircle className="guideline-icon" />
                        <span>{guideline}</span>
                      </div>
                    ))}
                  </div>

                  <div className="guidelines-note">
                    <FaLightbulb className="note-icon" />
                    <div>
                      <strong>Pro Tip:</strong> Articles that include practical examples, case studies, or actionable advice perform best with our readers.
                    </div>
                  </div>
                </div>
              </Col>

              <Col lg={6}>
                <div className="topics-card">
                  <h3>Popular Topics We're Seeking</h3>
                  <div className="topics-cloud">
                    {topics.map((topic, index) => (
                      <Badge key={index} className="topic-badge" bg="primary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-3">
                    Have an idea not listed? We're open to unique perspectives and emerging topics. Just tell us about it!
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Submission Form Section */}
        <section className="submission-section">
          <Container>
            <Row className="justify-content-center">
              <Col lg={10}>
                <Card className="submission-card">
                  <Card.Header className="submission-header">
                    <h3>
                      <FaPenFancy className="me-2" />
                      Submit Your Proposal
                    </h3>
                    <p>Fill out the form below and our editorial team will review your submission</p>
                  </Card.Header>
                  <Card.Body className="submission-body">
                    
                    {status === 'success' && (
                      <Alert variant="success" onClose={() => setStatus('idle')} dismissible>
                        <FaCheckCircle className="me-2" />
                        {message}
                      </Alert>
                    )}
                    
                    {status === 'error' && (
                      <Alert variant="danger" onClose={() => setStatus('idle')} dismissible>
                        <FaExclamationCircle className="me-2" />
                        {message}
                      </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name *</Form.Label>
                            <Form.Control
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              placeholder="John Doe"
                              disabled={status === 'loading'}
                              className="form-control-lg"
                              required
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email Address *</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="john@example.com"
                              disabled={status === 'loading'}
                              className="form-control-lg"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Topic Category *</Form.Label>
                            <Form.Select
                              name="topic"
                              value={formData.topic}
                              onChange={handleChange}
                              disabled={status === 'loading'}
                              className="form-control-lg"
                              required
                            >
                              <option value="">Select a topic</option>
                              {topics.map(topic => (
                                <option key={topic} value={topic}>{topic}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Proposed Article Title *</Form.Label>
                            <Form.Control
                              type="text"
                              name="articleTitle"
                              value={formData.articleTitle}
                              onChange={handleChange}
                              placeholder="e.g., The Future of AI in 2026"
                              disabled={status === 'loading'}
                              className="form-control-lg"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Article Summary *</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="articleSummary"
                          value={formData.articleSummary}
                          onChange={handleChange}
                          placeholder="Provide a brief summary of your article (minimum 50 characters)"
                          rows={3}
                          disabled={status === 'loading'}
                          required
                        />
                        <Form.Text className="text-muted">
                          {formData.articleSummary.length}/500 characters (minimum 50)
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>About You / Message to Editor *</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us about your expertise, writing experience, and why you want to write for DailyCrest"
                          rows={4}
                          disabled={status === 'loading'}
                          required
                        />
                      </Form.Group>

                      {/* File Upload */}
                      <Form.Group className="mb-4">
                        <Form.Label>Attach Your Draft (Optional)</Form.Label>
                        <div className="file-upload-area">
                          <input
                            type="file"
                            id="file-upload"
                            onChange={handleFileChange}
                            disabled={status === 'loading'}
                            accept=".pdf,.doc,.docx,.txt"
                          />
                          <label htmlFor="file-upload" className="file-upload-label">
                            <FaUpload className="me-2" />
                            {fileName || 'Choose file or drag here'}
                          </label>
                          {fileName && (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={removeFile}
                              className="file-remove"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <Form.Text className="text-muted">
                          Accepted formats: PDF, DOC, DOCX, TXT (Max 5MB)
                        </Form.Text>
                      </Form.Group>

                      {/* Terms Checkbox */}
                      <Form.Group className="mb-4">
                        <Form.Check
                          type="checkbox"
                          name="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onChange={handleChange}
                          label={
                            <span>
                              I confirm that my submission is original and I agree to the{' '}
                              <a href="/terms" target="_blank">Terms of Service</a> and{' '}
                              <a href="/privacy" target="_blank">Privacy Policy</a>.
                            </span>
                          }
                          disabled={status === 'loading'}
                          required
                        />
                      </Form.Group>

                      <div className="text-center">
                        <Button
                          type="submit"
                          className="btn-submit"
                          disabled={status === 'loading'}
                        >
                          {status === 'loading' ? (
                            <>
                              <Spinner size="sm" className="me-2" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <FaPaperPlane className="me-2" />
                              Submit Proposal
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Process Section */}
        <section className="process-section">
          <Container>
            <h2 className="section-title">What Happens Next?</h2>
            <Row className="g-4">
              <Col md={3}>
                <div className="process-step">
                  <div className="step-number">1</div>
                  <div className="step-icon">
                    <FaRegListAlt />
                  </div>
                  <h4>Submit</h4>
                  <p>Fill out the form with your article proposal</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="process-step">
                  <div className="step-number">2</div>
                  <div className="step-icon">
                    <FaRegClock />
                  </div>
                  <h4>Review</h4>
                  <p>Our editors review your submission (3-5 days)</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="process-step">
                  <div className="step-number">3</div>
                  <div className="step-icon">
                    <FaRegCopy />
                  </div>
                  <h4>Collaborate</h4>
                  <p>Work with our team to refine your article</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="process-step">
                  <div className="step-number">4</div>
                  <div className="step-icon">
                    <FaRocket />
                  </div>
                  <h4>Publish</h4>
                  <p>Your article goes live and reaches thousands</p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* FAQ Teaser */}
        <section className="faq-teaser">
          <Container>
            <Row className="align-items-center">
              <Col lg={8}>
                <h3>Have Questions About Guest Posting?</h3>
                <p>Check out our FAQ section for answers to common questions about writing for DailyCrest.</p>
              </Col>
              <Col lg={4} className="text-lg-end">
                <a href="/faq" className="btn-faq">
                  View FAQ
                  <FaArrowRight className="ms-2" />
                </a>
              </Col>
            </Row>
          </Container>
        </section>
      </div>
    </>
  );
};

export default WriteForUs;
