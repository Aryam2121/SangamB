const express = require('express');
const router = express.Router();
const {sendMessage,getChatHistory} = require('../controllers/chatController');

// Route to send a new message
router.post('/send', sendMessage);

// Route to get chat history between two users
router.get('/history/:sender/:receiver', getChatHistory);

module.exports = router;
