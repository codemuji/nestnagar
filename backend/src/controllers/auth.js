import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateSeekerProfile } from "../services/ai.service.js";

const sendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res.cookie("token", token, cookieOptions);

  user.passwordHash = undefined;

  res.status(statusCode).json({
    user,
    token,
  });
};

// POST /auth/register
export const register = async (req, res) => {
  try {
    const { name, phone, password, role, seekerProfile } = req.body;
    
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let finalSeekerProfile = undefined;
    if (role === "seeker" && seekerProfile) {
      const aiDerived = await generateSeekerProfile(seekerProfile);
      finalSeekerProfile = {
        ...seekerProfile,
        budget: aiDerived.priceRange, // AI provides min/max range
        listingTypes: aiDerived.listingTypes,
        priorityLocalities: aiDerived.priorityLocalities,
        feedMessage: aiDerived.feedMessage,
        showPartnerOption: aiDerived.showPartnerOption
      };
    }

    const newUser = new User({
      name,
      phone,
      passwordHash,
      role,
      isVerified: true, // Assuming OTP was verified
      seekerProfile: finalSeekerProfile
    });

    await newUser.save();

    sendToken(newUser, 201, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /auth/login
export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /auth/update-me
export const updateMe = async (req, res) => {
  try {
    const { name, profilePhoto, seekerProfile } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (profilePhoto) user.profilePhoto = profilePhoto;
    
    if (seekerProfile && user.role === "seeker") {
      // If we're completing onboarding for the first time or updating preferences, 
      // we might want to re-run AI categorization
      try {
        const aiDerived = await generateSeekerProfile(seekerProfile);
        user.seekerProfile = {
          ...seekerProfile,
          budget: {
            min: aiDerived.priceRange?.min || 0,
            max: aiDerived.priceRange?.max || parseInt(seekerProfile.budget) || 10000
          },
          listingTypes: aiDerived.listingTypes || ["single-room"],
          priorityLocalities: aiDerived.priorityLocalities || [seekerProfile.locality],
          feedMessage: aiDerived.feedMessage || "Welcome to NestNagar!",
          showPartnerOption: aiDerived.showPartnerOption ?? (seekerProfile.aloneOrPartner === "partner")
        };
      } catch (aiError) {
        console.error("AI Categorization failed in updateMe:", aiError);
        // Fallback if AI fails
        user.seekerProfile = {
          ...seekerProfile,
          budget: { min: 0, max: parseInt(seekerProfile.budget) || 10000 },
          listingTypes: ["single-room"],
          priorityLocalities: [seekerProfile.locality],
          feedMessage: "Welcome to NestNagar! Let's find you a great place.",
          showPartnerOption: seekerProfile.aloneOrPartner === "partner"
        };
      }
    }

    await user.save();
    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /auth/update-password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /auth/logout
export const logout = async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    
    // Simple verification (in production, use a more secure token or actual OTP service)
    if (otp !== "123456") {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
