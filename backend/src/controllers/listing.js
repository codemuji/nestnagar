import Listing from "../models/Listing.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// GET /listings/localities/autocomplete
export const getLocalitiesAutocomplete = async (req, res) => {
  try {
    const { q = '' } = req.query;
    const regex = new RegExp(q, 'i');
    
    // Get unique localities from listings
    const localities = await Listing.aggregate([
      { $match: { locality: regex, status: 'available' } },
      { $group: { _id: '$locality', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, locality: '$_id', count: 1 } }
    ]);
    
    res.status(200).json(localities.map(l => l.locality));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /listings/stats
export const getDashboardStats = async (req, res) => {
  try {
    const listings = await Listing.find({ postedBy: req.user.id });
    const totalListings = listings.length;
    const totalViews = listings.reduce((acc, curr) => acc + (curr.views || 0), 0);
    
    const activeChats = await Conversation.countDocuments({
      participants: req.user.id
    });

    res.status(200).json({
      totalListings,
      totalViews,
      activeChats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /listings
export const createListing = async (req, res) => {
  try {
    const { 
      type, title, description, price, deposit, 
      locality, coordinates, amenities, genderAllowed 
    } = req.body;

    let photos = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file =>
          cloudinary.uploader.upload(file.path, {
            folder: "nestnagar/listings",
          })
        );
        const uploadResults = await Promise.all(uploadPromises);
        photos = uploadResults.map(result => result.secure_url);
      } finally {
        // Cleanup local temp files
        for (const file of req.files) {
          try {
            await fs.promises.unlink(file.path);
          } catch (unlinkErr) {
            console.error(`Failed to delete temp file ${file.path}:`, unlinkErr);
          }
        }
      }
    }

    const parsedCoordinates = coordinates 
      ? (typeof coordinates === "string" ? JSON.parse(coordinates) : coordinates) 
      : undefined;

    const newListing = new Listing({
      postedBy: req.user.id,
      posterRole: req.user.role,
      type,
      title,
      description,
      price: Number(price),
      deposit: Number(deposit),
      locality,
      coordinates: parsedCoordinates,
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
      // If fetching own listings, we need the user ID from the protect middleware
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized to view your listings" });
      }
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

    const { type, locality, minPrice, maxPrice } = req.query;
    const profile = user.seekerProfile;

    const { 
      listingTypes, budget, priorityLocalities, 
      locality: mainLocality, genderPreference 
    } = profile;

    // Fetch ALL available listings (not just matches)
    const allListings = await Listing.find({ status: "available" })
      .populate("postedBy", "name profilePhoto");

    // Score and sort listings based on user profile AND overrides
    const scoredListings = allListings.map(listing => {
      let score = 0;

      // 1. Property Type Match
      const searchTypes = type ? [type] : listingTypes;
      if (searchTypes && searchTypes.length > 0) {
        if (searchTypes.includes(listing.type)) {
          score += 20;
        }
      }

      // 2. Location Match
      const searchLocality = locality || mainLocality;
      if (searchLocality && listing.locality.toLowerCase().includes(searchLocality.toLowerCase())) {
        score += 40;
      }
      
      // Check priority localities
      if (priorityLocalities && priorityLocalities.length > 0) {
        const matchesPriority = priorityLocalities.some(loc => 
          listing.locality.toLowerCase().includes(loc.toLowerCase())
        );
        if (matchesPriority) {
          score += 30;
        }
      }

      // 3. Budget Match
      const searchMax = maxPrice ? Number(maxPrice) : budget.max;
      const searchMin = minPrice ? Number(minPrice) : budget.min;

      if (listing.price >= searchMin && listing.price <= searchMax) {
        score += 30;
      } else if (listing.price <= searchMax * 1.3) {
        // Within 30% of max budget
        score += 10;
      }

      // 4. Gender Preference Match
      const seekerWant = genderPreference || "any";
      const listingAllow = listing.genderAllowed;

      if (seekerWant === "any" || listingAllow === "any" || seekerWant === listingAllow) {
        score += 20;
      }

      return {
        ...listing.toObject(),
        matchScore: score
      };
    });

    // If explicit filters are used, we might want to boost exact matches more or filter strictly
    // For now, keeping the scoring approach but could filter if locality/type is provided
    let finalResult = scoredListings;
    
    if (type || locality) {
       // Optional: Filter more strictly if user explicitly searched?
       // Let's keep it as scoring for a "personalised search" feel
    }

    // Sort by match score (descending), then by most recent (descending)
    const sortedListings = finalResult.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json({
      feedMessage: profile.feedMessage || "Here are some listings we found for you.",
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

    const { 
      type, title, description, price, deposit, 
      locality, coordinates, amenities, genderAllowed, status, existingPhotos
    } = req.body;

    let currentPhotos = [];
    if (existingPhotos) {
      currentPhotos = typeof existingPhotos === "string" ? JSON.parse(existingPhotos) : existingPhotos;
    } else {
      currentPhotos = listing.photos || [];
    }

    let newPhotos = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file =>
          cloudinary.uploader.upload(file.path, {
            folder: "nestnagar/listings",
          })
        );
        const uploadResults = await Promise.all(uploadPromises);
        newPhotos = uploadResults.map(result => result.secure_url);
      } finally {
        // Cleanup local temp files
        for (const file of req.files) {
          try {
            await fs.promises.unlink(file.path);
          } catch (unlinkErr) {
            console.error(`Failed to delete temp file ${file.path}:`, unlinkErr);
          }
        }
      }
    }

    const mergedPhotos = [...currentPhotos, ...newPhotos];

    if (type !== undefined) listing.type = type;
    if (title !== undefined) listing.title = title;
    if (description !== undefined) listing.description = description;
    if (price !== undefined) listing.price = Number(price);
    if (deposit !== undefined) listing.deposit = Number(deposit);
    if (locality !== undefined) listing.locality = locality;
    if (genderAllowed !== undefined) listing.genderAllowed = genderAllowed;
    if (status !== undefined) listing.status = status;

    if (coordinates !== undefined) {
      listing.coordinates = typeof coordinates === "string" ? JSON.parse(coordinates) : coordinates;
    }
    if (amenities !== undefined) {
      listing.amenities = typeof amenities === "string" ? JSON.parse(amenities) : amenities;
    }
    
    listing.photos = mergedPhotos;

    await listing.save();
    res.status(200).json(listing);
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
