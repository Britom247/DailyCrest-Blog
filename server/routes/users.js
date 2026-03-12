const express = require('express');
const router = express.Router();

// Placeholder users routes
// TODO: implement real user controllers (CRUD, profile, etc.)
router.get('/', (req, res) => {
  res.json({ message: 'Users route placeholder' });
});

module.exports = router;
