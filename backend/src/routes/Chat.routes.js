import express from "express";
import { 
  startConversation, 
  getConversations, 
  getMessages, 
  markRead 
} from "../controllers/chat.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", startConversation);
router.get("/", getConversations);
router.get("/:id/messages", getMessages);
router.patch("/:id/read", markRead);

export default router;
