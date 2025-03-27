const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Redis = require("ioredis");
const User = require('../models/Users');
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing
const { Sequelize } = require("sequelize");
const jwt = require("jsonwebtoken");

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

// Route to User login
router.post("/login", async (req, res) => {
    console.log("Received POST request:", req.body);  

    try {
        const { email, username, password } = req.body;

        // Ensure at least one of the fields is provided
        if (!email && !username || !password) {
            return res.status(400).json({ message: "Email/Username and Password are required" });
        }

        // Find user by email or username (case insensitive)
        const user = await User.findOne({
          where: {
              [Sequelize.Op.or]: [
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('email')), email ? email.toLowerCase() : ""),
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('username')), username ? username.toLowerCase() : "")
              ]
          }
      });
      

        // If no user found, send error response
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token (make sure to replace 'yourSecret' with your actual secret)
        const token = jwt.sign(
            { userId: user.id, email: user.email, username: user.username, role: user.role },
             process.env.JWT_SECRET, // secret key for JWT
            { expiresIn: '1h' } // set token expiry
        );

        // Send response with the token
        res.status(200).json({
            message: "Login successful",
            token: token, // return the token for frontend to store
            user: { email: user.email, username: user.username, role: user.role }
        });

    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Failed to log in. Please kry again." });
    }
});

module.exports = router;
