const express = require('express');
const { registerUser, authUser, allUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
// const cloudinary = require('cloudinary').V2;

// cloudinary.config({
//     cloud_name: 'sanvad-app',
//     api_key: '452859733429445',
//     api_secret: 'ytrxAxPRfEg-kazFE7Y1sTkeaSw'
// });

const router = express.Router();

router.get("/" , protect, allUsers);
router.post("/" , registerUser);
router.post("/login", authUser);
// router.route('').post(registerUser).get(protect, allUsers);
// // router.route('/login').post(authUser); // or the same line can also be written be like:    router.post('/login', authUser);

// router.post('/login', authUser);     

module.exports = router;