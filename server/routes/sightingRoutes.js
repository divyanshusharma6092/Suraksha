const express = require("express");
const rateLimit = require("express-rate-limit");

const Sighting = require("../models/Sighting");
const PetID = require("../models/PetID");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// RATE LIMIT
// Maximum 5 sighting reports per IP per hour

const sightingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
max: 5,
message: {
    success: false,
    message: "Too many sighting reports. Please try again later.",
},
});

// 1. CREATE PET SIGHTING
// POST /api/sightings
// PUBLIC

router.post("/", sightingLimiter, async (req, res) => {
try {
    const {
    qrCode,
    lat,
    lng,
    reporterName,
    reporterContact,
    photo,
    } = req.body;

    // Check required fields
    if (
    !qrCode ||
    lat === undefined ||
    lng === undefined
    ) {
    return res.status(400).json({
        success: false,
        message: "QR code, latitude and longitude are required",
    });
    }

    // Find pet using QR code
    const pet = await PetID.findOne({
    qrCode,
    }).populate("ownerId", "name email phone");

    if (!pet) {
    return res.status(404).json({
        success: false,
        message: "Pet not found",
    });
    }

    // Create sighting
    const sighting = await Sighting.create({
    petId: pet._id,
    location: {
        lat: Number(lat),
        lng: Number(lng),
    },
    reporterName: reporterName || "",
    reporterContact: reporterContact || "",
    photo: photo || "",
    status: "pending",
    });

    // Notify pet owner by email
    if (pet.ownerId && pet.ownerId.email) {
    await sendEmail();
    }

    res.status(201).json({
    success: true,
    message: "Pet sighting reported successfully",
    sighting,
    });

} catch (error) {
    console.error("Create Sighting Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to report pet sighting",
    });
}
});

// 2. GET ALL SIGHTINGS FOR A PET
// GET /api/sightings/:petId
// PUBLIC

router.get("/:petId", async (req, res) => {
try {
    const pet = await PetID.findById(req.params.petId);

    if (!pet) {
    return res.status(404).json({
        success: false,
        message: "Pet not found",
    });
    }

    const sightings = await Sighting.find({
    petId: pet._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
    success: true,
    count: sightings.length,
    sightings,
    });

} catch (error) {
    console.error("Get Sightings Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to get pet sightings",
    });
}
});

// 3. VERIFY SIGHTING
// PATCH /api/sightings/:id/verify
// OWNER / NGO / ADMIN

router.patch("/:id/verify", authMiddleware, async (req, res) => {
try {
    const sighting = await Sighting.findById(req.params.id)
    .populate("petId");

    if (!sighting) {
    return res.status(404).json({
        success: false,
        message: "Sighting not found",
    });
    }

    const pet = sighting.petId;

    // Only owner, NGO or admin can verify
    const isOwner =
    pet.ownerId.toString() === req.user._id.toString();

    const isNGO = req.user.role === "ngo";
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isNGO && !isAdmin) {
    return res.status(403).json({
        success: false,
        message: "You are not allowed to verify this sighting",
    });
    }

    sighting.status = "verified";

    await sighting.save();

    res.status(200).json({
    success: true,
    message: "Pet sighting verified successfully",
    sighting,
    });

} catch (error) {
    console.error("Verify Sighting Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to verify sighting",
    });
}
});

module.exports = router;