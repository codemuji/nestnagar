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

    const listingIds = [];
    const partnerCardIds = [];
    conversations.forEach(c => {
      if (c.contextType === "listing") {
        listingIds.push(c.contextId);
      } else if (c.contextType === "partnerCard") {
        partnerCardIds.push(c.contextId);
      }
    });

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const [listings, partnerCards, unreadCounts] = await Promise.all([
      mongoose.model("Listing").find({ _id: { $in: listingIds } }).select("title price locality photos"),
      mongoose.model("PartnerCard").find({ _id: { $in: partnerCardIds } }).select("preferredLocality budget purpose"),
      Message.aggregate([
        { 
          $match: { 
            conversationId: { $in: conversations.map(c => c._id) }, 
            senderId: { $ne: userId }, 
            readBy: { $ne: userId } 
          } 
        },
        { $group: { _id: "$conversationId", count: { $sum: 1 } } }
      ])
    ]);

    const listingMap = new Map(listings.map(l => [l._id.toString(), l]));
    const partnerMap = new Map(partnerCards.map(p => [p._id.toString(), p]));
    const countMap = new Map(unreadCounts.map(u => [u._id.toString(), u.count]));

    const populatedConversations = conversations.map(conv => {
      const convObj = conv.toObject();
      convObj.contextId = conv.contextType === "listing"
        ? listingMap.get(conv.contextId.toString()) || null
        : partnerMap.get(conv.contextId.toString()) || null;
      convObj.unreadCount = countMap.get(conv._id.toString()) || 0;
      return convObj;
    });

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
