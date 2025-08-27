const express = require('express');
const { getMessages } = require('../services/messageService');
const logger = require('../utils/logger');

const router = express.Router();

// Get messages for a session
router.get('/:sessionId', (req, res) => {
 try {
    const sessionId = req.params.sessionId;
    const messages = getMessages(sessionId);
    
    res.json(messages);
  } catch (error) {
    logger.error('Error retrieving messages', { error: error.message, userId: req.user.userId });
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

module.exports = router;