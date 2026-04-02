import express from "express";
import { 
  register, 
  login, 
  getMe,
  updateMe,
  updatePassword,
  logout
} from "../controllers/auth.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.use(protect);
router.get("/me", getMe);
router.put("/update-me", updateMe);
router.put("/update-password", updatePassword);
router.post("/logout", logout);

export default router;
