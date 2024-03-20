const asyncHandler = require('express-async-handler');
const generateToken = require('../config/generteToken');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');


const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pics } = req.body;
    // console.log(req.body)
    if (!name || !email || !password) {
        res.status(400).send();
        throw new Error('Enter all the fields');
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
        res.status(400).send();
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const user = await User.create({ name, email, password: hashedPassword, pic : pics }); // Save hashed password

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Failed to create the user');
    }
});


const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error("Invalid Email or Password");
    }
});


//  /api/user?search=suman
const allUsers = asyncHandler(async (req, res) => {
    const searchQuery = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ],
    } : {};

    const users = await User.find({
        $and: [
            searchQuery,
            { _id: { $ne: req.user._id } }
        ]
    });
    res.status(200).send(users);
})



module.exports = { registerUser, authUser, allUsers }