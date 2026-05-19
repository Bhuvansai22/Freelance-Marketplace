const express = require('express');
const router = express.Router();
const { getQuestions, submitAssessment } = require('../controllers/assessmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('freelancer', 'admin'));

router.get('/:topic', getQuestions);
router.post('/:topic/submit', submitAssessment);

module.exports = router;
