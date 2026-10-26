const mongoose = require("mongoose");

const adoptionApplicationSchema = new mongoose.Schema(
{
    listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdoptionListing",
    required: true,
    },

    applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },

    message: {
    type: String,
    required: true,
    trim: true,
    },

    status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    },
},
{
    timestamps: true,
}
);

const AdoptionApplication = mongoose.model(
"AdoptionApplication",
adoptionApplicationSchema
);

module.exports = AdoptionApplication;