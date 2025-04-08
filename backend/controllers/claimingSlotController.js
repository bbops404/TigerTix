// controllers/claimingSlotController.js
const db = require("../models");
const ClaimingSlot = db.ClaimingSlot;
const Event = db.Event;

const claimingSlotController = {
  // Create a single claiming slot
  createClaimingSlot: async (req, res) => {
    try {
      const { event_id } = req.params;
      const { claiming_date, start_time, end_time, venue, max_claimers } =
        req.body;

      // Validate required fields
      if (
        !claiming_date ||
        !start_time ||
        !end_time ||
        !venue ||
        !max_claimers
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required claiming slot details",
        });
      }

      // Check if event exists
      const event = await Event.findByPk(event_id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Validate event type - only ticketed events should have claiming slots
      if (event.event_type !== "ticketed") {
        return res.status(400).json({
          success: false,
          message: `${event.event_type} events cannot have claiming slots`,
        });
      }

      // Validate that claiming date is before event date
      if (event.event_date) {
        const eventDate = new Date(event.event_date);
        const claimingDateObj = new Date(claiming_date);

        if (claimingDateObj >= eventDate) {
          return res.status(400).json({
            success: false,
            message: "Claiming date must be before the event date",
          });
        }
      }

      // Create the claiming slot
      const newSlot = await ClaimingSlot.create({
        event_id,
        claiming_date,
        start_time,
        end_time,
        venue,
        max_claimers,
        current_claimers: 0, // Start with 0 claimers
      });

      return res.status(201).json({
        success: true,
        message: "Claiming slot created successfully",
        data: newSlot,
      });
    } catch (error) {
      console.error("Error creating claiming slot:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Create multiple claiming slots at once
  createClaimingSlotsBulk: async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const { event_id } = req.params;
      const claimingSlots = req.body;

      if (!Array.isArray(claimingSlots) || claimingSlots.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Invalid claiming slots data",
        });
      }

      // Check if event exists and validate event type
      const event = await Event.findByPk(event_id);
      if (!event) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Only ticketed events should have claiming slots
      if (event.event_type !== "ticketed") {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `${event.event_type} events cannot have claiming slots`,
        });
      }

      // Validate that all claiming dates are before event date
      if (event.event_date) {
        const eventDate = new Date(event.event_date);

        for (const slot of claimingSlots) {
          const claimingDateObj = new Date(slot.claiming_date);

          if (claimingDateObj >= eventDate) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message: "All claiming dates must be before the event date",
            });
          }
        }
      }

      // Create all claiming slots
      const createdSlots = await Promise.all(
        claimingSlots.map((slot) => {
          return ClaimingSlot.create(
            {
              event_id,
              claiming_date: slot.claiming_date,
              start_time: slot.start_time,
              end_time: slot.end_time,
              venue: slot.venue,
              max_claimers: slot.max_claimers,
              current_claimers: 0,
            },
            { transaction }
          );
        })
      );

      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: "Claiming slots created successfully",
        data: createdSlots,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error creating claiming slots:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Get all claiming slots for an event
  getEventClaimingSlots: async (req, res) => {
    try {
      const { event_id } = req.params;

      // Check if event exists and validate event type
      const event = await Event.findByPk(event_id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // For non-ticketed events, return empty array with appropriate message
      if (event.event_type !== "ticketed") {
        return res.status(200).json({
          success: true,
          message: `${event.event_type} events do not have claiming slots`,
          data: [],
          event_type: event.event_type,
        });
      }

      const slots = await ClaimingSlot.findAll({
        where: { event_id },
        order: [
          ["claiming_date", "ASC"],
          ["start_time", "ASC"],
        ],
      });

      return res.status(200).json({
        success: true,
        data: slots,
        event_type: event.event_type,
      });
    } catch (error) {
      console.error("Error fetching claiming slots:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Update a claiming slot
  updateClaimingSlot: async (req, res) => {
    try {
      const { slot_id } = req.params;
      const { claiming_date, start_time, end_time, venue, max_claimers } =
        req.body;

      const slot = await ClaimingSlot.findByPk(slot_id, {
        include: [{ model: Event, as: "event" }],
      });

      if (!slot) {
        return res.status(404).json({
          success: false,
          message: "Claiming slot not found",
        });
      }

      // Validate the claiming date against event date
      if (claiming_date && slot.event && slot.event.event_date) {
        const eventDate = new Date(slot.event.event_date);
        const claimingDateObj = new Date(claiming_date);

        if (claimingDateObj >= eventDate) {
          return res.status(400).json({
            success: false,
            message: "Claiming date must be before the event date",
          });
        }
      }

      // Ensure max_claimers doesn't go below current_claimers
      if (max_claimers !== undefined && max_claimers < slot.current_claimers) {
        return res.status(400).json({
          success: false,
          message: "Cannot reduce max claimers below current claimers",
        });
      }

      await slot.update({
        claiming_date: claiming_date || slot.claiming_date,
        start_time: start_time || slot.start_time,
        end_time: end_time || slot.end_time,
        venue: venue || slot.venue,
        max_claimers: max_claimers || slot.max_claimers,
      });

      return res.status(200).json({
        success: true,
        message: "Claiming slot updated successfully",
        data: slot,
      });
    } catch (error) {
      console.error("Error updating claiming slot:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Delete a claiming slot
  deleteClaimingSlot: async (req, res) => {
    try {
      const { slot_id } = req.params;

      const slot = await ClaimingSlot.findByPk(slot_id);

      if (!slot) {
        return res.status(404).json({
          success: false,
          message: "Claiming slot not found",
        });
      }

      // Check if the slot has active claimers
      if (slot.current_claimers > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete claiming slot with active claimers",
        });
      }

      await slot.destroy();

      return res.status(200).json({
        success: true,
        message: "Claiming slot deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting claiming slot:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Clear all claiming slots for an event
  clearEventClaimingSlots: async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const { event_id } = req.params;

      // Check if event exists
      const event = await Event.findByPk(event_id);
      if (!event) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Get all claiming slots for this event
      const slots = await ClaimingSlot.findAll({
        where: { event_id },
      });

      // Check if any slots have active claimers
      const activeSlots = slots.filter((slot) => slot.current_claimers > 0);

      if (activeSlots.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Cannot clear claiming slots with active claimers",
          activeSlots: activeSlots.length,
        });
      }

      // Delete all claiming slots for this event
      await ClaimingSlot.destroy({
        where: { event_id },
        transaction,
      });

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "All claiming slots deleted successfully",
        count: slots.length,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error clearing claiming slots:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  getAvailableClaimingSlots: async (req, res) => {
    try {
      const { event_id } = req.params;

      // Check if event exists
      const event = await Event.findByPk(event_id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Only ticketed events have claiming slots
      if (event.event_type !== "ticketed") {
        return res.status(200).json({
          success: true,
          message: `${event.event_type} events do not have claiming slots`,
          data: [],
          event_type: event.event_type,
        });
      }

      // Get all claiming slots for this event first
      const allSlots = await ClaimingSlot.findAll({
        where: { event_id },
        order: [
          ["claiming_date", "ASC"],
          ["start_time", "ASC"],
        ],
      });

      // Then filter in JavaScript to avoid database dialect issues
      const availableSlots = allSlots.filter(
        (slot) => slot.current_claimers < slot.max_claimers
      );

      return res.status(200).json({
        success: true,
        data: availableSlots,
      });
    } catch (error) {
      console.error("Error fetching available claiming slots:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = claimingSlotController;
