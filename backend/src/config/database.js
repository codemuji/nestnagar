import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    console.log("Attempting MongoDB connection...");
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.error("Full error:", err);
    console.log("\n--- Troubleshooting ---");
    console.log("1. Check if cluster exists in MongoDB Atlas");
    console.log("2. Verify cluster is not paused (free tier pauses after 60 days)");
    console.log("3. Try using direct connection string instead of SRV");
    console.log("4. Check network/firewall allows outbound MongoDB connections");
    process.exit(1);
  }
};

export default connectDB;
