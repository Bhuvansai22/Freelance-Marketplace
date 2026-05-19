const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('client', 'admin'));

router.post('/order', createOrder);
router.post('/verify', verifyPayment);

module.exports = router;
