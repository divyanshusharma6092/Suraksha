const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
{
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    },

    skills: {
    type: [String],
    default: [],
    },

    availability: {
    type: String,
    trim: true,
    },

    ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    },

    status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
    },
},
{
    timestamps: true,
}
);

const Volunteer = mongoose.model("Volunteer", volunteerSchema);

module.exports = Volunteer;