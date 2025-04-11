const nodemailer = require("nodemailer");
const Redis = require("ioredis");
const bcrypt = require("bcryptjs");
const { Sequelize } = require("sequelize");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");

require("dotenv").config();

const redis = new Redis();

// Generate a 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Check if a user exists
exports.checkUser = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    res.status(200).json({ exists: !!existingUser });
  } catch (error) {
    console.error("Error checking user:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Send OTP for email verification
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email.endsWith("@ust.edu.ph")) {
      return res.status(400).json({ message: "Only UST emails are allowed!" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered. Please log in instead.",
      });
    }

    const otp = generateOTP();
    await redis.set(`otp:${email}`, otp, "EX", 300);

    await transporter.sendMail({
      from: `"TigerTix OTP Service" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your One-Time Password (OTP)",
      text: `Your OTP code is: ${otp}\n\nThis code will expire in 5 minutes. Do not share it with anyone.`,
    });

    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

// Validate OTP
exports.validateOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedOtp = await redis.get(`otp:${email}`);

    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    await redis.del(`otp:${email}`);
    res.json({ message: "OTP valid, please fill in your details." });
  } catch (error) {
    console.error("Error validating OTP:", error);
    res.status(500).json({ message: "Error validating OTP." });
  }
};

// User Sign-Up
exports.signUp = async (req, res) => {
  try {
    const { email, firstName, lastName, username, password, role } = req.body;
    const formattedRole = role ? role.toLowerCase() : "student";

    if (
      !email ||
      !firstName ||
      !lastName ||
      !username ||
      !password ||
      !formattedRole
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      first_name: firstName,
      last_name: lastName,
      username,
      password_hash: hashedPassword,
      role: formattedRole,
      status: "active",
    });

    res.status(201).json({
      message: "Account created successfully!",
      user: { email, username, role: formattedRole },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Failed to create account. Please try again." });
  }
};

// ✅ User Login
exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    console.log("Login attempt:", { email, username });

    if ((!email && !username) || !password) {
      console.log("Missing fields");
      return res
        .status(400)
        .json({ message: "Email/Username and Password are required" });
    }

    const user = await User.findOne({
      where: {
        [Sequelize.Op.or]: [
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("email")),
            email ? email.toLowerCase() : ""
          ),
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("username")),
            username ? username.toLowerCase() : ""
          ),
        ],
      },
    });

    console.log("User found:", user ? user.username : "Not Found");

    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Check if user account is suspended (FIRST THING AFTER USER LOOKUP)
    if (user.status === "suspended") {
      console.log("User account is suspended");
      return res.status(403).json({
        message:
          "Your account has been suspended. Please contact support for assistance.",
        suspended: true,
        details: {
          status: user.status,
          violationCount: user.violation_count,
        },
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    console.log("Password match:", passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token with CONSISTENT key naming
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Store token in Redis with expiration (1 hour)
    await redis.set(`session:${user.user_id}`, token, "EX", 3600);
    console.log(`✅ Token stored in Redis for session:${user.user_id}`);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS
      sameSite: "Lax",
      maxAge: 3600000, // 1 hour
    });

    console.log("✅ Cookie set successfully:", req.cookies); // Debug log

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        violation_count: user.violation_count,
        restriction_end_date: user.restriction_end_date,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Failed to log in. Please try again." });
  }
};

// User Logout
// Modified logout function in authController.js
exports.logout = async (req, res) => {
  try {
    // Get token from cookies, headers, or request body as fallback
    const token =
      req.cookies.token ||
      (req.headers.authorization &&
        req.headers.authorization.replace("Bearer ", "")) ||
      req.body.token;

    if (!token) {
      // If no token found, just clear the cookie and return success
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
      });

      return res.status(200).json({ message: "Logged out successfully" });
    }

    // If token exists, try to decode it to get the userId
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId || decoded.user_id;

      if (userId) {
        // Remove session from Redis
        await redis.del(`session:${userId}`);
      }
    } catch (error) {
      console.log("Error decoding token during logout:", error.message);
      // Continue with logout even if token is invalid
    }

    // Always clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Failed to log out" });
  }
};
// Request Password Reset OTP
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email not found." });
    }

    const otp = generateOTP();
    await redis.set(`password-reset:${email}`, otp, "EX", 300);

    await transporter.sendMail({
      from: `"TigerTix Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is: ${otp}\n\nIt expires in 5 minutes.`,
    });

    res.status(200).json({ message: "OTP sent for password reset." });
  } catch (error) {
    console.error("Error sending password reset OTP:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
};

// Validate Password Reset OTP
exports.validatePasswordResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedOtp = await redis.get(`password-reset:${email}`);

    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    await redis.del(`password-reset:${email}`);
    res
      .status(200)
      .json({ message: "OTP verified. You may now reset your password." });
  } catch (error) {
    console.error("Error validating password reset OTP:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
};
