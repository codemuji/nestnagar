import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import chatHandler from "./chatHandler.js";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // JWT Auth Middleware for Sockets
  io.use(async (socket, next) => {
    try {
      const token = 
        socket.handshake.auth.token || 
        socket.handshake.headers.cookie?.split("token=")[1]?.split(";")[0];
      
      if (!token) return next(new Error("Authentication error"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-passwordHash");
      
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    console.log(`Socket connected: ${userId}`);
    
    // Each user joins their own private room for notifications
    socket.join(userId);

    // Register handlers
    chatHandler(io, socket);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${userId}`);
    });
  });

  return io;
};
