const { Op } = require("sequelize");
const db = require("../models");
const Event = db.Event;
const Ticket = db.Ticket;
const ClaimingSlot = db.ClaimingSlot;
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { createAuditTrail } = require("./auditTrailController");

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
          { model: Ticket, as: "Tickets" },
          { model: ClaimingSlot, as: "ClaimingSlots" },
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
          { model: Ticket, as: "Tickets" },
          { model: ClaimingSlot, as: "ClaimingSlots" },
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

      // Log user data for debugging
      console.log("User data for audit log:", req.user);

      // Inside createEvent (after transaction.commit())
      await createAuditTrail({
        user_id: req.user.user_id, // Assuming `req.user` contains authenticated user details
        username: req.user.username,
        role: req.user.role,
        action: "Create Event",
        affectedEntity: "Event",
        message: `Created event "${newEvent.name}" with ID ${newEvent.id}.`,
        status: "Successful",
      });

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
      // Rollback the transaction in case of an error
      if (transaction) await transaction.rollback();

      console.error("Error creating event:", error);

      // Add audit log for failure
      await createAuditTrail({
        user_id: req.user?.user_id || "Unknown",
        username: req.user?.username || "Unknown",
        role: req.user?.role || "Unknown",
        action: "Create Event",
        affectedEntity: "Event",
        message: `Failed to create event. Error: ${error.message}`,
        status: "Failed",
      });

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
        status: updatedStatus || event.status,
        visibility: visibility || event.visibility,
        event_date: event_date || event.event_date,
        event_time: event_time || event.event_time,
        event_end_time: event_end_time || event.event_end_time,
        venue: venue || event.venue,
        image: image || event.image,
        category: category || event.category,
        event_type: event_type || event.event_type,
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

      // Add audit log if the event is published
      if (visibility === "published") {
        await createAuditTrail({
          user_id: req.user.user_id,
          username: req.user.username,
          role: req.user.role,
          action: "Publish Event",
          affectedEntity: "Event",
          message: `Published event "${event.name}" with ID ${event.id}.`,
          status: "Successful",
        });
      }

      await createAuditTrail({
        user_id: req.user.user_id,
        username: req.user.username,
        role: req.user.role,
        action: "Update Event",
        affectedEntity: "Event",
        message: `Updated event "${event.name}" with ID ${event.id}.`,
        status: "Successful",
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
  updateEventStatuses: async () => {
    try {
      const now = new Date();

      // Convert today to YYYY-MM-DD format for date comparison
      const todayDate = now.toISOString().split("T")[0];
      const currentTime = now.toISOString().split("T")[1].substring(0, 8); // HH:MM:SS

      // Find events to update visibility that have ended their display period
      const eventsToUpdateVisibility = await Event.findAll({
        where: {
          visibility: "published",
          // Only select events where both display end date AND time are specified
          display_end_date: { [Op.not]: null },
          display_end_time: { [Op.not]: null },
          // Check if display period has actually ended
          [Op.or]: [
            // Display end date is before today
            {
              display_end_date: { [Op.lt]: todayDate },
            },
            // Display end date is today and time has passed
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
        // Add audit log for each published event
        for (const event of eventsToUpdateVisibility) {
          await createAuditTrail({
            user_id: "system", // Use "system" for automated updates
            username: "system",
            role: "system",
            action: "Publish Event",
            affectedEntity: "Event",
            message: `Automatically published event "${event.name}" with ID ${event.id}.`,
            status: "Successful",
          });
        }

        console.log(
          `Updated visibility to 'unpublished' for ${eventsToUpdateVisibility.length} events`
        );
      }

      // Find scheduled events to open
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

        // Add audit log for each event
        for (const event of ticketedEventsToOpen) {
          await createAuditTrail({
            user_id: "system",
            username: "system",
            role: "system",
            action: "Open Reservation",
            affectedEntity: "Event",
            message: `Automatically opened reservation for event "${event.name}" with ID ${event.id}.`,
            status: "Successful",
          });
        }

        console.log(
          `Updated status to 'open' for ${ticketedEventsToOpen.length} events`
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

        // Add audit log for each event
        for (const event of ticketedEventsToClose) {
          await createAuditTrail({
            user_id: "system",
            username: "system",
            role: "system",
            action: "Close Reservation",
            affectedEntity: "Event",
            message: `Automatically closed reservation for event "${event.name}" with ID ${event.id}.`,
            status: "Successful",
          });
        }

        console.log(
          `Updated status to 'closed' for ${ticketedEventsToClose.length} events`
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

        console.log(
          `Updated status to 'closed' for ${completedEvents.length} completed events`
        );
      }

      console.log("Event statuses and visibility updated successfully");
    } catch (error) {
      console.error("Error updating event statuses:", error);
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

      // Add audit log if the event is published
      if (updatedVisibility === "published") {
        await createAuditTrail({
          user_id: req.user.user_id,
          username: req.user.username,
          role: req.user.role,
          action: "Publish Event",
          affectedEntity: "Event",
          message: `Published event "${event.name}" with ID ${event.id}.`,
          status: "Successful",
        });
      }

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

      await createAuditTrail({
        user_id: req.user.user_id,
        username: req.user.username,
        role: req.user.role,
        action: "Cancel Event",
        affectedEntity: "Event",
        message: `Cancelled event "${event.name}" with ID ${event.id}.`,
        status: "Successful",
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

      // Inside archiveEvent (after event.update())
      await createAuditTrail({
        user_id: req.user.user_id,
        username: req.user.username,
        role: req.user.role,
        action: "Archive Event",
        affectedEntity: "Event",
        message: `Archived event "${event.name}" with ID ${event.id}.`,
        status: "Successful",
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
  // Add this method to the eventController
  updateEventStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, visibility } = req.body;

      const event = await Event.findByPk(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Validate status and visibility
      const validStatuses = [
        "draft",
        "scheduled",
        "open",
        "closed",
        "cancelled",
      ];
      const validVisibilities = ["published", "unpublished", "archived"];

      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
          validStatuses: validStatuses,
        });
      }

      if (visibility && !validVisibilities.includes(visibility)) {
        return res.status(400).json({
          success: false,
          message: "Invalid visibility",
          validVisibilities: validVisibilities,
        });
      }

      // Update event status and/or visibility
      const updateData = {};
      if (status) updateData.status = status;
      if (visibility) updateData.visibility = visibility;

      await event.update(updateData);

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

      // Inside permanentlyDeleteEvent (after event.destroy())
      await createAuditTrail({
        user_id: req.user.user_id,
        username: req.user.username,
        role: req.user.role,
        action: "Delete Event",
        affectedEntity: "Event",
        message: `Permanently deleted event "${event.name}" with ID ${event.id}.`,
        status: "Successful",
      });
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
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File too large. Maximum file size is 5MB.",
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(500).json({
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

  // Get free events
  getFreeEvents: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const events = await Event.findAndCountAll({
        where: {
          event_type: "free",
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
      console.error("Error fetching free events:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Get ticketed events
  getTicketedEvents: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const events = await Event.findAndCountAll({
        where: {
          event_type: "ticketed",
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
      console.error("Error fetching ticketed events:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  getTicketedEventsById: async (req, res) => {
    try {
      const { id } = req.params; // Get the event ID from the request parameters

      const event = await Event.findByPk(id, {
        include: [
          {
            model: Ticket,
            as: "Tickets", // Use the alias defined in your Sequelize association
          },
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
      console.error("Error fetching ticketed event by ID:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  getComingSoonEventsbyId: async (req, res) => {
    try {
      const { id } = req.params; // Get the event ID from the request parameters

      const event = await Event.findByPk(id, {
        include: [
          {
            model: Ticket, // Include related tickets if applicable
            as: "Tickets", // Use the alias defined in your Sequelize association
          },
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
      console.error("Error fetching coming soon event by ID:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  getFreeEventsbyId: async (req, res) => {
    try {
      const { id } = req.params; // Get the event ID from the request parameters

      const event = await Event.findByPk(id, {
        include: [
          {
            model: Ticket, // Include related tickets if applicable
            as: "Tickets", // Use the alias defined in your Sequelize association
          },
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
      console.error("Error fetching free event by ID:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // get published ticketed events for users
  getTicketedEventsByIdForUser: async (req, res) => {
    try {
      const { id } = req.params;

      const event = await Event.findByPk(id, {
        include: [
          {
            model: Ticket,
            as: "Tickets",
          },
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
      console.error("Error fetching ticketed event for user by ID:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  getComingSoonEventsByIdForUser: async (req, res) => {
    try {
      const { id } = req.params;

      const event = await Event.findByPk(id, {
        include: [
          {
            model: Ticket,
            as: "Tickets",
          },
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
      console.error("Error fetching coming soon event for user by ID:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  getFreeEventsByIdForUser: async (req, res) => {
    try {
      const { id } = req.params;

      const event = await Event.findByPk(id, {
        include: [
          {
            model: Ticket,
            as: "Tickets",
          },
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
      console.error("Error fetching free event for user by ID:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  getPublishedTicketedEvents: async (req, res) => {
    try {
      const { limit = 4 } = req.query; // Limit the number of events to fetch (default: 4)

      const events = await Event.findAll({
        where: {
          visibility: "published", // Only fetch published events
          event_type: "ticketed", // Only fetch ticketed events
        },
        order: [["createdAt", "DESC"]], // Order by most recently created
        limit: parseInt(limit), // Limit the number of results
        attributes: ["id", "name", "details"], // Only fetch the name and details
      });

      return res.status(200).json({
        success: true,
        data: events,
      });
    } catch (error) {
      console.error("Error fetching published ticketed events:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  getPublishedEvents: async (req, res) => {
    try {
      const events = await Event.findAll({
        where: { visibility: "published" },
        attributes: ["id", "name", "event_date"], // Include event_date in the response
        order: [["createdAt", "DESC"]], // Order by most recent
      });

      return res.status(200).json({
        success: true,
        data: events,
      });
    } catch (error) {
      console.error("Error fetching published events:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  getEventSummary: async (req, res) => {
    try {
      const events = await Event.findAll({
        attributes: [
          "id", // Event ID
          "name", // Event Name
          "event_date", // Event Date
          "venue", // Event Venue
          "category", // Event Category
          "event_type", // Event Type
          "status", // Event Availability
          [
            db.sequelize.fn(
              "COUNT",
              db.sequelize.col("Reservations.reservation_id")
            ),
            "total_reservations",
          ],
          [
            db.sequelize.literal(`
              CASE
                WHEN "Event"."event_type" = 'free' THEN 0
                ELSE SUM(CASE WHEN "Reservations"."reservation_status" = 'claimed' THEN "Tickets"."price" ELSE 0 END)
              END
            `),
            "revenue",
          ],
          [
            db.sequelize.literal(`
            CASE
              WHEN "Event"."event_type" = 'free' THEN 'FREE'
              ELSE CAST("Tickets"."remaining_quantity" AS TEXT)
            END
          `),
            "remaining_tickets",
          ],
        ],
        include: [
          {
            model: Ticket,
            as: "Tickets",
            attributes: [],
          },
          {
            model: db.Reservation,
            as: "Reservations",
            attributes: [],
          },
        ],
        group: ["Event.id", "Tickets.remaining_quantity"],
        order: [["event_date", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        data: events, // Ensure the data field contains the array of events
      });
    } catch (error) {
      console.error("Error fetching event summary:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = eventController;
