import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  posterRole: { type: String, enum: ["broker", "owner"], required: true },
  type: { type: String, enum: ["pg", "single-room", "flat"], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  deposit: { type: Number, required: true },
  locality: { type: String, required: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  amenities: [{ type: String }],
  genderAllowed: { type: String, enum: ["any", "male", "female"], required: true },
  photos: [{ type: String }], // Cloudinary URLs
  status: { type: String, enum: ["available", "filled", "paused"], default: "available" },
  views: { type: Number, default: 0 },
}, { timestamps: true });

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;
