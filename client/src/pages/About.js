import React from 'react';
import { Link } from 'react-router-dom';
// import { Helmet } from 'react-helmet-async';
import { FaLinkedin, FaGithub, FaEnvelope, FaQuoteLeft, FaEye, FaUsers, FaNewspaper } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import brightImage from '../assets/images/brightImage.png';
import SEO from '../components/SEO';
import Newsletter from '../components/Newsletter';
import './About.css';

const About = () => {
  const teamMembers = [
    {
      name: 'Bright Momoh',
      role: 'Founder & Editor-in-Chief',
      bio: 'Passionate about technology and personal growth. Bright founded DailyCrest to help others rise to their full potential through curated insights and knowledge.',
      image: brightImage,
      social: {
        twitter: 'https://x.com/bright_mom62851/',
        linkedin: 'https://www.linkedin.com/in/bright-momoh-9997652a3/',
        github: 'https://github.com/Britom247'
      }
    },
    {
      name: 'Sarah Johnson',
      role: 'Senior Tech Writer',
      bio: 'Tech enthusiast with 8+ years of experience in software development. Sarah breaks down complex topics into digestible insights.',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400',
      social: {
        twitter: 'https://twitter.com/sarahjohnson',
        linkedin: 'https://linkedin.com/in/sarahjohnson',
        github: 'https://github.com/sarahjohnson'
      }
    },
    {
      name: 'Michael Adebayo',
      role: 'Business & Growth Expert',
      bio: 'Business consultant and growth strategist helping entrepreneurs and professionals achieve their goals through practical advice.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
      social: {
        twitter: 'https://twitter.com/michaeladebayo',
        linkedin: 'https://linkedin.com/in/michaeladebayo',
        github: 'https://github.com/michaeladebayo'
      }
    }
  ];

  const stats = [
    { icon: <FaNewspaper />, value: '500+', label: 'Articles Published' },
    { icon: <FaUsers />, value: '50K+', label: 'Monthly Readers' },
    { icon: <FaEye />, value: '2M+', label: 'Total Views' },
    { icon: <FaEnvelope />, value: '10K+', label: 'Newsletter Subscribers' }
  ];

  const values = [
    {
      title: 'Excellence',
      description: 'We strive for excellence in every piece of content we publish, ensuring accuracy, depth, and value for our readers.'
    },
    {
      title: 'Growth',
      description: 'We believe in continuous learning and helping our readers grow personally and professionally every day.'
    },
    {
      title: 'Integrity',
      description: 'We maintain the highest standards of integrity, being transparent about our sources and honest in our insights.'
    },
    {
      title: 'Community',
      description: 'We foster a community of curious minds who support and learn from each other on their journey to the top.'
    }
  ];

  return (
    <>
      <SEO 
        title="About Us - DailyCrest"
        description="Learn about DailyCrest's mission to provide daily insights on technology, business, and personal growth. Meet our team and discover our values."
        keywords="about DailyCrest, team, mission, values, tech blog Nigeria"
      />

      <div className="about-page">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="container">
            <div className="about-hero-content">
              <h1>Rising to the Top, Together</h1>
              <p className="about-tagline">Your Daily Peak of Knowledge</p>
              <p className="about-description">
                DailyCrest was born from a simple idea: everyone deserves access to insights that can transform their lives. 
                We curate and create content that helps you stay ahead in technology, business, and personal growth.
              </p>
              <div className="hero-stats">
                {stats.map((stat, index) => (
                  <div key={index} className="hero-stat">
                    <span className="stat-icon">{stat.icon}</span>
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mission-section">
          <div className="container">
            <div className="mission-grid">
              <div className="mission-content">
                <h2>Our Mission</h2>
                <p className="mission-statement">
                  To empower individuals with the knowledge and insights they need to reach their full potential, 
                  one day at a time.
                </p>
                <p>
                  In a world of information overload, we cut through the noise to bring you what truly matters. 
                  Whether you're a tech enthusiast, entrepreneur, or lifelong learner, DailyCrest is your trusted 
                  companion on the journey to excellence.
                </p>
                <div className="mission-quote">
                  <FaQuoteLeft className="quote-icon" />
                  <blockquote>
                    The only limit to our realization of tomorrow is our doubts of today.
                  </blockquote>
                  <cite>- Franklin D. Roosevelt</cite>
                </div>
              </div>
              <div className="mission-image">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600" 
                  alt="Team collaborating"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="values-section">
          <div className="container">
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle">The principles that guide everything we do</p>
            
            <div className="values-grid">
              {values.map((value, index) => (
                <div key={index} className="value-card">
                  <div className="value-number">0{index + 1}</div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <div className="container">
            <h2 className="section-title">Meet the Team</h2>
            <p className="section-subtitle">The passionate people behind DailyCrest</p>
            
            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <div key={index} className="team-card">
                  <div className="team-image">
                    <img src={member.image} alt={member.name} />
                  </div>
                  <div className="team-info">
                    <h3>{member.name}</h3>
                    <p className="team-role">{member.role}</p>
                    <p className="team-bio">{member.bio}</p>
                    <div className="team-social">
                      <a href={member.social.twitter} target="_blank" rel="noopener noreferrer">
                        <FaXTwitter />
                      </a>
                      <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer">
                        <FaLinkedin />
                      </a>
                      <a href={member.social.github} target="_blank" rel="noopener noreferrer">
                        <FaGithub />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="story-section">
          <div className="container">
            <div className="story-grid">
              <div className="story-image">
                <img 
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600" 
                  alt="DailyCrest journey"
                />
              </div>
              <div className="story-content">
                <h2>Our Story</h2>
                <p>
                  DailyCrest started in 2026 as a small blog by Bright Momoh, who wanted to share his passion for 
                  technology and personal development with the world. What began as a personal project quickly grew 
                  into a community of thousands of readers from across Nigeria and beyond.
                </p>
                <p>
                  Today, DailyCrest is proud to be one of Nigeria's fastest-growing knowledge platforms, reaching 
                  readers in over 50 countries. We've expanded our team, diversified our content, and built a 
                  newsletter that thousands look forward to every week.
                </p>
                <p>
                  But our mission remains the same: to help you rise to the top, every single day.
                </p>
                <div className="story-highlight">
                  <span className="highlight-label">Proudly</span>
                  <span className="highlight-flag">Nigerian</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Join Section */}
        <section className="join-section">
          <div className="container">
            <div className="join-content">
              <h2>Join Our Journey</h2>
              <p>
                Whether you're a reader, writer, or partner, we'd love to have you on board. 
                Together, we can create something extraordinary.
              </p>
              <div className="join-buttons">
                <Link to="/contact" className="btn-primary">Contact Us</Link>
                <Link to="/write-for-us" className="btn-secondary">Write for Us</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <Newsletter />
      </div>
    </>
  );
};

export default About;