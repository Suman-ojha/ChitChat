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
        res.status(201).send({
            status :"success",
            message :"User Registered Successfully.!",
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
        return res.status(200).send({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: generateToken(user._id),
        });
    } else {
        return res.status(200).send({
            status :"error",
            message : "Invalid Email or Password"
        });
        
    }
});


//  /api/user?search=suman
const allUsers = asyncHandler(async (req, res) => {
    try {
        // console.log('in all');
        const searchQuery = buildSearchQuery(req.query.search, req.user._id);
        
        if (!req.query.search) {
            // If no search term is provided, return an empty array
            return res.status(200).send([]);
        }
        const users = await findUsers(searchQuery);
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Function to build the search query
const buildSearchQuery = (searchTerm, userId) => {
    if (!searchTerm) {
        return { _id: { $ne: userId }, name: { $exists: true, $ne: null } };
    }

    return {
        $or: [
            { name: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
        ],
    };
};


// Function to find users based on the search query
const findUsers = async (searchQuery) => {
    return await User.find(searchQuery);
};




module.exports = { registerUser, authUser, allUsers }