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

      // Check if event exists
      const event = await Event.findByPk(event_id);
      if (!event) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
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
        // controllers/claimingSlotController.js (continued)
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

      const slot = await ClaimingSlot.findByPk(slot_id);

      if (!slot) {
        return res.status(404).json({
          success: false,
          message: "Claiming slot not found",
        });
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
};

module.exports = claimingSlotController;
