import express from "express";
import { 
  createPartnerCard, 
  getPartnerCards, 
  getPartnerCardById, 
  updatePartnerCard, 
  deletePartnerCard 
} from "../controllers/partner.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getPartnerCards);
router.get("/:id", getPartnerCardById);

// Protected routes
router.use(protect);
router.post("/", createPartnerCard);
router.patch("/:id", updatePartnerCard);
router.delete("/:id", deletePartnerCard);

export default router;
