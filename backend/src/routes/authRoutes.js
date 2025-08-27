const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const logger = require('../utils/logger');

// Generate a JWT token for testing
router.post('/token', (req, res) => {
   
   try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
    logger.info('Token generated', { userId });
    
    res.json({ token, userId });
  } catch (error) {
    logger.error('Error generating token', { error: error.message });
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

module.exports = router;