const User = require("../models/userModel");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const asyncHandler = require("express-async-handler");


//@description     Get all Messages
//@route           GET /api/Message/:chatId


//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// const allMessages = asyncHandler(async (req, res) => {
//     try {
//         const messages = await Message.aggregate([
//             { $match: { chat: mongoose.Types.ObjectId(req.params.chatId) } },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "sender",
//                     foreignField: "_id",
//                     as: "sender"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "chats",
//                     localField: "chat",
//                     foreignField: "_id",
//                     as: "chat"
//                 }
//             },
//             { $unwind: "$sender" },
//             { $unwind: "$chat" },
//             {
//                 $project: {
//                     _id: 1,
//                     text: 1,
//                     sender: { name: 1, pic: 1, email: 1 },
//                     chat: 1
//                 }
//             }
//         ]);
        
//         res.json(messages);
//     } catch (error) {
//         res.status(400);
//         throw new Error(error.message);
//     }
// });

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    const newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = { allMessages, sendMessage };
