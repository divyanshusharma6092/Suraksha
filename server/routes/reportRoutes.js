const express = require("express");
const Report = require("../models/Report");
const NGOProfile = require("../models/NGOProfile");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// CALCULATE DISTANCE
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in KM

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// CREATE STRAY ANIMAL REPORT
router.post("/", authMiddleware, async (req, res) => {
try {
    // Supports both nested location and direct lat/lng formats
    const { location, lat, lng, description, photo } = req.body;

    const reportLat = Number(location?.lat ?? lat);
    const reportLng = Number(location?.lng ?? lng);

    if (
    !Number.isFinite(reportLat) ||
    !Number.isFinite(reportLng) ||
    !description?.trim()
    ) {
    return res.status(400).json({
        success: false,
        message: "Location and description are required",
    });
    }

    // FIND NEAREST NGO
    const ngoProfiles = await NGOProfile.find({
    "location.lat": { $exists: true },
    "location.lng": { $exists: true },
    });

    let nearestNGO = null;
    let shortestDistance = Infinity;

    for (const ngo of ngoProfiles) {
    const ngoLat = Number(ngo.location.lat);
    const ngoLng = Number(ngo.location.lng);

    const distance = calculateDistance(
        reportLat,
        reportLng,
        ngoLat,
        ngoLng
    );

    if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestNGO = ngo;
    }
    }

    // CREATE REPORT
    const report = await Report.create({
    reportedBy: req.user._id,

    location: {
        lat: reportLat,
        lng: reportLng,
    },

    description,

    photo: photo || "",

    status: nearestNGO ? "assigned" : "pending",

    assignedNGO: nearestNGO ? nearestNGO.userId : undefined,
    });

// SEND EMAIL TO ASSIGNED NGO
if (nearestNGO) {
const assignedUser = await require("../models/User").findById(
    nearestNGO.userId
);

if (assignedUser && assignedUser.email) {
    await sendEmail(
    assignedUser.email,
    "New Stray Animal Report Assigned - Suraksha",
    `Hello ${assignedUser.name},

A new stray animal report has been assigned to your NGO through Suraksha.

Description: ${description}

Location:
Latitude: ${reportLat}
Longitude: ${reportLng}

Distance from your NGO: ${shortestDistance.toFixed(2)} km

Please check the Suraksha platform and take necessary action.

Regards,
Suraksha Team`
    );
}
}
    // RESPONSE
    res.status(201).json({
    success: true,
    message: nearestNGO
        ? "Report created and nearest NGO assigned successfully"
        : "Report created successfully, but no NGO location is available",

    report: {
        id: report._id,
        reportedBy: report.reportedBy,
        description: report.description,
        location: report.location,
        photo: report.photo,
        status: report.status,
        assignedNGO: report.assignedNGO || null,
        distanceFromNGO: nearestNGO
        ? `${shortestDistance.toFixed(2)} km`
        : null,
        createdAt: report.createdAt,
    },
    });
} catch (error) {
    console.error("Create Report Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to create report",
    });
}
});


 // GET MY REPORTS
router.get("/my", authMiddleware, async (req, res) => {
try {
    const reports = await Report.find({
    reportedBy: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
    success: true,
    count: reports.length,
    reports,
    });
} catch (error) {
    console.error("Get My Reports Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to get reports",
    });
}
});

// GET ALL REPORTS
router.get("/", authMiddleware, async (req, res) => {
try {
    const { status, assignedNGO } = req.query;

    const filter = {};

    if (status) {
    filter.status = status;
    }

    if (assignedNGO) {
    filter.assignedNGO = assignedNGO;
    }

    const reports = await Report.find(filter)
    .populate("reportedBy", "name email role")
    .populate("assignedNGO", "name email role")
    .sort({ createdAt: -1 });

    res.status(200).json({
    success: true,
    count: reports.length,
    reports,
    });
} catch (error) {
    console.error("Get Reports Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to get reports",
    });
}
});

// GET SINGLE REPORT
router.get("/:id", authMiddleware, async (req, res) => {
try {
    const report = await Report.findById(req.params.id)
    .populate("reportedBy", "name email role")
    .populate("assignedNGO", "name email role");

    if (!report) {
    return res.status(404).json({
        success: false,
        message: "Report not found",
    });
    }

    res.status(200).json({
    success: true,
    report,
    });
} catch (error) {
    console.error("Get Report Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to get report",
    });
}
});

// UPDATE REPORT STATUS
router.patch("/:id", authMiddleware, async (req, res) => {
try {
    const { status } = req.body;

    if (req.user.role !== "ngo" && req.user.role !== "admin") {
    return res.status(403).json({
        success: false,
        message: "Only NGO or admin can update report status",
    });
    }

    if (!["pending", "assigned", "resolved"].includes(status)) {
    return res.status(400).json({
        success: false,
        message: "Invalid report status",
    });
    }

    const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status },
    {
        new: true,
        runValidators: true,
    }
    );

    if (!report) {
    return res.status(404).json({
        success: false,
        message: "Report not found",
    });
    }

    res.status(200).json({
    success: true,
    message: "Report status updated successfully",
    report: {
        id: report._id,
        status: report.status,
    },
    });
} catch (error) {
    console.error("Update Report Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to update report",
    });
}
});

module.exports = router;