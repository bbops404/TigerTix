// ========================================================
// EVENT SCHEDULER SERVICE
// Responsible for all scheduled tasks related to event management
// ========================================================
const cron = require("node-cron");
const db = require("./models");
const autoStatusCheck = require("./middleware/autoStatusCheck");
const { Op } = require("sequelize");

// If you have a controller or service for reservation status update:
const updateReservationStatusService = require("./middleware/updateReservationStatus"); // Replace path if needed

/**
 * Initialize and start all scheduled tasks
 * @param {Object} io - Socket.io instance for real-time updates
 */
const initScheduler = (io) => {
  // ========================================================
  // 1. EVENT STATUS UPDATE - EVERY MINUTE
  // ========================================================
  cron.schedule("* * * * *", async () => {
    console.log("🕒 [1m] Running: Event status updater");

    try {
      const updatedEvents = await autoStatusCheck.updateEventStatuses();

      if (updatedEvents?.length > 0) {
        console.log(`✅ Updated ${updatedEvents.length} events`);

        if (io) {
          io.emit("events-updated", {
            updated: updatedEvents,
            message: "Event statuses auto-updated",
          });
        }
      } else {
        console.log("ℹ️ No events required status update");
      }
    } catch (error) {
      console.error("❌ Error updating event statuses:", error);
    }
  });

  // ========================================================
  // 2. RESERVATION STATUS UPDATE - EVERY 5 MINUTES
  // ========================================================
  cron.schedule("*/5 * * * *", async () => {
    console.log("🕒 [5m] Running: Reservation status updater");

    try {
      const results =
        await updateReservationStatusService.updatePendingToUnclaimed();

      if (results.updated > 0) {
        console.log(`✅ ${results.updated} reservations marked as unclaimed`);

        if (io) {
          io.emit("reservations-updated", {
            message: `${results.updated} reservations were marked as unclaimed`,
            type: "status-update",
            count: results.updated,
          });
        }
      } else {
        console.log("ℹ️ No reservations needed status update");
      }
    } catch (error) {
      console.error("❌ Error updating reservation statuses:", error);
    }
  });

  // ========================================================
  // 3. UPCOMING STATUS CHANGES DETECTOR - EVERY 5 MINUTES
  // ========================================================
  cron.schedule("*/5 * * * *", async () => {
    console.log("🕒 [5m] Running: Check for upcoming event status changes");

    try {
      const now = new Date();
      const lookAheadMinutes = 15;

      const events = await db.Event.findAll({
        where: {
          [Op.or]: [
            {
              status: "scheduled",
              event_type: "ticketed",
              visibility: "published",
              reservation_start_date: { [Op.not]: null },
              reservation_start_time: { [Op.not]: null },
            },
            {
              status: "open",
              event_type: "ticketed",
              visibility: "published",
              reservation_end_date: { [Op.not]: null },
              reservation_end_time: { [Op.not]: null },
            },
            {
              visibility: "unpublished",
              status: "scheduled",
              display_start_date: { [Op.not]: null },
              display_start_time: { [Op.not]: null },
            },
          ],
        },
      });

      const upcomingChanges = [];

      events.forEach((event) => {
        const checkTime = (date, time) => new Date(`${date}T${time}`);
        const getDiff = (target) => (target - now) / (1000 * 60);

        if (
          event.status === "scheduled" &&
          event.reservation_start_date &&
          event.reservation_start_time
        ) {
          const diff = getDiff(
            checkTime(
              event.reservation_start_date,
              event.reservation_start_time
            )
          );
          if (diff > 0 && diff <= lookAheadMinutes) {
            upcomingChanges.push({
              id: event.id,
              name: event.name,
              changeType: "open",
              scheduledTime: checkTime(
                event.reservation_start_date,
                event.reservation_start_time
              ),
              minutesRemaining: Math.round(diff),
            });
          }
        }

        if (
          event.status === "open" &&
          event.reservation_end_date &&
          event.reservation_end_time
        ) {
          const diff = getDiff(
            checkTime(event.reservation_end_date, event.reservation_end_time)
          );
          if (diff > 0 && diff <= lookAheadMinutes) {
            upcomingChanges.push({
              id: event.id,
              name: event.name,
              changeType: "close",
              scheduledTime: checkTime(
                event.reservation_end_date,
                event.reservation_end_time
              ),
              minutesRemaining: Math.round(diff),
            });
          }
        }

        if (
          event.visibility === "unpublished" &&
          event.display_start_date &&
          event.display_start_time
        ) {
          const diff = getDiff(
            checkTime(event.display_start_date, event.display_start_time)
          );
          if (diff > 0 && diff <= lookAheadMinutes) {
            upcomingChanges.push({
              id: event.id,
              name: event.name,
              changeType: "publish",
              scheduledTime: checkTime(
                event.display_start_date,
                event.display_start_time
              ),
              minutesRemaining: Math.round(diff),
            });
          }
        }
      });

      if (upcomingChanges.length > 0) {
        console.log(
          `📢 ${upcomingChanges.length} events have upcoming changes:`,
          upcomingChanges.map(
            (e) => `${e.name} will ${e.changeType} in ${e.minutesRemaining} min`
          )
        );

        if (io) {
          io.emit("upcoming-status-changes", {
            upcomingChanges,
            message: "Events with upcoming status changes",
          });
        }
      } else {
        console.log("ℹ️ No upcoming status changes found");
      }
    } catch (error) {
      console.error("❌ Error checking upcoming status changes:", error);
    }
  });

  console.log("✅ Scheduler services initialized successfully ⏰");
};

module.exports = {
  initScheduler,
};
