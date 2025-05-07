// middleware/checkUserRestrictions.js
/**
 * Middleware to check and update user restrictions based on dates
 * This will automatically remove restrictions that have expired
 */
const db = require("../models");
const User = db.User;
const { Op } = require("sequelize");

const checkUserRestrictions = async (req, res, next) => {
  try {
    // Skip if no user is authenticated
    if (!req.user || !req.user.user_id) {
      return next();
    }

    const userId = req.user.user_id;
    const currentUser = await User.findByPk(userId);

    if (!currentUser) {
      return next();
    }

    // If user is restricted and has a restriction end date
    if (
      currentUser.status === "restricted" &&
      currentUser.restriction_end_date
    ) {
      const now = new Date();
      const restrictionEnd = new Date(currentUser.restriction_end_date);

      // If restriction period has passed, update status to active
      if (now >= restrictionEnd) {
        await currentUser.update({
          status: "active",
          restriction_end_date: null,
        });

        // Update the user in the request object
        req.user.status = "active";
        req.user.restriction_end_date = null;

        console.log(`User ${userId} restriction has been lifted`);
      }
    }

    next();
  } catch (error) {
    console.error("Error checking user restrictions:", error);
    next(); // Continue even if there's an error
  }
};

// A scheduled task to update all user restrictions
const updateAllUserRestrictions = async (req, res) => {
  try {
    const { User } = require("../models");
    const { Op } = require("sequelize");
    const { createAuditTrail } = require("./auditTrailController");

    // Start a transaction to ensure all updates are atomic
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
      throw error;
    }
  } catch (error) {
    console.error("Error updating user restrictions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user restrictions",
      error: error.message,
    });
  }
};

module.exports = {
  checkUserRestrictions,
  updateAllUserRestrictions,
};
