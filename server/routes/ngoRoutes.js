
const express = require("express");
const NGOProfile = require("../models/NGOProfile");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET ALL NGOs
router.get("/", async (req, res) => {
try {
    const ngos = await NGOProfile.find()
    .populate("userId", "name email phone")
    .select("orgName address location verified userId")
    .sort({ createdAt: -1 });

    const formattedNgos = ngos.map((ngo) => ({
    _id: ngo._id,
    name: ngo.orgName || ngo.userId?.name || "Registered NGO",
    city: ngo.address || "",
    description: ngo.verified ? "Verified NGO" : "Registration pending verification",
    email: ngo.userId?.email || "",
    phone: ngo.userId?.phone || "",
    location: ngo.location,
    verified: ngo.verified,
    }));

    res.status(200).json({
    success: true,
    count: formattedNgos.length,
    ngos: formattedNgos,
    });
} catch (error) {
    console.error("Get NGOs Error:", error);
    res.status(500).json({
    success: false,
    message: "Failed to get NGOs",
    });
}
});

// UPDATE NGO PROFILE
router.put("/profile", authMiddleware, async (req, res) => {
try {
    if (req.user.role !== "ngo") {
    return res.status(403).json({
        success: false,
        message: "Only NGO can update this profile",
    });
    }

    const { orgName, address, lat, lng } = req.body;

    const profile = await NGOProfile.findOneAndUpdate(
    { userId: req.user._id },
    {
        orgName,
        address,
        location: {
        lat,
        lng,
        },
    },
    {
        new: true,
        runValidators: true,
    }
    );

    if (!profile) {
    return res.status(404).json({
        success: false,
        message: "NGO profile not found",
    });
    }

    res.status(200).json({
    success: true,
    message: "NGO profile updated successfully",
    profile,
    });
} catch (error) {
    console.error("Update NGO Profile Error:", error);
    res.status(500).json({
    success: false,
    message: "Failed to update NGO profile",
    });
}
});

module.exports = router;
