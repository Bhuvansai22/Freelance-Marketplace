const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory, getChatContacts } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', sendMessage);
router.get('/contacts/list', getChatContacts);
router.get('/:otherUserId', getChatHistory);

module.exports = router;
