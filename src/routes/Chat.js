const express = require("express");
const { userAuthorized } = require("../middlewares/auth");
const { findOne } = require("../models/connectionRequest");
const { Chat } = require("../models/chat");
const ConnecionRequest = require("../models/connectionRequest");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuthorized, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    const isConnected = await ConnecionRequest.findOne({
      $or: [
        {
          toUserId: userId,
          fromUserId: targetUserId,
          status: "accepted",
        },
        {
          toUserId: targetUserId,
          fromUserId: userId,
          status: "accepted",
        },
      ],
    });

    if (!isConnected) {
      res.status(400).json({ message: "User is not connected" });
    }

    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate("messages.senderId", "firstName lastName");

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        message: [],
      });
    }

    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error(error);
  }
});

module.exports = chatRouter;
