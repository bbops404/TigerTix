// controllers/ticketController.js
const db = require("../models");
const Ticket = db.Ticket;
const Event = db.Event;

const ticketController = {
  // Create a single ticket tier
  createTicket: async (req, res) => {
    try {
      const { event_id } = req.params;
      const { seat_type, ticket_type, price, total_quantity, max_per_user } =
        req.body;

      // Validate required fields
      if (!seat_type || !ticket_type || !total_quantity) {
        return res.status(400).json({
          success: false,
          message: "Missing required ticket details",
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

      // Create the ticket tier
      const newTicket = await Ticket.create({
        event_id,
        seat_type,
        ticket_type,
        price: price || 0,
        total_quantity,
        remaining_quantity: total_quantity, // Initially same as total
        max_per_user: max_per_user || 1,
      });

      console.log("New Ticket Created:", newTicket);
      
      return res.status(201).json({
        success: true,
        message: "Ticket tier created successfully",
        data: newTicket,
      });
    } catch (error) {
      console.error("Error creating ticket tier:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Create multiple ticket tiers at once
  createTicketsBulk: async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const { event_id } = req.params;
      const ticketTiers = req.body;

      if (!Array.isArray(ticketTiers) || ticketTiers.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Invalid ticket tiers data",
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

      // Create all ticket tiers
      const createdTickets = await Promise.all(
        ticketTiers.map((tier) => {
          return Ticket.create(
            {
              event_id,
              seat_type: tier.seat_type,
              ticket_type: tier.ticket_type,
              price: tier.price || 0,
              total_quantity: tier.total_quantity,
              remaining_quantity: tier.total_quantity,
              max_per_user: tier.max_per_user || 1,
            },
            { transaction }
          );
        })
      );

      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: "Ticket tiers created successfully",
        data: createdTickets,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error creating ticket tiers:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Get all ticket tiers for an event
  getEventTickets: async (req, res) => {
    try {
      const { event_id } = req.params;

      const tickets = await Ticket.findAll({
        where: { event_id },
        order: [["price", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        data: tickets,
      });
    } catch (error) {
      console.error("Error fetching tickets:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Update a ticket tier
  updateTicket: async (req, res) => {
    try {
      const { ticket_id } = req.params;
      const { seat_type, ticket_type, price, total_quantity, max_per_user } =
        req.body;

      const ticket = await Ticket.findByPk(ticket_id);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Ticket tier not found",
        });
      }

      // Calculate the difference for remaining tickets
      const quantityDifference = total_quantity - ticket.total_quantity;
      const newRemainingQuantity =
        ticket.remaining_quantity + quantityDifference;

      // Ensure remaining quantity doesn't go negative
      if (newRemainingQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot reduce total quantity below reservations made",
        });
      }

      await ticket.update({
        seat_type: seat_type || ticket.seat_type,
        ticket_type: ticket_type || ticket.ticket_type,
        price: price !== undefined ? price : ticket.price,
        total_quantity: total_quantity || ticket.total_quantity,
        remaining_quantity: newRemainingQuantity,
        max_per_user: max_per_user || ticket.max_per_user,
      });

      return res.status(200).json({
        success: true,
        message: "Ticket tier updated successfully",
        data: ticket,
      });
    } catch (error) {
      console.error("Error updating ticket tier:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Delete a ticket tier
  deleteTicket: async (req, res) => {
    try {
      const { ticket_id } = req.params;

      const ticket = await Ticket.findByPk(ticket_id);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Ticket tier not found",
        });
      }

      // Check if tickets from this tier have been reserved (remaining < total)
      if (ticket.remaining_quantity < ticket.total_quantity) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete ticket tier with active reservations",
        });
      }

      await ticket.destroy();

      return res.status(200).json({
        success: true,
        message: "Ticket tier deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting ticket tier:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = ticketController;
