import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Row, Col, Accordion } from 'react-bootstrap';
import { FaSearch, FaEnvelope, FaUser, FaTag, FaComments, FaNewspaper, FaLock, FaQuestionCircle } from 'react-icons/fa';
import './FAQ.css';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Questions', icon: <FaQuestionCircle /> },
    { id: 'general', name: 'General', icon: <FaNewspaper /> },
    { id: 'account', name: 'Access', icon: <FaUser /> },
    { id: 'content', name: 'Content', icon: <FaTag /> },
    { id: 'comments', name: 'Comments', icon: <FaComments /> },
    { id: 'privacy', name: 'Privacy', icon: <FaLock /> }
  ];

  const faqs = [
    {
      id: 1,
      category: 'general',
      question: 'What is DailyCrest?',
      answer: 'DailyCrest is a knowledge platform dedicated to providing insights on technology, business, personal growth, and more. We curate and create content to help you stay ahead in your personal and professional journey.'
    },
    {
      id: 2,
      category: 'general',
      question: 'How often do you publish new content?',
      answer: 'We publish new articles daily, focusing on various topics including technology trends, business strategies, personal development, and industry insights. Our goal is to provide you with fresh, valuable content every day.'
    },
    {
      id: 3,
      category: 'general',
      question: 'Is DailyCrest free to use?',
      answer: 'Yes, DailyCrest is completely free! All our articles and resources are available at no cost. We believe in making knowledge accessible to everyone.'
    },
    {
      id: 4,
      category: 'account',
      question: 'Do I need an account to read articles?',
      answer: 'No. DailyCrest does not require account registration to read articles. All published content is freely accessible.'
    },
    {
      id: 5,
      category: 'account',
      question: 'How can I stay updated without an account?',
      answer: 'Use the newsletter subscription form to receive updates by email. You can also follow our social channels for new posts and announcements.'
    },
    {
      id: 6,
      category: 'account',
      question: 'Do you offer user login or password reset?',
      answer: 'Not at the moment. DailyCrest currently does not support public user accounts, so there is no login or password reset flow.'
    },
    {
      id: 7,
      category: 'content',
      question: 'Can I contribute articles to DailyCrest?',
      answer: 'Yes! We welcome guest contributions from experts and enthusiasts. Visit our "Write for Us" page to learn more about our submission guidelines and how you can share your knowledge with our community.'
    },
    {
      id: 8,
      category: 'content',
      question: 'How are topics chosen for articles?',
      answer: 'We select topics based on current trends, reader interests, and expert insights. We also welcome suggestions from our community. If there\'s a topic you\'d like us to cover, let us know through our contact form.'
    },
    {
      id: 9,
      category: 'content',
      question: 'Can I request a specific topic?',
      answer: 'Absolutely! We love hearing from our readers. Use our contact form to suggest topics you\'d like to see covered. We do our best to accommodate popular requests.'
    },
    {
      id: 10,
      category: 'comments',
      question: 'How do I comment on an article?',
      answer: 'Scroll to the bottom of any article to find the comment section. Enter your name, email, and comment, then click "Post Comment".'
    },
    {
      id: 11,
      category: 'comments',
      question: 'Why is my comment not appearing?',
      answer: 'All comments are moderated to ensure they follow our community guidelines. Once approved, your comment will appear publicly. This process usually takes a few hours.'
    },
    {
      id: 12,
      category: 'comments',
      question: 'Can I edit or delete my comment?',
      answer: 'Currently, you cannot edit comments after posting. If you need to correct or remove a comment, please contact us and we\'ll assist you.'
    },
    {
      id: 13,
      category: 'privacy',
      question: 'How do you protect my personal information?',
      answer: 'We take your privacy seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent. Read our Privacy Policy for more details.'
    },
    {
      id: 14,
      category: 'privacy',
      question: 'What information do you collect?',
      answer: 'We collect information you submit through forms, such as contact details and newsletter subscriptions. We also use cookies and basic analytics to improve site performance and user experience.'
    },
    {
      id: 15,
      category: 'privacy',
      question: 'Can I request deletion of my submitted data?',
      answer: 'Yes. If you want your contact or newsletter information removed, please reach out through our Contact page and we will process your request.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || <FaQuestionCircle />;
  };

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | DailyCrest</title>
        <meta name="description" content="Find answers to common questions about DailyCrest, including content, comments, privacy, subscriptions, and support." />
      </Helmet>

      <div className="faq-page">
        {/* Hero Section */}
        <section className="faq-hero">
          <div className="container">
            <div className="faq-hero-content">
              <h1>Frequently Asked Questions</h1>
              <p className="hero-subtitle">Find answers to common questions</p>
              
              {/* Search Bar */}
              <div className="faq-search-wrapper">
                <div className="faq-search">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search for questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="hero-peak-decoration">▲</div>
        </section>

        {/* Categories */}
        <section className="faq-categories">
          <Container>
            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </Container>
        </section>

        {/* FAQ Accordion */}
        <section className="faq-accordion-section">
          <Container>
            {filteredFaqs.length > 0 ? (
              <Accordion defaultActiveKey="0" flush>
                {filteredFaqs.map((faq, index) => (
                  <Accordion.Item eventKey={index.toString()} key={faq.id}>
                    <Accordion.Header>
                      <div className="question-header">
                        <span className="category-badge">
                          {getCategoryIcon(faq.category)}
                          {categories.find(c => c.id === faq.category)?.name}
                        </span>
                        <span className="question-text">{faq.question}</span>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="answer-content">
                        {faq.answer}
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            ) : (
              <div className="no-results">
                <FaSearch size={48} className="no-results-icon" />
                <h3>No questions found</h3>
                <p>Try adjusting your search or filter to find what you're looking for.</p>
                <button 
                  className="clear-search-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </Container>
        </section>

        {/* Still Have Questions */}
        <section className="still-questions">
          <Container>
            <Row className="justify-content-center">
              <Col lg={8} className="text-center">
                <h2>Still Have Questions?</h2>
                <p className="mb-4">
                  Can't find the answer you're looking for? Please reach out to our friendly team.
                </p>
                <div className="question-actions">
                  <a href="/contact" className="btn-contact">
                    <FaEnvelope className="me-2" />
                    Contact Us
                  </a>
                  <a href="/write-for-us" className="btn-write">
                    Write for Us
                  </a>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Quick Stats */}
        <section className="faq-stats">
          <Container>
            <Row className="g-4">
              <Col md={3} sm={6}>
                <div className="stat-card">
                  <div className="stat-icon">📚</div>
                  <div className="stat-number">150+</div>
                  <div className="stat-label">Articles</div>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-number">50K+</div>
                  <div className="stat-label">Readers</div>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="stat-card">
                  <div className="stat-icon">💬</div>
                  <div className="stat-number">1K+</div>
                  <div className="stat-label">Comments</div>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="stat-card">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Support</div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </div>
    </>
  );
};

export default FAQ;
