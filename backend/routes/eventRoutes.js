const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const ticketController = require("../controllers/ticketController");
const claimingSlotController = require("../controllers/claimingController");
const upload = require("../middleware/multerConfig");

// Event Creation and Management Routes
router.post("/events/draft", eventController.createDraftEvent);
router.get("/events/draft", eventController.getDraftEvents);
router.put("/events/:id/draft", eventController.updateDraftEvent);
router.post("/events", eventController.createEvent);

// Publish a draft event
router.patch("/events/:id/publish", eventController.publishEvent);

// Get Events with Comprehensive Filtering
router.get("/events", eventController.getAllEvents);
router.get("/events/upcoming", eventController.getUpcomingEvents);
router.get("/events/archived", eventController.getArchivedEvents);

// Event Details and Management
router.get("/events/:id", eventController.getEventById);
router.put("/events/:id", eventController.updateEvent);

// Event Status Management
router.patch("/events/:id/status", eventController.changeEventStatus);
router.patch("/events/:id/cancel", eventController.cancelEvent);
router.patch("/events/:id/archive", eventController.archiveEvent);

// Permanent Deletion (only from archive)
router.delete(
  "/events/:id/permanent-delete",
  eventController.permanentDeleteFromArchive
);

// Image Upload Routes
router.post(
  "/uploads/images",
  upload.single("image"),
  eventController.uploadGeneralImage
);
router.get("/events/:id/image", eventController.getEventImage);

// Ticket Routes
router.post("/events/:event_id/tickets", ticketController.createTicket);
router.get("/events/:event_id/tickets", ticketController.getEventTickets);
router.get("/tickets/:id", ticketController.getTicketById);
router.put("/tickets/:id", ticketController.updateTicket);
router.delete("/tickets/:id", ticketController.deleteTicket);
router.get(
  "/events/:event_id/ticket-availability",
  ticketController.getTicketAvailability
);
router.post(
  "/events/:event_id/tickets/bulk",
  ticketController.bulkCreateTickets
);

// Claiming Slot Routes
router.post(
  "/events/:event_id/claiming-slots",
  claimingSlotController.createClaimingSlot
);
router.get(
  "/events/:event_id/claiming-slots",
  claimingSlotController.getEventClaimingSlots
);
router.get("/claiming-slots/:id", claimingSlotController.getClaimingSlotById);
router.put("/claiming-slots/:id", claimingSlotController.updateClaimingSlot);
router.delete("/claiming-slots/:id", claimingSlotController.deleteClaimingSlot);
router.get(
  "/events/:event_id/claiming-slot-availability",
  claimingSlotController.getClaimingSlotAvailability
);
router.post(
  "/events/:event_id/claiming-slots/bulk",
  claimingSlotController.bulkCreateClaimingSlots
);
router.get(
  "/claiming-slots/:id/reservations",
  claimingSlotController.getClaimingSlotReservations
);

module.exports = router;
