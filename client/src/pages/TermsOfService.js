import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Row, Col } from 'react-bootstrap';
import {
  FaFileContract,
  FaCopyright,
  FaCommentDots,
  FaExclamationTriangle,
  FaGavel,
  FaShieldAlt,
  FaBan,
  FaLink,
  FaEnvelope,
  FaClock,
  FaGlobe,
  FaCheckCircle
} from 'react-icons/fa';
import './TermsOfService.css';

const TermsOfService = () => {
  const lastUpdated = "March 9, 2026";
  const effectiveDate = "March 9, 2026";

  const sections = [
    {
      id: 'acceptance',
      icon: <FaCheckCircle />,
      title: 'Acceptance of Terms',
      content: `By accessing or using DailyCrest ("the Website"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use the Website. These terms apply to all visitors, users, and others who access the Website.`
    },
    {
      id: 'description',
      icon: <FaGlobe />,
      title: 'Description of Service',
      content: `DailyCrest is a knowledge platform that provides articles, insights, and resources on technology, business, personal growth, and related topics. The Website offers:`,
      bullets: [
        'Free access to all published articles and content',
        'Comment sections on blog posts',
        'Newsletter subscriptions (optional)',
        'Contact forms for inquiries'
      ]
    },
    {
      id: 'no-account',
      icon: <FaBan />,
      title: 'No Account Requirement',
      content: `DailyCrest does not require user registration or account creation. You can:`,
      bullets: [
        'Read all articles without any registration',
        'Access all content anonymously',
        'Browse the Website without providing personal information'
      ],
      note: 'While you can comment without an account, you must provide a name and email address (which is not publicly displayed).'
    },
    {
      id: 'intellectual-property',
      icon: <FaCopyright />,
      title: 'Intellectual Property Rights',
      content: `All content published on DailyCrest, including but not limited to articles, text, graphics, logos, images, and software, is the property of DailyCrest or its content creators and is protected by copyright, trademark, and other intellectual property laws.`,
      subsections: [
        {
          title: 'Our Content',
          bullets: [
            'You may not reproduce, distribute, modify, or publicly display any content without prior written consent',
            'You may download or print content for personal, non-commercial use only',
            'You must retain all copyright and other proprietary notices'
          ]
        },
        {
          title: 'User-Generated Content',
          bullets: [
            'By posting comments, you grant DailyCrest a non-exclusive, royalty-free license to display your content',
            'You retain ownership of your comments',
            'You are solely responsible for the content you post'
          ]
        }
      ]
    },
    {
      id: 'user-conduct',
      icon: <FaGavel />,
      title: 'User Conduct and Guidelines',
      content: 'When using DailyCrest, you agree not to:',
      bullets: [
        'Post or transmit any unlawful, threatening, abusive, defamatory, or obscene content',
        'Harass, stalk, or intimidate other users',
        'Impersonate any person or entity',
        'Post spam, advertisements, or promotional content',
        'Attempt to gain unauthorized access to our systems',
        'Interfere with the proper functioning of the Website',
        'Use automated scripts or bots to access the Website',
        'Collect or harvest user information without consent'
      ]
    },
    {
      id: 'comments',
      icon: <FaCommentDots />,
      title: 'Comment Guidelines',
      content: `Our comment sections are provided for constructive discussion. By commenting, you agree to:`,
      bullets: [
        'Be respectful and courteous to others',
        'Stay on topic and contribute meaningfully',
        'Not post personal information about yourself or others',
        'Not post links to malicious or inappropriate websites',
        'Not use comments for self-promotion or advertising'
      ],
      note: 'All comments are moderated before publication. We reserve the right to remove any comment that violates these guidelines without notice.'
    },
    {
      id: 'third-party',
      icon: <FaLink />,
      title: 'Third-Party Links',
      content: `Our Website may contain links to third-party websites or services that are not owned or controlled by DailyCrest. We have no control over, and assume no responsibility for:`,
      bullets: [
        'The content, privacy policies, or practices of any third-party websites',
        'Any damages or losses caused by or in connection with the use of third-party content'
      ],
      note: 'We encourage you to read the terms and conditions and privacy policies of any third-party websites you visit.'
    },
    {
      id: 'disclaimer',
      icon: <FaExclamationTriangle />,
      title: 'Disclaimer of Warranties',
      content: `THE WEBSITE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. TO THE FULLEST EXTENT PERMITTED BY LAW, DAILYCREST DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:`,
      bullets: [
        'The accuracy, reliability, or completeness of any content',
        'The availability of the Website at any particular time',
        'That the Website will be error-free or secure',
        'The results obtained from using the Website'
      ]
    },
    {
      id: 'limitation',
      icon: <FaShieldAlt />,
      title: 'Limitation of Liability',
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL DAILYCREST, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR:`,
      bullets: [
        'Any indirect, incidental, special, consequential, or punitive damages',
        'Any loss of profits, data, or goodwill',
        'Any damages arising from your use of or inability to use the Website',
        'Any content obtained from the Website'
      ],
      note: 'This limitation applies whether the alleged liability is based on contract, tort, negligence, strict liability, or any other basis.'
    },
    {
      id: 'indemnification',
      icon: <FaGavel />,
      title: 'Indemnification',
      content: `You agree to defend, indemnify, and hold harmless DailyCrest, its affiliates, and their respective officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with:`,
      bullets: [
        'Your access to or use of the Website',
        'Your violation of these Terms',
        'Your violation of any third-party rights',
        'Any content you post or submit'
      ]
    },
    {
      id: 'modifications',
      icon: <FaClock />,
      title: 'Modifications to Terms',
      content: `We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.`,
      note: 'By continuing to access or use our Website after any revisions become effective, you agree to be bound by the revised terms.'
    },
    {
      id: 'termination',
      icon: <FaBan />,
      title: 'Termination',
      content: `We may terminate or suspend your access to the Website immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.`,
      bullets: [
        'All provisions of the Terms which by their nature should survive termination shall survive',
        'Upon termination, your right to use the Website will immediately cease'
      ]
    },
    {
      id: 'governing-law',
      icon: <FaGavel />,
      title: 'Governing Law',
      content: `These Terms shall be governed and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.`
    },
    {
      id: 'contact',
      icon: <FaEnvelope />,
      title: 'Contact Information',
      content: 'If you have any questions about these Terms, please contact us at:',
      contactInfo: {
        email: 'dailycrestadmin@gmail.com',
        address: 'DailyCrest, 123 Tech Hub, Victoria Island, Lagos, Nigeria'
      }
    }
  ];

  return (
    <>
      <Helmet>
        <title>Terms of Service | DailyCrest</title>
        <meta name="description" content="DailyCrest Terms of Service - Read our terms and conditions for using our website, including content usage, comment guidelines, and legal disclaimers." />
      </Helmet>

      <div className="terms-page">
        {/* Hero Section */}
        <section className="terms-hero">
          <div className="container">
            <div className="terms-hero-content">
              <h1>Terms of Service</h1>
              <p className="hero-subtitle">Please read these terms carefully</p>
              <div className="hero-dates">
                <span>Last Updated: {lastUpdated}</span>
                <span>Effective Date: {effectiveDate}</span>
              </div>
            </div>
          </div>
          <div className="hero-peak-decoration">▲</div>
        </section>

        {/* Summary Banner */}
        <section className="terms-summary">
          <Container>
            <div className="summary-banner">
              <FaFileContract className="summary-icon" />
              <div className="summary-text">
                <h3>Quick Summary</h3>
                <p>
                  DailyCrest provides free content for your personal use. You don't need an account to read our articles.
                  When commenting, be respectful and follow our guidelines. All content is protected by copyright.
                  We're not liable for how you use the information provided. For full details, please read below.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Terms Content */}
        <section className="terms-content">
          <Container>
            <Row>
              <Col lg={3} className="mb-4 mb-lg-0">
                {/* Table of Contents - Sticky on desktop */}
                <div className="terms-toc">
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
                <div className="terms-sections">
                  {sections.map(section => (
                    <section key={section.id} id={section.id} className="terms-section">
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

                  {/* Agreement Section */}
                  <div className="agreement-section">
                    <p>
                      By using DailyCrest, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Contact Banner */}
        <section className="terms-contact-banner">
          <Container>
            <Row className="align-items-center">
              <Col lg={8}>
                <h3>Have questions about our terms?</h3>
                <p>We're here to help clarify any concerns.</p>
              </Col>
              <Col lg={4} className="text-lg-end">
                <a href="/contact" className="btn-terms-contact">
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

export default TermsOfService;
