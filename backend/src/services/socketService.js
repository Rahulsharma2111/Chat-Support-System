// 
// const jwt = require('jsonwebtoken');
// const { addMessage } = require('./messageService');
// const { getSession, endSession } = require('./sessionService');
// const logger = require('../utils/logger');
// 
// function authenticateSocket(socket, next) {
//   try {
//     const token = socket.handshake.auth.token;
//     
//     if (!token) {
//       return next(new Error('Authentication error: No token provided'));
//     }
//     
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     socket.userId = decoded.userId;
//     next();
//   } catch (error) {
//     next(new Error('Authentication error: Invalid token'));
//   }
// }
// 
// function setupSocket(io) {
//   // Use authentication middleware
//   io.use(authenticateSocket);
//   
//   io.on('connection', (socket) => {
//     logger.info('User connected', { socketId: socket.id, userId: socket.userId });
//     
//     // Join a session room
//     socket.on('join_session', (data) => {
//       const { sessionId } = data;
//       const session = getSession(sessionId);
//       
//       if (session && (session.userId === socket.userId || session.agentId === socket.userId)) {
//         socket.join(sessionId);
//         logger.info('User joined session', { sessionId, userId: socket.userId, socketId: socket.id });
//         
//         // Notify others in the room
//         socket.to(sessionId).emit('user_joined', { userId: socket.userId });
//       } else {
//         socket.emit('error', { message: 'Cannot join session' });
//         logger.warn('Failed to join session', { sessionId, userId: socket.userId });
//       }
//     });
//     
//     // Handle new messages
//     socket.on('send_message', (data) => {
//       const { sessionId, content } = data;
//       const session = getSession(sessionId);
//       
//       if (session && (session.userId === socket.userId || session.agentId === socket.userId)) {
//         const message = addMessage(sessionId, socket.userId, content);
//         
//         // Broadcast to everyone in the session room including sender
//         io.to(sessionId).emit('new_message', message);
//         logger.info('Message sent', { sessionId, userId: socket.userId, messageId: message.id });
//       } else {
//         socket.emit('error', { message: 'Cannot send message to this session' });
//         logger.warn('Failed to send message', { sessionId, userId: socket.userId });
//       }
//     });
//     
//     // End a session
//     socket.on('end_session', (data) => {
//       const { sessionId } = data;
//       const session = getSession(sessionId);
//       
//       if (session && (session.userId === socket.userId || session.agentId === socket.userId)) {
//         if (endSession(sessionId)) {
//           io.to(sessionId).emit('session_ended', { sessionId });
//           logger.info('Session ended', { sessionId, userId: socket.userId });
//         }
//       } else {
//         socket.emit('error', { message: 'Cannot end session' });
//         logger.warn('Failed to end session', { sessionId, userId: socket.userId });
//       }
//     });
//     
//     socket.on('disconnect', (reason) => {
//       logger.info('User disconnected', { socketId: socket.id, userId: socket.userId, reason });
//     });
//     
//     socket.on('error', (error) => {
//       logger.error('Socket error', { socketId: socket.id, userId: socket.userId, error });
//     });
//   });
// }
// 
// module.exports = { setupSocket };



const jwt = require('jsonwebtoken');
const { addMessage } = require('./messageService');
const { getSession, endSession, getAgentSessions } = require('./sessionService');
const logger = require('../utils/logger');

function authenticateSocket(socket, next) {
  try {
    // Try to get token from auth first, then from query
    let token = socket.handshake.auth.token;
    if (!token) {
      token = socket.handshake.query.token;
    }
    
    if (!token) {
      logger.warn('Socket authentication failed: No token provided', { socketId: socket.id });
      return next(new Error('Authentication error: No token provided'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    logger.info('Socket authenticated', { socketId: socket.id, userId: socket.userId });
    next();
  } catch (error) {
    logger.error('Socket authentication failed: Invalid token', { 
      error: error.message,
      socketId: socket.id
    });
    next(new Error('Authentication error: Invalid token'));
  }
}

function setupSocket(io) {
  // Use authentication middleware
  io.use(authenticateSocket);
  
  io.on('connection', (socket) => {
    logger.info('User connected', { socketId: socket.id, userId: socket.userId });
    
    // Join user's personal room for notifications
    socket.join(`user_${socket.userId}`);
    
    // Check if user is an agent and join agent room
    const isAgent = socket.userId.startsWith('agent');
    if (isAgent) {
      socket.join('agents_room');
      logger.info('Agent joined agents room', { socketId: socket.id, userId: socket.userId });
      
      // Notify agent of their active sessions
      const agentSessions = getAgentSessions(socket.userId);
      socket.emit('agent_sessions', agentSessions);
    }
    
    // Join a session room
    socket.on('join_session', (data) => {
      const { sessionId } = data;
      const session = getSession(sessionId);
      
      if (session && (session.userId === socket.userId || session.agentId === socket.userId)) {
        socket.join(sessionId);
        logger.info('User joined session', { sessionId, userId: socket.userId, socketId: socket.id });
        
        // Notify others in the room
        socket.to(sessionId).emit('user_joined', { 
          userId: socket.userId, 
          isAgent: socket.userId === session.agentId 
        });
        
        // If agent joined, notify the user
        if (socket.userId === session.agentId) {
          io.to(sessionId).emit('agent_joined', { 
            agentId: socket.userId,
            agentName: session.agentName 
          });
        }
      } else {
        const errorMsg = 'Cannot join session';
        socket.emit('error', { message: errorMsg });
        logger.warn('Failed to join session', { sessionId, userId: socket.userId, socketId: socket.id });
      }
    });
    
    // Handle new messages
    socket.on('send_message', (data) => {
      const { sessionId, content } = data;
      const session = getSession(sessionId);
      
      if (session && (session.userId === socket.userId || session.agentId === socket.userId)) {
        const message = addMessage(sessionId, socket.userId, content);
        
        // Broadcast to everyone in the session room including sender
        io.to(sessionId).emit('new_message', message);
        logger.info('Message sent', { sessionId, userId: socket.userId, messageId: message.id });
      } else {
        const errorMsg = 'Cannot send message to this session';
        socket.emit('error', { message: errorMsg });
        logger.warn('Failed to send message', { sessionId, userId: socket.userId, socketId: socket.id });
      }
    });
    
    // End a session
    socket.on('end_session', (data) => {
      const { sessionId } = data;
      const session = getSession(sessionId);
      
      if (session && (session.userId === socket.userId || session.agentId === socket.userId)) {
        if (endSession(sessionId)) {
          io.to(sessionId).emit('session_ended', { sessionId });
          logger.info('Session ended', { sessionId, userId: socket.userId });
        }
      } else {
        const errorMsg = 'Cannot end session';
        socket.emit('error', { message: errorMsg });
        logger.warn('Failed to end session', { sessionId, userId: socket.userId, socketId: socket.id });
      }
    });
    
    // Request agent sessions
    socket.on('get_agent_sessions', () => {
      if (socket.userId.startsWith('agent')) {
        const agentSessions = getAgentSessions(socket.userId);
        socket.emit('agent_sessions', agentSessions);
      }
    });
    
    socket.on('disconnect', (reason) => {
      logger.info('User disconnected', { socketId: socket.id, userId: socket.userId, reason });
    });
    
    socket.on('error', (error) => {
      logger.error('Socket error', { socketId: socket.id, userId: socket.userId, error: error.message });
    });
  });
}

module.exports = { setupSocket };