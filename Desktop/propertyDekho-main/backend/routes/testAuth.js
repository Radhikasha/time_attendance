const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/testAuth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
const protect = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

module.exports = router;
