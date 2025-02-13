const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(" ")[1];

            //decode token id
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            // console.log("decode detail===>", decode)

            req.user = await User.findById(decode.id).select("-password");
            // console.log("req authData==>",req)
            next();
        } catch (error) {
            res.status(401);
            throw new Error("Not Authorized, no token");
        }
    }

    if (!token) {
        res.status(401);
        throw new Error("Not Authorized, no token");
    }
});

module.exports = { protect };