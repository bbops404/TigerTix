const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate"); // Middleware for auth
const authorizeAdmin = require("../middleware/authorizeAdmin.js"); // Middleware for admin access
const adminController = require("../controllers/adminController"); // Admin controller
const adminDashboardController = require("../controllers/adminDashboardController"); // Admin controller

// Routes for Admin Dashboard
router.get(
  "/dashboard/metrics",
  authenticate,
  authorizeAdmin,
  adminDashboardController.getDashboardMetrics
);
router.get(
  "/upcoming-events",
  authenticate,
  authorizeAdmin,
  adminDashboardController.getUpcomingEvents
);
router.get(
  "/recent-reservations",
  authenticate,
  authorizeAdmin,
  adminDashboardController.getRecentReservations
);
// Get ticketed events
router.get(
  "/ticketed-events",
  authenticate,
  authorizeAdmin,
  adminDashboardController.getTicketedEvents
);
router.get(
  "/event-claiming-status/:eventId",
  authenticate,
  authorizeAdmin,
  adminDashboardController.getEventClaimingStatus
);

// ✅ Protected route: Get all users (only for admin)
router.get("/users", authenticate, authorizeAdmin, adminController.getAllUsers);
router.post(
  "/generate-user-report",
  authenticate,
  authorizeAdmin,
  adminController.generateUserReport
);
router.post(
  "/generate-event-report",
  authenticate,
  authorizeAdmin,
  adminController.generateEventReport
);

// ✅ Protected route: Update user status (only for admin)
router.put(
  "/users/:id/status",
  authenticate,
  authorizeAdmin,
  adminController.updateUserStatus
);

// ✅ Protected route: Update user role (only for admin)
router.put(
  "/users/:id/role",
  authenticate,
  authorizeAdmin,
  adminController.updateUserType
);

// ✅ Protected route: Delete a user (only for admin)
router.delete(
  "/users/delete",
  authenticate,
  authorizeAdmin,
  adminController.deleteUser
); // Changed to handle multiple users

// ✅ Protected route: Add a new user (only for admin)
router.post(
  "/users/add",
  authenticate,
  authorizeAdmin,
  adminController.addUser
);
//  Check user restriction status
router.get(
  "/users/:id/restriction-status",
  authenticate,
  authorizeAdmin,
  adminController.checkUserRestrictions
);

// Reset user violations (amnesty function)
router.post(
  "/users/:id/reset-violations",
  authenticate,
  authorizeAdmin,
  adminController.resetUserViolations
);
router.post(
  "/users/update-all-restrictions",
  authenticate,
  authorizeAdmin,
  adminController.updateAllUserRestrictions
);

module.exports = router;
