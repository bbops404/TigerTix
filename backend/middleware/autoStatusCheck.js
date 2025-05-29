/**
 * Auto Status Check Service
 * This service provides functions to automatically check and update event statuses
 */

// Import needed for direct database operations
const db = require("../models");
const Event = db.Event;
const { Op } = require("sequelize");
const moment = require('moment-timezone');

// Configure timezone for Philippines (Asia/Manila)
const PHILIPPINE_TIMEZONE = 'Asia/Manila';

const autoStatusCheck = {
  /**
   * Get current time in Philippine timezone
   * @returns {Date} Current time in Philippine timezone
   */
  getCurrentPhilippineTime: () => {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: PHILIPPINE_TIMEZONE }));
  },

  /**
   * Check if an event's status should be updated based on current time
   * @param {Object} event The event object to check
   * @returns {Object|null} Status update info or null if no change needed
   */
  checkEventStatus: (event) => {
    // Get current time in Philippine timezone using moment
    const phTime = moment().tz(PHILIPPINE_TIMEZONE);
    const today = phTime.format('YYYY-MM-DD');
    const currentTime = phTime.format('HH:mm:ss');

    console.log("🔍 Checking event status:", {
      eventId: event.id,
      eventName: event.name,
      currentStatus: event.status,
      currentVisibility: event.visibility,
      phTime: phTime.format(),
      timezone: PHILIPPINE_TIMEZONE,
      displayStartDate: event.display_start_date,
      displayStartTime: event.display_start_time,
      displayEndDate: event.display_end_date,
      displayEndTime: event.display_end_time,
      reservationStart: event.reservation_start_date && event.reservation_start_time ? 
        `${event.reservation_start_date}T${event.reservation_start_time}` : null,
      reservationEnd: event.reservation_end_date && event.reservation_end_time ? 
        `${event.reservation_end_date}T${event.reservation_end_time}` : null
    });

    // First check if display period has ended
    if (event.visibility === "published" && event.display_end_date && event.display_end_time) {
      const displayEndDateTime = moment.tz(
        `${event.display_end_date} ${event.display_end_time}`,
        'YYYY-MM-DD HH:mm:ss',
        PHILIPPINE_TIMEZONE
      );

      console.log("⏰ Checking display end:", {
        eventId: event.id,
        displayEndDateTime: displayEndDateTime.format(),
        currentTime: phTime.format(),
        timezone: PHILIPPINE_TIMEZONE,
        shouldUnpublish: phTime.isAfter(displayEndDateTime)
      });

      if (phTime.isAfter(displayEndDateTime)) {
        console.log("✅ Event should be unpublished:", {
          eventId: event.id,
          eventName: event.name,
          reason: "Display period has ended"
        });
        return {
          id: event.id,
          oldVisibility: event.visibility,
          newVisibility: "unpublished",
          oldStatus: event.status,
          newStatus: "closed",
          reason: "Display period has ended",
        };
      }
    }

    // Then check if display period has started
    if (event.visibility === "unpublished" && event.display_start_date && event.display_start_time) {
      const displayStartDateTime = moment.tz(
        `${event.display_start_date} ${event.display_start_time}`,
        'YYYY-MM-DD HH:mm:ss',
        PHILIPPINE_TIMEZONE
      );

      console.log("⏰ Checking display start:", {
        eventId: event.id,
        displayStartDateTime: displayStartDateTime.format(),
        currentTime: phTime.format(),
        timezone: PHILIPPINE_TIMEZONE,
        shouldPublish: phTime.isSameOrAfter(displayStartDateTime)
      });

      if (phTime.isSameOrAfter(displayStartDateTime)) {
        // Only publish if display period hasn't ended
        if (!event.display_end_date || !event.display_end_time || 
            phTime.isBefore(moment.tz(
              `${event.display_end_date} ${event.display_end_time}`,
              'YYYY-MM-DD HH:mm:ss',
              PHILIPPINE_TIMEZONE
            ))) {
          console.log("✅ Event should be published:", {
            eventId: event.id,
            eventName: event.name,
            reason: "Display period has started"
          });
          return {
            id: event.id,
            oldVisibility: event.visibility,
            newVisibility: "published",
            reason: "Display period has started",
          };
        }
      }
    }

    // Check reservation period for ticketed events
    if (event.event_type === "ticketed" && event.visibility === "published") {
      // Check if reservation period has started
      if (event.reservation_start_date && event.reservation_start_time) {
        const reservationStartDateTime = moment.tz(
          `${event.reservation_start_date} ${event.reservation_start_time}`,
          'YYYY-MM-DD HH:mm:ss',
          PHILIPPINE_TIMEZONE
        );

        if (phTime.isSameOrAfter(reservationStartDateTime)) {
          // Check if reservation period hasn't ended
          if (!event.reservation_end_date || !event.reservation_end_time || 
              phTime.isBefore(moment.tz(
                `${event.reservation_end_date} ${event.reservation_end_time}`,
                'YYYY-MM-DD HH:mm:ss',
                PHILIPPINE_TIMEZONE
              ))) {
            if (event.status === "scheduled") {
              return {
                id: event.id,
                oldStatus: event.status,
                newStatus: "open",
                reason: "Reservation period has started",
              };
            }
          } else if (event.status === "open") {
            return {
              id: event.id,
              oldStatus: event.status,
              newStatus: "closed",
              reason: "Reservation period has ended",
            };
          }
        }
      }
    }

    // Check if event has ended
    if (event.status !== "closed" && event.status !== "cancelled" && event.event_date) {
      const eventEndDateTime = moment.tz(
        `${event.event_date} ${event.event_end_time || '23:59:59'}`,
        'YYYY-MM-DD HH:mm:ss',
        PHILIPPINE_TIMEZONE
      );

      if (phTime.isAfter(eventEndDateTime)) {
        return {
          id: event.id,
          oldStatus: event.status,
          newStatus: "closed",
          reason: "Event has ended",
        };
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

      console.log(`Checking ${events.length} events for status updates...`);

      const eventsToUpdate = [];

      events.forEach((event) => {
        // Single check for both visibility and status updates
        const update = autoStatusCheck.checkEventStatus(event);
        if (update) {
          eventsToUpdate.push({
            event,
            update
          });
        }
      });

      if (eventsToUpdate.length > 0) {
        console.log(`Found ${eventsToUpdate.length} events that need updates:`, 
          eventsToUpdate.map(update => ({
            eventId: update.event.id,
            eventName: update.event.name,
            update: update.update
          }))
        );
      } else {
        console.log("No events need status updates at this time.");
      }

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

      // Create a map to consolidate updates by event ID
      const consolidatedUpdates = new Map();

      eventsToUpdate.forEach(({ event, update }) => {
        if (!consolidatedUpdates.has(event.id)) {
          consolidatedUpdates.set(event.id, {});
        }
        
        const eventUpdate = consolidatedUpdates.get(event.id);
        
        if (update.newStatus) {
          eventUpdate.status = update.newStatus;
        }
        
        if (update.newVisibility) {
          eventUpdate.visibility = update.newVisibility;
        }

        updatedEvents.push({
          id: event.id,
          name: event.name,
          update,
        });
      });

      // Apply consolidated updates in a single operation per event
      for (const [eventId, updateData] of consolidatedUpdates.entries()) {
        await Event.update(updateData, { where: { id: eventId } });
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
