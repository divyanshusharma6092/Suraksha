const mongoose = require("mongoose");

const ngoProfileSchema = new mongoose.Schema(
{
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    },

    orgName: {
    type: String,
    trim: true,
    },

    address: {
    type: String,
    trim: true,
    },

    location: {
    lat: {
        type: Number,
    },
    lng: {
        type: Number,
    },
    },

    verified: {
    type: Boolean,
    default: false,
    },
},
{
    timestamps: true,
}
);

const NGOProfile = mongoose.model("NGOProfile", ngoProfileSchema);

module.exports = NGOProfile;