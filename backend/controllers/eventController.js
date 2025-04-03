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
      const { status, visibility, type, page = 1, limit = 10 } = req.query;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (visibility) whereClause.visibility = visibility;
      if (type) whereClause.event_type = type;

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
        venue,
        category,
        event_type,
        image,
        status,
        visibility,
        display_start_date,
        display_end_date,
        reservation_start,
        reservation_end,
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
          venue,
          image,
          category,
          event_type,
          status: status || defaultStatus,
          visibility: visibility || defaultVisibility,
          display_start_date,
          display_end_date,
          reservation_start,
          reservation_end,
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
        venue,
        category,
        event_type,
        status,
        visibility,
        image,
        display_start_date,
        display_end_date,
        reservation_start,
        reservation_end,
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

      if (event_type === "ticketed" && reservation_start && reservation_end) {
        const now = new Date();
        const resStart = new Date(reservation_start);
        const resEnd = new Date(reservation_end);

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
        venue: venue || event.venue,
        image: image || event.image,
        category: category || event.category,
        event_type: event_type || event.event_type,
        status: updatedStatus || event.status,
        visibility: visibility || event.visibility,
        display_start_date: display_start_date || event.display_start_date,
        display_end_date: display_end_date || event.display_end_date,
        reservation_start: reservation_start || event.reservation_start,
        reservation_end: reservation_end || event.reservation_end,
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
        imageUrl: imageUrl,
      });
    });
  },

  // Auto update event statuses based on dates
  updateEventStatuses: async () => {
    try {
      const now = new Date();

      // Find ticketed events that should be open (reservation period started)
      await Event.update(
        { status: "open" },
        {
          where: {
            event_type: "ticketed",
            status: "scheduled",
            visibility: "published",
            reservation_start: { [Op.lte]: now },
            reservation_end: { [Op.gt]: now },
          },
        }
      );

      // Find ticketed events that should be closed (reservation period ended)
      await Event.update(
        { status: "closed" },
        {
          where: {
            event_type: "ticketed",
            status: "open",
            visibility: "published",
            reservation_end: { [Op.lte]: now },
          },
        }
      );

      // Find events with display period ended
      await Event.update(
        { visibility: "unpublished" },
        {
          where: {
            visibility: "published",
            display_end_date: { [Op.lt]: now },
          },
        }
      );

      console.log("Event statuses updated successfully");
    } catch (error) {
      console.error("Error updating event statuses:", error);
    }
  },
};

module.exports = eventController;
