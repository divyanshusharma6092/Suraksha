const express = require("express");
const AdoptionListing = require("../models/AdoptionListing");
const AdoptionApplication = require("../models/AdoptionApplication");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 1. CREATE ADOPTION LISTING
// POST /api/adoptions
// NGO ONLY

router.post("/", authMiddleware, async (req, res) => {
try {
    if (req.user.role !== "ngo") {
    return res.status(403).json({
        success: false,
        message: "Only NGO can create adoption listings"
    });
    }

    const {
    petName,
    breed,
    age,
    description,
    photos
    } = req.body;

    if (!petName || !description) {
return res.status(400).json({
        success: false,
        message: "Pet name and description are required"
    });
    }

    const listing = await AdoptionListing.create({
    ngoId: req.user._id,
    petName,
    breed: breed || "",
    age: age || "",
    description,
    photos: photos || []
    });

    res.status(201).json({
    success: true,
    message: "Adoption listing created successfully",
    listing
    });

} catch (error) {
    console.error("Create Adoption Listing Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to create adoption listing"
    });
}
});

// 2. GET ALL AVAILABLE PETS
// GET /api/adoptions

router.get("/", async (req, res) => {
try {
    const listings = await AdoptionListing.find({
    status: "available"
    })
    .populate("ngoId", "name email phone")
    .sort({ createdAt: -1 });

    res.status(200).json({
    success: true,
    count: listings.length,
    listings
    });

} catch (error) {
    console.error("Get Adoption Listings Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to get adoption listings"
    });
}
});

// 3. GET SINGLE ADOPTION LISTING
// GET /api/adoptions/:id

router.get("/:id", async (req, res) => {
try {
    const listing = await AdoptionListing.findById(req.params.id)
    .populate("ngoId", "name email phone");

    if (!listing) {
    return res.status(404).json({
        success: false,
        message: "Adoption listing not found"
    });
    }

    res.status(200).json({
    success: true,
    listing
    });

} catch (error) {
    console.error("Get Adoption Listing Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to get adoption listing"
    });
}
});

// 4. APPLY FOR ADOPTION
// POST /api/adoptions/:id/apply
// INDIVIDUAL ONLY
router.post("/:id/apply", authMiddleware, async (req, res) => {
try {
    if (req.user.role !== "individual") {
    return res.status(403).json({
        success: false,
        message: "Only individual users can apply for adoption"
    });
    }

    const { message } = req.body;

    if (!message) {
    return res.status(400).json({
        success: false,
        message: "Application message is required"
    });
    }

    const listing = await AdoptionListing.findById(req.params.id);

    if (!listing) {
    return res.status(404).json({
        success: false,
        message: "Adoption listing not found"
    });
    }

    if (listing.status !== "available") {
    return res.status(400).json({
        success: false,
        message: "This pet is no longer available for adoption"
    });
    }

    const existingApplication = await AdoptionApplication.findOne({
    listingId: listing._id,
    applicantId: req.user._id
    });

    if (existingApplication) {
    return res.status(400).json({
        success: false,
        message: "You have already applied for this pet"
    });
    }

    const application = await AdoptionApplication.create({
    listingId: listing._id,
    applicantId: req.user._id,
    message
    });

    res.status(201).json({
    success: true,
    message: "Adoption application submitted successfully",
    application
    });

} catch (error) {

}
});

// 5. GET APPLICATIONS FOR A PET
// GET /api/adoptions/:id/applications
// NGO OWNER ONLY
router.get("/:id/applications", authMiddleware, async (req, res) => {
try {
    if (req.user.role !== "ngo") {
    return res.status(403).json({
        success: false,
        message: "Only NGO can view applications"
    });
    }

    const listing = await AdoptionListing.findById(req.params.id);

    if (!listing) {
    return res.status(404).json({
        success: false,
        message: "Adoption listing not found"
    });
    }

    if (listing.ngoId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
        success: false,
        message: "You can only view applications for your own listing"
    });
    }

    const applications = await AdoptionApplication.find({
    listingId: listing._id
    })
    .populate("applicantId", "name email phone")
    .sort({ createdAt: -1 });

    res.status(200).json({
    success: true,
    count: applications.length,
    applications
    });

} catch (error) {
    console.error("Get Adoption Applications Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to get adoption applications"
    });
}
});

// 6. APPROVE / REJECT ADOPTION APPLICATION
// PATCH /api/applications/:id
// NGO ONLY

router.patch("/applications/:id", authMiddleware, async (req, res) => {
try {
    // Only NGO can approve/reject
    if (req.user.role !== "ngo") {
    return res.status(403).json({
        success: false,
        message: "Only NGO can approve or reject applications"
    });
    }

    const { status } = req.body;

    // Check valid status
    if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected"
    });
    }

    // Find application
    const application = await AdoptionApplication.findById(
    req.params.id
    ).populate("listingId");

    if (!application) {
    return res.status(404).json({
        success: false,
        message: "Adoption application not found"
    });
    }

    // Check that this NGO owns the listing
    if (
    application.listingId.ngoId.toString() !==
    req.user._id.toString()
    ) {
    return res.status(403).json({
        success: false,
        message: "You can only manage applications for your own pets"
    });
    }

    // Update application status
    application.status = status;

    await application.save();

    // If approved, mark pet as adopted
    if (status === "approved") {
    await AdoptionListing.findByIdAndUpdate(
        application.listingId._id,
        {
        status: "adopted"
        }
    );
    }

    res.status(200).json({
    success: true,
    message: `Application ${status} successfully`,
    application
    });

} catch (error) {
    console.error("Update Adoption Application Error:", error);

    res.status(500).json({
    success: false,
    message: "Failed to update adoption application"
    });
}
});

module.exports = router;