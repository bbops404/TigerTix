const { AuditTrail } = require("../models");
const { Op } = require("sequelize");

// Fetch audit trail logs
exports.getAuditTrails = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    // Build the query
    const where = {};
    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { action: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Pagination
    const offset = (page - 1) * limit;

    // Fetch logs from the database
    const { count, rows } = await AuditTrail.findAndCountAll({
      where,
      order: [["timestamp", "DESC"]],
      offset,
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching audit trails:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.createAuditTrail = async (logData) => {
  try {
    console.log("Creating audit log:", logData); // Debug log

    const { user_id, username, role, action, affectedEntity, message, status } = logData;

    // Ensure all required fields are present
    if (!user_id || !username || !role || !action || !affectedEntity|| !message || !status) {
      console.error("Missing required fields for audit trail:", logData);
      return;
    }

    // Create the audit trail entry
    await AuditTrail.create({
      user_id,
      username,
      role,
      action,
      affectedEntity: affectedEntity || "Unknown", // Provide a default value if undefined
      message,
      status,
    });

    console.log("Audit trail created successfully");
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
};