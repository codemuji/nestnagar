import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

// POST /listings
export const createListing = async (req, res) => {
  try {
    const { 
      type, title, description, price, deposit, 
      locality, coordinates, amenities, genderAllowed 
    } = req.body;

    const photos = [];
    if (req.files) {
      for (const file of req.files) {
        // Cloudinary upload logic would go here
        // For now, assuming middleware handles upload or we do it here
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "nestnagar/listings",
        });
        photos.push(result.secure_url);
      }
    }

    const newListing = new Listing({
      postedBy: req.user.id,
      posterRole: req.user.role,
      type,
      title,
      description,
      price,
      deposit,
      locality,
      coordinates,
      amenities: typeof amenities === "string" ? JSON.parse(amenities) : amenities,
      genderAllowed,
      photos,
    });

    await newListing.save();
    res.status(201).json(newListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /listings
export const getListings = async (req, res) => {
  try {
    const { type, locality, minPrice, maxPrice, genderAllowed, my } = req.query;
    
    let query = {};
    
    if (my === 'true') {
      // If fetching own listings, we don't filter by status available only
      // But we need the user ID from the protect middleware
      // Wait, is getListings protected? Let's check routes.
      query.postedBy = req.user.id;
    } else {
      query.status = "available";
    }
    
    if (type) query.type = type;
    if (locality) query.locality = new RegExp(locality, "i");
    if (genderAllowed) query.genderAllowed = genderAllowed;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(query)
      .populate("postedBy", "name profilePhoto")
      .sort({ createdAt: -1 });
      
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /listings/my
export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ postedBy: req.user.id })
      .populate("postedBy", "name profilePhoto")
      .sort({ createdAt: -1 });
      
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /listings/:id
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("postedBy", "name profilePhoto phone");
    
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Increment views
    listing.views += 1;
    await listing.save();

    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /listings/personalised
export const getPersonalisedListings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "seeker" || !user.seekerProfile) {
      return res.status(400).json({ message: "Personalised feed only available for seekers with a profile" });
    }

    const { listingTypes, budget, priorityLocalities } = user.seekerProfile;

    let query = { 
      status: "available",
      type: { $in: listingTypes },
      price: { $gte: budget.min, $lte: budget.max }
    };

    // Priority localities: we search for these first
    const personalisedListings = await Listing.find(query)
      .populate("postedBy", "name profilePhoto")
      .sort({ createdAt: -1 });

    // Optional: Sort by priority localities (simple implementation)
    const sortedListings = personalisedListings.sort((a, b) => {
      const aMatch = priorityLocalities.some(loc => new RegExp(loc, "i").test(a.locality));
      const bMatch = priorityLocalities.some(loc => new RegExp(loc, "i").test(b.locality));
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

    res.status(200).json({
      feedMessage: user.seekerProfile.feedMessage,
      listings: sortedListings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /listings/:id
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check ownership
    if (listing.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json(updatedListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /listings/:id
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check ownership
    if (listing.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
