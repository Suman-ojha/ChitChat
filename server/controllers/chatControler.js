const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    // console.log(userId, "user")

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    const isChat = await Chat.aggregate([
        {
            $match: {
                isGroupChat: false,
                $and: [
                    { users: { $elemMatch: { $eq: req.user._id } } },
                    { users: { $elemMatch: { $eq: userId } } },
                ],
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "users",
                foreignField: "_id",
                as: "usersData"
            }
        },
        {
            $lookup: {
                from: "messages",
                localField: "latestMessage",
                foreignField: "_id",
                as: "latestMessageData"
            }
        },
        {
            $unwind: "$latestMessageData"
        },
        {
            $lookup: {
                from: "users",
                localField: "latestMessageData.sender",
                foreignField: "_id",
                as: "latestMessageData.senderData"
            }
        },
        {
            $group: {
                _id: "$_id",
                usersData: { $first: "$usersData" },
                latestMessageData: { $push: "$latestMessageData" }
            }
        }
    ]);

    console.log(isChat,"<<<--chat")

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        const chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).json(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
});



//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
    console.log(req.user)
    try {
        const results = await Chat.aggregate([
            {
                $match: {
                    users: { $elemMatch: { $eq: req.user._id } }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "users",
                    foreignField: "_id",
                    as: "usersData"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "groupAdmin",
                    foreignField: "_id",
                    as: "groupAdminData"
                }
            },
            {
                $lookup: {
                    from: "messages",
                    localField: "latestMessage",
                    foreignField: "_id",
                    as: "latestMessageData"
                }
            },
            {
                $unwind: "$latestMessageData"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "latestMessageData.sender",
                    foreignField: "_id",
                    as: "latestMessageData.senderData"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    usersData: { $first: "$usersData" },
                    groupAdminData: { $first: "$groupAdminData" },
                    latestMessageData: { $push: "$latestMessageData" }
                }
            },
            {
                $sort: { updatedAt: -1 }
            }
        ]);

        res.status(200).send(results);
    } catch (error) {
        console.log(error?.message)
        return res.status(200).send({
            status :"error",
            message : error?.message ?? 'something went wrong!!'
        })
        // res.status(400);
        // throw new Error(error.message);
    }
});



//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the feilds" });
    }

    const users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res
            .status(400)
            .send("More than 2 users are required to form a group chat");
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});



// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName: chatName,
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        res.status(404).send();
        throw new Error("Chat Not Found");
    } else {
        return res.status(201).json(updatedChat);
    }
});


// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    // check if the requester is admin

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!added) {
        res.status(404).send();
        throw new Error("Chat Not Found");
    } else {
        return res.status(201).json(added);
    }
});



// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    // check if the requester is admin

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!removed) {
        res.status(404),send();
        throw new Error("Chat Not Found");
    } else {
        return res.status(201).json(removed);
    }
});

module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup }