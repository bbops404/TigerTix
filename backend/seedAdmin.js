const bcrypt = require("bcryptjs");
const User = require("./models/Users");

async function createAdmin() {
  try {
    const existingAdmin = await User.findOne({ where: { role: "admin" } });
    if (existingAdmin) {
      console.log("Admin already exists.");
      return;
    }

    // Generate hashed password
    const plainPassword = "admin123";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log("Hashed Password:", hashedPassword); // Check if it's hashed properly

    // Create admin user
    await User.create({
      first_name: "Admin",
      last_name: "User",
      email: "admin@ust.edu.ph",
      username: "admin",
      password_hash: hashedPassword,
      role: "admin",
      status: "active",
    });

    console.log("✅ Admin user created successfully.");
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  }
}

createAdmin();
