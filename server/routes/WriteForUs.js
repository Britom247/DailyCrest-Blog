const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const supportEmail = process.env.SUPPORT_EMAIL || 'dailycrestadmin@gmail.com';

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};

const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads/guest-submissions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'submission-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
    }
  }
});

// Write for us submission endpoint
router.post('/', upload.single('article'), [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('topic').notEmpty().withMessage('Topic category is required'),
  body('articleTitle').trim().notEmpty().withMessage('Article title is required'),
  body('articleSummary').trim().isLength({ min: 50 }).withMessage('Summary must be at least 50 characters'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('agreeToTerms').equals('true').withMessage('You must agree to the terms')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, topic, articleTitle, articleSummary, message } = req.body;
    const safeFullName = escapeHtml(fullName);
    const safeEmail = escapeHtml(email);
    const safeTopic = escapeHtml(topic);
    const safeArticleTitle = escapeHtml(articleTitle);
    const safeArticleSummary = escapeHtml(articleSummary);
    const safeMessage = escapeHtml(message);

    const transporter = createTransporter();
    if (!transporter) {
      console.error('Write-for-us email not sent: missing SMTP configuration.');
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({
        message: 'Email service is not configured yet. Please try again later.'
      });
    }

    const emailSubject = `[DailyCrest Write For Us] ${articleTitle}`;
    const textBody = [
      'New Write For Us submission received:',
      '',
      `Full Name: ${fullName}`,
      `Email: ${email}`,
      `Topic: ${topic}`,
      `Article Title: ${articleTitle}`,
      '',
      'Article Summary:',
      articleSummary,
      '',
      'Message to Editor:',
      message,
      '',
      `Attached Draft: ${req.file ? req.file.originalname : 'No attachment'}`
    ].join('\n');

    const htmlBody = `
      <h2>New Write For Us Submission</h2>
      <p><strong>Full Name:</strong> ${safeFullName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Topic:</strong> ${safeTopic}</p>
      <p><strong>Article Title:</strong> ${safeArticleTitle}</p>
      <hr />
      <p><strong>Article Summary:</strong></p>
      <p style="white-space: pre-line;">${safeArticleSummary}</p>
      <hr />
      <p><strong>Message to Editor:</strong></p>
      <p style="white-space: pre-line;">${safeMessage}</p>
      <hr />
      <p><strong>Attached Draft:</strong> ${req.file ? escapeHtml(req.file.originalname) : 'No attachment'}</p>
    `;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: supportEmail,
      replyTo: email,
      subject: emailSubject,
      text: textBody,
      html: htmlBody,
      attachments: req.file ? [{
        filename: req.file.originalname,
        path: req.file.path
      }] : []
    });

    // Cleanup uploaded file after successful email dispatch.
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(200).json({
      message: 'Thank you for your submission! Our editorial team will review your proposal and get back to you within 3-5 business days.'
    });

  } catch (err) {
    console.error('Write for us error:', err);
    
    // Clean up uploaded file if error occurs
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;

