import mongoose from "mongoose";

const partnerCardSchema = new mongoose.Schema({
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  purpose: { type: String, enum: ["student", "working"], required: true },
  budget: { type: Number, required: true },
  preferredLocality: { type: String, required: true },
  moveInDate: { type: Date, required: true },
  genderPreference: { type: String, enum: ["any", "male", "female"], required: true },
  habits: [{ type: String }],
  bio: { type: String, required: true },
  status: { type: String, enum: ["active", "matched", "closed"], default: "active" },
}, { timestamps: true });

const PartnerCard = mongoose.model("PartnerCard", partnerCardSchema);
export default PartnerCard;
