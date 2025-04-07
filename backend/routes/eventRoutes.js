// routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const ticketController = require("../controllers/ticketController");
const claimingSlotController = require("../controllers/claimingSlotController");

  
const authorizeAdmin = require("../middleware/authorizeAdmin.js"); // Middleware for admin access
const authenticate = require("../middleware/authenticate.js"); // Middleware for admin access
const adminController = require("../controllers/adminController"); // Admin controller
const autoStatusCheck = require("../middleware/autoStatusCheck");
const { Op } = require("sequelize");
const Event = require("../models/Event");


// NON-PARAMETERIZED ROUTES FIRST
// Event routes without parameters
router.get("/events",authenticate, authorizeAdmin, eventController.getAllEvents);
router.get("/events/drafts",authenticate, authorizeAdmin, eventController.getDraftEvents);
router.get("/events/coming-soon",authenticate, authorizeAdmin, eventController.getComingSoonEvents);
router.post("/events",authenticate, authorizeAdmin, eventController.createEvent);
router.post("/events/draft",authenticate, authorizeAdmin, eventController.createDraftEvent);
router.post("/events/upload-image",authenticate, authorizeAdmin, eventController.uploadEventImage);
router.get("/events/ticketed",authenticate, authorizeAdmin, eventController.getTicketedEvents);
router.get("/events/coming-soon",authenticate, authorizeAdmin, eventController.getComingSoonEvents);
router.get("events/free-events",authenticate, authorizeAdmin, eventController.getFreeEvents);

// Status check endpoint (non-parameterized)
router.get("/events/check-status", async (req, res) => {
  try {
    const eventsToUpdate = await autoStatusCheck.checkAllEvents();

    if (eventsToUpdate.length > 0) {
      const updated = await autoStatusCheck.updateEventStatuses();

      // If using socket.io, notify clients about the updates
      if (req.io) {
        req.io.emit("events-updated", {
          updated,
          message: "Event statuses have been updated",
        });
      }

      return res.status(200).json({
        success: true,
        message: `${updated.length} events were updated`,
        updated,
      });
    }

    return res.status(200).json({
      success: true,
      message: "No events need status updates",
      updated: [],
    });
  } catch (error) {
    console.error("Error checking event statuses:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking event statuses",
      error: error.message,
    });
  }
});

// Upcoming status changes endpoint
router.get("/events/upcoming-status-changes", async (req, res) => {
  try {
    const now = new Date();
    const lookAheadMinutes = 10; // Look 10 minutes ahead

    // Find events that will have status changes soon
    const events = await Event.findAll({
      where: {
        [Op.or]: [
          // Events that will open reservation soon
          {
            status: "scheduled",
            event_type: "ticketed",
            visibility: "published",
            reservation_start_date: { [Op.not]: null },
            reservation_start_time: { [Op.not]: null },
          },
          // Events that will close reservation soon
          {
            status: "open",
            event_type: "ticketed",
            visibility: "published",
            reservation_end_date: { [Op.not]: null },
            reservation_end_time: { [Op.not]: null },
          },
          // Events that will be published soon
          {
            visibility: "unpublished",
            status: "scheduled",
            display_start_date: { [Op.not]: null },
            display_start_time: { [Op.not]: null },
          },
        ],
      },
    });

    // Filter to events with changes in the next few minutes
    const upcomingChanges = [];

    events.forEach((event) => {
      // Check reservation opening soon
      if (
        event.status === "scheduled" &&
        event.reservation_start_date &&
        event.reservation_start_time
      ) {
        const startTime = new Date(
          `${event.reservation_start_date}T${event.reservation_start_time}`
        );
        const timeDiff = (startTime - now) / (1000 * 60); // diff in minutes

        if (timeDiff > 0 && timeDiff <= lookAheadMinutes) {
          upcomingChanges.push({
            id: event.id,
            name: event.name,
            changeType: "open",
            scheduledTime: startTime,
            minutesRemaining: Math.round(timeDiff),
          });
        }
      }

      // Check reservation closing soon
      if (
        event.status === "open" &&
        event.reservation_end_date &&
        event.reservation_end_time
      ) {
        const endTime = new Date(
          `${event.reservation_end_date}T${event.reservation_end_time}`
        );
        const timeDiff = (endTime - now) / (1000 * 60); // diff in minutes

        if (timeDiff > 0 && timeDiff <= lookAheadMinutes) {
          upcomingChanges.push({
            id: event.id,
            name: event.name,
            changeType: "close",
            scheduledTime: endTime,
            minutesRemaining: Math.round(timeDiff),
          });
        }
      }

      // Check display starting soon
      if (
        event.visibility === "unpublished" &&
        event.display_start_date &&
        event.display_start_time
      ) {
        const startTime = new Date(
          `${event.display_start_date}T${event.display_start_time}`
        );
        const timeDiff = (startTime - now) / (1000 * 60); // diff in minutes

        if (timeDiff > 0 && timeDiff <= lookAheadMinutes) {
          upcomingChanges.push({
            id: event.id,
            name: event.name,
            changeType: "publish",
            scheduledTime: startTime,
            minutesRemaining: Math.round(timeDiff),
          });
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: upcomingChanges,
    });
  } catch (error) {
    console.error("Error fetching upcoming status changes:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching upcoming status changes",
      error: error.message,
    });
  }
});

// PARAMETERIZED ROUTES AFTER
// Event routes with parameters
router.get("/events/:id",authenticate, authorizeAdmin, eventController.getEventById);
router.put("/events/:id",authenticate, authorizeAdmin, eventController.updateEvent);
router.put("/events/:id/status",authenticate, authorizeAdmin, eventController.updateEventStatus);
router.post("/events/:id/convert",authenticate, authorizeAdmin, eventController.convertEvent);
router.post("/events/cancel/:id",authenticate, authorizeAdmin, eventController.cancelEvent);
router.post("/events/archive/:id",authenticate, authorizeAdmin, eventController.archiveEvent);
router.delete("/events/:id",authenticate, authorizeAdmin, eventController.permanentlyDeleteEvent);

// Event-specific endpoints with refresh status
router.post("/events/:id/refresh-status", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if status needs updating
    const statusUpdate = await autoStatusCheck.checkEventById(id);

    if (statusUpdate) {
      // Apply the update
      if (statusUpdate.newStatus) {
        await event.update({ status: statusUpdate.newStatus });
      }

      if (statusUpdate.newVisibility) {
        await event.update({ visibility: statusUpdate.newVisibility });
      }

      // If using socket.io, notify clients about the update
      if (req.io) {
        req.io.emit("event-updated", {
          eventId: id,
          update: statusUpdate,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Event status updated",
        event: {
          id: event.id,
          name: event.name,
          update: statusUpdate,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event status is up to date",
      event: {
        id: event.id,
        name: event.name,
      },
    });
  } catch (error) {
    console.error(`Error refreshing status for event ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: "Error refreshing event status",
      error: error.message,
    });
  }
});


// Ticket routes
router.get("/events/:event_id/tickets", authenticate, authorizeAdmin, ticketController.getEventTickets);
router.post("/events/:event_id/tickets", authenticate, authorizeAdmin, ticketController.createTicket);
router.post(
  "/events/:event_id/tickets/bulk",
  authenticate,
  authorizeAdmin,
  ticketController.createTicketsBulk
);

router.put("/tickets/:ticket_id",authenticate, authorizeAdmin, ticketController.updateTicket);
router.delete("/tickets/:ticket_id",authenticate, authorizeAdmin, ticketController.deleteTicket);
router.post(
  "/events/:source_event_id/tickets/transfer/:target_event_id",
  authenticate, authorizeAdmin, ticketController.transferTickets
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
router.get(
  "/events/:event_id/claiming-slots/available",
  claimingSlotController.getAvailableClaimingSlots
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
router.delete(
  "/events/:event_id/claiming-slots",
  claimingSlotController.clearEventClaimingSlots
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
