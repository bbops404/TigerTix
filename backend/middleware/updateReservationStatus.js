const db = require("../models");
const Reservation = db.Reservation;
const ClaimingSlot = db.ClaimingSlot;
const { Op } = require("sequelize");

/**
 * Service to automatically update reservation statuses based on time
 */
const updateReservationStatus = {
  /**
   * Update pending reservations to unclaimed if the claiming period has ended
   * @returns {Promise<Object>} Results of the update operation
   */
  updatePendingToUnclaimed: async () => {
    try {
      const now = new Date();
      const results = {
        updated: 0,
        errors: [],
      };

      // Find all pending reservations
      const pendingReservations = await Reservation.findAll({
        where: {
          reservation_status: "pending",
        },
        include: [
          {
            model: db.ClaimingSlot,
            as: "ClaimingSlot",
            attributes: ["claiming_date", "end_time"],
          },
        ],
      });

      console.log(
        `Found ${pendingReservations.length} pending reservations to check`
      );

      // Filter reservations where claiming period has ended
      for (const reservation of pendingReservations) {
        try {
          // Skip if no claiming slot data
          if (!reservation.ClaimingSlot) {
            console.log(
              `Reservation ${reservation.reservation_id} has no claiming slot data, skipping`
            );
            continue;
          }

          const claimingDate = reservation.ClaimingSlot.claiming_date;
          const endTime = reservation.ClaimingSlot.end_time;

          // Skip if missing date or time
          if (!claimingDate || !endTime) {
            console.log(
              `Reservation ${reservation.reservation_id} has incomplete claiming slot data, skipping`
            );
            continue;
          }

          // Create date object for claiming end datetime
          const claimingEndDateTime = new Date(`${claimingDate}T${endTime}`);

          // If the claiming period has ended (current time is after claiming end time)
          if (now > claimingEndDateTime) {
            console.log(
              `Reservation ${reservation.reservation_id} claiming period has ended, updating to unclaimed`
            );

            // Update status to unclaimed
            await reservation.update({
              reservation_status: "unclaimed",
            });

            results.updated++;
          }
        } catch (error) {
          console.error(
            `Error processing reservation ${reservation.reservation_id}:`,
            error
          );
          results.errors.push({
            reservation_id: reservation.reservation_id,
            error: error.message,
          });
        }
      }

      return results;
    } catch (error) {
      console.error("Error updating pending reservations to unclaimed:", error);
      throw error;
    }
  },
};

module.exports = updateReservationStatus;
