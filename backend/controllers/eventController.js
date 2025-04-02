const db = require("../models");
const { Event, Ticket, ClaimingSlot } = db;
const { Op } = require("sequelize");

// Create a new event directly (not as draft)
exports.createEvent = async (req, res) => {
  try {
    const eventData = req.body;

    // Set status and visibility if not provided
    if (!eventData.status) {
      eventData.status = "scheduled";
    }
    if (!eventData.visibility) {
      eventData.visibility = "published";
    }

    const event = await Event.create(eventData);

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: {
        event_id: event.id,
        ...event.toJSON(),
      },
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: error.message,
    });
  }
};
// Create a draft event
exports.createDraftEvent = async (req, res) => {
  try {
    const eventData = req.body;

    // Ensure draft events are set with correct defaults
    eventData.status = "draft";
    eventData.visibility = "unpublished";

    const event = await Event.create(eventData);

    return res.status(201).json({
      success: true,
      message: "Draft event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error creating draft event:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create draft event",
      error: error.message,
    });
  }
};

// Get all draft events
exports.getDraftEvents = async (req, res) => {
  try {
    const draftEvents = await Event.findAll({
      where: {
        status: "draft",
        visibility: "unpublished",
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: draftEvents.length,
      data: draftEvents,
    });
  } catch (error) {
    console.error("Error fetching draft events:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch draft events",
      error: error.message,
    });
  }
};

// Update a draft event
exports.updateDraftEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const event = await Event.findOne({
      where: {
        id,
        status: "draft",
        visibility: "unpublished",
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Draft event not found",
      });
    }

    await event.update(updateData);

    return res.status(200).json({
      success: true,
      message: "Draft event updated successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error updating draft event:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update draft event",
      error: error.message,
    });
  }
};

// Publish a draft event
exports.publishEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      where: {
        id,
        status: "draft",
        visibility: "unpublished",
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Draft event not found",
      });
    }

    // Ensure required fields are present for publishing
    const requiredFields = ["name", "event_date", "venue", "event_type"];
    const missingFields = requiredFields.filter((field) => !event[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields to publish: ${missingFields.join(
          ", "
        )}`,
      });
    }

    // Update event to published state
    await event.update({
      status: "scheduled",
      visibility: "published",
    });

    return res.status(200).json({
      success: true,
      message: "Draft event published successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error publishing draft event:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to publish draft event",
      error: error.message,
    });
  }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id, {
      include: [
        {
          model: Ticket,
          as: "tickets",
          attributes: [
            "ticket_id",
            "seat_type",
            "ticket_type",
            "price",
            "total_quantity",
            "tickets_sold",
          ],
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
    console.error("Error fetching event:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch event",
      error: error.message,
    });
  }
};

// Get archived events
exports.getArchivedEvents = async (req, res) => {
  try {
    const archivedEvents = await Event.findAll({
      where: {
        visibility: "archived",
      },
      order: [["updatedAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: archivedEvents.length,
      data: archivedEvents,
    });
  } catch (error) {
    console.error("Error fetching archived events:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch archived events",
      error: error.message,
    });
  }
};

// Existing methods from previous implementation with slight modifications
exports.getAllEvents = async (req, res) => {
  try {
    const {
      status,
      visibility,
      category,
      event_type,
      search,
      from_date,
      to_date,
      display_start,
      display_end,
    } = req.query;

    const whereConditions = {};

    if (status) whereConditions.status = status;
    if (visibility) whereConditions.visibility = visibility;
    if (category) whereConditions.category = category;
    if (event_type) whereConditions.event_type = event_type;

    if (from_date || to_date) {
      whereConditions.event_date = {};
      if (from_date) whereConditions.event_date[Op.gte] = from_date;
      if (to_date) whereConditions.event_date[Op.lte] = to_date;
    }

    if (display_start || display_end) {
      whereConditions.display_start_date = {};
      if (display_start)
        whereConditions.display_start_date[Op.gte] = display_start;
      if (display_end) whereConditions.display_start_date[Op.lte] = display_end;
    }

    if (search) {
      whereConditions.name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const events = await Event.findAll({
      where: whereConditions,
      order: [["event_date", "ASC"]],
      include: [
        {
          model: Ticket,
          as: "tickets",
          attributes: [
            "ticket_id",
            "seat_type",
            "ticket_type",
            "price",
            "total_quantity",
            "tickets_sold",
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Prevent updates to draft events via this method
    if (event.status === "draft") {
      return res.status(400).json({
        success: false,
        message: "Use specific draft event update endpoint",
      });
    }

    // Status change validations
    if (updateData.status) {
      // Cancellation rules
      if (updateData.status === "cancelled") {
        if (event.visibility !== "published") {
          return res.status(400).json({
            success: false,
            message: "Only published events can be cancelled",
          });
        }
      }

      // Validate allowed status transitions
      const allowedTransitions = {
        draft: ["scheduled"],
        scheduled: ["open", "cancelled"],
        open: ["closed", "cancelled"],
        closed: [],
        cancelled: [],
      };

      const currentStatus = event.status;
      const newStatus = updateData.status;

      if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from ${currentStatus} to ${newStatus}`,
        });
      }
    }

    await event.update(updateData);

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error.message,
    });
  }
};

// Change event status
exports.changeEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // Validate status value
    const validStatuses = ["draft", "scheduled", "open", "closed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Validation for status changes
    const allowedTransitions = {
      draft: ["scheduled"],
      scheduled: ["open", "cancelled"],
      open: ["closed", "cancelled"],
      closed: [],
      cancelled: [],
    };

    const currentStatus = event.status;
    if (!allowedTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${status}`,
      });
    }

    // Special handling for different statuses
    let updateData = { status };
    if (status === "draft") {
      updateData.visibility = "unpublished";
    } else if (status === "scheduled") {
      updateData.visibility = "published";
    } else if (status === "cancelled") {
      // Only published events can be cancelled
      if (event.visibility !== "published") {
        return res.status(400).json({
          success: false,
          message: "Only published events can be cancelled",
        });
      }
    }

    await event.update(updateData);

    return res.status(200).json({
      success: true,
      message: `Event status changed to ${status}`,
      data: { status },
    });
  } catch (error) {
    console.error("Error changing event status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change event status",
      error: error.message,
    });
  }
};

// Cancel an event
exports.cancelEvent = async (req, res) => {
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
      visibility: "archived",
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
      message: "Failed to cancel event",
      error: error.message,
    });
  }
};

// Archive an event
exports.archiveEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if the event has any tickets sold
    const ticketsWithSales = await Ticket.findOne({
      where: {
        event_id: id,
        tickets_sold: { [Op.gt]: 0 },
      },
    });

    if (ticketsWithSales) {
      return res.status(400).json({
        success: false,
        message: "Cannot archive event with sold tickets",
      });
    }

    // Update event to archived state
    await event.update({
      visibility: "archived",
      status: "closed",
      is_permanent_delete_allowed: true,
    });

    return res.status(200).json({
      success: true,
      message: "Event archived successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error archiving event:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to archive event",
      error: error.message,
    });
  }
};

// Permanent deletion from archive
exports.permanentDeleteFromArchive = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Only allow permanent deletion from archived events
    if (event.visibility !== "archived") {
      return res.status(400).json({
        success: false,
        message: "Event can only be permanently deleted from archive",
      });
    }

    // Check if permanent deletion is allowed
    if (!event.is_permanent_delete_allowed) {
      return res.status(400).json({
        success: false,
        message: "Permanent deletion is not allowed for this event",
      });
    }

    // Perform permanent deletion
    await event.destroy();

    return res.status(200).json({
      success: true,
      message: "Event permanently deleted",
    });
  } catch (error) {
    console.error("Error permanently deleting event:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to permanently delete event",
      error: error.message,
    });
  }
};
// Get event image
exports.getEventImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the event
    const event = await Event.findByPk(id, {
      attributes: ["image"],
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!event.image) {
      return res.status(404).json({
        success: false,
        message: "No image found for this event",
      });
    }

    return res.status(200).json({
      success: true,
      imageUrl: event.image,
    });
  } catch (error) {
    console.error("Error fetching event image:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch event image",
      error: error.message,
    });
  }
};

// Validate event status transitions
const validateStatusTransition = (currentStatus, newStatus) => {
  const allowedTransitions = {
    draft: ["scheduled", "closed"],
    scheduled: ["open", "cancelled", "closed"],
    open: ["closed", "cancelled"],
    closed: [],
    cancelled: [],
  };

  return allowedTransitions[currentStatus]?.includes(newStatus) || false;
};
// Get upcoming events
exports.getUpcomingEvents = async (req, res) => {
  try {
    const currentDate = new Date();

    const upcomingEvents = await Event.findAll({
      where: {
        event_date: {
          [Op.gte]: currentDate,
        },
        visibility: "published",
        status: {
          [Op.notIn]: ["cancelled", "draft"],
        },
      },
      order: [["event_date", "ASC"]],
      include: [
        {
          model: Ticket,
          as: "tickets",
          attributes: [
            "ticket_id",
            "seat_type",
            "ticket_type",
            "price",
            "total_quantity",
            "tickets_sold",
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: upcomingEvents.length,
      data: upcomingEvents,
    });
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming events",
      error: error.message,
    });
  }
};
// Upload event image
// Upload general image (without requiring an event ID)
exports.uploadGeneralImage = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    // Construct image URL (adjust based on your storage setup)
    const imageUrl = `/uploads/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: error.message,
    });
  }
};
exports.uploadEventImage = async (req, res) => {
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

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    // Construct image URL (adjust this based on your storage setup)
    const imageUrl = `/uploads/${req.file.filename}`;

    // Update event with image URL
    await event.update({ image: imageUrl });

    return res.status(200).json({
      success: true,
      message: "Event image uploaded successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading event image:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload event image",
      error: error.message,
    });
  }
};

// Additional helper methods can be added here as needed

module.exports = {
  createEvent: exports.createEvent,
  createDraftEvent: exports.createDraftEvent,
  getDraftEvents: exports.getDraftEvents,
  updateDraftEvent: exports.updateDraftEvent,
  publishEvent: exports.publishEvent,
  getEventById: exports.getEventById,
  getArchivedEvents: exports.getArchivedEvents,
  getAllEvents: exports.getAllEvents,
  updateEvent: exports.updateEvent,
  changeEventStatus: exports.changeEventStatus,
  cancelEvent: exports.cancelEvent,
  archiveEvent: exports.archiveEvent,
  permanentDeleteFromArchive: exports.permanentDeleteFromArchive,
  getUpcomingEvents: exports.getUpcomingEvents,
  uploadEventImage: exports.uploadEventImage,
  getEventImage: exports.getEventImage,
  uploadGeneralImage: exports.uploadGeneralImage,
  validateStatusTransition,
};
