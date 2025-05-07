const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorizeAdmin = require("../middleware/authorizeAdmin.js"); // Middleware for admin access

const auditTrailController = require("../controllers/auditTrailController");

// GET /api/audit-trails - Fetch audit trail logs
router.get(
  "/",
  authenticate,
  authorizeAdmin,
  auditTrailController.getAuditTrails
);

// POST /api/audit-trails - Create a new audit trail entry
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  auditTrailController.createAuditTrail
);

module.exports = router;
