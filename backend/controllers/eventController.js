const { Event } = require("../models");

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving event" });
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const newEvent = await Event.create(req.body);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    await event.update(req.body);
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Archiving an event
exports.archiveEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    await event.update({ visibility: "archived" }); // Soft delete
    res.status(200).json({ message: "Event archived successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error archiving event" });
  }
};
// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    await event.destroy();
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting event" });
  }
};

// Update reservation period or Add reservation period
exports.updateReservationPeriod = async (req, res) => {
  try {
    const { event_id } = req.params;
    const { reservation_start, reservation_end } = req.body;

    // Check if event exists
    const event = await Event.findByPk(event_id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Update reservation period
    event.reservation_start = reservation_start;
    event.reservation_end = reservation_end;
    await event.save();

    return res.status(200).json({
      message: "Reservation period updated successfully",
      event,
    });
  } catch (error) {
    console.error("Error updating reservation period:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
