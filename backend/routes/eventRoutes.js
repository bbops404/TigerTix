// routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const ticketController = require("../controllers/ticketController");
const claimingSlotController = require("../controllers/claimingSlotController");
const authorizeAdmin = require("../middleware/authorizeAdmin.js"); // Middleware for admin access
const authenticate = require("../middleware/authenticate.js"); // Middleware for admin access
const adminController = require("../controllers/adminController"); // Admin controller


// Event routes
router.get("/events", authenticate, authorizeAdmin, eventController.getAllEvents);
router.get("/events/:id", authenticate, authorizeAdmin, eventController.getEventById);
router.post("/events", authenticate, authorizeAdmin, eventController.createEvent);
router.post("/events/draft", authenticate, authorizeAdmin, eventController.createDraftEvent);
router.put("/events/:id", authenticate, authorizeAdmin, eventController.updateEvent);
router.post("/events/cancel/:id", authenticate, authorizeAdmin, eventController.cancelEvent);
router.post("/events/archive/:id", authenticate, authorizeAdmin, eventController.archiveEvent);
router.delete("/events/:id", authenticate, authorizeAdmin, eventController.permanentlyDeleteEvent);
router.post("/events/upload-image", authenticate, authorizeAdmin, eventController.uploadEventImage);

// Ticket routes
router.get("/events/:event_id/tickets", authenticate, authorizeAdmin, ticketController.getEventTickets);
router.post("/events/:event_id/tickets", authenticate, authorizeAdmin, ticketController.createTicket);
router.post(
  "/events/:event_id/tickets/bulk",
  authenticate,
  authorizeAdmin,
  ticketController.createTicketsBulk
);
router.put("/tickets/:ticket_id", authenticate, authorizeAdmin, ticketController.updateTicket);
router.delete("/tickets/:ticket_id", authenticate, authorizeAdmin, ticketController.deleteTicket);

// Claiming slot routes
router.get(
  "/events/:event_id/claiming-slots",
  authenticate,
  authorizeAdmin,
  claimingSlotController.getEventClaimingSlots
);
router.post(
  "/events/:event_id/claiming-slots",
  authenticate,
  authorizeAdmin,
  claimingSlotController.createClaimingSlot
);
router.post(
  "/events/:event_id/claiming-slots/bulk",
  authenticate,
  authorizeAdmin,
  claimingSlotController.createClaimingSlotsBulk
);
router.put(
  "/claiming-slots/:slot_id",
  authenticate,
  authorizeAdmin,
  claimingSlotController.updateClaimingSlot
);
router.delete(
  "/claiming-slots/:slot_id",
  authenticate,
  authorizeAdmin,
  claimingSlotController.deleteClaimingSlot
);

module.exports = router;
