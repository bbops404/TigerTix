const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");

// Create multiple tickets for an event
router.post("/events/:event_id/tickets", createTickets);

// Get all tickets for an event
router.get("/events/:event_id/tickets", getTicketsByEvent);

// Edit a specific ticket
router.put("/tickets/:ticket_id", editTicket);

// Delete a specific ticket
router.delete("/tickets/:ticket_id", deleteTicket);

// Delete all tickets for an event
router.delete("/events/:event_id/tickets", deleteTicket);

module.exports = router;
