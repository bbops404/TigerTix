const sequelize = require("./config/db");
const AuditTrail = require("./models/AuditTrail");

const testAuditTrail = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    await sequelize.sync({ force: true }); // Drop and recreate all tables
    console.log("Database tables recreated successfully!");

    // Create a test audit trail entry
    const auditEntry = await AuditTrail.create({
      user_id: "123e4567-e89b-12d3-a456-426614174000",
      username: "admin",
      role: "Admin",
      action: "Test Action",
      message: "This is a test audit trail entry.",
      status: "Successful",
    });

    console.log("Audit trail entry created:", auditEntry.toJSON());
  } catch (error) {
    console.error("Error testing AuditTrail model:", error);
  } finally {
    await sequelize.close();
  }
};

testAuditTrail();