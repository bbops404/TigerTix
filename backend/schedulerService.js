// ========================================================
// EVENT SCHEDULER SERVICE
// Responsible for all scheduled tasks related to event management
// ========================================================
const cron = require("node-cron");
const db = require("./models");
const autoStatusCheck = require("./middleware/autoStatusCheck");
const { Op } = require("sequelize");

/**
 * Initialize and start all scheduled tasks
 * @param {Object} io - Socket.io instance for real-time updates
 */
const initScheduler = (io) => {
  // ========================================================
  // EVENT STATUS UPDATE JOB - RUNS EVERY MINUTE
  // Automatically updates event statuses based on time
  // ========================================================
  cron.schedule("* * * * *", async () => {
    console.log("Running scheduled task: updating event statuses");

    try {
      // Use the autoStatusCheck service to check and update event statuses
      const updatedEvents = await autoStatusCheck.updateEventStatuses();

      if (updatedEvents && updatedEvents.length > 0) {
        console.log(
          `Updated ${updatedEvents.length} events:`,
          updatedEvents.map(
            (e) =>
              `${e.id} (${e.name}: ${
                e.update.oldStatus || e.update.oldVisibility
              } -> ${e.update.newStatus || e.update.newVisibility})`
          )
        );

        // Notify connected clients about the updates via socket.io
        if (io) {
          io.emit("events-updated", {
            updated: updatedEvents,
            message: "Event statuses have been updated automatically",
          });
        }
      } else {
        console.log("No events needed status updates");
      }
    } catch (error) {
      console.error("Error in scheduled event status update:", error);
    }
  });

  // ========================================================
  // UPCOMING STATUS CHANGES CHECK - RUNS EVERY 5 MINUTES
  // Proactively notifies about events that will change status soon
  // ========================================================
  cron.schedule("*/5 * * * *", async () => {
    console.log("Running scheduled task: checking upcoming status changes");

    try {
      const now = new Date();
      const lookAheadMinutes = 15; // Look 15 minutes ahead

      // Find events that will have status changes soon
      const events = await db.Event.findAll({
        where: {
          [Op.or]: [
            // Events that will open reservation soon
            {
              status: "scheduled",
              event_type: "ticketed",
              visibility: "published",
              reservation_start_date: { [Op.not]: null },
              reservation_start_time: { [Op.not]: null },
            },
            // Events that will close reservation soon
            {
              status: "open",
              event_type: "ticketed",
              visibility: "published",
              reservation_end_date: { [Op.not]: null },
              reservation_end_time: { [Op.not]: null },
            },
            // Events that will be published soon
            {
              visibility: "unpublished",
              status: "scheduled",
              display_start_date: { [Op.not]: null },
              display_start_time: { [Op.not]: null },
            },
          ],
        },
      });

      // Filter to events with changes in the next few minutes
      const upcomingChanges = [];

      events.forEach((event) => {
        // Check reservation opening soon
        if (
          event.status === "scheduled" &&
          event.reservation_start_date &&
          event.reservation_start_time
        ) {
          const startTime = new Date(
            `${event.reservation_start_date}T${event.reservation_start_time}`
          );
          const timeDiff = (startTime - now) / (1000 * 60); // diff in minutes

          if (timeDiff > 0 && timeDiff <= lookAheadMinutes) {
            upcomingChanges.push({
              id: event.id,
              name: event.name,
              changeType: "open",
              scheduledTime: startTime,
              minutesRemaining: Math.round(timeDiff),
            });
          }
        }

        // Check reservation closing soon
        if (
          event.status === "open" &&
          event.reservation_end_date &&
          event.reservation_end_time
        ) {
          const endTime = new Date(
            `${event.reservation_end_date}T${event.reservation_end_time}`
          );
          const timeDiff = (endTime - now) / (1000 * 60); // diff in minutes

          if (timeDiff > 0 && timeDiff <= lookAheadMinutes) {
            upcomingChanges.push({
              id: event.id,
              name: event.name,
              changeType: "close",
              scheduledTime: endTime,
              minutesRemaining: Math.round(timeDiff),
            });
          }
        }

        // Check display starting soon
        if (
          event.visibility === "unpublished" &&
          event.display_start_date &&
          event.display_start_time
        ) {
          const startTime = new Date(
            `${event.display_start_date}T${event.display_start_time}`
          );
          const timeDiff = (startTime - now) / (1000 * 60); // diff in minutes

          if (timeDiff > 0 && timeDiff <= lookAheadMinutes) {
            upcomingChanges.push({
              id: event.id,
              name: event.name,
              changeType: "publish",
              scheduledTime: startTime,
              minutesRemaining: Math.round(timeDiff),
            });
          }
        }
      });

      // If there are upcoming changes, log them and notify clients
      if (upcomingChanges.length > 0) {
        console.log(
          `Found ${upcomingChanges.length} events with upcoming status changes:`,
          upcomingChanges.map(
            (e) =>
              `${e.name} will ${e.changeType} in ${e.minutesRemaining} minutes`
          )
        );

        // Notify connected clients about upcoming changes via socket.io
        if (io) {
          io.emit("upcoming-status-changes", {
            upcomingChanges,
            message: "Events with upcoming status changes",
          });
        }
      }
    } catch (error) {
      console.error("Error checking upcoming status changes:", error);
    }
  });

  console.log("Event scheduler initialized successfully ⏰");
};

module.exports = {
  initScheduler,
};
