const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authmiddleware');
const chatCtrl = require('../contoller/chatCtrl');


router.get('/', authMiddleware, chatCtrl.userChats);
router.get('/:firstId/:secondId', authMiddleware, chatCtrl.findChat);
router.delete('/:chatId', authMiddleware, chatCtrl.deleteChat);

module.exports = router