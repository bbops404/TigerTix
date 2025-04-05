const bcrypt = require("bcryptjs");
const db = require("../config/db"); // Import Sequelize instance
const User = require("../models/Users");

async function createUser() {
  try {
    await db.authenticate(); // Ensure the database connection is established
    console.log("Database connected successfully!");

    const existingUser = await User.findOne({ where: { email: "jamia.navarro.cics@ust.edu.ph" } });
    if (existingUser) {
      console.log("User already exists.");
      return;
    }

    // Generate hashed password
    const plainPassword = "j";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log("Hashed Password:", hashedPassword); // Check if it's hashed properly

    // Create user
    await User.create({
      first_name: "jamia",
      last_name: "navarro",
      email: "jamia.navarro.cics@ust.edu.ph",
      username: "jamiargh",
      password_hash: hashedPassword,
      role: "student",
      status: "active",
      violation_count: 0,
    });

    console.log("✅ User created successfully.");
  } catch (error) {
    console.error("❌ Error creating user:", error);
  }
}

createUser();