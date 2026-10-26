
const mongoose = require("mongoose");

const missingPetSchema = new mongoose.Schema(
{
    reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },

    type: {
    type: String,
    enum: ["missing", "found"],
    required: true,
    },

    petName: {
    type: String,
    trim: true,
    default: "",
    },

    breed: {
    type: String,
    trim: true,
    default: "",
    },

    color: {
    type: String,
    trim: true,
    default: "",
    },

    description: {
    type: String,
    required: true,
    trim: true,
    },

    contact: {
    type: String,
    required: true,
    trim: true,
    },

    photo: {
    type: String,
    default: "",
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

    dateLost: {
    type: Date,
    default: Date.now,
    },

    status: {
    type: String,
    enum: ["open", "matched", "closed"],
    default: "open",
    },
},
{
    timestamps: true,
}
);

const MissingPet = mongoose.model("MissingPet", missingPetSchema);

module.exports = MissingPet;
