import React, { useState } from 'react';
import api from '../services/api';
import { FaEnvelope, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import { trackNewsletterSignup } from '../utils/analytics';
import './Newsletter.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error, duplicate
  const [message, setMessage] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setMessage('');
    
    // Validate email format
    if (!validateEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }
    
    setStatus('loading');
    
    try {
      const response = await api.post('/newsletter/subscribe', { 
        email: email.trim(), 
        name: name.trim() 
      });
      
      setStatus('success');
      setMessage(response.data.message || 'Thanks for subscribing! Check your email for confirmation.');
      trackNewsletterSignup(email);
      setEmail('');
      setName('');
    } catch (error) {
      console.error('Newsletter error:', error.response || error);
      
      // Handle specific error messages
      if (error.response?.status === 400) {
        if (error.response.data.message === 'Email already subscribed') {
          setStatus('duplicate');
          setMessage('This email is already subscribed to our newsletter!');
        } else if (error.response.data.errors) {
          // Validation errors
          const validationError = error.response.data.errors[0];
          setStatus('error');
          setMessage(validationError.msg || 'Please check your input and try again.');
        } else {
          setStatus('error');
          setMessage(error.response.data.message || 'Invalid request. Please try again.');
        }
      } else if (error.response?.status === 500) {
        setStatus('error');
        setMessage('Server error. Please try again later.');
      } else {
        setStatus('error');
        setMessage('Network error. Please check your connection.');
      }
    }
  };

  const getButtonContent = () => {
    switch(status) {
      case 'loading':
        return 'Subscribing...';
      case 'success':
        return <><FaCheck /> Subscribed!</>;
      case 'duplicate':
        return <><FaEnvelope /> Already Subscribed</>;
      default:
        return <><FaEnvelope /> Subscribe</>;
    }
  };

  const isDisabled = status === 'loading' || status === 'success';

  return (
    <div className="newsletter-section m-0">
      <div className="container">
        <div className="newsletter-content">
          <h2>Stay Updated with DailyCrest</h2>
          <p>Subscribe to our newsletter for exclusive insights, new articles, and special content delivered straight to your inbox!</p>
          
          <form onSubmit={handleSubmit} className="newsletter-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isDisabled}
                className={status === 'error' ? 'error' : ''}
              />
            </div>
            
            <div className="form-group">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isDisabled}
                className={status === 'error' ? 'error' : ''}
              />
            </div>
            
            <button 
              type="submit" 
              className={`btn-primary ${status === 'success' ? 'success' : ''} ${status === 'duplicate' ? 'duplicate' : ''}`}
              disabled={isDisabled}
            >
              {getButtonContent()}
            </button>
          </form>
          
          {message && (
            <div className={`newsletter-message ${status}`}>
              {status === 'error' || status === 'duplicate' ? <FaExclamationCircle /> : <FaCheck />}
              {message}
            </div>
          )}
          
          <p className="privacy-note">
            We'll never share your email. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;