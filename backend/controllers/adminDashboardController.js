const db = require("../models"); // Import your Sequelize models
const { Op } = require("sequelize");

const adminDashboardController = {
  getDashboardMetrics: async (req, res) => {
    try {
      const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
      const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

      // Fetch total reservations
      const totalReservations = await db.Reservation.count();
      const lastMonthReservations = await db.Reservation.count({
        where: {
          createdAt: { // Use camelCase for Sequelize timestamps
            [Op.between]: [lastMonthStart, lastMonthEnd],
          },
        },
      });

      // Fetch total users
      const totalUsers = await db.User.count();
      const lastMonthUsers = await db.User.count({
        where: {
          createdAt: { // Use camelCase for Sequelize timestamps
            [Op.between]: [lastMonthStart, lastMonthEnd],
          },
        },
      });

      // Fetch total events
      const totalEvents = await db.Event.count();
      const lastMonthEvents = await db.Event.count({
        where: {
          createdAt: { // Use camelCase for Sequelize timestamps
            [Op.between]: [lastMonthStart, lastMonthEnd],
          },
        },
      });

      // Fetch completed events
      const completedEvents = await db.Event.count({
        where: { status: "completed" },
      });
      const lastMonthCompletedEvents = await db.Event.count({
        where: {
          status: "completed",
          createdAt: { // Use camelCase for Sequelize timestamps
            [Op.between]: [lastMonthStart, lastMonthEnd],
          },
        },
      });

      // Calculate percentage changes
      const calculatePercentageChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0; // Avoid division by zero
        return (((current - previous) / previous) * 100).toFixed(1);
      };

      const reservationChange = calculatePercentageChange(totalReservations, lastMonthReservations);
      const userChange = calculatePercentageChange(totalUsers, lastMonthUsers);
      const eventChange = calculatePercentageChange(totalEvents, lastMonthEvents);
      const completedEventChange = calculatePercentageChange(completedEvents, lastMonthCompletedEvents);

      // Return the metrics
      return res.status(200).json({
        success: true,
        data: {
          totalReservations,
          reservationChange,
          totalUsers,
          userChange,
          totalEvents,
          eventChange,
          completedEvents,
          completedEventChange,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = adminDashboardController;





