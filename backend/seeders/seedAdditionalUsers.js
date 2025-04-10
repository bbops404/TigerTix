const bcrypt = require("bcryptjs");
const db = require("../config/db"); // Import Sequelize instance
const User = require("../models/Users");

async function createAdditionalUsers() {
  try {
    await db.authenticate(); // Ensure the database connection is established
    console.log("Database connected successfully!");

    const users = [
      [
        {
          first_name: "Liam",
          last_name: "Samillano",
          email: "liam.samillano@ust.edu.ph",
          username: "liamsamillano",
          password_hash: "liam123",
          role: "student",
          status: "active",
          violation_count: 0
        },
        {
          first_name: "Jamia",
          last_name: "Navarro",
          email: "jamia.navarro.cics@ust.edu.ph",
          username: "jnavarro",
          password_hash: "jamia123",
          role: "student",
          status: "restricted",
          violation_count: 1
        },
        {
          first_name: "Christian",
          last_name: "Buenagua",
          email: "christianbhernan.buenagua.cics@ust.edu.ph",
          username: "cbuenagua",
          password_hash: "christian123",
          role: "student",
          status: "active",
          violation_count: 2
        },
        {
          first_name: "Jaiddie",
          last_name: "Pangilinan",
          email: "jaiddie.pangilinan.cics@ust.edu.ph",
          username: "jpangilinan",
          password_hash: "jaiddie123",
          role: "student",
          status: "active",
          violation_count: 0
        },
        {
          first_name: "Andrea",
          last_name: "Dumanat",
          email: "andreanicole.dumanat.cics@ust.edu.ph",
          username: "adumanat",
          password_hash: "andrea123",
          role: "student",
          status: "active",
          violation_count: 0
        },
        {
          first_name: "Natasha",
          last_name: "Namujhe",
          email: "natasha.namujhe.cics@ust.edu.ph",
          username: "nnamujhe",
          password_hash: "natasha123",
          role: "student",
          status: "active",
          violation_count: 0
        },
        {
          first_name: "Yvhan",
          last_name: "Fermin",
          email: "raudmonyvhan.fermin.cics@ust.edu.ph",
          username: "yfermin",
          password_hash: "yvhan123",
          role: "student",
          status: "active",
          violation_count: 0
        }
      ]      
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