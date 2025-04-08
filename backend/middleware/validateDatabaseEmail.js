// middleware/validateDatabaseEmail.js
/**
 * Middleware to validate that emails exist in the database
 * This can be used in routes where email validation is required
 */
const db = require("../models");
const User = db.User;

const validateDatabaseEmail = async (req, res, next) => {
  try {
    // Check body for emails field which could be a string or array
    const emails = req.body.emails || (req.body.email ? [req.body.email] : []);

    // Convert single email to array for consistent processing
    const emailArray = Array.isArray(emails) ? emails : [emails];

    // If no emails to validate, continue
    if (emailArray.length === 0) {
      return next();
    }

    // Find users with the given emails
    const users = await User.findAll({
      where: {
        email: emailArray,
      },
      attributes: ["email"],
    });

    // Extract found emails
    const foundEmails = users.map((user) => user.email);

    // Check which emails don't exist in the database
    const notFoundEmails = emailArray.filter(
      (email) => !foundEmails.includes(email)
    );

    // If any emails are not found
    if (notFoundEmails.length > 0) {
      return res.status(404).json({
        success: false,
        message: "One or more emails are not registered in the system",
        notFoundEmails,
      });
    }

    // All emails exist in the database, continue
    next();
  } catch (error) {
    console.error("Error validating emails:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during email validation",
      error: error.message,
    });
  }
};

module.exports = validateDatabaseEmail;
