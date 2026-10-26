
const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 1. CREATE EVENT - NGO ONLY
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({
        success: false,
        message: "Only NGO can create events",
      });
    }

    const { title, description, date, location } = req.body;

    if (!title || !description || !date || !location) {
      return res.status(400).json({
        success: false,
        message: "All event fields are required",
      });
    }

    const eventDate = new Date(date);

    if (Number.isNaN(eventDate.getTime()) || eventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid future date and time",
      });
    }

    const event = await Event.create({
      ngoId: req.user._id,
      title: title.trim(),
      description: description.trim(),
      date: eventDate,
      location: location.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Create Event Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
});

// 2. GET ALL UPCOMING EVENTS - PUBLIC
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({
      date: { $gte: new Date() },
    })
      .populate("ngoId", "name email phone")
      .sort({ date: 1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Get Events Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get events",
    });
  }
});

// 3. REGISTER FOR EVENT - INDIVIDUAL ONLY
router.post("/:id/register", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "individual") {
      return res.status(403).json({
        success: false,
        message: "Only individual users can register as volunteers",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (new Date(event.date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This event has already passed",
      });
    }

    // Prevent duplicate registration
    const alreadyRegistered = (event.volunteers || []).some(
      (volunteerId) =>
        volunteerId.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(409).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    event.volunteers.push(req.user._id);
    await event.save();

    return res.status(200).json({
      success: true,
      message: "You are registered successfully!",
      eventId: event._id,
    });
  } catch (error) {
    console.error("Register Volunteer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register for event",
    });
  }
});

// 4. GET MY EVENTS WITH REGISTERED VOLUNTEERS - NGO ONLY
// IMPORTANT: This route must be before "/:id"
router.get(
  "/my/registered-volunteers",
  authMiddleware,
  async (req, res) => {
    try {
      if (req.user.role !== "ngo") {
        return res.status(403).json({
          success: false,
          message: "Only NGOs can view registered volunteers",
        });
      }

      const events = await Event.find({
        ngoId: req.user._id,
      })
        .populate("volunteers", "name email phone")
        .sort({ date: 1 });

      const result = events.map((event) => ({
        _id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        volunteers: event.volunteers || [],
        volunteerCount: (event.volunteers || []).length,
      }));

      return res.status(200).json({
        success: true,
        count: result.length,
        events: result,
      });
    } catch (error) {
      console.error("Get Registered Volunteers Error:", error);
      return res.status(500).json({
        success: false,
        message: "Could not load registered volunteers",
      });
    }
  }
);

// 5. GET SINGLE EVENT - PUBLIC
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(req.params.id)
      .populate("ngoId", "name email phone")
      .populate("volunteers", "name email phone");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Get Single Event Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get event",
    });
  }
});

// 6. DELETE EVENT - NGO OWNER ONLY
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({
        success: false,
        message: "Only NGO can delete events",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.ngoId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own events",
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete Event Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
});

module.exports = router;
