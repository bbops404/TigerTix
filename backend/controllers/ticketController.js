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

      // Handle ticket creation for free events
      if (event.event_type === "free" && price > 0) {
        return res.status(400).json({
          success: false,
          message: "Free events cannot have paid tickets",
        });
      }

      // Create the ticket tier
      const newTicket = await Ticket.create({
        event_id,
        seat_type,
        ticket_type,
        price: event.event_type === "free" ? 0 : price || 0, // Ensure free events have 0 price
        total_quantity,
        remaining_quantity: total_quantity, // Initially same as total
        max_per_user: max_per_user || 1,
      });

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

      // Handle ticket creation for different event types
      let processedTiers = ticketTiers;

      // For free events: ensure all tickets have 0 price
      if (event.event_type === "free") {
        processedTiers = ticketTiers.map((tier) => ({
          ...tier,
          price: 0,
        }));
      }

      // Create all ticket tiers
      const createdTickets = await Promise.all(
        processedTiers.map((tier) => {
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

      // First, verify the event exists and check its type
      const event = await Event.findByPk(event_id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      const tickets = await Ticket.findAll({
        where: { event_id },
        order: [["price", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        data: tickets,
        event_type: event.event_type,
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

      const ticket = await Ticket.findByPk(ticket_id, {
        include: [{ model: Event, as: "event" }],
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Ticket tier not found",
        });
      }

      // For free events, enforce 0 price
      let updatedPrice = price;
      if (ticket.event && ticket.event.event_type === "free") {
        updatedPrice = 0;
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
        price: updatedPrice !== undefined ? updatedPrice : ticket.price,
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

  // Handle ticket transfers from one event to another (e.g., when converting from coming_soon to ticketed)
  transferTickets: async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const { source_event_id, target_event_id } = req.params;

      // Verify both events exist
      const sourceEvent = await Event.findByPk(source_event_id);
      const targetEvent = await Event.findByPk(target_event_id);

      if (!sourceEvent || !targetEvent) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "One or both events not found",
        });
      }

      // Get all tickets from source event
      const sourceTickets = await Ticket.findAll({
        where: { event_id: source_event_id },
      });

      if (sourceTickets.length === 0) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "No ticket tiers found in source event",
        });
      }

      // Create new tickets in target event based on source tickets
      const newTickets = await Promise.all(
        sourceTickets.map((ticket) => {
          // If target is free event, set price to 0
          const price = targetEvent.event_type === "free" ? 0 : ticket.price;

          return Ticket.create(
            {
              event_id: target_event_id,
              seat_type: ticket.seat_type,
              ticket_type: ticket.ticket_type,
              price: price,
              total_quantity: ticket.total_quantity,
              remaining_quantity: ticket.total_quantity, // Reset to full availability
              max_per_user: ticket.max_per_user,
            },
            { transaction }
          );
        })
      );

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Ticket tiers transferred successfully",
        data: newTickets,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error transferring tickets:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = ticketController;
