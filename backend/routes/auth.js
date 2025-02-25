const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Redis = require("ioredis");
require("dotenv").config(); // Load environment variables

// Initialize Redis client
const redis = new Redis();

// Function to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Sender email from .env
    pass: process.env.EMAIL_PASS, // App password from .env
  },
});

// Send OTP Route
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate UST email domain
    if (!email.endsWith("@ust.edu.ph")) {
      return res.status(400).json({ message: "Only UST emails are allowed!" });
    }

    // Generate and store OTP in Redis with a 5-minute expiry
    const otp = generateOTP();
    await redis.set(`otp:${email}`, otp, "EX", 300);

    // Email message details
    const mailOptions = {
      from: `"TigerTix OTP Service" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your One-Time Password (OTP)",
      text: `Your OTP code is: ${otp}\n\nThis code will expire in 5 minutes. Do not share it with anyone.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
});

module.exports = router;
