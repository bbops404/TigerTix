const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate"); // Import middleware

// Define a protected route
router.get("/", authenticate, (req, res) => {
  res.status(200).json({
    message: `Welcome, ${req.user.username}! You have access to this protected route.`,
  });
});

module.exports = router; // ✅ Ensure you are exporting the router
