// controllers/userController.js
const db = require("../models");
const User = db.User;
const Reservation = db.Reservation;
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const userController = {
  // Get user's restriction status
  getUserRestrictionStatus: async (req, res) => {
    try {
      // Get the authenticated user's ID
      const userId = req.user.user_id;

      // Find the user in the database
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check restriction status
      let restrictionStatus = "none";
      let message = "You have no active restrictions.";
      let daysRemaining = 0;

      if (user.status === "suspended") {
        restrictionStatus = "suspended";
        message =
          "Your account has been suspended due to multiple violations. Please contact support for assistance.";
      } else if (user.status === "restricted" && user.restriction_end_date) {
        const now = new Date();
        const endDate = new Date(user.restriction_end_date);

        if (now < endDate) {
          restrictionStatus = "restricted";

          // Calculate days remaining
          const diffTime = Math.abs(endDate - now);
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          message = `Your account is currently restricted from making reservations. This restriction will be lifted in ${daysRemaining} day(s).`;
        } else {
          // If restriction has ended but status not updated
          await user.update({
            status: "active",
            restriction_end_date: null,
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          username: user.username,
          violation_count: user.violation_count,
          status: user.status,
          restriction_status: restrictionStatus,
          message: message,
          days_remaining: daysRemaining,
          restriction_end_date: user.restriction_end_date,
        },
      });
    } catch (error) {
      console.error("Error getting user restriction status:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
  // Get current authenticated user profile// Get current authenticated user profile
  getCurrentUser: async (req, res) => {
    try {
      // Detailed debug logs
      console.log("GET /users/me - Auth request received");
      console.log("User from request:", JSON.stringify(req.user, null, 2));

      // User should be available from authentication middleware
      if (!req.user) {
        console.log("Error: No user in request");
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      // Use either userId or user_id, whichever is available
      const userId = req.user.userId || req.user.user_id;

      if (!userId) {
        console.log("Error: No user ID found in token");
        return res.status(401).json({
          success: false,
          message: "User ID not found in authentication token",
        });
      }

      console.log(`Looking up user with ID: ${userId}`);

      // Get user without exposing sensitive data
      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password_hash"] },
      });

      console.log(`User lookup result: ${user ? "Found" : "Not Found"}`);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if there's a restriction and add relevant info
      let restrictionInfo = null;

      if (user.status === "restricted" && user.restriction_end_date) {
        const now = new Date();
        const endDate = new Date(user.restriction_end_date);

        if (now < endDate) {
          // Calculate days remaining
          const diffTime = Math.abs(endDate - now);
          const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          restrictionInfo = {
            status: "restricted",
            end_date: user.restriction_end_date,
            days_remaining: daysRemaining,
            message: `Your account is restricted from making reservations for ${daysRemaining} more day(s)`,
          };
        } else {
          // If restriction has ended but status not updated, update it now
          await user.update({
            status: "active",
            restriction_end_date: null,
          });
        }
      } else if (user.status === "suspended") {
        restrictionInfo = {
          status: "suspended",
          message:
            "Your account has been suspended due to multiple violations. Please contact support.",
        };
      }

      // Return success with user data
      console.log("Returning user data successfully");
      return res.status(200).json({
        success: true,
        data: {
          ...user.toJSON(),
          restriction: restrictionInfo,
        },
      });
    } catch (error) {
      console.error("Error getting current user:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Update user profile (users can update their own data)
  updateUserProfile: async (req, res) => {
    try {
      // Only allow users to update their own profile unless admin
      const userId = req.params.id;
      const currentUser = req.user;

      if (userId !== currentUser.userId && currentUser.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "You can only update your own profile",
        });
      }

      const { first_name, last_name, email } = req.body;

      // Validate email uniqueness if being changed
      if (email) {
        const existingEmail = await User.findOne({
          where: {
            email,
            user_id: { [Op.ne]: userId },
          },
        });

        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: "Email is already in use",
          });
        }
      }

      // Get the user to update
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update fields
      await user.update({
        first_name: first_name || user.first_name,
        last_name: last_name || user.last_name,
        email: email || user.email,
      });

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status,
        },
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.params.id;

      // Only allow users to change their own password unless admin
      if (userId !== req.user.user_id && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "You can only change your own password",
        });
      }

      // Get the user
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify current password (skip this step for admins)
      if (userId === req.user.user_id) {
        const isPasswordValid = await bcrypt.compare(
          currentPassword,
          user.password_hash
        );

        if (!isPasswordValid) {
          return res.status(400).json({
            success: false,
            message: "Current password is incorrect",
          });
        }
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update the password
      await user.update({
        password_hash: hashedPassword,
      });

      return res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Validate multiple emails to verify they exist in the system
  validateUserEmails: async (req, res) => {
    try {
      const { emails } = req.body;

      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide an array of emails to validate",
        });
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter((email) => !emailRegex.test(email));

      if (invalidEmails.length > 0) {
        return res.status(400).json({
          success: false,
          message: "One or more emails have invalid format",
          invalidEmails,
        });
      }

      // Find users with the given emails
      const users = await User.findAll({
        where: {
          email: emails,
        },
        attributes: ["user_id", "email", "first_name", "last_name"], // Only return necessary data
      });

      // Check which emails exist and which don't
      const foundEmails = users.map((user) => user.email);
      const notFoundEmails = emails.filter(
        (email) => !foundEmails.includes(email)
      );

      if (notFoundEmails.length > 0) {
        return res.status(404).json({
          success: false,
          message: "One or more emails not found in the system",
          notFoundEmails,
          foundUsers: users,
        });
      }

      // All emails exist in the system
      return res.status(200).json({
        success: true,
        message: "All emails validated successfully",
        users,
      });
    } catch (error) {
      console.error("Error validating emails:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Get user IDs by email addresses
  getUserIdsByEmail: async (req, res) => {
    try {
      const { emails } = req.body;

      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide an array of emails",
        });
      }

      // Find users with the given emails
      const users = await User.findAll({
        where: {
          email: emails,
        },
        attributes: ["user_id", "email"], // Only return necessary data
      });

      // Create a map of email to user_id
      const userIds = [];
      for (const email of emails) {
        const user = users.find((u) => u.email === email);
        if (user) {
          userIds.push(user.user_id);
        } else {
          // If email not found, push null
          userIds.push(null);
        }
      }

      return res.status(200).json({
        success: true,
        userIds,
      });
    } catch (error) {
      console.error("Error getting user IDs by email:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Get user reservations
  getUserReservations: async (req, res) => {
    try {
      const { user_id } = req.params;

      // Make sure users can only view their own reservations unless admin
      if (user_id !== req.user.user_id && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "You can only view your own reservations",
        });
      }

      const reservations = await db.Reservation.findAll({
        where: { user_id },
        include: [
          {
            model: db.Event,
            as: "Event",
          },
          {
            model: db.Ticket,
            as: "Tickets",
          },
          {
            model: db.ClaimingSlot,
            as: "ClaimingSlot",
          },
        ],
      });

      return res.status(200).json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      console.error("Error fetching user reservations:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = userController;
