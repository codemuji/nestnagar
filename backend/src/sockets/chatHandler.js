import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

const chatHandler = (io, socket) => {
  const userId = socket.user._id.toString();

  socket.on("join-conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${userId} joined room: ${conversationId}`);
  });

  socket.on("send-message", async ({ conversationId, text, tempId }) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.includes(userId)) return;

      const newMessage = new Message({
        conversationId,
        senderId: userId,
        text,
      });
      await newMessage.save();

      conversation.lastMessage = { text, senderId: userId, timestamp: new Date() };
      await conversation.save();

      const payload = {
        ...newMessage.toObject(),
        tempId,
      };

      // Echo to sender so they can reconcile the optimistic message with the persisted one
      io.to(socket.id).emit("new-message", payload);
      // Broadcast to other participants only
      socket.to(conversationId).emit("new-message", payload);

      // Notify other participants even if they aren't in the specific room
      conversation.participants.forEach((participantId) => {
        if (participantId.toString() !== userId) {
          io.to(participantId.toString()).emit("notification", {
            type: "new-message",
            conversationId,
            text,
          });
        }
      });
    } catch (err) {
      console.error("Socket error in send-message:", err);
    }
  });

  socket.on("typing", ({ conversationId }) => {
    socket.to(conversationId).emit("user-typing", { conversationId, userId });
  });

  socket.on("stop-typing", ({ conversationId }) => {
    socket.to(conversationId).emit("user-stop-typing", { conversationId, userId });
  });

  socket.on("read-conversation", async ({ conversationId }) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.includes(userId)) return;

      await Message.updateMany(
        { conversationId, senderId: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );

      io.to(conversationId).emit("conversation-read", { conversationId, userId });
    } catch (err) {
      console.error("Socket error in read-conversation:", err);
    }
  });
};

export default chatHandler;
