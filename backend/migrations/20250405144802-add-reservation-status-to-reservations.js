module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("reservations", "reservation_status", {
      type: Sequelize.ENUM("pending", "claimed", "unclaimed", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("reservations", "reservation_status");
  },
};