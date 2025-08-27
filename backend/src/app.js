const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const { loggingMiddleware } = require('./middleware/loggingMiddleware');
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/authMiddleware');
const sessionRoutes = require('./routes/sessionRoutes');
const messageRoutes = require('./routes/messageRoutes');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(loggingMiddleware);

// Routes
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/session', authMiddleware, sessionRoutes);
app.use('/messages', authMiddleware, messageRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;