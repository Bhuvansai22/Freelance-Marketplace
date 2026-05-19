const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/match-skills', protect, aiController.matchSkills);
router.post('/generate-proposal', protect, aiController.generateProposal);

module.exports = router;
