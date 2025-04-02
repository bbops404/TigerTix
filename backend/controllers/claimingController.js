const db = require("../models");
const { ClaimingSlot, Event, Reservation } = db;
const { Op } = require("sequelize");

// Create a new claiming slot
exports.createClaimingSlot = async (req, res) => {
  try {
    const { event_id } = req.params;
    const slotData = { ...req.body, event_id };

    // Verify the event exists
    const event = await Event.findByPk(event_id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Create the claiming slot
    const claimingSlot = await ClaimingSlot.create(slotData);

    return res.status(201).json({
      success: true,
      data: claimingSlot,
    });
  } catch (error) {
    console.error("Error creating claiming slot:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create claiming slot",
      error: error.message,
    });
  }
};

// Get all claiming slots for an event
exports.getEventClaimingSlots = async (req, res) => {
  try {
    const { event_id } = req.params;

    // Verify the event exists
    const event = await Event.findByPk(event_id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const claimingSlots = await ClaimingSlot.findAll({
      where: { event_id },
      order: [
        ["claiming_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    return res.status(200).json({
      success: true,
      count: claimingSlots.length,
      data: claimingSlots,
    });
  } catch (error) {
    console.error("Error fetching claiming slots:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch claiming slots",
      error: error.message,
    });
  }
};

// Get a single claiming slot by ID
exports.getClaimingSlotById = async (req, res) => {
  try {
    const { id } = req.params;

    const claimingSlot = await ClaimingSlot.findByPk(id, {
      include: [
        {
          model: Event,
          as: "event",
          attributes: ["event_id", "name", "event_date", "event_time", "venue"],
        },
      ],
    });

    if (!claimingSlot) {
      return res.status(404).json({
        success: false,
        message: "Claiming slot not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: claimingSlot,
    });
  } catch (error) {
    console.error("Error fetching claiming slot:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch claiming slot",
      error: error.message,
    });
  }
};

// Update a claiming slot
exports.updateClaimingSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the claiming slot
    const claimingSlot = await ClaimingSlot.findByPk(id, {
      include: [
        {
          model: Reservation,
          as: "reservations",
          attributes: ["reservation_id", "quantity"],
        },
      ],
    });

    if (!claimingSlot) {
      return res.status(404).json({
        success: false,
        message: "Claiming slot not found",
      });
    }

    // Check if updating max_claimers would conflict with current reservations
    if (
      updateData.max_claimers &&
      claimingSlot.current_claimers > updateData.max_claimers
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce maximum capacity below current reservations (${claimingSlot.current_claimers})`,
      });
    }

    // Update the claiming slot
    await claimingSlot.update(updateData);

    return res.status(200).json({
      success: true,
      data: claimingSlot,
    });
  } catch (error) {
    console.error("Error updating claiming slot:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update claiming slot",
      error: error.message,
    });
  }
};

// Delete a claiming slot
exports.deleteClaimingSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const claimingSlot = await ClaimingSlot.findByPk(id, {
      include: [
        {
          model: Reservation,
          as: "reservations",
        },
      ],
    });

    if (!claimingSlot) {
      return res.status(404).json({
        success: false,
        message: "Claiming slot not found",
      });
    }

    // Check if claiming slot has reservations
    if (claimingSlot.reservations && claimingSlot.reservations.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete claiming slot with existing reservations",
      });
    }

    await claimingSlot.destroy();

    return res.status(200).json({
      success: true,
      message: "Claiming slot deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting claiming slot:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete claiming slot",
      error: error.message,
    });
  }
};

// Get claiming slot availability
exports.getClaimingSlotAvailability = async (req, res) => {
  try {
    const { event_id } = req.params;

    // Verify the event exists
    const event = await Event.findByPk(event_id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const claimingSlots = await ClaimingSlot.findAll({
      where: { event_id },
      attributes: [
        "claiming_id",
        "claiming_date",
        "start_time",
        "end_time",
        "venue",
        "max_claimers",
        "current_claimers",
        [
          db.sequelize.literal("max_claimers - current_claimers"),
          "available_space",
        ],
      ],
      order: [
        ["claiming_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    return res.status(200).json({
      success: true,
      count: claimingSlots.length,
      data: claimingSlots,
    });
  } catch (error) {
    console.error("Error fetching claiming slot availability:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch claiming slot availability",
      error: error.message,
    });
  }
};

// Bulk create claiming slots for an event
exports.bulkCreateClaimingSlots = async (req, res) => {
  try {
    const { event_id } = req.params;
    const { claimingSlots } = req.body;

    if (!Array.isArray(claimingSlots) || claimingSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid claiming slots data. Expected an array of slot objects.",
      });
    }

    // Verify the event exists
    const event = await Event.findByPk(event_id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Add event_id to each claiming slot
    const slotsWithEventId = claimingSlots.map((slot) => ({
      ...slot,
      event_id,
      current_claimers: 0, // Initialize with zero claimers
    }));

    // Create all claiming slots
    const createdSlots = await ClaimingSlot.bulkCreate(slotsWithEventId, {
      validate: true,
    });

    return res.status(201).json({
      success: true,
      count: createdSlots.length,
      data: createdSlots,
    });
  } catch (error) {
    console.error("Error bulk creating claiming slots:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create claiming slots",
      error: error.message,
    });
  }
};

// Get reservations for a claiming slot (admin only)
exports.getClaimingSlotReservations = async (req, res) => {
  try {
    const { id } = req.params;

    const claimingSlot = await ClaimingSlot.findByPk(id);

    if (!claimingSlot) {
      return res.status(404).json({
        success: false,
        message: "Claiming slot not found",
      });
    }

    const reservations = await Reservation.findAll({
      where: { claiming_slot_id: id },
      include: [
        {
          model: Ticket,
          as: "ticket",
          attributes: ["ticket_id", "ticket_type", "price"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error("Error fetching claiming slot reservations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reservations",
      error: error.message,
    });
  }
};
