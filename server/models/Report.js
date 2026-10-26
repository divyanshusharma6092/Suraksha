const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
{
    reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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

    description: {
    type: String,
    required: true,
    trim: true,
    },

    photo: {
    type: String,
    },

    status: {
    type: String,
    enum: ["pending", "assigned", "resolved"],
    default: "pending",
    },

    assignedNGO: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    },
},
{
    timestamps: true,
}
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;