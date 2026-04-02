import mongoose from "mongoose";

const seekerProfileSchema = new mongoose.Schema({
  purpose: { type: String, enum: ["student", "working"], default: "student" },
  budget: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
  },
  locality: { type: String, default: "" },
  moveInDate: { type: Date },
  aloneOrPartner: { type: String, enum: ["alone", "partner"], default: "alone" },
  genderPreference: { type: String, enum: ["any", "male", "female"], default: "any" },
  // AI Derived fields
  listingTypes: [{ type: String }],
  priorityLocalities: [{ type: String }],
  feedMessage: { type: String, default: "" },
  showPartnerOption: { type: Boolean, default: false },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["seeker", "broker", "owner"], default: "seeker" },
  isVerified: { type: Boolean, default: false },
  identityDoc: { type: String, default: "" }, // Cloudinary URL
  brokerApproved: { type: Boolean, default: false },
  profilePhoto: { type: String, default: "" }, // Cloudinary URL
  seekerProfile: { type: seekerProfileSchema, required: false },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
