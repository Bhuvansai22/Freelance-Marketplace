const express = require('express');
const router = express.Router();
const aiAssessmentController = require('../controllers/aiAssessmentController');
const { protect } = require('../middleware/authMiddleware');

// Dynamic dynamic assessment lifecycle endpoints
router.post('/generate', protect, aiAssessmentController.generateAssessment);
router.post('/submit', protect, aiAssessmentController.submitAssessment);
router.get('/active', protect, aiAssessmentController.getActiveAssessment);
router.get('/history', protect, aiAssessmentController.getHistory);

module.exports = router;
