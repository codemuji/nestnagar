import express from "express";
import { body } from "express-validator";
import { 
  register, 
  login, 
  getMe,
  updateMe,
  updatePassword,
  logout
} from "../controllers/auth.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

const registerRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("phone")
    .trim()
    .isMobilePhone("any")
    .withMessage("Please enter a valid phone number"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .isIn(["seeker", "broker", "owner"])
    .withMessage("Role must be seeker, broker, or owner")
];

const loginRules = [
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
];

// Public routes
router.post("/register", authLimiter, validate(registerRules), register);
router.post("/login", authLimiter, validate(loginRules), login);
router.post("/logout", logout);

// Protected routes
router.use(protect);
router.get("/me", getMe);
router.put("/update-me", updateMe);
router.put("/update-password", updatePassword);

export default router;
