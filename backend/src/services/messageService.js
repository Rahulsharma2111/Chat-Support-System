// const logger = require('../utils/logger');
// 
// const messages = new Map();
// 
// function addMessage(sessionId, senderId, content) {
//   const message = {
//     id: Date.now().toString(),
//     sessionId,
//     senderId,
//     content,
//     timestamp: new Date().toISOString()
//   };
//   
//   if (!messages.has(sessionId)) {
//     messages.set(sessionId, []);
//   }
//   
//   messages.get(sessionId).push(message);
//   logger.info('Message added', { sessionId, senderId });
//   
//   return message;
// }
// 
// function getMessages(sessionId) {
//   return messages.get(sessionId) || [];
// }
// 
// module.exports = {
//   addMessage,
//   getMessages
// };


const logger = require('../utils/logger');

// In-memory storage for demo purposes
const messages = new Map();

function addMessage(sessionId, senderId, content) {
  const message = {
    id: Date.now().toString(),
    sessionId,
    senderId,
    content,
    timestamp: new Date().toISOString()
  };
  
  if (!messages.has(sessionId)) {
    messages.set(sessionId, []);
  }
  
  messages.get(sessionId).push(message);
  logger.info('Message added', { sessionId, senderId, messageId: message.id });
  
  return message;
}

function getMessages(sessionId) {
  return messages.get(sessionId) || [];
}

module.exports = {
  addMessage,
  getMessages,
  messages
};