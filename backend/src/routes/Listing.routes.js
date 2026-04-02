import express from "express";
import { 
  createListing, 
  getListings, 
  getListingById, 
  updateListing, 
  deleteListing,
  getPersonalisedListings,
  getMyListings
} from "../controllers/listing.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getListings);
router.get("/personalised", protect, authorize("seeker"), getPersonalisedListings);
router.get("/my", protect, authorize("broker", "owner"), getMyListings);
router.get("/:id", getListingById);

// Protected routes
router.use(protect);

// Only brokers and owners can create/update/delete listings
router.post(
  "/", 
  authorize("broker", "owner"), 
  upload.array("photos", 8), 
  createListing
);

router.patch(
  "/:id", 
  authorize("broker", "owner"), 
  upload.array("photos", 8), 
  updateListing
);

router.delete(
  "/:id", 
  authorize("broker", "owner"), 
  deleteListing
);

export default router;
