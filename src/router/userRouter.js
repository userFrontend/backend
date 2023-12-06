const express = require('express');
const router = express.Router();
const userCtrl = require('../contoller/userCtrl');
const authMiddleware = require('../middleware/authmiddleware');


router.get('/', userCtrl.getAllUsers);
router.get('/:id', userCtrl.getUser);
router.put('/:id', authMiddleware, userCtrl.updateUser);
router.delete('/:id', authMiddleware, userCtrl.deleteUser);

module.exports = router