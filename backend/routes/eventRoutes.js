const express = require("express");
const router = express.Router();
const EventController = require("../controllers/eventController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");

const eventController = new EventController();

// Public event routes (for end users)
router.get("/public", eventController.getPublicEvents);
router.get("/public/:id", eventController.getPublicEvent);

// Protected routes (requires authentication)
router.use(authenticate);

// Admin-only routes (requires admin role)
router.use(authorizeAdmin);

// Draft event management
router.post("/draft", eventController.createDraftEvent);

// Full event creation and management
router.post("/", eventController.createEvent);
router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEvent);
router.put("/:id", eventController.updateEvent);
router.delete("/:id", eventController.deleteEvent);

// Ticket and claiming slot management
router.post("/:eventId/tickets", eventController.createTicketsBulk);
router.post(
  "/:eventId/claiming-slots",
  eventController.createClaimingSlotsBulk
);

// Event status management
router.post("/:id/publish", eventController.publishEvent);
router.post("/:id/cancel", eventController.cancelEvent);
router.post("/:id/archive", eventController.archiveEvent);
router.post("/:id/restore", eventController.restoreEvent);
router.delete("/:id/permanent", eventController.permanentlyDeleteEvent);

module.exports = router;
