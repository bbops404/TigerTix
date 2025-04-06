const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate"); // Middleware for auth
const authorizeAdmin = require("../middleware/authorizeAdmin.js"); // Middleware for admin access
const adminController = require("../controllers/adminController"); // Admin controller

// ✅ Protected route: Get all users (only for admin)
router.get("/users", authenticate, authorizeAdmin ,adminController.getAllUsers);

// ✅ Protected route: Update user status (only for admin)
router.put("/users/:id/status", authenticate, authorizeAdmin, adminController.updateUserStatus);

// ✅ Protected route: Update user role (only for admin)
router.put("/users/:id/role", authenticate, authorizeAdmin, adminController.updateUserType);

// ✅ Protected route: Delete a user (only for admin)
router.delete("/users/delete", authenticate, authorizeAdmin, adminController.deleteUser);  // Changed to handle multiple users

// ✅ Protected route: Add a new user (only for admin)
router.post("/users/add", authenticate, authorizeAdmin, adminController.addUser);



module.exports = router;
