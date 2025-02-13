const express = require('express');
const { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup } = require('../controllers/chatControler');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/' ,protect, accessChat );
router.get('/' , protect, fetchChats);
router.route('/group').post(protect, createGroupChat);
router.route('/rename').put(protect, renameGroup);
router.route('/groupadd').put(protect, addToGroup);
router.route('/groupremove').put(protect, removeFromGroup);

module.exports = router;