import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Row, Col } from 'react-bootstrap';
import { 
  FaShieldAlt, 
  FaCookieBite, 
  FaEnvelope, 
  FaChartLine, 
  FaUserSecret, 
  FaFileAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaGlobe
} from 'react-icons/fa';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const lastUpdated = "March 9, 2026";

  const sections = [
    {
      id: 'introduction',
      icon: <FaShieldAlt />,
      title: 'Introduction',
      content: `At DailyCrest ("we," "our," or "us"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website dailycrest.com (the "Site"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.`
    },
    {
      id: 'no-account',
      icon: <FaUserSecret />,
      title: 'No Account Creation',
      content: `DailyCrest does not require or offer user account creation. You can read all our articles and access all content without registering, logging in, or creating any form of account. This means:`,
      bullets: [
        'No usernames or passwords are collected',
        'No profile information is stored',
        'No account management features exist',
        'You remain anonymous while browsing'
      ]
    },
    {
      id: 'information-collected',
      icon: <FaFileAlt />,
      title: 'Information We Collect',
      content: `Since we don't have user accounts, we collect minimal information:`,
      subsections: [
        {
          title: 'Automatically Collected Information',
          content: 'When you visit our Site, our servers automatically log standard data provided by your web browser. This may include:',
          bullets: [
            'Your IP address',
            'Browser type and version',
            'Device type and operating system',
            'Pages you visit on our Site',
            'Time and date of your visit',
            'Referring website addresses',
            'Time spent on each page'
          ]
        },
        {
          title: 'Cookies and Similar Technologies',
          content: 'We use cookies and similar tracking technologies to enhance your browsing experience. These are small files stored on your device that help us:',
          bullets: [
            'Remember your preferences',
            'Understand how you use our Site',
            'Improve our content and services',
            'Analyze traffic patterns'
          ]
        },
        {
          title: 'Information You Voluntarily Provide',
          content: 'If you choose to interact with us, you may voluntarily provide:',
          bullets: [
            'Email address (when contacting us via our contact form)',
            'Name (when filling out our contact form)',
            'Message content (when submitting inquiries)',
            'Newsletter subscription (email address only)'
          ]
        }
      ]
    },
    {
      id: 'comments',
      icon: <FaEnvelope />,
      title: 'Comments and Interaction',
      content: `Our blog allows visitors to leave comments on articles. When you leave a comment, we collect:`,
      bullets: [
        'Your name (as provided)',
        'Your email address (not publicly displayed)',
        'Your comment content',
        'The time and date of your comment',
        'Your IP address (for spam prevention)'
      ],
      note: 'All comments are moderated before publication to ensure they comply with our community guidelines.'
    },
    {
      id: 'newsletter',
      icon: <FaEnvelope />,
      title: 'Newsletter Subscriptions',
      content: `If you subscribe to our newsletter, we collect and store:`,
      bullets: [
        'Your email address',
        'The date you subscribed',
        'Your subscription status (active/unsubscribed)'
      ],
      note: 'You can unsubscribe at any time by clicking the "Unsubscribe" link at the bottom of any newsletter email.'
    },
    {
      id: 'cookies',
      icon: <FaCookieBite />,
      title: 'Cookies and Tracking',
      content: `We use the following types of cookies:`,
      subsections: [
        {
          title: 'Essential Cookies',
          bullets: [
            'Required for basic site functionality',
            'Enable you to navigate the site',
            'Cannot be disabled'
          ]
        },
        {
          title: 'Analytics Cookies',
          bullets: [
            'Help us understand how visitors use our site',
            'Track page views and visitor behavior',
            'Allow us to improve our content'
          ]
        },
        {
          title: 'Preference Cookies',
          bullets: [
            'Remember your settings',
            'Enhance your user experience'
          ]
        }
      ]
    },
    {
      id: 'analytics',
      icon: <FaChartLine />,
      title: 'Analytics',
      content: `We use analytics tools to understand how our content performs and how visitors interact with our site. These tools may collect:`,
      bullets: [
        'Pages viewed and time spent',
        'Click patterns and scrolling behavior',
        'Geographic location (at country/city level)',
        'Referral sources'
      ],
      note: 'This data is aggregated and anonymized. We do not track individual users across different websites.'
    },
    {
      id: 'data-use',
      icon: <FaCheckCircle />,
      title: 'How We Use Your Information',
      content: 'We use the information we collect to:',
      bullets: [
        'Provide and maintain our Site',
        'Improve and personalize your experience',
        'Understand how visitors use our Site',
        'Respond to your comments and inquiries',
        'Send newsletters (if subscribed)',
        'Prevent spam and abuse',
        'Comply with legal obligations'
      ]
    },
    {
      id: 'data-sharing',
      icon: <FaGlobe />,
      title: 'Information Sharing',
      content: 'We do not sell, trade, or rent your personal information to third parties. We may share information:',
      bullets: [
        'With service providers who help us operate our Site (e.g., hosting, analytics)',
        'To comply with legal obligations',
        'To protect our rights and safety',
        'With your consent'
      ]
    },
    {
      id: 'data-security',
      icon: <FaShieldAlt />,
      title: 'Data Security',
      content: 'We implement appropriate technical and organizational measures to protect your information, including:',
      bullets: [
        'SSL/TLS encryption for data transmission',
        'Regular security audits',
        'Limited access to personal information',
        'Secure data storage'
      ],
      note: 'While we strive to protect your information, no method of transmission over the Internet is 100% secure.'
    },
    {
      id: 'third-party',
      icon: <FaGlobe />,
      title: 'Third-Party Links',
      content: 'Our Site may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to read their privacy policies.'
    },
    {
      id: 'children',
      icon: <FaUserSecret />,
      title: 'Children\'s Privacy',
      content: 'Our Site is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we may have collected information from a child under 13, please contact us immediately.'
    },
    {
      id: 'rights',
      icon: <FaCheckCircle />,
      title: 'Your Rights',
      content: 'Depending on your location, you may have certain rights regarding your personal information:',
      bullets: [
        'Right to access your data',
        'Right to correct inaccurate data',
        'Right to delete your data',
        'Right to restrict processing',
        'Right to data portability',
        'Right to object to processing'
      ],
      note: 'To exercise these rights, please contact us using the information below.'
    },
    {
      id: 'changes',
      icon: <FaClock />,
      title: 'Changes to This Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated effective date. We encourage you to review this policy periodically.'
    },
    {
      id: 'contact',
      icon: <FaEnvelope />,
      title: 'Contact Us',
      content: 'If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:',
      contactInfo: {
        email: 'dailycrestadmin@gmail.com',
        address: 'DailyCrest, 123 Tech Hub, Victoria Island, Lagos, Nigeria'
      }
    }
  ];

  return (
    <>
      <Helmet>
        <title>Privacy Policy | DailyCrest</title>
        <meta name="description" content="DailyCrest Privacy Policy - Learn how we protect your privacy, what information we collect, and your rights regarding your personal data." />
      </Helmet>

      <div className="privacy-policy-page">
        {/* Hero Section */}
        <section className="privacy-hero">
          <div className="container">
            <div className="privacy-hero-content">
              <h1>Privacy Policy</h1>
              <p className="hero-subtitle">Your privacy matters to us</p>
              <p className="hero-description">
                Last Updated: {lastUpdated}
              </p>
            </div>
          </div>
          <div className="hero-peak-decoration">▲</div>
        </section>

        {/* Summary Banner */}
        <section className="privacy-summary">
          <Container>
            <div className="summary-banner">
              <FaExclamationTriangle className="summary-icon" />
              <div className="summary-text">
                <h3>Quick Summary</h3>
                <p>
                  DailyCrest does <strong>not</strong> require user accounts. You can read all content anonymously. 
                  We collect minimal data through cookies and analytics to improve your experience. 
                  If you comment or subscribe to our newsletter, we collect only the information necessary 
                  for those features. We never sell your data.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Policy Content */}
        <section className="privacy-content">
          <Container>
            <Row>
              <Col lg={3} className="mb-4 mb-lg-0">
                {/* Table of Contents - Sticky on desktop */}
                <div className="privacy-toc">
                  <h4>Contents</h4>
                  <ul>
                    {sections.map(section => (
                      <li key={section.id}>
                        <a href={`#${section.id}`}>
                          <span className="toc-icon">{section.icon}</span>
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Col>

              <Col lg={9}>
                <div className="privacy-sections">
                  {sections.map(section => (
                    <section key={section.id} id={section.id} className="privacy-section">
                      <div className="section-header">
                        <div className="section-icon">{section.icon}</div>
                        <h2>{section.title}</h2>
                      </div>
                      
                      <div className="section-content">
                        <p>{section.content}</p>

                        {section.bullets && (
                          <ul className="section-bullets">
                            {section.bullets.map((bullet, index) => (
                              <li key={index}>{bullet}</li>
                            ))}
                          </ul>
                        )}

                        {section.subsections && section.subsections.map((subsection, index) => (
                          <div key={index} className="subsection">
                            <h3>{subsection.title}</h3>
                            {subsection.content && <p>{subsection.content}</p>}
                            {subsection.bullets && (
                              <ul className="subsection-bullets">
                                {subsection.bullets.map((bullet, idx) => (
                                  <li key={idx}>{bullet}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}

                        {section.note && (
                          <div className="section-note">
                            <strong>Note:</strong> {section.note}
                          </div>
                        )}

                        {section.contactInfo && (
                          <div className="contact-info">
                            <p><strong>Email:</strong> <a href={`mailto:${section.contactInfo.email}`}>{section.contactInfo.email}</a></p>
                            <p><strong>Address:</strong> {section.contactInfo.address}</p>
                          </div>
                        )}
                      </div>
                    </section>
                  ))}

                  {/* Consent Section */}
                  <div className="consent-section">
                    <p>
                      By using our website, you hereby consent to our Privacy Policy and agree to its terms.
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Contact Banner */}
        <section className="privacy-contact-banner">
          <Container>
            <Row className="align-items-center">
              <Col lg={8}>
                <h3>Have questions about your privacy?</h3>
                <p>We're here to help. Reach out to our privacy team anytime.</p>
              </Col>
              <Col lg={4} className="text-lg-end">
                <a href="/contact" className="btn-privacy-contact">
                  <FaEnvelope className="me-2" />
                  Contact Us
                </a>
              </Col>
            </Row>
          </Container>
        </section>
      </div>
    </>
  );
};

export default PrivacyPolicy;
