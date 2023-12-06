const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authmiddleware');
const messageCtrl = require('../contoller/messageCtrl');


router.post('/', authMiddleware, messageCtrl.addMessage);
router.get('/:chatId', authMiddleware, messageCtrl.getMessage);
router.put('/:messageId', authMiddleware, messageCtrl.updateMessage);
router.delete('/:messageId', authMiddleware, messageCtrl.deleteMessage);

module.exports = router