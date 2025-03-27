const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Redis = require("ioredis");
const User = require('../models/Users');
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing

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

router.post("/check-user", async (req, res) => {
    try {
      const { email } = req.body;
  
      // ✅ Find user in the database
      const existingUser = await User.findOne({ where: { email } });
  
      if (existingUser) {
        return res.status(200).json({ exists: true });
      }
  
      return res.status(200).json({ exists: false });
    } catch (error) {
      console.error("Error checking user:", error);
      return res.status(500).json({ message: "Server error. Please try again." });
    }
  });
  
  

// Send OTP Route
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate UST email domain
    if (!email.endsWith("@ust.edu.ph")) {
      return res.status(400).json({ message: "Only UST emails are allowed!" });
    }

    //check if the email is registered
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered. Please log in instead." });
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

//Verify OTP
router.post("/validate-otp", async(req, res)=> {
  try {
    const { email, otp } = req.body;

    // Check if OTP exists in Redis
    const storedOtp = await redis.get(`otp:${email}`);

    // If OTP doesn't exist or is incorrect, send an error
    if (!storedOtp) {
      return res.status(400).json({ message: "OTP has expired or is invalid." });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }


    // If OTP is valid, return success response and move to the next step
    res.json({ message: "OTP valid, please fill in your details." });

    // Optionally, delete OTP from Redis after successful validation
    await redis.del(`otp:${email}`);

  } catch (error) {
    console.error("Error validating OTP:", error);
    res.status(500).json({ message: "Error validating OTP." });
  }
});

// Route to User SignUp
router.post("/signUp", async (req, res) => {
    console.log("Received POST request:", req.body);  // Ensure you see this log

    try {
        const { email, firstName, lastName, username, password, role } = req.body;

        // Ensure the role is in lowercase (to avoid mismatched case errors with enum)
        const formattedRole = role ? role.toLowerCase() : "student"; // Default to 'student' if not provided
        
        // Check if the email is already registered
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        // Ensure all required fields are provided
        if (!email || !firstName || !lastName || !username || !password || !formattedRole) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Hash password before saving (use bcrypt or similar library)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user record in the database
        const newUser = await User.create({
            email,
            first_name: firstName,
            last_name: lastName,
            username,
            password_hash: hashedPassword,
            role: formattedRole, // Use the formatted role
            status: 'active', // default status
        });

        res.status(201).json({
            message: "Account created successfully!",
            user: { email, username, role: formattedRole }
        });

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Failed to create account. Please try again." });
    }
});

// Password Reset - Step 1: Request OTP for Reset
router.post("/request-password-reset", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email not found." });
    }

    // Generate and store OTP in Redis (expires in 5 minutes)
    const otp = generateOTP();
    await redis.set(`password-reset:${email}`, otp, "EX", 300);

    // Send email with OTP
    const mailOptions = {
      from: `"TigerTix Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is: ${otp}\n\nIt expires in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent for password reset." });

  } catch (error) {
    console.error("Error sending password reset OTP:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
});

// Password Reset - Step 2: Validate OTP
router.post("/validate-password-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Get stored OTP
    const storedOtp = await redis.get(`password-reset:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // OTP is valid → Allow password reset
    res.status(200).json({ message: "OTP verified. You may now reset your password." });

    // Remove OTP after successful verification
    await redis.del(`password-reset:${email}`);
    
  } catch (error) {
    console.error("Error validating password reset OTP:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
});


router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Check if the email exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Compare new password with the old one
    const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password must be different from the old password." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in the database
    await user.update({ password_hash: hashedPassword });

    res.status(200).json({ message: "Password reset successful!" });

  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
});


module.exports = router;
