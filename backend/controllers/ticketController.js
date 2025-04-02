const db = require("../models");
const { Ticket, Event, Reservation } = db;
const { Op } = require("sequelize");

// Create a new ticket type for an event
exports.createTicket = async (req, res) => {
  try {
    const { event_id } = req.params;
    const ticketData = { ...req.body, event_id };

    // Auto-set require_emails based on max_per_user
    if (ticketData.max_per_user > 1) {
      ticketData.require_emails = true;
    }

    // Verify the event exists
    const event = await Event.findByPk(event_id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Create the ticket
    const ticket = await Ticket.create(ticketData);

    return res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create ticket",
      error: error.message,
    });
  }
};

// Get all tickets for an event
exports.getEventTickets = async (req, res) => {
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

    const tickets = await Ticket.findAll({
      where: { event_id },
      order: [["price", "ASC"]], // Order by price, lowest first
    });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

// Get a single ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id, {
      include: [
        {
          model: Event,
          as: "event",
          attributes: [
            "event_id",
            "name",
            "event_date",
            "event_time",
            "venue",
            "status",
          ],
        },
        {
          model: Reservation,
          as: "reservations",
          attributes: [
            "reservation_id",
            "user_id",
            "quantity",
            "status",
            "created_at",
          ],
        },
      ],
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ticket",
      error: error.message,
    });
  }
};

// Update a ticket
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Auto-set require_emails if max_per_user is being updated
    if (updateData.max_per_user && updateData.max_per_user > 1) {
      updateData.require_emails = true;
    }

    // Find the ticket
    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Prevent updating if tickets have already been sold (except for certain fields)
    if (ticket.tickets_sold > 0) {
      const safeToUpdateFields = [
        "total_quantity",
        "max_per_user",
        "require_emails",
      ]; // Fields that can be updated after tickets are sold

      // Filter out unsafe fields if tickets have been sold
      Object.keys(updateData).forEach((key) => {
        if (!safeToUpdateFields.includes(key)) {
          delete updateData[key];
        }
      });

      // If trying to decrease quantity below tickets_sold
      if (
        updateData.total_quantity &&
        updateData.total_quantity < ticket.tickets_sold
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot reduce quantity below number of tickets already sold",
        });
      }
    }

    // Update the ticket
    await ticket.update(updateData);

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update ticket",
      error: error.message,
    });
  }
};

// Delete a ticket
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Prevent deletion if tickets have been sold
    if (ticket.tickets_sold > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete ticket type that has sold tickets",
      });
    }

    await ticket.destroy();

    return res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete ticket",
      error: error.message,
    });
  }
};

// Get ticket availability
exports.getTicketAvailability = async (req, res) => {
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

    const tickets = await Ticket.findAll({
      where: { event_id },
      attributes: [
        "ticket_id",
        "ticket_type",
        "price",
        "total_quantity",
        "tickets_sold",
        [db.sequelize.literal("total_quantity - tickets_sold"), "available"],
      ],
    });

    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching ticket availability:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ticket availability",
      error: error.message,
    });
  }
};

// Bulk create tickets for an event
exports.bulkCreateTickets = async (req, res) => {
  try {
    const { event_id } = req.params;
    const { tickets } = req.body;

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid tickets data. Expected an array of ticket objects.",
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

    // Add event_id to each ticket and set require_emails where needed
    const ticketsWithEventId = tickets.map((ticket) => {
      const ticketWithEventId = {
        ...ticket,
        event_id,
      };

      // Auto-set require_emails based on max_per_user
      if (ticket.max_per_user && ticket.max_per_user > 1) {
        ticketWithEventId.require_emails = true;
      }

      return ticketWithEventId;
    });

    // Create all tickets
    const createdTickets = await Ticket.bulkCreate(ticketsWithEventId, {
      validate: true,
    });

    return res.status(201).json({
      success: true,
      count: createdTickets.length,
      data: createdTickets,
    });
  } catch (error) {
    console.error("Error bulk creating tickets:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create tickets",
      error: error.message,
    });
  }
};
