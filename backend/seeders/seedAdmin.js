const bcrypt = require("bcryptjs");
const User = require("../models/Users");


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
      last_name: "User1",
      email: "admin@ust.edu.ph",
      username: "admin1",
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

// const bcrypt = require("bcryptjs");
// const User = require("./models/Users");

// async function createAdmin() {
//   try {
//     // Create an array with the admin details
//     const admins = [
//       {
//         first_name: "Admin",
//         last_name: "User1",
//         email: "admin@ust.edu.ph",
//         username: "admin1",
//       },
//       {
//         first_name: "Admin",
//         last_name: "User2",
//         email: "admin2@ust.edu.ph",
//         username: "admin2",
//       },
//       {
//         first_name: "Admin",
//         last_name: "User3",
//         email: "admin3@ust.edu.ph",
//         username: "admin3",
//       },
//     ];

//     // Loop through the admins and create each one
//     for (const admin of admins) {
//       const existingAdmin = await User.findOne({ where: { username: admin.username } });
//       if (existingAdmin) {
//         console.log(`${admin.username} already exists.`);
//         continue;
//       }

//       // Generate hashed password
//       const plainPassword = "admin123";
//       const hashedPassword = await bcrypt.hash(plainPassword, 10);

//       console.log(`Hashed Password for ${admin.username}:`, hashedPassword);

//       // Create admin user
//       await User.create({
//         first_name: admin.first_name,
//         last_name: admin.last_name,
//         email: admin.email,
//         username: admin.username,
//         password_hash: hashedPassword,
//         role: "admin",
//         status: "active",
//       });

//       console.log(`✅ ${admin.username} created successfully.`);
//     }
//   } catch (error) {
//     console.error("❌ Error creating admin:", error);
//   }
// }

// createAdmin();

