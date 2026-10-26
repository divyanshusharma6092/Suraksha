const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// IMPORT ROUTES
const authRoutes = require("./routes/authRoutes");
const ngoRoutes = require("./routes/ngoRoutes");
const reportRoutes = require("./routes/reportRoutes");
const missingPetRoutes = require("./routes/missingPetRoutes");
const adoptionRoutes = require("./routes/adoptionRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const eventRoutes = require("./routes/eventRoutes");
const petRoutes = require("./routes/petRoutes");
const sightingRoutes = require("./routes/sightingRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

// CREATE EXPRESS APP
const app = express();

// MIDDLEWARE
const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.1.103:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json({ limit: "10mb" }));
// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/missing-pets", missingPetRoutes);
app.use("/api/adoptions", adoptionRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/sightings", sightingRoutes);
app.use("/api/applications", applicationRoutes);


// TEST ROUTE
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Suraksha Backend is Running!",
  });
});

// ===============================
// MONGODB CONNECTION
// ===============================

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error.message);
  });

// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});