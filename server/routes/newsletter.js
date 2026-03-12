const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const { body, validationResult } = require('express-validator');

// Subscribe to newsletter
router.post('/subscribe', [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('name').optional().trim().escape()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, name } = req.body;
    
    console.log('Newsletter subscription attempt:', { email, name }); // Debug log

    // Check if already subscribed
    let subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (subscriber) {
      if (subscriber.status === 'active') {
        return res.status(400).json({ message: 'Email already subscribed' });
      } else {
        // Reactivate unsubscribed user
        subscriber.status = 'active';
        subscriber.name = name || subscriber.name;
        await subscriber.save();
        
        return res.json({ message: 'Subscription reactivated successfully' });
      }
    }

    // Create new subscriber
    subscriber = new Subscriber({ 
      email: email.toLowerCase(), 
      name: name || '',
      status: 'active',
      subscribedAt: new Date()
    });
    
    await subscriber.save();
    console.log('New subscriber saved:', subscriber.email); // Debug log

    // TODO: Send welcome email (optional)

    res.status(201).json({ message: 'Successfully subscribed to newsletter' });
  } catch (err) {
    console.error('Newsletter subscription error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const { email } = req.body;
    
    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    if (subscriber) {
      subscriber.status = 'unsubscribed';
      await subscriber.save();
    }

    res.json({ message: 'Successfully unsubscribed' });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test route to check if newsletter endpoint is working
router.get('/test', (req, res) => {
  res.json({ message: 'Newsletter endpoint is working' });
});

module.exports = router;