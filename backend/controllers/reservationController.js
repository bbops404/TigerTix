const db = require("../models");
const Reservation = db.Reservation;
const Ticket = db.Ticket;
const Event = db.Event; // Add this
const User = db.User; // Add this
const ClaimingSlot = db.ClaimingSlot; // Add this
const { createAuditTrail } = require("./auditTrailController");

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const resendhost = process.env.RESEND_HOST;

const QRCode = require("qrcode"); // Add this at the top
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const sequelize = db.sequelize; // Add this for transaction

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  }
});

// Function to upload QR code to S3
async function uploadQRCodeToS3(qrCodeBuffer, fileName) {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `qr-code/${fileName}`,
      Body: qrCodeBuffer,
      ContentType: 'image/png'
    });

    await s3Client.send(command);
    return `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/qr-code/${fileName}`;
  } catch (error) {
    console.error('Error uploading QR code to S3:', error);
    throw error;
  }
}

const reservationController = {
  // Create a new reservation
  createReservation: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    let qrTicketCount = 0; // Initialize counter for QR codes

    try {
      console.log("Starting reservation creation...");
      console.log("User from request:", req.user);
      
      const { main_reserver_id, user_ids, event_id, ticket_id, claiming_id } = req.body;

      // For debug purposes
      console.log(
        "Reservation Request Body:",
        JSON.stringify(req.body, null, 2)
      );

      // Validate required fields
      if (!event_id || !ticket_id || !claiming_id) {
        console.log("Missing required fields:", { event_id, ticket_id, claiming_id });
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
        console.log("No valid user IDs provided");
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
        console.log(`Event not found with ID: ${event_id}`);
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Validate event status - only 'open' events can be reserved
      if (event.status !== "open") {
        console.log(`Event status is not open. Current status: ${event.status}`);
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
          console.log("Reservation period has ended");
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "Reservations for this event are no longer allowed.",
          });
        }
      }

      // NEW: Check for user restrictions and violations
      console.log("Fetching user data for:", usersToReserveFor);
      const users = await User.findAll({
        where: { user_id: usersToReserveFor },
        attributes: [
          "user_id",
          "email",
          "first_name",
          "last_name",
          "status",
          "violation_count",
          "restriction_end_date",
        ],
      });

      // Check if all users exist
      if (users.length !== usersToReserveFor.length) {
        const foundUserIds = users.map((user) => user.user_id);
        const missingUserIds = usersToReserveFor.filter(
          (id) => !foundUserIds.includes(id)
        );

        console.log("Missing users:", missingUserIds);
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "One or more users not found",
          missing_users: missingUserIds,
        });
      }

      // Check for account restrictions
      const restrictedUsers = users.filter((user) => {
        // Case 1: Account is suspended
        if (user.status === "suspended") {
          return true;
        }

        // Case 2: Account is restricted and restriction is still active
        if (user.status === "restricted" && user.restriction_end_date) {
          const now = new Date();
          return now < new Date(user.restriction_end_date);
        }

        return false;
      });

      if (restrictedUsers.length > 0) {
        console.log("Found restricted users:", restrictedUsers);
        await transaction.rollback();

        // Format restriction messages
        const restrictions = restrictedUsers.map((user) => {
          let message = "";

          if (user.status === "suspended") {
            message = "Account is suspended due to multiple violations";
          } else if (user.status === "restricted") {
            const endDate = new Date(user.restriction_end_date);
            const formattedDate = endDate.toLocaleDateString();
            message = `Account is restricted until ${formattedDate} due to previous violations`;
          }

          return {
            user_id: user.user_id,
            name: `${user.first_name} ${user.last_name}`,
            status: user.status,
            restriction_end_date: user.restriction_end_date,
            message,
          };
        });

        return res.status(403).json({
          success: false,
          message: "One or more users have restrictions and cannot make reservations",
          restricted_users: restrictions,
        });
      }

      // Check if the ticket exists and has enough remaining quantity
      console.log("Checking ticket availability...");
      const ticket = await Ticket.findByPk(ticket_id);
      if (!ticket) {
        console.log(`Ticket not found with ID: ${ticket_id}`);
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Ticket not found",
        });
      }

      const totalQuantity = usersToReserveFor.length; // Total tickets needed (1 per user)
      if (ticket.remaining_quantity < totalQuantity) {
        console.log(`Not enough tickets. Available: ${ticket.remaining_quantity}, Requested: ${totalQuantity}`);
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Not enough tickets available",
        });
      }

      // Check for existing reservations for the same event and users
      console.log("Checking for existing reservations...");
      const existingReservations = await Reservation.findAll({
        where: {
          user_id: usersToReserveFor,
          event_id,
        },
      });

      if (existingReservations.length > 0) {
        const duplicateUsers = existingReservations.map((res) => res.user_id);
        console.log("Found duplicate reservations for users:", duplicateUsers);
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "One or more users already have a reservation for this event",
          duplicate_users: duplicateUsers,
        });
      }

      // Check the claiming slot
      console.log("Checking claiming slot...");
      const claimingSlot = await ClaimingSlot.findByPk(claiming_id);
      if (!claimingSlot) {
        console.log(`Claiming slot not found with ID: ${claiming_id}`);
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
        console.log(`Claiming slot is full. Current: ${claimingSlot.current_claimers}, Max: ${claimingSlot.max_claimers}, Requested: ${totalQuantity}`);
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "This claiming slot does not have enough space for your reservation",
        });
      }

      // Create individual reservations for each user
      console.log("Creating reservations...");
      const reservations = [];
      for (const user_id of usersToReserveFor) {
        try {
          const isMainReserver = user_id === main_reserver_id;
          const qrTicketCount = isMainReserver ? totalQuantity : 1;
          const qrValue = `UST-TICKET-${Date.now()}-${event.name}-${ticket.ticket_type}-${qrTicketCount}`;
          
          // Generate QR code as buffer
          console.log("Generating QR code...");
          const qrCodeBuffer = await QRCode.toBuffer(qrValue, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 180,
            color: {
              dark: '#000000',
              light: '#ffffff'
            },
            type: 'png'
          });

          // Generate unique filename for the QR code
          const fileName = `qr-${Date.now()}-${user_id}.png`;
          
          // Upload QR code to S3 and get the URL
          console.log("Uploading QR code to S3...");
          const qrCodeUrl = await uploadQRCodeToS3(qrCodeBuffer, fileName);

          console.log("Creating reservation in database...");
          const newReservation = await Reservation.create(
            {
              user_id,
              event_id,
              ticket_id,
              claiming_id,
              quantity: 1, // Each user gets 1 ticket
              reservation_status: "pending", // Default status
              qr_code: qrCodeUrl // Store the QR code URL
            },
            { transaction }
          );
          reservations.push(newReservation);
        } catch (error) {
          console.error("Error creating reservation for user:", user_id, error);
          throw error;
        }
      }

      // Update claiming slot's current_claimers count
      console.log("Updating claiming slot...");
      await claimingSlot.increment("current_claimers", {
        by: totalQuantity,
        transaction,
      });

      // Update the ticket's remaining quantity
      console.log("Updating ticket quantity...");
      await ticket.decrement("remaining_quantity", {
        by: totalQuantity,
        transaction,
      });

      await transaction.commit(); // Commit the transaction
      console.log("Transaction committed successfully");

      // Send emails
      console.log("Sending confirmation emails...");
      console.log("Resend configuration:", {
        apiKey: process.env.RESEND_API_KEY ? "Present" : "Missing",
        host: process.env.RESEND_HOST
      });

      for (const user of users) {
        try {
          // Find the reservation for this user to get reservationId
          const reservation = reservations.find(
            (r) => r.user_id === user.user_id
          );
          
          console.log(`Preparing email for user ${user.email} with reservation ID ${reservation.reservation_id}`);
          
          // Compose the email HTML with the stored QR code URL
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 24px;">
              <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #0001; padding: 32px;">
                <h1 style="text-align:center; color:#222; margin-bottom: 24px;">Reservation Receipt</h1>
                <div style="display: flex; flex-wrap: wrap; gap: 24px;">
                  <div style="flex: 1 1 200px; text-align: center;">
                    <div style="font-weight: bold; margin-bottom: 8px;">YOUR QR CODE:</div>
                    <img src="${reservation.qr_code}" alt="Reservation QR Code" style="width:120px;height:120px; margin-bottom: 12px;" />
                    <div style="margin-top: 8px; font-size: 16px;">
                      <b>RESERVATION ID:</b> <span style="color:#F09C32;">${reservation.reservation_id}</span>
                    </div>
                    <div style="margin-top: 8px; font-size: 12px; color: #555;">
                      Please present this QR code when claiming your ticket(s)
                    </div>
                  </div>
                  <div style="flex: 2 1 300px; font-size: 15px;">
                    <div><b>Name:</b> ${user.first_name} ${user.last_name}</div>
                    <div><b>Email:</b> ${user.email}</div>
                    <div><b>Event:</b> ${event.name}</div>
                    <div><b>Event Date:</b> ${event.event_date || "TBA"}</div>
                    <div><b>Event Time:</b> ${event.event_time || "TBA"}</div>
                    <div><b>Venue:</b> ${event.venue || "TBA"}</div>
                    <div><b>Ticket Type:</b> ${ticket.ticket_type}</div>
                    <div><b>Number of Tickets:</b> ${qrTicketCount}</div>
                    <div><b>Batch:</b> ${claimingSlot.claiming_date} (${claimingSlot.start_time} - ${claimingSlot.end_time})</div>
                    <div><b>Claiming Venue:</b> ${claimingSlot.venue || "IPEA"}</div>
                    <div><b>Price Per Person:</b> ₱${parseFloat(ticket.price).toFixed(2)}</div>
                    <div><b>Total Amount:</b> ₱${(parseFloat(ticket.price) * qrTicketCount).toFixed(2)}</div>
                  </div>
                </div>
                <div style="margin-top: 32px; text-align: center;">
                  <b>Important Reminders</b>
                  <ul style="text-align: left; margin: 12px auto; max-width: 500px; color: #444;">
                    <li>You must bring a valid UST ID when claiming your ticket.</li>
                    <li>All ticket holders must present their UST ID for verification.</li>
                    <li>Ticket claiming deadline: 3 hours before the event starts.</li>
                    <li>Unclaimed tickets may result in account restrictions for future events.</li>
                  </ul>
                </div>
              </div>
            </div>
          `;

          console.log(`Attempting to send email to ${user.email}...`);
          console.log("Email configuration:", {
            from: resendhost,
            to: user.email,
            subject: "Your TigerTix Reservation Receipt",
            hasHtml: !!emailHtml
          });

          const result = await resend.emails.send({
            from: resendhost,
            to: user.email,
            subject: "Your TigerTix Reservation Receipt",
            html: emailHtml
          });

          console.log(`Email send result for ${user.email}:`, result);
        } catch (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
          console.error("Error details:", {
            message: emailError.message,
            stack: emailError.stack,
            code: emailError.code
          });
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
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
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
      consoleemo.log("User data for audit log:", req.user);

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
      const violationWarnings = [];

      for (const reservation_id of reservation_ids) {
        try {
          // Find the reservation by ID
          const reservation = await Reservation.findByPk(reservation_id, {
            include: [
              {
                model: db.Ticket,
                as: "Ticket", // Use the alias defined in the association
                attributes: ["id", "remaining_quantity"],
              },
              {
                model: db.User,
                as: "User", // Use the alias defined in the association
                attributes: [
                  "user_id",
                  "violation_count",
                  "status",
                  "restriction_end_date",
                ],
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

          // Increment the user's violation count and apply appropriate restrictions
          const user = reservation.User;
          if (user) {
            // Increment violation count
            const newViolationCount = user.violation_count + 1;

            // Apply different restrictions based on violation count
            let newStatus = user.status;
            let restrictionEndDate = null;
            let violationMessage = "";

            if (newViolationCount === 1) {
              // First violation: Warning only
              violationMessage =
                "This is your first violation. Please claim your tickets on time in the future.";
              newStatus = "active"; // Keep status active
            } else if (newViolationCount === 2) {
              // Second violation: Block reservations for 15 days
              const endDate = new Date();
              endDate.setDate(endDate.getDate() + 15); // Add 15 days
              restrictionEndDate = endDate;
              newStatus = "restricted";
              violationMessage =
                "This is your second violation. You are restricted from making reservations for 15 days.";
            } else if (newViolationCount >= 3) {
              // Third violation: Account suspended
              newStatus = "suspended";
              violationMessage =
                "This is your third violation. Your account has been suspended.";
            }

            // Update the user record
            await user.update({
              violation_count: newViolationCount,
              status: newStatus,
              restriction_end_date: restrictionEndDate,
            });

            // Add violation warning for response
            violationWarnings.push({
              user_id: user.user_id,
              violation_count: newViolationCount,
              message: violationMessage,
              status: newStatus,
              restriction_end_date: restrictionEndDate,
            });
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
            affectedEntity: "Reservation",
            message: `Marked reservation ${reservation_id} from unclaimed to cancelled with violation count increment.`,
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
        violations: violationWarnings,
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
