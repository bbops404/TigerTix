const db = require("../models");
const Reservation = db.Reservation;
const Ticket = db.Ticket;
const Event = db.Event; // Add this
const User = db.User; // Add this
const ClaimingSlot = db.ClaimingSlot; // Add this
const sequelize = db.sequelize; // Add this for transaction

const reservationController = {
  // Create a new reservation
  createReservation: async (req, res) => {
    // Start a transaction to ensure all database operations succeed or fail together
    const transaction = await db.sequelize.transaction();

    try {
      const { main_reserver_id, user_ids, event_id, ticket_id, claiming_id } =
        req.body;

      // For debug purposes
      console.log(
        "Reservation Request Body:",
        JSON.stringify(req.body, null, 2)
      );

      // Validate required fields
      if (!event_id || !ticket_id || !claiming_id) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Missing required reservation details",
        });
      }

      // Determine if it's a single or multiple reservation
      let usersToReserveFor = [];

      if (user_ids && Array.isArray(user_ids) && user_ids.length > 0) {
        // Multiple reservations
        usersToReserveFor = user_ids;

        // Ensure the main reserver is included in the user_ids array
        if (main_reserver_id && !usersToReserveFor.includes(main_reserver_id)) {
          usersToReserveFor.push(main_reserver_id);
        }
      } else if (main_reserver_id) {
        // Single reservation for the main reserver
        usersToReserveFor = [main_reserver_id];
      } else {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Either main_reserver_id or user_ids must be provided",
        });
      }

      console.log(
        `Processing reservation for ${usersToReserveFor.length} users:`,
        usersToReserveFor
      );

      // Check if the event exists
      const event = await Event.findByPk(event_id);
      if (!event) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Validate event status - only 'open' events can be reserved
      if (event.status !== "open") {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Event is not open for reservations. Current status: ${event.status}`,
        });
      }

      // Check if the current date and time are within the reservation period
      const currentDate = new Date();
      if (event.reservation_end_date && event.reservation_end_time) {
        const reservationEndDateTime = new Date(
          `${event.reservation_end_date}T${event.reservation_end_time}`
        );

        if (currentDate > reservationEndDateTime) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "Reservations for this event are no longer allowed.",
          });
        }
      }

      // Check if the ticket exists and has enough remaining quantity
      const ticket = await Ticket.findByPk(ticket_id);
      if (!ticket) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Ticket not found",
        });
      }

      const totalQuantity = usersToReserveFor.length; // Total tickets needed (1 per user)
      if (ticket.remaining_quantity < totalQuantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Not enough tickets available",
        });
      }

      // Validate that all users exist in the system
      const users = await User.findAll({
        where: { user_id: usersToReserveFor },
      });

      if (users.length !== usersToReserveFor.length) {
        const foundUserIds = users.map((user) => user.user_id);
        const missingUserIds = usersToReserveFor.filter(
          (id) => !foundUserIds.includes(id)
        );

        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "One or more users not found",
          missing_users: missingUserIds,
        });
      }

      // Check for existing reservations for the same event and users
      const existingReservations = await Reservation.findAll({
        where: {
          user_id: usersToReserveFor,
          event_id,
        },
      });

      if (existingReservations.length > 0) {
        const duplicateUsers = existingReservations.map((res) => res.user_id);

        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message:
            "One or more users already have a reservation for this event",
          duplicate_users: duplicateUsers,
        });
      }

      // Check the claiming slot
      const claimingSlot = await ClaimingSlot.findByPk(claiming_id);
      if (!claimingSlot) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Claiming slot not found",
        });
      }

      // Check if the ClaimingSlot has enough space
      if (
        claimingSlot.current_claimers + totalQuantity >
        claimingSlot.max_claimers
      ) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message:
            "This claiming slot does not have enough space for your reservation",
        });
      }

      // Create individual reservations for each user
      const reservations = [];
      for (const user_id of usersToReserveFor) {
        const newReservation = await Reservation.create(
          {
            user_id,
            event_id,
            ticket_id,
            claiming_id,
            quantity: 1, // Each user gets 1 ticket
            reservation_status: "pending", // Default status
          },
          { transaction }
        );
        reservations.push(newReservation);
      }

      // Update claiming slot's current_claimers count
      await claimingSlot.increment("current_claimers", {
        by: totalQuantity,
        transaction,
      });

      // Update the ticket's remaining quantity
      await ticket.decrement("remaining_quantity", {
        by: totalQuantity,
        transaction,
      });

      await transaction.commit(); // Commit the transaction

      return res.status(201).json({
        success: true,
        message: "Reservations created successfully",
        data: reservations,
      });
    } catch (error) {
      await transaction.rollback(); // Rollback the transaction in case of an error
      console.error("Error creating reservations:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Get all reservations for a user
  getUserReservations: async (req, res) => {
    try {
      const { user_id } = req.params;

      const reservations = await Reservation.findAll({
        where: { user_id },
        include: ["event", "tickets", "claimingSlot"],
      });

      return res.status(200).json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      console.error("Error fetching reservations:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Cancel a reservation
  cancelReservation: async (req, res) => {
    try {
      const { reservation_id } = req.params;

      const reservation = await Reservation.findByPk(reservation_id);
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
      }

      // Update the reservation status
      reservation.reservation_status = "cancelled";
      await reservation.save();

      // Restore the ticket quantity
      const ticket = await Ticket.findByPk(reservation.ticket_id);
      if (ticket) {
        ticket.remaining_quantity += reservation.quantity;
        await ticket.save();
      }

      return res.status(200).json({
        success: true,
        message: "Reservation cancelled successfully",
        data: reservation,
      });
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Get all reservations for all events
  getAllReservations: async (req, res) => {
    try {
      const reservations = await Reservation.findAll({
        attributes: ["reservation_id", "reservation_status"], // Fetch only necessary columns from Reservation
        include: [
          {
            model: db.User,
            as: "User", // Use the alias defined in the association
            attributes: ["first_name", "last_name", "role"], // Fetch name and role from User
          },
          {
            model: db.Event,
            as: "Event", // Use the alias defined in the association
            attributes: ["name"], // Fetch event name from Event
          },
          {
            model: db.Ticket,
            as: "Tickets", // Use the alias defined in the association
            attributes: ["ticket_type"], // Fetch ticket type from Ticket
          },
          {
            model: db.ClaimingSlot,
            as: "ClaimingSlot", // Use the alias defined in the association
            attributes: ["claiming_date", "start_time", "end_time"], // Fetch claiming date and time from ClaimingSlot
          },
        ],
      });

      // Format the response
      const formattedReservations = reservations.map((reservation) => ({
        reservation_id: reservation.reservation_id,
        name: `${reservation.User.first_name} ${reservation.User.last_name}`, // Format full name
        role: reservation.User.role,
        event_name: reservation.Event.event_name,
        ticket_tier: reservation.Ticket.ticket_type,
        claiming_date: reservation.ClaimingSlot.claiming_date,
        claiming_time: `${reservation.ClaimingSlot.start_time} - ${reservation.ClaimingSlot.end_time}`,
        claiming_status: reservation.reservation_status,
      }));

      return res.status(200).json({
        success: true,
        data: formattedReservations,
      });
    } catch (error) {
      console.error("Error fetching all reservations:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Get reservations for specific events
  getReservationsByEvent: async (req, res) => {
    try {
      const reservations = await Reservation.findAll({
        attributes: ["reservation_id", "reservation_status"], // Fetch only necessary columns from Reservation
        include: [
          {
            model: db.User,
            as: "User", // Use the alias defined in the association
            attributes: ["first_name", "last_name", "role"], // Fetch name and role from User
          },
          {
            model: db.Event,
            as: "Event", // Use the alias defined in the association
            attributes: ["id", "name"], // Fetch event ID and name from Event
          },
          {
            model: db.Ticket,
            as: "Ticket", // Use the alias defined in the association
            attributes: ["ticket_type"], // Fetch ticket type from Ticket
          },
          {
            model: db.ClaimingSlot,
            as: "ClaimingSlot", // Use the alias defined in the association
            attributes: ["claiming_date", "start_time", "end_time"], // Fetch claiming date and time from ClaimingSlot
          },
        ],
      });

      // Group reservations by event
      const groupedByEvent = reservations.reduce((acc, reservation) => {
        const eventId = reservation.Event.event_id;
        const eventName = reservation.Event.event_name;

        if (!acc[eventId]) {
          acc[eventId] = {
            event_name: eventName,
            reservations: [],
          };
        }

        acc[eventId].reservations.push({
          reservation_id: reservation.reservation_id,
          name: `${reservation.User.first_name} ${reservation.User.last_name}`, // Format full name
          role: reservation.User.role,
          ticket_tier: reservation.Ticket.ticket_type,
          claiming_date: reservation.ClaimingSlot.claiming_date,
          claiming_time: `${reservation.ClaimingSlot.start_time} - ${reservation.ClaimingSlot.end_time}`,
          claiming_status: reservation.reservation_status,
        });

        return acc;
      }, {});

      return res.status(200).json({
        success: true,
        data: groupedByEvent,
      });
    } catch (error) {
      console.error("Error fetching reservations by event:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Mark a reservation as claimed
  markAsClaimed: async (req, res) => {
    try {
      const { reservation_id } = req.params;

      // Find the reservation by ID
      const reservation = await Reservation.findByPk(reservation_id);

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
      }

      // Check if the reservation status is valid for claiming
      if (reservation.reservation_status !== "pending") {
        return res.status(400).json({
          success: false,
          message: `Reservation cannot be marked as claimed. Current status: ${reservation.reservation_status}`,
        });
      }

      // Update the reservation status to "claimed"
      reservation.reservation_status = "claimed";
      await reservation.save();

      return res.status(200).json({
        success: true,
        message: "Reservation marked as claimed successfully",
        data: reservation,
      });
    } catch (error) {
      console.error("Error marking reservation as claimed:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Mark a reservation as claimed via QR code
  markAsClaimedByQRCode: async (req, res) => {
    try {
      const { reservation_id } = req.body; // Extract reservation_id from the QR code data

      if (!reservation_id) {
        return res.status(400).json({
          success: false,
          message: "Reservation ID is required",
        });
      }

      // Find the reservation by ID
      const reservation = await Reservation.findByPk(reservation_id, {
        include: [
          {
            model: db.Ticket,
            as: "Tickets", // Use the alias defined in the association
            attributes: ["ticket_type"],
          },
          {
            model: db.User,
            as: "User", // Use the alias defined in the association
            attributes: ["first_name", "last_name"],
          },
        ],
      });

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
      }

      // Check if the reservation status is valid for claiming
      if (reservation.reservation_status !== "pending") {
        return res.status(400).json({
          success: false,
          message: `Reservation cannot be marked as claimed. Current status: ${reservation.reservation_status}`,
        });
      }

      // Update the reservation status to "claimed"
      reservation.reservation_status = "claimed";
      await reservation.save();

      return res.status(200).json({
        success: true,
        message: "Reservation marked as claimed successfully",
        data: {
          reservation_id: reservation.reservation_id,
          user_name: `${reservation.User.first_name} ${reservation.User.last_name}`,
          ticket_type: reservation.Ticket.ticket_type,
        },
      });
    } catch (error) {
      console.error("Error marking reservation as claimed via QR code:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Validate and retrieve reservation details via QR code
  validateReservationByQRCode: async (req, res) => {
    try {
      const { reservation_id } = req.body; // Extract reservation_id from the QR code data

      if (!reservation_id) {
        return res.status(400).json({
          success: false,
          message: "Reservation ID is required",
        });
      }

      // Find the reservation by ID
      const reservation = await Reservation.findByPk(reservation_id, {
        include: [
          {
            model: db.Ticket,
            as: "Tickets", // Use the alias defined in the association
            attributes: ["ticket_type", "price"], // Include ticket type and price
          },
          {
            model: db.User,
            as: "User", // Use the alias defined in the association
            attributes: ["first_name", "last_name", "role"], // Include user details
          },
          {
            model: db.Event,
            as: "Event", // Use the alias defined in the association
            attributes: ["name"], // Include event name
          },
          {
            model: db.ClaimingSlot,
            as: "ClaimingSlot", // Use the alias defined in the association
            attributes: ["claiming_date", "start_time", "end_time"], // Include claiming period
          },
        ],
      });

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
      }

      // Check if the QR code has expired
      const currentTime = new Date();
      const claimingEndTime = new Date(
        `${reservation.ClaimingSlot.claiming_date}T${reservation.ClaimingSlot.end_time}`
      );

      if (currentTime > claimingEndTime) {
        return res.status(400).json({
          success: false,
          message: "This QR code has expired.",
        });
      }

      // Check if the reservation status is valid for claiming
      if (reservation.reservation_status !== "pending") {
        return res.status(400).json({
          success: false,
          message: `Reservation cannot be claimed. Current status: ${reservation.reservation_status}`,
        });
      }

      // Format the reservation details
      const reservationDetails = {
        reservation_id: reservation.reservation_id,
        name: `${reservation.User.first_name} ${reservation.User.last_name}`,
        role: reservation.User.role,
        event_name: reservation.Event.name,
        ticket_tier: reservation.Ticket.ticket_type,
        claiming_date: reservation.ClaimingSlot.claiming_date,
        claiming_time: `${reservation.ClaimingSlot.start_time} - ${reservation.ClaimingSlot.end_time}`,
        amount: reservation.Ticket.price,
        claiming_status: reservation.reservation_status,
      };

      return res.status(200).json({
        success: true,
        message: "Reservation successfully retrieved!",
        data: reservationDetails,
      });
    } catch (error) {
      console.error("Error validating reservation via QR code:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Reinstate an "unclaimed" reservation to "claimed"
  reinstateReservation: async (req, res) => {
    try {
      const { reservation_id } = req.params;

      // Find the reservation by ID
      const reservation = await Reservation.findByPk(reservation_id, {
        include: [
          {
            model: db.ClaimingSlot,
            as: "ClaimingSlot", // Use the alias defined in the association
            attributes: ["claiming_date", "start_time", "end_time"],
          },
          {
            model: db.User,
            as: "User", // Use the alias defined in the association
            attributes: ["user_id", "violation_count"],
          },
        ],
      });

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
      }

      // Check if the reservation status is "unclaimed"
      if (reservation.reservation_status !== "unclaimed") {
        return res.status(400).json({
          success: false,
          message: `Reservation cannot be reinstated. Current status: ${reservation.reservation_status}`,
        });
      }

      // Check if the current time is past the claiming end time
      const currentTime = new Date();
      const claimingEndTime = new Date(
        `${reservation.ClaimingSlot.claiming_date}T${reservation.ClaimingSlot.end_time}`
      );

      if (currentTime <= claimingEndTime) {
        return res.status(400).json({
          success: false,
          message:
            "Reservation cannot be reinstated before the claiming period ends.",
        });
      }

      // Increment the user's violation count
      const user = reservation.User;
      if (user) {
        user.violation_count += 1;
        await user.save();
      }

      // Update the reservation status to "claimed"
      reservation.reservation_status = "claimed";
      await reservation.save();

      return res.status(200).json({
        success: true,
        message: "Reservation reinstated to claimed successfully",
        data: reservation,
      });
    } catch (error) {
      console.error("Error reinstating reservation:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Restore multiple "unclaimed" reservations
  restoreUnclaimedReservations: async (req, res) => {
    try {
      const { reservation_ids } = req.body; // Expect an array of reservation IDs in the request body

      if (!Array.isArray(reservation_ids) || reservation_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide an array of reservation IDs to restore.",
        });
      }

      const restoredReservations = [];
      const errors = [];

      for (const reservation_id of reservation_ids) {
        try {
          // Find the reservation by ID
          const reservation = await Reservation.findByPk(reservation_id, {
            include: [
              {
                model: db.Ticket,
                as: "Tickets", // Use the alias defined in the association
                attributes: ["id", "remaining_quantity"],
              },
              {
                model: db.User,
                as: "User", // Use the alias defined in the association
                attributes: ["user_id", "violation_count"],
              },
            ],
          });

          if (!reservation) {
            errors.push({ reservation_id, message: "Reservation not found" });
            continue;
          }

          // Check if the reservation status is "unclaimed"
          if (reservation.reservation_status !== "unclaimed") {
            errors.push({
              reservation_id,
              message: `Reservation cannot be restored. Current status: ${reservation.reservation_status}`,
            });
            continue;
          }

          // Increment the user's violation count
          const user = reservation.User;
          if (user) {
            user.violation_count += 1;
            await user.save();
          }

          // Restore the ticket slot
          const ticket = reservation.Ticket;
          if (ticket) {
            ticket.remaining_quantity += reservation.quantity;
            await ticket.save();
          }

          // Update the reservation status to "cancelled"
          reservation.reservation_status = "cancelled";
          await reservation.save();

          restoredReservations.push(reservation);
        } catch (error) {
          errors.push({ reservation_id, message: error.message });
        }
      }

      return res.status(200).json({
        success: true,
        message: "Processed reservations.",
        restored: restoredReservations,
        errors,
      });
    } catch (error) {
      console.error("Error restoring reservations:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = reservationController;
