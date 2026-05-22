import PartnerCard from "../models/PartnerCard.js";

// POST /partners
export const createPartnerCard = async (req, res) => {
  try {
    const { 
      purpose, budget, preferredLocality, 
      moveInDate, genderPreference, habits, bio 
    } = req.body;

    const newCard = new PartnerCard({
      postedBy: req.user.id,
      purpose,
      budget,
      preferredLocality,
      moveInDate,
      genderPreference,
      habits,
      bio
    });

    await newCard.save();
    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /partners
export const getPartnerCards = async (req, res) => {
  try {
    const { purpose, genderPreference, maxBudget } = req.query;
    
    let query = { status: "active" };
    
    if (purpose) query.purpose = purpose;
    if (genderPreference) query.genderPreference = genderPreference;
    if (maxBudget) query.budget = { $lte: Number(maxBudget) };

    const cards = await PartnerCard.find(query)
      .populate("postedBy", "name profilePhoto")
      .sort({ createdAt: -1 });
      
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /partners/:id
export const getPartnerCardById = async (req, res) => {
  try {
    const card = await PartnerCard.findById(req.params.id)
      .populate("postedBy", "name profilePhoto");
    
    if (!card) {
      return res.status(404).json({ message: "Partner card not found" });
    }

    res.status(200).json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /partners/:id
export const updatePartnerCard = async (req, res) => {
  try {
    const card = await PartnerCard.findById(req.params.id);
    
    if (!card) {
      return res.status(404).json({ message: "Partner card not found" });
    }

    if (card.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedCard = await PartnerCard.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /partners/:id
export const deletePartnerCard = async (req, res) => {
  try {
    const card = await PartnerCard.findById(req.params.id);
    
    if (!card) {
      return res.status(404).json({ message: "Partner card not found" });
    }

    if (card.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await PartnerCard.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Partner card deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
