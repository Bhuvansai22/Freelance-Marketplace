const express = require('express');
const router = express.Router();
const {
  placeBid,
  getProjectBids,
  getMyBids,
  acceptBid,
  rejectBid,
} = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('freelancer', 'admin'), placeBid);
router.get('/mybids', protect, authorize('freelancer', 'admin'), getMyBids);
router.get('/project/:projectId', protect, getProjectBids);
router.put('/:id/accept', protect, authorize('client', 'admin'), acceptBid);
router.put('/:id/reject', protect, authorize('client', 'admin'), rejectBid);

module.exports = router;
