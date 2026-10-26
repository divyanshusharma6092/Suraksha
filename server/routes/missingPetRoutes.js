
const express = require("express");
const MissingPet = require("../models/missingpet");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/missing-pets
// Login required: create a Missing/Found report
router.post("/", authMiddleware, async (req, res) => {
try {
    const {
    type,
    petName,
    breed,
    color,
    description,
    contact,
    photo,
    location,
    } = req.body;

    const lat = Number(location?.lat);
    const lng = Number(location?.lng);

    if (
    !["missing", "found"].includes(type) ||
    !description?.trim() ||
    !contact?.trim() ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
    ) {
    return res.status(400).json({
        success: false,
        message:
        "Please provide type, location, description and contact number.",
    });
    }

    if (type === "missing" && !petName?.trim()) {
    return res.status(400).json({
        success: false,
        message: "Pet name is required for a missing pet.",
    });
    }

    const pet = await MissingPet.create({
    reportedBy: req.user._id,
    type,
    petName: petName || "",
    breed: breed || "",
    color: color || "",
    description: description.trim(),
    contact: contact.trim(),
    photo: photo || "",
    location: { lat, lng },
    dateLost: new Date(),
    });

    return res.status(201).json({
    success: true,
    message: "Missing/Found pet report created successfully.",
    pet,
    });
} catch (error) {
    console.error("Create Missing Pet Error:", error);

    return res.status(500).json({
    success: false,
    message: "Failed to create missing pet report.",
    });
}
});

// GET /api/missing-pets
// Public: visitors can see active Missing/Found reports
router.get("/", async (req, res) => {
try {
    const filter = {};

    if (req.query.type) {
    filter.type = req.query.type;
    }

    if (req.query.status) {
    filter.status = req.query.status;
    } else {
    filter.status = "open";
    }

    const pets = await MissingPet.find(filter)
    .select("-contact")
    .populate("reportedBy", "name")
    .sort({ createdAt: -1 });

    return res.status(200).json({
    success: true,
    count: pets.length,
    pets,
    });
} catch (error) {
    console.error("Get Missing Pets Error:", error);

    return res.status(500).json({
    success: false,
    message: "Failed to get missing/found pet reports.",
    });
}
});

// GET /api/missing-pets/:id
// Login required: view one report
router.get("/:id", authMiddleware, async (req, res) => {
try {
    const pet = await MissingPet.findById(req.params.id)
    .select("-contact")
    .populate("reportedBy", "name");

    if (!pet) {
    return res.status(404).json({
        success: false,
        message: "Missing/Found pet report not found.",
    });
    }

    return res.status(200).json({
    success: true,
    pet,
    });
} catch (error) {
    console.error("Get Missing Pet Error:", error);

    return res.status(500).json({
    success: false,
    message: "Failed to get pet report.",
    });
}
});

// PATCH /api/missing-pets/:id
// Login required: NGO/Admin can update report status
router.patch("/:id", authMiddleware, async (req, res) => {
try {
    const { status } = req.body;

    if (!["open", "matched", "closed"].includes(status)) {
    return res.status(400).json({
        success: false,
        message: "Status must be open, matched, or closed.",
    });
    }

    if (!["ngo", "admin"].includes(req.user.role)) {
    return res.status(403).json({
        success: false,
        message: "Only NGO or Admin can update report status.",
    });
    }

    const pet = await MissingPet.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
    );

    if (!pet) {
    return res.status(404).json({
        success: false,
        message: "Missing/Found pet report not found.",
    });
    }

    return res.status(200).json({
    success: true,
    message: "Pet report status updated successfully.",
    pet,
    });
} catch (error) {
    console.error("Update Missing Pet Error:", error);

    return res.status(500).json({
    success: false,
    message: "Failed to update pet report status.",
    });
}
});

module.exports = router;
