// controllers/eventController.js
const { Op } = require("sequelize");
const db = require("../models");
const Event = db.Event;
const Ticket = db.Ticket;
const ClaimingSlot = db.ClaimingSlot;
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/events";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
}).single("image");

const eventController = {
  // Get all events (with filtering options)
  getAllEvents: async (req, res) => {
    try {
      const {
        status,
        visibility,
        type,
        category,
        page = 1,
        limit = 10,
      } = req.query;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (visibility) whereClause.visibility = visibility;
      if (type) whereClause.event_type = type;
      if (category) whereClause.category = category;

      const offset = (page - 1) * limit;

      const events = await Event.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: offset,
        order: [["createdAt", "DESC"]],
        include: [
          { model: Ticket, as: "tickets" },
          { model: ClaimingSlot, as: "claimingSlots" },
        ],
      });

      return res.status(200).json({
        success: true,
        data: events.rows,
        total: events.count,
        totalPages: Math.ceil(events.count / limit),
        currentPage: parseInt(page),
      });
    } catch (error) {
      console.error("Error fetching events:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Get a single event by ID
  getEventById: async (req, res) => {
    try {
      const { id } = req.params;

      const event = await Event.findByPk(id, {
        include: [
          { model: Ticket, as: "tickets" },
          { model: ClaimingSlot, as: "claimingSlots" },
        ],
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error) {
      console.error("Error fetching event:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Create a new event
  createEvent: async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const {
        name,
        details,
        event_date,
        event_time,
        event_end_time,
        venue,
        category,
        event_type,
        image,
        status,
        visibility,
        display_start_date,
        display_end_date,
        display_start_time,
        display_end_time,
        reservation_start_date,
        reservation_start_time,
        reservation_end_date,
        reservation_end_time,
      } = req.body;

      // Validate required fields
      if (!name) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Event name is required",
        });
      }

      // Set default values based on event_type
      let defaultStatus, defaultVisibility;

      switch (event_type) {
        case "coming_soon":
          defaultStatus = "scheduled";
          defaultVisibility = "published";
          break;
        case "free":
          defaultStatus = "closed";
          defaultVisibility = "published";
          break;
        case "ticketed":
          defaultStatus = status || "scheduled";
          defaultVisibility = visibility || "published";
          break;
        default:
          defaultStatus = "draft";
          defaultVisibility = "unpublished";
      }

      // Create the event
      const newEvent = await Event.create(
        {
          name,
          details,
          event_date,
          event_time,
          event_end_time,
          venue,
          image,
          category,
          event_type,
          status: status || defaultStatus,
          visibility: visibility || defaultVisibility,
          display_start_date,
          display_end_date,
          display_start_time,
          display_end_time,
          reservation_start_date,
          reservation_start_time,
          reservation_end_date,
          reservation_end_time,
        },
        { transaction }
      );

      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: {
          event_id: newEvent.id,
          event: newEvent,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error creating event:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Create a draft event
  createDraftEvent: async (req, res) => {
    try {
      const {
        name,
        details,
        event_date,
        event_time,
        event_end_time,
        venue,
        category,
        event_type,
        image,
      } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Event name is required",
        });
      }

      // Create draft event with fixed status and visibility
      const newEvent = await Event.create({
        name,
        details,
        event_date,
        event_time,
        event_end_time,
        venue,
        image,
        category,
        event_type: event_type || "ticketed",
        status: "draft",
        visibility: "unpublished",
      });

      return res.status(201).json({
        success: true,
        message: "Draft event created successfully",
        data: {
          event_id: newEvent.id,
          event: newEvent,
        },
      });
    } catch (error) {
      console.error("Error creating draft event:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Update an existing event
  updateEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        details,
        event_date,
        event_time,
        event_end_time,
        venue,
        category,
        event_type,
        status,
        visibility,
        image,
        display_start_date,
        display_end_date,
        display_start_time,
        display_end_time,
        reservation_start_date,
        reservation_end_date,
        reservation_start_time,
        reservation_end_time,
      } = req.body;

      const event = await Event.findByPk(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Determine if we need to update status based on reservation period
      let updatedStatus = status;

      if (
        event_type === "ticketed" &&
        req.body.reservation_start_date &&
        req.body.reservation_end_date &&
        req.body.reservation_start_time &&
        req.body.reservation_end_time
      ) {
        const now = new Date();

        // Combine date and time fields
        const resStartStr = `${req.body.reservation_start_date}T${req.body.reservation_start_time}`;
        const resEndStr = `${req.body.reservation_end_date}T${req.body.reservation_end_time}`;

        const resStart = new Date(resStartStr);
        const resEnd = new Date(resEndStr);

        if (now < resStart) {
          updatedStatus = "scheduled";
        } else if (now >= resStart && now <= resEnd) {
          updatedStatus = "open";
        } else {
          updatedStatus = "closed";
        }
      }

      await event.update({
        name: name || event.name,
        details: details !== undefined ? details : event.details,
        event_date: event_date || event.event_date,
        event_time: event_time || event.event_time,
        event_end_time: event_end_time || event.event_end_time,
        venue: venue || event.venue,
        image: image || event.image,
        category: category || event.category,
        event_type: event_type || event.event_type,
        status: updatedStatus || event.status,
        visibility: visibility || event.visibility,
        display_start_date: display_start_date || event.display_start_date,
        display_end_date: display_end_date || event.display_end_date,
        display_start_time: display_start_time || event.display_start_time,
        display_end_time: display_end_time || event.display_end_time,
        reservation_start_date:
          reservation_start_date || event.reservation_start_date,
        reservation_start_time:
          reservation_start_time || event.reservation_start_time,
        reservation_end_date:
          reservation_end_date || event.reservation_end_date,
        reservation_end_time:
          reservation_end_time || event.reservation_end_time,
      });

      return res.status(200).json({
        success: true,
        message: "Event updated successfully",
        data: event,
      });
    } catch (error) {
      console.error("Error updating event:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Update event status (draft to published, coming soon to ticketed, etc.)
  updateEventStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, visibility, event_type } = req.body;

      const event = await Event.findByPk(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Validate status and event type combinations
      if (
        (status === "open" && event_type === "coming_soon") ||
        (status === "open" && event_type === "free")
      ) {
        return res.status(400).json({
          success: false,
          message: `${event_type} events cannot have an 'open' status`,
        });
      }

      // Update the event
      await event.update({
        status: status || event.status,
        visibility: visibility || event.visibility,
        event_type: event_type || event.event_type,
      });

      return res.status(200).json({
        success: true,
        message: "Event status updated successfully",
        data: event,
      });
    } catch (error) {
      console.error("Error updating event status:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Convert an event (e.g., coming soon to ticketed)
  convertEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const { event_type, status, visibility } = req.body;

      const event = await Event.findByPk(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Check for valid conversions
      const validConversions = {
        coming_soon: ["ticketed", "free"],
        free: ["ticketed"],
        ticketed: ["free"],
      };

      if (!validConversions[event.event_type].includes(event_type)) {
        return res.status(400).json({
          success: false,
          message: `Cannot convert from ${event.event_type} to ${event_type}`,
        });
      }

      // Update the event type and appropriate status/visibility
      let updatedStatus, updatedVisibility;

      switch (event_type) {
        case "ticketed":
          updatedStatus = status || "scheduled";
          updatedVisibility = visibility || "published";
          break;
        case "free":
          updatedStatus = status || "closed";
          updatedVisibility = visibility || "published";
          break;
        case "coming_soon":
          updatedStatus = status || "scheduled";
          updatedVisibility = visibility || "published";
          break;
        default:
          updatedStatus = event.status;
          updatedVisibility = event.visibility;
      }

      await event.update({
        event_type,
        status: updatedStatus,
        visibility: updatedVisibility,
      });

      return res.status(200).json({
        success: true,
        message: `Event converted from ${event.event_type} to ${event_type}`,
        data: event,
      });
    } catch (error) {
      console.error("Error converting event:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Cancel an event (only for published events)
  cancelEvent: async (req, res) => {
    try {
      const { id } = req.params;

      const event = await Event.findByPk(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Only published events can be cancelled
      if (event.visibility !== "published") {
        return res.status(400).json({
          success: false,
          message: "Only published events can be cancelled",
        });
      }

      await event.update({
        status: "cancelled",
      });

      return res.status(200).json({
        success: true,
        message: "Event cancelled successfully",
        data: event,
      });
    } catch (error) {
      console.error("Error cancelling event:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Archive an event (soft delete)
  archiveEvent: async (req, res) => {
    try {
      const { id } = req.params;

      const event = await Event.findByPk(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      if (event.visibility === "published" && event.status !== "cancelled") {
        return res.status(400).json({
          success: false,
          message: "Published events must be cancelled before archiving",
        });
      }

      await event.update({
        visibility: "archived",
        status: "closed",
      });

      return res.status(200).json({
        success: true,
        message: "Event archived successfully",
      });
    } catch (error) {
      console.error("Error archiving event:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Permanently delete an event (only from archive)
  permanentlyDeleteEvent: async (req, res) => {
    try {
      const { id } = req.params;

      const event = await Event.findByPk(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Only archived events can be permanently deleted
      if (event.visibility !== "archived") {
        return res.status(400).json({
          success: false,
          message: "Only archived events can be permanently deleted",
        });
      }

      // Force delete the event and its associated data
      await event.destroy({ force: true });

      return res.status(200).json({
        success: true,
        message: "Event permanently deleted",
      });
    } catch (error) {
      console.error("Error permanently deleting event:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Upload event image
  uploadEventImage: (req, res) => {
    upload(req, res, function (err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const imageUrl = `/uploads/events/${req.file.filename}`;

      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        imageUrl: `/uploads/events/${req.file.filename}`, // Notice the leading slas
      });
    });
  },

  // Auto update event statuses based on dates
  // Auto update event statuses and visibility
  updateEventStatuses: async () => {
    try {
      const now = new Date();

      // Convert today to YYYY-MM-DD format for date comparison
      const todayDate = now.toISOString().split("T")[0];
      const currentTime = now.toISOString().split("T")[1].substring(0, 8); // HH:MM:SS

      // Find events to update visibility
      const eventsToUpdateVisibility = await Event.findAll({
        where: {
          visibility: "published",
          // Check display period
          [Op.or]: [
            // Display period has ended
            {
              display_end_date: { [Op.lt]: todayDate },
            },
            // Display period hasn't started yet or has already ended
            {
              [Op.and]: [
                { display_start_date: { [Op.lte]: todayDate } },
                { display_end_date: { [Op.lt]: todayDate } },
              ],
            },
            // Specific time-based checks when end date is today
            {
              display_end_date: todayDate,
              display_end_time: { [Op.lte]: currentTime },
            },
          ],
        },
      });

      // Update visibility for events that should no longer be visible
      if (eventsToUpdateVisibility.length > 0) {
        await Event.update(
          { visibility: "unpublished" },
          {
            where: {
              id: eventsToUpdateVisibility.map((e) => e.id),
            },
          }
        );
      }

      // Find ticketed events to update reservation status
      const ticketedEventsToOpen = await Event.findAll({
        where: {
          event_type: "ticketed",
          status: "scheduled",
          visibility: "published",
          [Op.or]: [
            // Reservation start date is in the past
            {
              reservation_start_date: { [Op.lt]: todayDate },
            },
            // Reservation start date is today and time has passed
            {
              reservation_start_date: todayDate,
              reservation_start_time: { [Op.lte]: currentTime },
            },
          ],
          // Ensure reservation end hasn't passed
          [Op.and]: [
            {
              [Op.or]: [
                { reservation_end_date: { [Op.gt]: todayDate } },
                {
                  reservation_end_date: todayDate,
                  reservation_end_time: { [Op.gt]: currentTime },
                },
              ],
            },
          ],
        },
      });

      // Open reservation for eligible events
      if (ticketedEventsToOpen.length > 0) {
        await Event.update(
          { status: "open" },
          {
            where: {
              id: ticketedEventsToOpen.map((e) => e.id),
            },
          }
        );
      }

      // Find ticketed events to close reservations
      const ticketedEventsToClose = await Event.findAll({
        where: {
          event_type: "ticketed",
          status: "open",
          visibility: "published",
          [Op.or]: [
            // Reservation end date is in the past
            {
              reservation_end_date: { [Op.lt]: todayDate },
            },
            // Reservation end date is today and time has passed
            {
              reservation_end_date: todayDate,
              reservation_end_time: { [Op.lte]: currentTime },
            },
          ],
        },
      });

      // Close reservations for events that have passed
      if (ticketedEventsToClose.length > 0) {
        await Event.update(
          { status: "closed" },
          {
            where: {
              id: ticketedEventsToClose.map((e) => e.id),
            },
          }
        );
      }

      // Update status for completed events
      const completedEvents = await Event.findAll({
        where: {
          event_type: "ticketed",
          [Op.or]: [
            // Event date is in the past
            {
              event_date: { [Op.lt]: todayDate },
            },
            // Event date is today and end time has passed
            {
              event_date: todayDate,
              event_end_time: { [Op.lte]: currentTime },
            },
          ],
          // Ensure not already marked as cancelled or closed
          status: { [Op.notIn]: ["cancelled", "closed"] },
        },
      });

      // Mark completed events
      if (completedEvents.length > 0) {
        await Event.update(
          { status: "closed" },
          {
            where: {
              id: completedEvents.map((e) => e.id),
            },
          }
        );
      }

      console.log("Event statuses and visibility updated successfully");
    } catch (error) {
      console.error("Error updating event statuses:", error);
    }
  },

  // Get draft events
  getDraftEvents: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const events = await Event.findAndCountAll({
        where: {
          status: "draft",
          visibility: "unpublished",
        },
        limit: parseInt(limit),
        offset: offset,
        order: [["updatedAt", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        data: events.rows,
        total: events.count,
        totalPages: Math.ceil(events.count / limit),
        currentPage: parseInt(page),
      });
    } catch (error) {
      console.error("Error fetching draft events:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Get coming soon events
  getComingSoonEvents: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const events = await Event.findAndCountAll({
        where: {
          event_type: "coming_soon",
          visibility: "published",
        },
        limit: parseInt(limit),
        offset: offset,
        order: [["display_start_date", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        data: events.rows,
        total: events.count,
        totalPages: Math.ceil(events.count / limit),
        currentPage: parseInt(page),
      });
    } catch (error) {
      console.error("Error fetching coming soon events:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = eventController;
