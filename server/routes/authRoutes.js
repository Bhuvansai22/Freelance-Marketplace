const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  getFreelancers,
  updateProfile,
  getUserById,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/freelancers', protect, getFreelancers);
router.put('/profile', protect, updateProfile);
router.get('/users/:id', protect, getUserById);

module.exports = router;
