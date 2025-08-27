const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
       stack: err.stack 
    }
  });
};

module.exports = { errorHandler };