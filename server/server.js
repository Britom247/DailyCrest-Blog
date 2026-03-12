const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ["https://dailycrest.click", "https://www.dailycrest.click"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth').router);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/write-for-us', require('./routes/WriteForUs'));

// Health check
app.get('/', (req, res) => {
  res.send('DailyCrest API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
