// const express = require('express');
// const { v4: uuidv4 } = require('uuid');
// const { createSession, getSession } = require('../services/sessionService');
// const logger = require('../utils/logger');
// 
// const router = express.Router();
// 
// // Start a new chat session
// router.post('/start', (req, res) => {
//       try {
//     const sessionId = uuidv4();
//     const userId = req.user.userId;
//     
//     const session = createSession(sessionId, userId);
//     logger.info('New chat session created', { sessionId, userId, agentId: session.agentId });
//     
//     res.status(201).json({
//       sessionId: session.id,
//       agentId: session.agentId,
//       message: 'Chat session started successfully'
//     });
//   } catch (error) {
//     logger.error('Error creating session', { error: error.message, userId: req.user.userId });
//     res.status(500).json({ error: error.message || 'Failed to create chat session' });
//   }
// });
// 
// // Get session details
// router.get('/:sessionId', (req, res) => {
//   try {
//     const session = getSession(req.params.sessionId);
//     
//     if (!session) {
//       return res.status(404).json({ error: 'Session not found' });
//     }
//     
//     // Check if user has access to this session
//     if (session.userId !== req.user.userId && session.agentId !== req.user.userId) {
//       return res.status(403).json({ error: 'Access denied' });
//     }
//     
//     res.json(session);
//   } catch (error) {
//     logger.error('Error retrieving session', { error: error.message, userId: req.user.userId });
//     res.status(500).json({ error: 'Failed to retrieve session' });
//   }
// });
// 
// // End a session
// router.post('/:sessionId/end', (req, res) => {
//   try {
//     const sessionId = req.params.sessionId;
//     const userId = req.user.userId;
//     
//     const session = getSession(sessionId);
//     if (!session) {
//       return res.status(404).json({ error: 'Session not found' });
//     }
//     
//     // Check if user has permission to end this session
//     if (session.userId !== userId && session.agentId !== userId) {
//       return res.status(403).json({ error: 'Access denied' });
//     }
//     
//     const success = endSession(sessionId);
//     if (success) {
//       logger.info('Session ended', { sessionId, userId });
//       res.json({ message: 'Session ended successfully' });
//     } else {
//       res.status(500).json({ error: 'Failed to end session' });
//     }
//   } catch (error) {
//     logger.error('Error ending session', { error: error.message, userId: req.user.userId });
//     res.status(500).json({ error: 'Failed to end session' });
//   }
// });
// 
// // Get active sessions (for agents)
// router.get('/', (req, res) => {
//   try {
//     // In a real app, you would check if the user is an agent
//     const sessions = getActiveSessions();
//     res.json(sessions);
//   } catch (error) {
//     logger.error('Error retrieving active sessions', { error: error.message, userId: req.user.userId });
//     res.status(500).json({ error: 'Failed to retrieve active sessions' });
//   }
// });
// 
// module.exports = router;





const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { createSession, getSession, getSessionsByUser, endSession, getActiveSessions, getAgentSessions } = require('../services/sessionService');
const logger = require('../utils/logger');

const router = express.Router();

// Start a new chat session
router.post('/start', (req, res) => {
  try {
    const sessionId = uuidv4();
    const userId = req.user.userId;
    
    const session = createSession(sessionId, userId);
    logger.info('New chat session created', { sessionId, userId, agentId: session.agentId });
    
    res.status(201).json({
      sessionId: session.id,
      agentId: session.agentId,
      agentName: session.agentName,
      message: 'Chat session started successfully'
    });
  } catch (error) {
    logger.error('Error creating session', { error: error.message, userId: req.user.userId });
    res.status(500).json({ error: error.message || 'Failed to create chat session' });
  }
});

// Get session details
router.get('/:sessionId', (req, res) => {
  try {
    const session = getSession(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user has access to this session
    if (session.userId !== req.user.userId && session.agentId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(session);
  } catch (error) {
    logger.error('Error retrieving session', { error: error.message, userId: req.user.userId });
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

// End a session
router.post('/:sessionId/end', (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.user.userId;
    
    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user has permission to end this session
    if (session.userId !== userId && session.agentId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const success = endSession(sessionId);
    if (success) {
      logger.info('Session ended', { sessionId, userId });
      res.json({ message: 'Session ended successfully' });
    } else {
      res.status(500).json({ error: 'Failed to end session' });
    }
  } catch (error) {
    logger.error('Error ending session', { error: error.message, userId: req.user.userId });
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// Get user's sessions (both as user and as agent)
router.get('/', (req, res) => {
  try {
    const userId = req.user.userId;
    const sessions = getSessionsByUser(userId);
    res.json(sessions);
  } catch (error) {
    logger.error('Error retrieving user sessions', { error: error.message, userId: req.user.userId });
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
});

// Get agent's active sessions
router.get('/agent/:agentId', (req, res) => {
  try {
    const agentId = req.params.agentId;
    
    // Check if the requesting user is the agent
    if (req.user.userId !== agentId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const sessions = getAgentSessions(agentId);
    res.json(sessions);
  } catch (error) {
    logger.error('Error retrieving agent sessions', { error: error.message, userId: req.user.userId });
    res.status(500).json({ error: 'Failed to retrieve agent sessions' });
  }
});

module.exports = router;