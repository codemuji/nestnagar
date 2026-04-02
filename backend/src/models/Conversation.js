import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  contextType: { type: String, enum: ["listing", "partnerCard"], required: true },
  contextId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Refers to Listing or PartnerCard
  lastMessage: {
    text: { type: String },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date },
  },
}, { timestamps: true });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
