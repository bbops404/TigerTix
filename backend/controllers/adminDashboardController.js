const db = require("../models"); // Import your Sequelize models
const { Op } = require("sequelize");
const { get } = require("../routes/auth");

const adminDashboardController = {
  getDashboardMetrics: async (req, res) => {
    try {
      // Fetch total reservations
      const totalReservations = await db.Reservation.count();

      // Fetch total users
      const totalUsers = await db.User.count();

      // Fetch total events
      const totalEvents = await db.Event.count();

      // Fetch active events (ongoing or scheduled in the future)
      const activeEvents = await db.Event.count({
        where: {
          status: {
            [Op.in]: ["scheduled", "open"], // Include only scheduled or ongoing events
          },
        },
      });

      // Return the metrics
      return res.status(200).json({
        success: true,
        data: {
          totalReservations,
          totalUsers,
          totalEvents,
          activeEvents, // Replace completedEvents with activeEvents
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Get Upcoming Events

  getUpcomingEvents: async (req, res) => {
    try {
      const upcomingEvents = await db.Event.findAll({
        where: {
          event_date: {
            [Op.gte]: new Date(), // Fetch events that are today or in the future
          },
        },
        order: [["event_date", "ASC"]],
        limit: 5,
      });

      return res.status(200).json({
        success: true,
        data: upcomingEvents,
      });
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Get Recent Reservations
  getRecentReservations: async (req, res) => {
    try {
      const recentReservations = await db.Reservation.findAll({
        order: [["createdAt", "DESC"]],
        limit: 5,
        include: [
          {
            model: db.User,
            as: "User",
            attributes: ["user_id", "username", "first_name", "last_name", "role"], // Include full name and role
          },
          {
            model: db.Event,
            as: "Event",
            attributes: ["id", "name"], // Fetch event-specific attributes
          },
          {
            model: db.Ticket,
            as: "Ticket",
            attributes: ["seat_type",  "ticket_type", "price"], // Fetch seat type from the Ticket model
          },
          {
            model: db.ClaimingSlot,
            as: "ClaimingSlot",
            attributes: ["claiming_date",  "start_time", "end_time"], // Fetch seat type from the Ticket model
          },
        ],
      });

      console.log("Recent Reservations:", recentReservations); // Debug log

      return res.status(200).json({
        success: true,
        data: recentReservations,
      });
    } catch (error) {
      console.error("Error fetching recent reservations:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  //Get Real time Event Claiming Status
getEventClaimingStatus: async (req, res) => {
  try {
    const { eventId } = req.params; // Get the event ID from the request parameters

    // Count claimed reservations
    const claimedCount = await db.Reservation.count({
      where: {
        event_id: eventId,
        reservation_status: "claimed", // Assuming "claimed" is the status for claimed reservations
      },
    });

    // Count pending reservations
    const pendingCount = await db.Reservation.count({
      where: {
        event_id: eventId,
        reservation_status: "pending", // Assuming "pending" is the status for pending reservations
      },
    });

    // Return the data
    return res.status(200).json({
      success: true,
      data: {
        claimed: claimedCount,
        pending: pendingCount,
      },
    });
  } catch (error) {
    console.error("Error fetching event claiming status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
},

// Get Ticketed Events
getTicketedEvents: async (req, res) => {
  try {
    const ticketedEvents = await db.Event.findAll({
      include: [
        {
          model: db.Ticket,
          as: "Tickets",
          required: true, // Ensures only events with tickets are included
        },
      ],
      attributes: ["id", "name"], // Fetch only necessary fields
    });

    return res.status(200).json({
      success: true,
      data: ticketedEvents,
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

};



module.exports = adminDashboardController;





