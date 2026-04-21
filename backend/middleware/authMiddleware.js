const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Dev Bypass: if token is mock
      if (token.startsWith('dev_mock_token:')) {
         const role = token.split(':')[1];
         req.user = {
            _id: '000000000000000000000001', // Valid HEX ID for Mongoose casting
            name: `Dev ${role.toUpperCase()}`,
            email: `${role}@dev.test`,
            role: role,
            departmentId: '69ca66489e472aac94f405cc'
         };
         return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
