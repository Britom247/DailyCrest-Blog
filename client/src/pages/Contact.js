import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaPaperPlane, FaCheckCircle, FaExclamationCircle, FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import api from '../services/api';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validation
    if (!formData.name.trim()) {
      setStatus('error');
      setMessage('Please enter your name');
      return;
    }

    if (!validateEmail(formData.email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    if (!formData.subject.trim()) {
      setStatus('error');
      setMessage('Please enter a subject');
      return;
    }

    if (!formData.message.trim()) {
      setStatus('error');
      setMessage('Please enter your message');
      return;
    }

    if (formData.message.length < 10) {
      setStatus('error');
      setMessage('Message must be at least 10 characters long');
      return;
    }

    setStatus('loading');

    try {
      // You'll need to create this endpoint
      const response = await api.post('/contact', formData);
      
      setStatus('success');
      setMessage(response.data.message || 'Your message has been sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus('error');
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again later.');
    }
  };

  const contactInfo = [
    {
      icon: <FaEnvelope />,
      title: 'Email Us',
      details: ['dailycrestadmin@gmail.com'],
      action: 'mailto:dailycrestadmin@gmail.com'
    },
    {
      icon: <FaPhone />,
      title: 'Call Us',
      details: ['+234 (0) 707 972 4342'],
      action: 'tel:+2347079724342'
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Visit Us',
      details: ['123 Tech Hub, Victoria Island', 'Lagos, Nigeria'],
      action: 'https://maps.google.com/?q=Lagos,Nigeria'
    },
    {
      icon: <FaClock />,
      title: 'Working Hours',
      details: ['Monday - Friday: 9am - 6pm', 'Saturday: 10am - 4pm'],
      action: null
    }
  ];

  const socialLinks = [
    { icon: <FaXTwitter />, url: 'https://x.com/DailyC31055', label: 'Twitter', className: 'social-icon--twitter' },
    { icon: <FaLinkedin />, url: 'https://www.linkedin.com/in/dailycrest-blog-72a6743b6/', label: 'LinkedIn', className: 'social-icon--linkedin' },
    { icon: <FaGithub />, url: 'https://github.com/dailycrest', label: 'GitHub', className: 'social-icon--github' },
    { icon: <FaInstagram />, url: 'https://www.instagram.com/dailycrest_2026/', label: 'Instagram', className: 'social-icon--instagram' }
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us | DailyCrest</title>
        <meta name="description" content="Get in touch with the DailyCrest team. We'd love to hear from you!" />
      </Helmet>

      <div className="contact-page">
        {/* Hero Section */}
        <section className="contact-hero">
          <div className="container">
            <div className="contact-hero-content">
              <h1>Get in Touch</h1>
              <p className="hero-subtitle">We'd love to hear from you</p>
              <p className="hero-description">
                Have a question, feedback, or just want to say hello? Reach out to us and we'll get back to you as soon as possible.
              </p>
            </div>
          </div>
          <div className="hero-peak-decoration">▲</div>
        </section>

        {/* Contact Info Cards */}
        <section className="contact-info-section">
          <Container>
            <Row className="g-4">
              {contactInfo.map((item, index) => (
                <Col key={index} lg={3} md={6}>
                  <Card className="contact-info-card h-100">
                    <Card.Body>
                      <div className="info-icon-wrapper">
                        {item.icon}
                      </div>
                      <h3>{item.title}</h3>
                      {item.details.map((detail, i) => (
                        <p key={i}>{detail}</p>
                      ))}
                      {item.action && (
                        <a 
                          href={item.action} 
                          className="info-link"
                          target={item.action.startsWith('http') ? '_blank' : '_self'}
                          rel="noopener noreferrer"
                        >
                          Connect <span>→</span>
                        </a>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Contact Form Section */}
        <section className="contact-form-section">
          <Container>
            <Row className="align-items-center">
              <Col lg={5} className="mb-4 mb-lg-0">
                <div className="form-intro">
                  <h2>Send Us a Message</h2>
                  <p className="lead">
                    Have a specific question or inquiry? Fill out the form and we'll respond within 24 hours.
                  </p>
                  
                  <div className="form-features">
                    <div className="feature-item">
                      <FaCheckCircle className="feature-icon" />
                      <div>
                        <h4>Quick Response</h4>
                        <p>We aim to respond within 24 hours</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <FaCheckCircle className="feature-icon" />
                      <div>
                        <h4>Expert Support</h4>
                        <p>Get help from our knowledgeable team</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <FaCheckCircle className="feature-icon" />
                      <div>
                        <h4>Privacy Guaranteed</h4>
                        <p>Your information is kept confidential</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="contact-social-links">
                    <p className="mb-3">Connect with us on social media:</p>
                    <div className="social-icons">
                      {socialLinks.map((social, index) => (
                        <a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`social-icon ${social.className}`}
                          aria-label={social.label}
                        >
                          {social.icon}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </Col>

              <Col lg={7}>
                <Card className="contact-form-card">
                  <Card.Body>
                    <h3 className="form-title">Send Your Message</h3>
                    
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
                            <Form.Label>Your Name *</Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="John Doe"
                              disabled={status === 'loading'}
                              className="form-control-lg"
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
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Subject *</Form.Label>
                        <Form.Control
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="What's this about?"
                          disabled={status === 'loading'}
                          className="form-control-lg"
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Message *</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us more about your inquiry..."
                          rows={6}
                          disabled={status === 'loading'}
                          className="form-control-lg"
                        />
                        <Form.Text className="text-muted">
                          {formData.message.length}/1000 characters (minimum 10)
                        </Form.Text>
                      </Form.Group>

                      <Button
                        type="submit"
                        className="btn-submit"
                        disabled={status === 'loading'}
                      >
                        {status === 'loading' ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <FaPaperPlane className="me-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Map Section (Optional) */}
        <section className="map-section">
          <Container fluid className="p-0">
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253682.7174750658!2d3.26716245!3d6.5483689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2s!4v1620000000000!5m2!1sen!2s"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="DailyCrest Location"
              ></iframe>
            </div>
          </Container>
        </section>

        {/* FAQ Teaser */}
        <section className="faq-teaser">
          <Container>
            <Row className="justify-content-center">
              <Col lg={8} className="text-center">
                <h2>Still Have Questions?</h2>
                <p className="mb-4">
                  Check out our FAQ section for quick answers to common questions, or reach out to us directly.
                </p>
                <Button variant="outline-primary" href="/faq" className="btn-faq">
                  View FAQ
                </Button>
              </Col>
            </Row>
          </Container>
        </section>
      </div>
    </>
  );
};

export default Contact;

