// routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const ticketController = require("../controllers/ticketController");
const claimingSlotController = require("../controllers/claimingSlotController");

// Event routes
router.get("/events", eventController.getAllEvents);
router.get("/events/:id", eventController.getEventById);
router.post("/events", eventController.createEvent);
router.post("/events/draft", eventController.createDraftEvent);
router.put("/events/:id", eventController.updateEvent);
router.post("/events/cancel/:id", eventController.cancelEvent);
router.post("/events/archive/:id", eventController.archiveEvent);
router.delete("/events/:id", eventController.permanentlyDeleteEvent);
router.post("/events/upload-image", eventController.uploadEventImage);

// Ticket routes
router.get("/events/:event_id/tickets", ticketController.getEventTickets);
router.post("/events/:event_id/tickets", ticketController.createTicket);
router.post(
  "/events/:event_id/tickets/bulk",
  ticketController.createTicketsBulk
);
router.put("/tickets/:ticket_id", ticketController.updateTicket);
router.delete("/tickets/:ticket_id", ticketController.deleteTicket);

// Claiming slot routes
router.get(
  "/events/:event_id/claiming-slots",
  claimingSlotController.getEventClaimingSlots
);
router.post(
  "/events/:event_id/claiming-slots",
  claimingSlotController.createClaimingSlot
);
router.post(
  "/events/:event_id/claiming-slots/bulk",
  claimingSlotController.createClaimingSlotsBulk
);
router.put(
  "/claiming-slots/:slot_id",
  claimingSlotController.updateClaimingSlot
);
router.delete(
  "/claiming-slots/:slot_id",
  claimingSlotController.deleteClaimingSlot
);

module.exports = router;
