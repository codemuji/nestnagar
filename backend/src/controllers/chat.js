import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Listing from "../models/Listing.js";
import PartnerCard from "../models/PartnerCard.js";
import mongoose from "mongoose";

// POST /conversations
// Starts a conversation or returns existing one
export const startConversation = async (req, res) => {
  try {
    const { contextType, contextId, initialMessage } = req.body;
    
    // 1. Find the recipient (owner of listing/card)
    let recipientId;
    if (contextType === "listing") {
      const listing = await Listing.findById(contextId);
      if (!listing) return res.status(404).json({ message: "Listing not found" });
      recipientId = listing.postedBy;
    } else if (contextType === "partnerCard") {
      const partnerCard = await PartnerCard.findById(contextId);
      if (!partnerCard) return res.status(404).json({ message: "Partner card not found" });
      recipientId = partnerCard.postedBy;
    } else {
      return res.status(400).json({ message: "Invalid context type" });
    }

    if (req.user.id === recipientId.toString()) {
      return res.status(400).json({ message: "You cannot start a conversation with yourself" });
    }

    // 2. Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, recipientId] },
      contextId: contextId
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.id, recipientId],
        contextType,
        contextId
      });
      await conversation.save();
    }

    // 3. Send initial message if provided
    if (initialMessage) {
      const newMessage = new Message({
        conversationId: conversation._id,
        senderId: req.user.id,
        text: initialMessage
      });
      await newMessage.save();

      // Update lastMessage in conversation
      conversation.lastMessage = {
        text: initialMessage,
        senderId: req.user.id,
        timestamp: new Date()
      };
      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /conversations
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate("participants", "name profilePhoto role")
    .sort({ updatedAt: -1 });

    // Manually populate contextId based on contextType
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const convObj = conv.toObject();
        if (conv.contextType === "listing") {
          convObj.contextId = await mongoose.model("Listing").findById(conv.contextId).select("title price locality photos");
        } else if (conv.contextType === "partnerCard") {
          convObj.contextId = await mongoose.model("PartnerCard").findById(conv.contextId).select("preferredLocality budget purpose");
        }
        
        // Count unread messages
        convObj.unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: req.user.id },
          readBy: { $ne: req.user.id }
        });

        return convObj;
      })
    );

    res.status(200).json(populatedConversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /conversations/:id/messages
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.id
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /conversations/:id/read
export const markRead = async (req, res) => {
  try {
    await Message.updateMany(
      { conversationId: req.params.id, senderId: { $ne: req.user.id } },
      { $addToSet: { readBy: req.user.id } }
    );
    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
