
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

async function resetPassword() {
try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "contact@yoda.co.in";
    const newPassword = "Suraksha@123";

    const user = await User.findOne({ email });

    if (!user) {
    console.log("User not found!");
    return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    console.log("Password reset successfully!");
    console.log("Email:", email);
    console.log("New password:", newPassword);
} catch (error) {
    console.error("Error:", error.message);
} finally {
    await mongoose.disconnect();
}
}

resetPassword();
