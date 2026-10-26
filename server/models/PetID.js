const mongoose = require("mongoose");

const petIDSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        petName: {
            type: String,
            required: true,
            trim: true,
        },

        qrCode: {
            type: String,
            required: true,
            unique: true,
        },

        photo: {
            type: String,
            default: "",
        },
        age: {
            type: String,
            default: "",
            trim: true,
        },

        breed: {
            type: String,
            default: "",
            trim: true,
        },

        ownerName: {
            type: String,
            required: true,
            trim: true,
        },

        ownerContact: {
            type: String,
            required: true,
            trim: true,
        },

        address: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const PetID = mongoose.model("PetID", petIDSchema);

module.exports = PetID;