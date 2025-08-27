const logger = require('../utils/logger');

const loggingMiddleware = (req, res, next) => {
  logger.info({
    message: 'Request received',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
  next();
};

module.exports = { loggingMiddleware };