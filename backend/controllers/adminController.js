const nodemailer = require("nodemailer");
const Redis = require("ioredis");
const bcrypt = require("bcryptjs");
const { Sequelize } = require("sequelize");
const jwt = require("jsonwebtoken");
const db = require("../models/Users"); // Import your User model
const crypto = require("crypto");

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.findAll({
      attributes: ["user_id","username", "email", "role", "first_name", "last_name", "status", "violation_count"]
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Delete multiple users
exports.deleteUser = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting an array of IDs in the request body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No user IDs provided" });
    }

    // Find all users with the provided IDs
    const users = await db.findAll({
      where: {
        user_id: ids,
      },
    });

    if (users.length === 0) {
      return res.status(404).json({ message: "Users not found" });
    }

    // Delete all the users found
    await Promise.all(users.map(user => user.destroy()));

    res.status(200).json({ message: `${users.length} user(s) deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: "Error deleting users", error });
  }
};

// Admin can add a user
exports.addUser = async (req, res) => {
  try {
    const { email, first_name, last_name, username, role } = req.body;
    const allowedRoles = ["admin", "student", "employee", "alumni", "support staff"];
    const formattedRole = role && allowedRoles.includes(role.toLowerCase()) ? role.toLowerCase() : "student";

    if (!email || !first_name || !last_name || !username || !formattedRole) {
      return res.status(400).json({ message: "All fields are required except password" });
    }

    // Check if the email is already registered
    const existingUser = await db.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Check if the username is already taken
    const existingUsername = await db.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    // Generate a temporary password
    const temporaryPassword = crypto.randomBytes(8).toString("hex"); // 16-character random password
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Create the new user
    const newUser = await db.create({
      email,
      first_name,
      last_name,
      username,
      password_hash: hashedPassword,
      role: formattedRole,
      status: "active",
    });

    // Send an email to the user with their temporary password
    await transporter.sendMail({
      from: `"TigerTix" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to TigerTix!",
      html: `
        <h1>Welcome to TigerTix, ${first_name}!</h1>
        <p>Your account has been successfully created. Here are your login details:</p>
        <ul>
          <li><strong>Username:</strong> ${username}</li>
          <li><strong>Temporary Password:</strong> ${temporaryPassword}</li>
        </ul>
        <p>Please log in and change your password as soon as possible.</p>
        <p>Thank you for joining TigerTix!</p>
      `,
    });

    res.status(201).json({
      message: "Account created successfully! A temporary password has been sent to the user's email.",
      user: { email, username, role: formattedRole },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create account. Please try again." });
  }
};

// Admin can update a user's status to "active", "restricted", or "suspended"
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;  // Assuming the status is sent in the request body

    // Check if the status is valid
    const validStatuses = ['active', 'restricted', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Allowed statuses are: active, restricted, suspended." });
    }

    // Ensure that all required fields are provided
    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    // Find the user in the database
    const user = await db.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's status
    user.status = status;

    // Save the changes
    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user. Please try again." });
  }
};

// Admin can update a user's role
exports.updateUserType= async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;  // Assuming the role is sent in the request body

    // Check if the role is valid
    const validRoles = ['admin', 'student', 'employee', 'alumni', 'support staff'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Allowed roles are: admin, student, employee, alumni, support staff." });
    }

    // Ensure that all required fields are provided
    if (!role) {
      return res.status(400).json({ message: "Role is required." });
    }

    // Find the user in the database
    const user = await db.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's role
    user.role = role;

    // Save the changes
    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user. Please try again." });
  }
};




