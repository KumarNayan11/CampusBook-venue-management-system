const logger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, Green for success
    const reset = '\x1b[0m';
    console.log(`${color}${req.method}${reset} ${req.originalUrl} ${color}${res.statusCode}${reset} - ${duration}ms`);
  });
  next();
};

module.exports = logger;
