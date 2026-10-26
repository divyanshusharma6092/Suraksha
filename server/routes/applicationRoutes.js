const express = require("express");

const AdoptionApplication = require("../models/AdoptionApplication");
const AdoptionListing = require("../models/AdoptionListing");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// APPROVE / REJECT ADOPTION APPLICATION
// PATCH /api/applications/:id
// NGO ONLY

router.patch("/:id", authMiddleware, async (req, res) => {try {
    // Only NGO can approve/reject
    if (req.user.role !== "ngo") {
    return res.status(403).json({
        success: false,
        message: "Only NGO can approve or reject applications",
    });
    }

    const { status } = req.body;

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
    });
    }

    // Find application
    const application = await AdoptionApplication.findById(
    req.params.id
    ).populate("listingId");

    if (!application) {
    return res.status(404).json({
        success: false,
        message: "Adoption application not found",
    });
    }

    // Check NGO ownership
    if (
    application.listingId.ngoId.toString() !==
    req.user._id.toString()
    ) {
    return res.status(403).json({
        success: false,
        message: "You can only manage applications for your own pets",
    });
    }

    // Update application
    application.status = status;

    await application.save();

    // If approved, mark pet as adopted
    if (status === "approved") {
    await AdoptionListing.findByIdAndUpdate(
        application.listingId._id,
        {
        status: "adopted",
        }
    );
    }

    res.status(200).json({
    success: true,
    message: `Application ${status} successfully`,
    application,
    });

} catch (error) {
    console.error("Update Adoption Application Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to update adoption application",
    });
}
});

module.exports = router;