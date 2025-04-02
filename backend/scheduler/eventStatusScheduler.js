const cron = require("node-cron");
const { Op } = require("sequelize");
const Event = require("../models/Event");

// Run every minute
cron.schedule("* * * * *", async () => {
  const now = new Date();

  try {
    // Find scheduled events whose reservation period has started
    const eventsToOpen = await Event.findAll({
      where: {
        status: "scheduled",
        reservation_start: {
          [Op.lte]: now, // Less than or equal to current time
        },
      },
    });

    // Update these events to "open" status
    for (const event of eventsToOpen) {
      await event.update({ status: "open" });
      console.log(
        `Event ${event.name} (${event.event_id}) status changed to open`
      );
    }

    // Find open events whose reservation period has ended
    const eventsToClose = await Event.findAll({
      where: {
        status: "open",
        reservation_end: {
          [Op.lte]: now, // Less than or equal to current time
        },
      },
    });

    // Update these events to "closed" status
    for (const event of eventsToClose) {
      await event.update({ status: "closed" });
      console.log(
        `Event ${event.name} (${event.event_id}) status changed to closed`
      );
    }
  } catch (error) {
    console.error("Error updating event statuses:", error);
  }
});
