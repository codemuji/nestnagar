import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import connectDB from "./config/database.js";
import configureCloudinary from "./config/cloudinary.js";
import { initSocket } from "./sockets/index.js";

import authRoutes from "./routes/Auth.routes.js";
import listingRoutes from "./routes/Listing.routes.js";
import chatRoutes from "./routes/Chat.routes.js";

dotenv.config();

// Configs
connectDB();
configureCloudinary();

const app = express();
const httpServer = createServer(app);

// Socket.io initialization
initSocket(httpServer);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/listings", listingRoutes);
app.use("/api/v1/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("NestNagar API is running...");
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
