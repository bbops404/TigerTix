const db = require("../models");
const Reservation = db.Reservation;
const Ticket = db.Ticket;
const Event = db.Event; // Add this
const User = db.User; // Add this
const ClaimingSlot = db.ClaimingSlot; // Add this
const nodemailer = require("nodemailer");
const { createAuditTrail } = require("./auditTrailController");




const sequelize = db.sequelize; // Add this for transaction


// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


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

      for (const user of users) {
        const mailOptions = {
          from: `"TigerTix" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Your Reservation Details",
          html: `
            <h1>Reservation Confirmation</h1>
            <p>Dear ${user.first_name} ${user.last_name},</p>
            <p>Your reservation has been successfully created. Here are the details:</p>
            <ul>
              <li><strong>Event:</strong> ${event.name}</li>
              <li><strong>Ticket Type:</strong> ${ticket.ticket_type}</li>
              <li><strong>Claiming Time:</strong> ${claimingSlot.claiming_date} (${claimingSlot.start_time} - ${claimingSlot.end_time})</li>
            </ul>
            <p>Please log in to your account to view your reservations and ensure all details are correct.</p>
            <p><strong>Reminder:</strong> You must claim your tickets during the chosen claiming time. Failure to do so may result in restrictions on your account.</p>
            <p>Thank you for using TigerTix!</p>
          `,
        };
      try {
        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
      }
    }

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

  getUserReservations: async (req, res) => {
    try {
      const { user_id } = req.params;

      const reservations = await Reservation.findAll({
        where: { user_id },
        include: ["Event", "Ticket", "ClaimingSlot"], // Changed to match your model association names
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
            as: "Ticket", // Use the alias defined in the association
            attributes: ["seat_type", "ticket_type", "price"], // Fetch ticket type from Ticket
          },
          {
            model: db.ClaimingSlot,
            as: "ClaimingSlot", // Use the alias defined in the association
            attributes: ["claiming_date", "start_time", "end_time"], // Fetch claiming date and time from ClaimingSlot
          },
        ],
      });

      const formattedReservations = reservations.map((reservation) => {
        // Format claiming start and end times with AM/PM
        const startTime = reservation.ClaimingSlot?.start_time
          ? new Date(
              `1970-01-01T${reservation.ClaimingSlot.start_time}`
            ).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A";

        const endTime = reservation.ClaimingSlot?.end_time
          ? new Date(
              `1970-01-01T${reservation.ClaimingSlot.end_time}`
            ).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A";

        return {
          reservation_id: reservation.reservation_id,
          name: `${reservation.User?.first_name || ""} ${
            reservation.User?.last_name || ""
          }`.trim(),
          role: reservation.User?.role || "N/A",
          event_name: reservation.Event?.name || "N/A",
          seat_type: reservation.Ticket?.seat_type || "N/A",
          ticket_tier: reservation.Ticket?.ticket_type || "N/A",
          claiming_date: reservation.ClaimingSlot?.claiming_date || "N/A",
          claiming_time: `${startTime} - ${endTime}`, // Include formatted start and end times
          amount: reservation.Ticket?.price || 0,
          claiming_status: reservation.reservation_status || "N/A",
        };
      });

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

  // Mark a reservation as claimed - manual
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
      consolemo.log("User data for audit log:", req.user);

    try {
  await createAuditTrail({
    user_id: req.user.user_id,
    username: req.user.username,
    role: req.user.role,
    action: "Mark Reservation as Claimed",
    affectedEntity: "Reservation",
    message: `Marked reservation ID ${reservation_id} as claimed.`,
    status: "Successful",
  });
} catch (error) {
  console.error("Failed to create audit log:", error);
}
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
      const { reservation_id } = req.body;

      console.log("Received QR claim request:", {
        body: req.body,
        reservationId: reservation_id,
      });

      if (!reservation_id) {
        return res.status(400).json({
          success: false,
          message: "Reservation ID is required",
        });
      }

      // Handle numeric ID conversion
      const parsedId = parseInt(reservation_id);
      const queryId = !isNaN(parsedId) ? parsedId : reservation_id;

      console.log(`Querying for reservation to claim with ID: ${queryId}`);

      // Find the reservation by ID with simpler associations (just what we need)
      const reservation = await db.Reservation.findOne({
        where: { reservation_id: queryId },
        include: [
          {
            model: db.User,
            as: "User",
            attributes: ["first_name", "last_name"],
          },
          {
            model: db.Ticket,
            as: "Ticket",
            attributes: ["ticket_type"],
          },
        ],
      });

      if (!reservation) {
        console.log(`No reservation found with ID: ${queryId}`);
        return res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
      }

      console.log(
        `Found reservation: ID ${reservation.reservation_id}, status: ${reservation.reservation_status}`
      );

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

      
      // Format user name safely
      const userName = reservation.User
        ? `${reservation.User.first_name || ""} ${
            reservation.User.last_name || ""
          }`.trim()
        : "Unknown User";

      // Get ticket type safely
      const ticketType = reservation.Ticket?.ticket_type || "Unknown Type";

      try {
        await createAuditTrail({
          user_id: req.user.user_id,
          username: req.user.username,
          role: req.user.role,
          action: "Mark Reservation as Claimed",
          affectedEntity: "Reservation",
          message: `Marked reservation ID ${reservation_id} as claimed.`,
          status: "Successful",
        });
      } catch (error) {
        console.error("Failed to create audit log:", error);
      }
      console.log(
        `Successfully marked reservation ${reservation.reservation_id} as claimed`
      );

      return res.status(200).json({
        success: true,
        message: "Reservation marked as claimed successfully",
        data: {
          reservation_id: reservation.reservation_id,
          user_name: userName,
          ticket_type: ticketType,
          status: "claimed",
        },
      });

      
    } catch (error) {
      console.error("Error marking reservation as claimed via QR code:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },
  // Validate and retrieve reservation details via QR code
  validateReservationByQRCode: async (req, res) => {
    try {
      const { reservation_id } = req.body;

      console.log("Received QR validation request:", {
        body: req.body,
        reservationId: reservation_id,
      });

      if (!reservation_id) {
        return res.status(400).json({
          success: false,
          message: "Reservation ID is required",
        });
      }

      // Handle numeric ID conversion
      const parsedId = parseInt(reservation_id);
      const queryId = !isNaN(parsedId) ? parsedId : reservation_id;

      console.log(
        `Querying for reservation with ID: ${queryId}, type: ${typeof queryId}`
      );

      // Find the reservation with proper associations
      const reservation = await db.Reservation.findOne({
        where: { reservation_id: queryId },
        include: [
          {
            model: db.Ticket,
            as: "Ticket", // Make sure this matches your model association alias
            attributes: ["ticket_type", "price", "seat_type"],
          },
          {
            model: db.User,
            as: "User",
            attributes: ["first_name", "last_name", "role"],
          },
          {
            model: db.Event,
            as: "Event",
            attributes: ["name"],
          },
          {
            model: db.ClaimingSlot,
            as: "ClaimingSlot",
            attributes: ["claiming_date", "start_time", "end_time"],
          },
        ],
      });

      if (!reservation) {
        console.log(`No reservation found with ID: ${queryId}`);
        return res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
      }

      console.log("Found reservation:", {
        id: reservation.reservation_id,
        status: reservation.reservation_status,
        user: reservation.User
          ? `${reservation.User.first_name} ${reservation.User.last_name}`
          : "Unknown",
      });

      // Format the reservation details with safe fallbacks for all fields
      const reservationDetails = {
        reservation_id: reservation.reservation_id,
        name: reservation.User
          ? `${reservation.User.first_name || ""} ${
              reservation.User.last_name || ""
            }`.trim()
          : "Unknown User",
        role: reservation.User?.role || "Unknown",
        event_name: reservation.Event?.name || "Unknown Event",
        seat_type: reservation.Ticket?.seat_type || "N/A",
        ticket_tier: reservation.Ticket?.ticket_type || "N/A",
        claiming_date: reservation.ClaimingSlot?.claiming_date || "N/A",
        claiming_time: reservation.ClaimingSlot
          ? `${reservation.ClaimingSlot.start_time || ""} - ${
              reservation.ClaimingSlot.end_time || ""
            }`
          : "N/A",
        amount: reservation.Ticket?.price || 0,
        claiming_status: reservation.reservation_status || "N/A",
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
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
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

await createAuditTrail({
  user_id: req.user.user_id,
  username: req.user.username,
  role: req.user.role,
  action: "Reinstated reservation",
  message: `Marked ${reservation_id} reservations from unclaimed to claimed.`,
  status: "Successful",
});
      
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

await createAuditTrail({
  user_id: req.user.user_id,
  username: req.user.username,
  role: req.user.role,
  action: "Restore reservation",
  message: `Marked ${reservation_id} reservations from unclaimed to cancelled.`,
  status: "Successful",
});
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
  checkAndUpdatePendingReservations: async (req, res) => {
    try {
      const updateReservationStatusService = require("../middleware/updateReservationStatus");
      const results =
        await updateReservationStatusService.updatePendingToUnclaimed();

      return res.status(200).json({
        success: true,
        message: `Updated ${results.updated} pending reservations to unclaimed`,
        data: results,
      });
    } catch (error) {
      console.error("Error updating pending reservations:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
  markMultipleAsClaimed: async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const { reservation_ids } = req.body;

      if (!Array.isArray(reservation_ids) || reservation_ids.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message:
            "Please provide an array of reservation IDs to mark as claimed",
        });
      }

      const successfulIds = [];
      const failedIds = [];

      // Process each reservation
      for (const reservationId of reservation_ids) {
        try {
          // Find the reservation by ID
          const reservation = await Reservation.findByPk(reservationId, {
            transaction,
          });

          if (!reservation) {
            failedIds.push({
              reservation_id: reservationId,
              reason: "Reservation not found",
            });
            continue;
          }

          // Check if the reservation status is valid for claiming
          if (reservation.reservation_status !== "pending") {
            failedIds.push({
              reservation_id: reservationId,
              reason: `Reservation cannot be marked as claimed. Current status: ${reservation.reservation_status}`,
            });
            continue;
          }

          // Update the reservation status to "claimed"
          await reservation.update(
            { reservation_status: "claimed" },
            { transaction }
          );



          successfulIds.push(reservationId);

          // Inside markMultipleAsClaimed
await createAuditTrail({
  user_id: req.user.user_id,
  username: req.user.username,
  role: req.user.role,
  action: "Mark Multiple Reservations as Claimed",
  affectedEntity: "Reservations",
  message: `Marked ${successfulIds.length} reservations as claimed.`,
  status: "Successful",
});
          
        } catch (error) {
          console.error(
            `Error processing reservation ${reservationId}:`,
            error
          );
          failedIds.push({
            reservation_id: reservationId,
            reason: error.message,
          });
        }
      }

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: `Successfully marked ${successfulIds.length} reservations as claimed`,
        successful: successfulIds,
        failed: failedIds,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error marking multiple reservations as claimed:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = reservationController;
