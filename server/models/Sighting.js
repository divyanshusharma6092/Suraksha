const mongoose = require("mongoose");

const sightingSchema = new mongoose.Schema(
{
    petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PetID",
    required: true,
    },

    location: {
    lat: {
        type: Number,
        required: true,
    },

    lng: {
        type: Number,
        required: true,
    },
    },

    reporterName: {
    type: String,
    trim: true,
    default: "",
    },

    reporterContact: {
    type: String,
    trim: true,
    default: "",
    },

    photo: {
    type: String,
    default: "",
    },

    status: {
    type: String,
    enum: ["pending", "verified"],
    default: "pending",
    },
},
{
    timestamps: true,
}
);

const Sighting = mongoose.model("Sighting", sightingSchema);

module.exports = Sighting;