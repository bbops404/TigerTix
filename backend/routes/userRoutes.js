// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticate = require("../middleware/authenticate");

// ===== USER ROUTES (require authentication) =====
// Get current user profile
router.get("/me", authenticate, userController.getCurrentUser);

// Update user profile (only own profile unless admin)
router.put("/:id", authenticate, userController.updateUserProfile);

// Change password (only own password unless admin)
router.put("/:id/change-password", authenticate, userController.changePassword);

// Validate emails (for reservations)
router.post(
  "/validate-emails",
  authenticate,
  userController.validateUserEmails
);

// Get user IDs from emails
router.post(
  "/get-ids-by-email",
  authenticate,
  userController.getUserIdsByEmail
);

// Get user reservations
router.get(
  "/:user_id/reservations",
  authenticate,
  userController.getUserReservations
);
// NEW: Get user restriction status
router.get(
  "/restriction-status",
  authenticate,
  userController.getUserRestrictionStatus
);

module.exports = router;
