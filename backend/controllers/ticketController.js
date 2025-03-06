const { Ticket, Event } = require("../models");

// ✅ Create multiple tickets for an event
exports.createTickets = async (req, res) => {
  try {
    const { event_id } = req.params;
    const tickets = req.body.tickets; // Expecting an array of tickets

    // Check if the event exists
    const event = await Event.findByPk(event_id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Validate input
    if (!Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({ message: "Invalid ticket data" });
    }

    // Insert multiple tickets
    const createdTickets = await Ticket.bulkCreate(
      tickets.map((ticket) => ({
        event_id,
        seat_type: ticket.seat_type,
        ticket_type: ticket.ticket_type,
        price: ticket.price,
        quantity: ticket.quantity,
      }))
    );

    return res.status(201).json({
      message: "Tickets created successfully",
      tickets: createdTickets,
    });
  } catch (error) {
    console.error("Error creating tickets:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Edit a specific ticket
exports.editTicket = async (req, res) => {
  try {
    const { ticket_id } = req.params;
    const { seat_type, ticket_type, price, quantity } = req.body;

    // Check if the ticket exists
    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Update ticket details
    ticket.seat_type = seat_type || ticket.seat_type;
    ticket.ticket_type = ticket_type || ticket.ticket_type;
    ticket.price = price !== undefined ? price : ticket.price;
    ticket.quantity = quantity !== undefined ? quantity : ticket.quantity;

    await ticket.save();

    return res
      .status(200)
      .json({ message: "Ticket updated successfully", ticket });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Delete a single ticket OR all tickets for an event
exports.deleteTicket = async (req, res) => {
  try {
    const { ticket_id, event_id } = req.params;

    if (ticket_id) {
      // Delete a specific ticket
      const ticket = await Ticket.findByPk(ticket_id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      await ticket.destroy();
      return res.status(200).json({ message: "Ticket deleted successfully" });
    } else if (event_id) {
      // Delete all tickets for an event
      await Ticket.destroy({ where: { event_id } });
      return res
        .status(200)
        .json({ message: "All tickets for this event deleted successfully" });
    }

    return res.status(400).json({ message: "Invalid request" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get all tickets for an event
exports.getTicketsByEvent = async (req, res) => {
  try {
    const { event_id } = req.params;

    // Fetch all tickets for the event
    const tickets = await Ticket.findAll({ where: { event_id } });

    if (tickets.length === 0) {
      return res
        .status(404)
        .json({ message: "No tickets found for this event" });
    }

    return res.status(200).json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
