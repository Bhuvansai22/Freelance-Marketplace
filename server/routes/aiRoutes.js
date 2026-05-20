const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer memory storage for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF format resumes are supported'), false);
    }
  }
});

router.post('/match-skills', protect, aiController.matchSkills);
router.post('/generate-proposal', protect, aiController.generateProposal);
router.post('/chatbot', protect, aiController.chatbotResponse);

// Resume Analyzer Routes
router.post('/analyze-resume', protect, upload.single('resume'), aiController.analyzeResume);
router.get('/resume-analysis', protect, aiController.getResumeAnalysis);

module.exports = router;
