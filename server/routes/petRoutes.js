const express = require("express");
const QRCode = require("qrcode");
const PetID = require("../models/PetID");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 1. REGISTER PET + GENERATE QR CODE
// POST /api/pets
// LOGIN REQUIRED
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { petName, photo, age, breed, ownerName, ownerContact, address } = req.body;

        if (!petName) {
            return res.status(400).json({
                success: false,
                message: "Pet name is required",
            });
        }

        if (!/^\d{10}$/.test(String(ownerContact).trim())) {
            return res.status(400).json({
                success: false,
                message: "Owner contact must be exactly 10 digits",
            });
        }
        if (!ownerName || !ownerContact) {
            return res.status(400).json({
                success: false,
                message: "Owner name and owner contact are required",
            });
        }

        // Generate unique QR code ID
        const qrCode = `SRK-${Date.now()}-${Math.floor(
            Math.random() * 1000
        )}`;

        // Save pet
        const pet = await PetID.create({
            ownerId: req.user._id,
            petName,
            qrCode,
            photo: photo || "",
            age: age || "",
            breed: breed || "",
            ownerName,
            ownerContact,
            address: address || "",
        });

        // Generate QR image as Base64
        const qrImage = await QRCode.toDataURL(qrCode);

        res.status(201).json({
            success: true,
            message: "Pet registered successfully",
            pet,
            qrImage,
        });

    } catch (error) {
        console.error("Register Pet Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to register pet",
        });
    }
});

// 2. GET PET BY QR CODE
// GET /api/pets/:qrCode
// PUBLIC

router.get("/:qrCode", async (req, res) => {
    try {
        const pet = await PetID.findOne({
            qrCode: req.params.qrCode,
        }).populate("ownerId", "name email phone");

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: "Pet not found",
            });
        }

        res.status(200).json({
            success: true,
            pet,
        });

    } catch (error) {
        console.error("Get Pet Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get pet details",
        });
    }
});

module.exports = router;