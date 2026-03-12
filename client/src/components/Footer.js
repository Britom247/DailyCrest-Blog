import React from 'react';
import { FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer style={{ marginTop: '0px' }}>
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>DailyCrest</h3>
            <p>Rise to the top every day with insights that matter. Your daily peak of knowledge for technology, business, and personal growth.</p>
            <div className="social-links">
              <a href="https://x.com/DailyC31055" target="_blank" rel="noopener noreferrer">
                <FaXTwitter />
              </a>
              <a href="https://www.linkedin.com/in/dailycrest-blog-72a6743b6/" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <FaGithub />
              </a>
              <a href="https://www.instagram.com/dailycrest_2026/" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="/about" style={{ color: 'white', opacity: 0.8, textDecoration: 'none' }}>About Us</a></li>
              <li><a href="/contact" style={{ color: 'white', opacity: 0.8, textDecoration: 'none' }}>Contact</a></li>
              <li><a href="/privacy" style={{ color: 'white', opacity: 0.8, textDecoration: 'none' }}>Privacy Policy</a></li>
              <li><a href="/terms" style={{ color: 'white', opacity: 0.8, textDecoration: 'none' }}>Terms of Service</a></li>
              <li><a href="/write-for-us" style={{ color: 'white', opacity: 0.8, textDecoration: 'none' }}>Write for Us</a></li>
              <li><a href="/faq" style={{ color: 'white', opacity: 0.8, textDecoration: 'none' }}>FAQ</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Categories</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="/category/technology" style={{ color: 'white', opacity: 0.8, textDecoration: 'none' }}>Technology</a></li>
              <li><a href="/category/business" style={{ color: 'white', opacity: 0.8, textDecoration: 'none' }}>Business</a></li>
              <li><a href="/category/growth" style={{ color: 'white', opacity: 0.8, textDecoration: 'none' }}>Growth</a></li>
              <li><a href="/category/insights" style={{ color: 'white', opacity: 0.8, textDecoration: 'none' }}>Insights</a></li>
              <li><a href="/category/lifestyle" style={{ color: 'white', opacity: 0.8, textDecoration: 'none' }}>Lifestyle</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} DailyCrest. All rights reserved. 🇳🇬</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;