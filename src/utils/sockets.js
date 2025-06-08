const socket = require("socket.io");
const { Chat } = require("../models/chat");

const initialiseSocket = (server, allowedOrigins) => {
  const io = socket(server, {
    cors: {
      origin: allowedOrigins,
    },
  });

  io.on("connection", (socket) => {
    // Handle event

    socket.on("joinChat", ({ userId, tagetUserId }) => {
      const roomId = [userId, tagetUserId].sort().join("_");
      socket.join(roomId);
    });
    socket.on(
      "sendMessage",
      async ({ firstName, userId, tagetUserId, text }) => {
        const roomId = [userId, tagetUserId].sort().join("_");

        try {
          let chat = await Chat.findOne({
            participants: { $all: [userId, tagetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, tagetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();
          io.to(roomId).emit("messageReceived", {
            firstName,
            text,
            senderId: userId,
          });
        } catch (error) {
          console.error(error);
        }
      }
    );
    socket.on("disconnect", () => {});
  });
};

module.exports = initialiseSocket;
