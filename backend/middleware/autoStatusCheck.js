/**
 * Auto Status Check Service
 * This service provides functions to automatically check and update event statuses
 */

// Import needed for direct database operations
const db = require("../models");
const Event = db.Event;
const { Op } = require("sequelize");

const autoStatusCheck = {
  /**
   * Check if an event's status should be updated based on current time
   * @param {Object} event The event object to check
   * @returns {Object|null} Status update info or null if no change needed
   */
  checkEventStatus: (event) => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toISOString().split("T")[1].substring(0, 8); // HH:MM:SS format

    //Check for scheduled events that should be opened
    if (
      event.status === "scheduled" &&
      event.event_type === "ticketed" &&
      event.visibility === "published"
    ) {
      // Check if reservation period has started
      if (event.reservation_start_date && event.reservation_start_time) {
        const reservationStartDateObj = new Date(
          `${event.reservation_start_date}T${event.reservation_start_time}`
        );

        if (now >= reservationStartDateObj) {
          // Check if reservation period hasn't ended yet
          if (event.reservation_end_date && event.reservation_end_time) {
            const reservationEndDateObj = new Date(
              `${event.reservation_end_date}T${event.reservation_end_time}`
            );

            if (now <= reservationEndDateObj) {
              return {
                id: event.id,
                oldStatus: event.status,
                newStatus: "open",
                reason: "Reservation period has started",
              };
            }
          }
        }
      }
    }

    // Check for open events that should be closed
    if (
      event.status === "open" &&
      event.event_type === "ticketed" &&
      event.visibility === "published"
    ) {
      // Check if reservation period has ended
      if (event.reservation_end_date && event.reservation_end_time) {
        const reservationEndDateObj = new Date(
          `${event.reservation_end_date}T${event.reservation_end_time}`
        );

        if (now > reservationEndDateObj) {
          return {
            id: event.id,
            oldStatus: event.status,
            newStatus: "closed",
            reason: "Reservation period has ended",
          };
        }
      }
    }

    // Check for events with display period ended
    if (event.visibility === "published") {
      if (event.display_end_date && event.display_end_time) {
        const displayEndDateObj = new Date(
          `${event.display_end_date}T${event.display_end_time}`
        );

        if (now > displayEndDateObj) {
          return {
            id: event.id,
            oldVisibility: event.visibility,
            newVisibility: "unpublished",
            oldStatus: event.status,
            newStatus: "closed", // Always close when display period ends
            reason: "Display period has ended",
          };
        }
      }
    }

    // Check for events with display period started (future scheduled)
    if (
      event.visibility === "unpublished" &&
      event.status === "scheduled" &&
      event.display_start_date &&
      event.display_start_time
    ) {
      const displayStartDateObj = new Date(
        `${event.display_start_date}T${event.display_start_time}`
      );

      if (
        now >= displayStartDateObj &&
        (!event.display_end_date ||
          !event.display_end_time ||
          now <=
            new Date(`${event.display_end_date}T${event.display_end_time}`))
      ) {
        return {
          id: event.id,
          oldVisibility: event.visibility,
          newVisibility: "published",
          reason: "Display period has started",
        };
      }
    }

    // 5. Check for completed events (event date has passed)
    if (event.status !== "closed" && event.status !== "cancelled") {
      if (event.event_date) {
        // If event has ended today
        if (
          event.event_date === today &&
          event.event_end_time &&
          currentTime > event.event_end_time
        ) {
          return {
            id: event.id,
            oldStatus: event.status,
            newStatus: "closed",
            reason: "Event has ended",
          };
        }

        // If event date is in the past
        const eventDateObj = new Date(event.event_date);
        eventDateObj.setHours(23, 59, 59); // End of the day

        if (now > eventDateObj) {
          return {
            id: event.id,
            oldStatus: event.status,
            newStatus: "closed",
            reason: "Event date has passed",
          };
        }
      }
    }

    // No status change needed
    return null;
  },

  /**
   * Check all events for status updates and return list of events needing updates
   * @returns {Promise<Array>} Array of events that need status updates
   */
  checkAllEvents: async () => {
    try {
      // Get all active events
      const events = await Event.findAll({
        where: {
          status: {
            [Op.notIn]: ["cancelled"], // Skip cancelled events
          },
        },
      });

      const eventsToUpdate = [];

      events.forEach((event) => {
        const statusUpdate = autoStatusCheck.checkEventStatus(event);
        if (statusUpdate) {
          eventsToUpdate.push({
            event,
            update: statusUpdate,
          });
        }
      });

      return eventsToUpdate;
    } catch (error) {
      console.error("Error checking events for status updates:", error);
      return [];
    }
  },

  /**
   * Apply status updates to events that need updating
   * @returns {Promise<Array>} Array of updated events
   */
  updateEventStatuses: async () => {
    try {
      const eventsToUpdate = await autoStatusCheck.checkAllEvents();
      const updatedEvents = [];

      // Group updates by type for batch processing
      const statusUpdates = [];
      const visibilityUpdates = [];

      eventsToUpdate.forEach(({ event, update }) => {
        if (update.newStatus) {
          statusUpdates.push({
            id: event.id,
            newStatus: update.newStatus,
          });
        }

        if (update.newVisibility) {
          visibilityUpdates.push({
            id: event.id,
            newVisibility: update.newVisibility,
          });
        }

        updatedEvents.push({
          id: event.id,
          name: event.name,
          update,
        });
      });

      // Batch update both statuses and visibilities in a single operation per event
      if (statusUpdates.length > 0 || visibilityUpdates.length > 0) {
        // Create a map to consolidate updates by event ID
        const consolidatedUpdates = new Map();

        // Process status updates
        for (const update of statusUpdates) {
          if (!consolidatedUpdates.has(update.id)) {
            consolidatedUpdates.set(update.id, {});
          }
          consolidatedUpdates.get(update.id).status = update.newStatus;
        }

        // Process visibility updates
        for (const update of visibilityUpdates) {
          if (!consolidatedUpdates.has(update.id)) {
            consolidatedUpdates.set(update.id, {});
          }
          consolidatedUpdates.get(update.id).visibility = update.newVisibility;
        }

        // Apply consolidated updates
        for (const [eventId, updateData] of consolidatedUpdates.entries()) {
          await Event.update(updateData, { where: { id: eventId } });
        }
      }

      return updatedEvents;
    } catch (error) {
      console.error("Error updating event statuses:", error);
      return [];
    }
  },

  /**
   * Check if a specific event needs status update
   * @param {string} eventId The ID of the event to check
   * @returns {Promise<Object|null>} Status update info or null
   */
  checkEventById: async (eventId) => {
    try {
      const event = await Event.findByPk(eventId);

      if (!event) {
        return null;
      }

      return autoStatusCheck.checkEventStatus(event);
    } catch (error) {
      console.error(`Error checking event ${eventId} status:`, error);
      return null;
    }
  },
};

module.exports = autoStatusCheck;
