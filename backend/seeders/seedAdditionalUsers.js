const bcrypt = require("bcryptjs");
const db = require("../config/db"); // Import Sequelize instance
const User = require("../models/Users");

async function createAdditionalUsers() {
  try {
    await db.authenticate(); // Ensure the database connection is established
    console.log("Database connected successfully!");

    const users = [
      {
        first_name: "Nayeon",
        last_name: "Im",
        email: "nayeon.im@ust.edu.ph",
        username: "nayeonim",
        plainPassword: "nayeonpass",
        role: "student",
        status: "active",
        violation_count: 0,
      },
      {
        first_name: "Jeongyeon",
        last_name: "Yoo",
        email: "jeongyeon.yoo@ust.edu.ph",
        username: "jeongyeonyoo",
        plainPassword: "jeongyeonpass",
        role: "faculty",
        status: "active",
        violation_count: 0,
      },
      {
        first_name: "Momo",
        last_name: "Hirai",
        email: "momo.hirai@ust.edu.ph",
        username: "momohirai",
        plainPassword: "momopass",
        role: "student",
        status: "active",
        violation_count: 0,
      },
      {
        first_name: "Sana",
        last_name: "Minatozaki",
        email: "sana.minatozaki@ust.edu.ph",
        username: "sanaminatozaki",
        plainPassword: "sanapass",
        role: "admin",
        status: "active",
        violation_count: 0,
      },
    ];

    for (const user of users) {
      const existingUser = await User.findOne({ where: { email: user.email } });
      if (existingUser) {
        console.log(`User with email ${user.email} already exists.`);
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(user.plainPassword, 10);

      // Create the user
      await User.create({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username,
        password_hash: hashedPassword,
        role: user.role,
        status: user.status,
        violation_count: user.violation_count,
      });

      console.log(`✅ User ${user.email} created successfully.`);
    }
  } catch (error) {
    console.error("❌ Error creating users:", error);
  }
}

createAdditionalUsers();