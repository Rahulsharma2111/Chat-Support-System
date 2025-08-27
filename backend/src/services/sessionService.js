const logger = require('../utils/logger');

// In-memory storage for demo purposes
const sessions = new Map();
const agents = [
  { id: 'agent1', name: 'Agent John', activeSessions: 0, isAvailable: true },
  { id: 'agent2', name: 'Agent Sarah', activeSessions: 0, isAvailable: true },
  { id: 'agent3', name: 'Agent Mike', activeSessions: 0, isAvailable: true }
];

// Assign an agent with the least active sessions
function assignAgent() {
  let minSessions = Infinity;
  let selectedAgent = null;

  for (const agent of agents) {
    if (agent.isAvailable && agent.activeSessions < minSessions && agent.activeSessions < 2) {
      minSessions = agent.activeSessions;
      selectedAgent = agent;
    }
  }

  if (selectedAgent) {
    selectedAgent.activeSessions++;
    return selectedAgent;
  }

  return null; // No available agents
}

function createSession(sessionId, userId) {
  const agent = assignAgent();

  if (!agent) {
    throw new Error('No agents available');
  }

  const session = {
    id: sessionId,
    userId,
    agentId: agent.id,
    agentName: agent.name,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  sessions.set(sessionId, session);
  logger.info('Session created', { sessionId, userId, agentId: agent.id });
  return session;
}

function getSession(sessionId) {
  return sessions.get(sessionId);
}

function getSessionsByUser(userId) {
  const userSessions = [];
  for (const [sessionId, session] of sessions) {
    if (session.userId === userId || session.agentId === userId) {
      userSessions.push(session);
    }
  }
  return userSessions;
}

function endSession(sessionId) {
  const session = sessions.get(sessionId);
  if (session) {
    session.status = 'ended';
    session.updatedAt = new Date().toISOString();

    // Decrement agent's active session count
    const agent = agents.find(a => a.id === session.agentId);
    if (agent && agent.activeSessions > 0) {
      agent.activeSessions--;
    }

    sessions.set(sessionId, session);
    logger.info('Session ended', { sessionId });
    return true;
  }
  return false;
}

function getActiveSessions() {
  const activeSessions = [];
  for (const [sessionId, session] of sessions) {
    if (session.status === 'active') {
      activeSessions.push(session);
    }
  }
  return activeSessions;
}

function getAgentSessions(agentId) {
  const agentSessions = [];
  for (const [sessionId, session] of sessions) {
    if (session.agentId === agentId && session.status === 'active') {
      agentSessions.push(session);
    }
  }
  return agentSessions;
}

module.exports = {
  createSession,
  getSession,
  getSessionsByUser,
  endSession,
  getActiveSessions,
  getAgentSessions,
  sessions,
  agents
};