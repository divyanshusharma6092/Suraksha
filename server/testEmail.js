require("dotenv").config();

const sendEmail = require("./utils/sendEmail");

sendEmail(
process.env.EMAIL_USER,
"Suraksha Email Test",
"Hello! This is a test email from Suraksha backend."
);