const nodemailer = require("nodemailer");
const Redis = require("ioredis");
const bcrypt = require("bcryptjs");
const { Sequelize } = require("sequelize");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
// Correct importconst crypto = require("crypto");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const { createAuditTrail } = require("./auditTrailController");
const crypto = require("crypto");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const resendhost = process.env.RESEND_HOST;
const { Event, Reservation } = require("../models");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Populate req.user with decoded token data
    } catch (error) {
      console.error("Invalid token:", error);
      return res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
  next();
};
exports.checkUserRestrictions = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Evaluate current restriction status
    let restrictionStatus = "active";
    let restrictionEndDate = null;

    if (user.status === "restricted" && user.restriction_end_date) {
      const now = new Date();
      const restrictionEnd = new Date(user.restriction_end_date);

      if (now >= restrictionEnd) {
        // Restriction period has passed
        user.status = "active";
        user.restriction_end_date = null;
        await user.save();
      } else {
        restrictionStatus = "restricted";
        restrictionEndDate = user.restriction_end_date;
      }
    } else if (user.status === "suspended") {
      restrictionStatus = "suspended";
    }

    return res.status(200).json({
      success: true,
      data: {
        user_id: user.user_id,
        username: user.username,
        status: restrictionStatus,
        violation_count: user.violation_count,
        restriction_end_date: restrictionEndDate,
      },
    });
  } catch (error) {
    console.error("Error checking user restrictions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check user restrictions",
      error: error.message,
    });
  }
};

// Reset individual user's violations
exports.resetUserViolations = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Reset violations and restore status to active
    await user.update({
      violation_count: 0,
      status: "active",
      restriction_end_date: null,
    });

    // Create audit trail
    await createAuditTrail({
      user_id: req.user.user_id,
      username: req.user.username,
      role: req.user.role,
      action: "Reset User Violations",
      affectedEntity: "User",
      message: `Reset violations for user ${user.username} (ID: ${user.user_id})`,
      status: "Successful",
    });

    return res.status(200).json({
      success: true,
      message: "User violations reset successfully",
      data: {
        user_id: user.user_id,
        username: user.username,
        violation_count: 0,
        status: "active",
      },
    });
  } catch (error) {
    console.error("Error resetting user violations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset user violations",
      error: error.message,
    });
  }
};

// Update restrictions for all users
exports.updateAllUserRestrictions = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    // 1. Update users with violation_count > 2 to suspended
    const suspendedUsers = await User.findAll({
      where: {
        violation_count: { [Op.gt]: 2 },
        status: { [Op.ne]: "suspended" },
      },
      transaction,
    });

    if (suspendedUsers.length > 0) {
      await User.update(
        {
          status: "suspended",
          restriction_end_date: null, // No end date for suspended accounts
        },
        {
          where: { user_id: suspendedUsers.map((user) => user.user_id) },
          transaction,
        }
      );

      // Create audit log entries for each suspended user
      for (const user of suspendedUsers) {
        await createAuditTrail(
          {
            user_id: req.user.user_id,
            username: req.user.username,
            role: req.user.role,
            action: "Update User Status",
            affectedEntity: "User",
            message: `User ${user.username} (ID: ${user.user_id}) was suspended due to having more than 2 violations.`,
            status: "Successful",
          },
          { transaction }
        );
      }
    }

    // 2. Calculate restriction end date (15 days from now)
    const restrictionEndDate = new Date();
    restrictionEndDate.setDate(restrictionEndDate.getDate() + 15);

    // 3. Update users with violation_count > 1 (but ≤ 2) to restricted
    const restrictedUsers = await User.findAll({
      where: {
        violation_count: { [Op.gt]: 1, [Op.lte]: 2 },
        status: { [Op.ne]: "restricted" },
      },
      transaction,
    });

    if (restrictedUsers.length > 0) {
      await User.update(
        {
          status: "restricted",
          restriction_end_date: restrictionEndDate,
        },
        {
          where: { user_id: restrictedUsers.map((user) => user.user_id) },
          transaction,
        }
      );

      // Create audit log entries for each restricted user
      for (const user of restrictedUsers) {
        await createAuditTrail(
          {
            user_id: req.user.user_id,
            username: req.user.username,
            role: req.user.role,
            action: "Update User Status",
            affectedEntity: "User",
            message: `User ${user.username} (ID: ${user.user_id}) was restricted for 15 days due to having more than 1 violation.`,
            status: "Successful",
          },
          { transaction }
        );
      }
    }

    // Commit transaction
    await transaction.commit();

    // Return success response
    return res.status(200).json({
      success: true,
      message: "User restrictions updated successfully",
      data: {
        suspended: suspendedUsers.length,
        restricted: restrictedUsers.length,
        suspendedUsers: suspendedUsers.map((u) => ({
          id: u.user_id,
          username: u.username,
        })),
        restrictedUsers: restrictedUsers.map((u) => ({
          id: u.user_id,
          username: u.username,
        })),
      },
    });
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    console.error("Error updating user restrictions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user restrictions",
      error: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "user_id",
        "username",
        "email",
        "role",
        "first_name",
        "last_name",
        "status",
        "violation_count",
      ],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    console.log("Delete User Request body:", req.body); // Debug the request body

    const { ids } = req.body; // Expecting an array of IDs in the request body

    console.log("Delete user ids:", ids); // Debug the request body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No user IDs provided" });
    }

    const users = await User.findAll({ where: { user_id: ids } });

    if (users.length === 0) {
      return res.status(404).json({ message: "Users not found" });
    }

    // Log the successful action in the audit trail
    await createAuditTrail({
      user_id: req.user?.user_id || "unknown",
      username: req.user?.username || "unknown",
      role: req.user?.role || "unknown",
      action: "Delete User(s)",
      affectedEntity: "User", // Specify the affected entity
      message: `Admin deleted ${users.length} user(s): ${ids.join(", ")}`,
      status: "Successful",
    });

    // Delete all the users found
    await Promise.all(users.map((user) => user.destroy()));

    res
      .status(200)
      .json({ message: `${users.length} user(s) deleted successfully` });
  } catch (error) {
    console.error("Error deleting users:", error);

    // Log the failed action in the audit trail
    await createAuditTrail({
      user_id: req.user?.user_id || "unknown",
      username: req.user?.username || "unknown",
      role: req.user?.role || "unknown",
      action: "Delete User(s)",
      message: "Failed to delete users.",
      status: "Failed",
    });

    res.status(500).json({ message: "Error deleting users", error });
  }
};

// Admin can add a user
exports.addUser = async (req, res) => {
  try {
    const { email, first_name, last_name, username, role } = req.body;
    const allowedRoles = [
      "admin",
      "student",
      "employee",
      "alumni",
      "support staff",
    ];
    const formattedRole =
      role && allowedRoles.includes(role.toLowerCase())
        ? role.toLowerCase()
        : "student";

    if (!email || !first_name || !last_name || !username || !formattedRole) {
      return res
        .status(400)
        .json({ message: "All fields are required except password" });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Check if the username is already taken
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    // Generate a 2
    const temporaryPassword = crypto.randomBytes(8).toString("hex"); // 16-character random password
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Create the new user
    const newUser = await User.create({
      email,
      first_name,
      last_name,
      username,
      password_hash: hashedPassword,
      role: formattedRole,
      status: "active",
    });

    // Send an email to the user with their temporary password
    await resend.emails.send({
      from: resendhost, // Use only the verified sender email, no display name or quotes
      to: email,
      subject: "Welcome to TigerTix!",
      html: `
        <h1>Welcome to TigerTix, ${first_name}!</h1>
        <p>Your account has been successfully created. Here are your login details:</p>
        <ul>
          <li><strong>Username:</strong> ${username}</li>
          <li><strong>Temporary Password:</strong> ${temporaryPassword}</li>
        </ul>
        <p>Please log in and change your password as soon as possible.</p>
        <p>Thank you for joining TigerTix!</p>
      `,
    });

    await createAuditTrail({
      user_id: req.user.user_id,
      username: req.user.username,
      role: req.user.role,
      action: "Add User",
      message: `Admin added a new user: ${username} (${email})`,
      status: "Successful",
      affectedEntity: "User", // Specify the affected entity
    });

    res.status(201).json({
      message:
        "Account created successfully! A temporary password has been sent to the user's email.",
      user: { email, username, role: formattedRole },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Failed to create account. Please try again." });
  }
};

// Admin can update a user's status to "active", "restricted", or "suspended"
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Assuming the status is sent in the request body

    // Check if the status is valid
    const validStatuses = ["active", "restricted", "suspended"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Allowed statuses are: active, restricted, suspended.",
      });
    }

    // Ensure that all required fields are provided
    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    // Find the user in the database
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's status
    user.status = status;

    await createAuditTrail({
      user_id: req.user.user_id,
      username: req.user.username,
      role: req.user.role,
      action: "Update User Status",
      message: `Admin updated the status of user ID ${id} to ${status}`,
      status: "Successful",
      affectedEntity: "User", // Specify the affected entity
    });
    // Save the changes
    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ message: "Failed to update user. Please try again." });
  }
};

// Admin can update a user's role
exports.updateUserType = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // Assuming the role is sent in the request body

    // Check if the role is valid
    const validRoles = [
      "admin",
      "student",
      "employee",
      "alumni",
      "support staff",
    ];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message:
          "Invalid role. Allowed roles are: admin, student, employee, alumni, support staff.",
      });
    }

    // Ensure that all required fields are provided
    if (!role) {
      return res.status(400).json({ message: "Role is required." });
    }

    // Find the user in the database
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's role
    user.role = role;

    // Save the changes
    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ message: "Failed to update user. Please try again." });
  }
};

// Helper function to add a header with three logos
function addHeader(doc) {
  // Add the UST logo on the left
  doc.image(
    "/Users/user/Desktop/TigerTix/TigerTix/src/assets/USTLogo.png",
    50,
    30,
    { width: 70 }
  );

  // Add the IPEA logo in the center
  doc.image(
    "/Users/user/Desktop/TigerTix/TigerTix/src/assets/IPEA Logo.png",
    450,
    30,
    { width: 50 }
  );

  // Add the TigerTix logo on the right
  doc.image(
    "/Users/user/Desktop/TigerTix/TigerTix/src/assets/tigertix_logo.png",
    500,
    50,
    { width: 70 }
  );

  // Add the title text below the logos
  doc
    .font("Helvetica-Bold") // Set font to bold
    .fontSize(12)
    .text("University of Santo Tomas", 50, 50, { align: "center" })
    .fontSize(12)
    .text("Institute of Physical Education and Athletics", { align: "center" })
    .fontSize(12)
    .text("TigerTix: IPEA Events Reservation System", { align: "center" })
    .moveDown();
}

//Generate Events Report
exports.generateEventReport = async (req, res) => {
  try {
    const { eventId, columns } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required"
      });
    }

    // Fetch event details with associated reservations
    const event = await Event.findByPk(eventId, {
      include: [{
        model: Reservation,
        as: "Reservations",
        include: [{
          model: User,
          as: "User",
          attributes: ['username', 'email']
        }]
      }]
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Define valid columns
    const validColumns = [
      'reservation_id',
      'name',
      'ticket_tier',
      'claiming_date',
      'claiming_time',
      'amount',
      'claiming_status'
    ];

    // Validate and set default columns if none provided
    const selectedColumns = columns && columns.length > 0
      ? columns.filter(col => validColumns.includes(col))
      : validColumns;

    // Format the report data
    const reportData = event.Reservations.map(reservation => {
      const row = {};
      selectedColumns.forEach(col => {
        switch (col) {
          case 'name':
            row[col] = reservation.User?.username || 'N/A';
            break;
          case 'amount':
            row[col] = `₱${parseFloat(reservation[col] || 0).toLocaleString()}`;
            break;
          default:
            row[col] = reservation[col] || 'N/A';
        }
      });
      return row;
    });

    return res.status(200).json({
      success: true,
      data: {
        event: {
          name: event.name,
          event_date: event.event_date,
          venue: event.venue
        },
        columns: selectedColumns,
        reportData
      }
    });
  } catch (error) {
    console.error("Error generating event report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate event report",
      error: error.message
    });
  }
};

// Helper function to add a footer
function addFooter(doc) {
  // Add footer to the first page
  const addFooterToPage = () => {
    const currentDateTime = new Date().toLocaleString();
    const pageNumber = doc.page.number || 1; // Default to 1 if undefined

    doc
      .fontSize(10)
      .text(`Report as of ${currentDateTime}`, 50, 750, { align: "left" }) // Left-aligned footer
      .text("TigerTix Version 1.0 System", 0, 750, { align: "center" }) // Centered footer
      .text(`Page ${pageNumber}`, 0, 750, { align: "right" }); // Right-aligned footer
  };

  // Add footer to the first page
  addFooterToPage();

  // Add footer to subsequent pages
  doc.on("pageAdded", addFooterToPage);
}

exports.generateUserReport = async (req, res) => {
  try {
    const { columns } = req.body;

    // Define valid columns
    const validColumns = [
      'user_id',
      'username',
      'email',
      'role',
      'status',
      'violation_count',
      'created_at'
    ];

    // Validate and set default columns if none provided
    const selectedColumns = columns && columns.length > 0
      ? columns.filter(col => validColumns.includes(col))
      : validColumns;

    // Fetch all users with selected columns
    const users = await User.findAll({
      attributes: selectedColumns,
      order: [['created_at', 'DESC']]
    });

    // Format the report data
    const reportData = users.map(user => {
      const row = {};
      selectedColumns.forEach(col => {
        switch (col) {
          case 'created_at':
            row[col] = new Date(user[col]).toLocaleDateString();
            break;
          case 'violation_count':
            row[col] = user[col] || 0;
            break;
          default:
            row[col] = user[col] || 'N/A';
        }
      });
      return row;
    });

    return res.status(200).json({
      success: true,
      data: {
        columns: selectedColumns,
        reportData
      }
    });
  } catch (error) {
    console.error("Error generating user report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate user report",
      error: error.message
    });
  }
};
