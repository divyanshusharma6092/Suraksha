const express = require("express");
const Volunteer = require("../models/Volunteer");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 1. CREATE / REGISTER AS VOLUNTEER
// POST /api/volunteers
// INDIVIDUAL ONLY

router.post("/", authMiddleware, async (req, res) => {
try {
    if (req.user.role !== "individual") {
    return res.status(403).json({
        success: false,
        message: "Only individual users can register as volunteers"
    });
    }

    const { skills, availability } = req.body;

    const existingVolunteer = await Volunteer.findOne({
    userId: req.user._id
    });

    if (existingVolunteer) {
    return res.status(400).json({
        success: false,
        message: "You are already registered as a volunteer"
    });
    }

    const volunteer = await Volunteer.create({
    userId: req.user._id,
    skills: skills || [],
    availability: availability || "",
    status: "active"
    });

    res.status(201).json({
    success: true,
    message: "Volunteer registered successfully",
    volunteer
    });

} catch (error) {
    console.error("Create Volunteer Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to register volunteer"
    });
}
});

// 2. GET MY VOLUNTEER PROFILE
// GET /api/volunteers/mine
// LOGIN REQUIRED

router.get("/mine", authMiddleware, async (req, res) => {
try {
    const volunteer = await Volunteer.findOne({
    userId: req.user._id
    })
    .populate("userId", "name email phone")
    .populate("ngoId", "name email");

    if (!volunteer) {
    return res.status(404).json({
        success: false,
        message: "Volunteer profile not found"
    });
    }

    res.status(200).json({
    success: true,
    volunteer
    });

} catch (error) {
    console.error("Get My Volunteer Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to get volunteer profile"
    });
}
});

// 3. GET ALL VOLUNTEERS
// GET /api/volunteers
// NGO / ADMIN ONLY

router.get("/", authMiddleware, async (req, res) => {
try {
    if (req.user.role !== "ngo" && req.user.role !== "admin") {
    return res.status(403).json({
        success: false,
        message: "Only NGO or admin can view volunteers"
    });
    }

    const { status } = req.query;

    const filter = {};

    if (status) {
    filter.status = status;
    }

    const volunteers = await Volunteer.find(filter)
    .populate("userId", "name email phone")
    .populate("ngoId", "name email")
    .sort({ createdAt: -1 });

    res.status(200).json({
    success: true,
    count: volunteers.length,
    volunteers
    });

} catch (error) {
    console.error("Get Volunteers Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to get volunteers"
    });
}
});

// 4. UPDATE VOLUNTEER PROFILE
// PATCH /api/volunteers
// VOLUNTEER ONLY

router.patch("/", authMiddleware, async (req, res) => {
try {
    const { skills, availability, status } = req.body;

    const volunteer = await Volunteer.findOne({
    userId: req.user._id
    });

    if (!volunteer) {
    return res.status(404).json({
        success: false,
        message: "Volunteer profile not found"
    });
    }

    if (skills !== undefined) {
    volunteer.skills = skills;
    }

    if (availability !== undefined) {
    volunteer.availability = availability;
    }

    if (status !== undefined) {
    if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
        success: false,
        message: "Status must be active or inactive"
        });
    }

    volunteer.status = status;
    }

    await volunteer.save();

    res.status(200).json({
    success: true,
    message: "Volunteer profile updated successfully",
    volunteer
    });

} catch (error) {
    console.error("Update Volunteer Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to update volunteer profile"
    });
}
});

module.exports = router;