const mongoose = require("mongoose");

const adoptionListingSchema = new mongoose.Schema(
{
    ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },

    petName: {
    type: String,
    required: true,
    trim: true,
    },

    breed: {
    type: String,
    trim: true,
    },

    age: {
    type: String,
    trim: true,
    },

    description: {
    type: String,
    required: true,
    trim: true,
    },

    photos: {
    type: [String],
    default: [],
    },

    status: {
    type: String,
    enum: ["available", "adopted"],
    default: "available",
    },
},
{
    timestamps: true,
}
);

const AdoptionListing = mongoose.model(
"AdoptionListing",
adoptionListingSchema
);

module.exports = AdoptionListing;