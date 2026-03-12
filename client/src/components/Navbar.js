import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaLock } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showSecretMessage, setShowSecretMessage] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Reset click count when navigating away
  useEffect(() => {
    setClickCount(0);
    setProgress(0);
    setShowSecretMessage(false);
  }, [location.pathname]);

  // track scroll position to apply sticky/shrink styles
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    // Calculate progress percentage (5 clicks = 100%)
    const newProgress = (newCount / 5) * 100;
    setProgress(newProgress);
    
    // Show secret message
    setShowSecretMessage(true);
    
    // If reached 5 clicks, navigate to admin login
    if (newCount >= 5) {
      navigate('/admin/login');
      setClickCount(0);
      setProgress(0);
      setShowSecretMessage(false);
    }
    
    // Reset after 3 seconds if not completed
    setTimeout(() => {
      setShowSecretMessage(false);
      setClickCount(0);
      setProgress(0);
    }, 3000);
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/category/Technology', label: 'Technology' },
    { path: '/category/Business', label: 'Business' },
    { path: '/category/Growth', label: 'Growth' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}>
      <div className="container">
        <div className="logo-container">
          <Link 
            to="/" 
            className="logo" 
            onClick={handleLogoClick}
            onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
          >
            DailyCrest
            <span className="logo-peak">▲</span>
          </Link>
          
          {/* Secret click indicator */}
          {showSecretMessage && (
            <div className="secret-click-indicator">
              <div className="secret-message">
                <FaLock className="lock-icon" />
                <span>Admin access: {5 - clickCount} more {5 - clickCount === 1 ? 'click' : 'clicks'}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              onClick={closeMenu}
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;