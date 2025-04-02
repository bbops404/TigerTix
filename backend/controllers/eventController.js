const { Event, Ticket, ClaimingSlot, sequelize } = require("../models");
const { Op } = require("sequelize");

/**
 * Event Controller with methods for creating and managing events
 * based on the event lifecycle rules
 */
class EventController {
  /**
   * Create a draft event
   * - Visibility: Unpublished
   * - Status: Draft
   */
  async createDraftEvent(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const eventData = {
        ...req.body,
        status: "draft",
        visibility: "unpublished",
        created_by: req.user?.id || null,
      };

      const event = await Event.create(eventData, { transaction });

      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: "Draft event created successfully",
        data: {
          event_id: event.id,
          name: event.name,
          status: event.status,
          visibility: event.visibility,
        },
      });
    } catch (error) {
      await transaction.rollback();

      console.error("Error creating draft event:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create draft event",
        error: error.message,
      });
    }
  }

  /**
   * Create a complete event
   * Status and visibility set based on event type
   */
  async createEvent(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { event_type, status, visibility } = req.body;

      // Apply status and visibility rules based on event type
      let eventData = {
        ...req.body,
        created_by: req.user?.id || null,
      };

      // Set default statuses if not provided
      if (!status) {
        switch (event_type) {
          case "coming_soon":
            eventData.status = "scheduled";
            eventData.visibility = "published";
            break;
          case "free":
            eventData.status = "closed";
            eventData.visibility = "published";
            break;
          case "ticketed":
            // For ticketed events, check reservation dates to determine status
            const now = new Date();
            if (eventData.reservation_start && eventData.reservation_end) {
              const reservationStart = new Date(eventData.reservation_start);
              const reservationEnd = new Date(eventData.reservation_end);

              if (now < reservationStart) {
                eventData.status = "scheduled";
              } else if (now >= reservationStart && now <= reservationEnd) {
                eventData.status = "open";
              } else {
                eventData.status = "closed";
              }
            } else {
              // Default if no reservation dates set
              eventData.status = "scheduled";
            }
            eventData.visibility = "published";
            break;
          default:
            eventData.status = "draft";
            eventData.visibility = "unpublished";
        }
      }

      const event = await Event.create(eventData, { transaction });

      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: {
          event_id: event.id,
          name: event.name,
          status: event.status,
          visibility: event.visibility,
          event_type: event.event_type,
        },
      });
    } catch (error) {
      await transaction.rollback();

      console.error("Error creating event:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create event",
        error: error.message,
      });
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(req, res) {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    try {
      const event = await Event.findByPk(id);

      if (!event) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Handle event status transitions based on rules
      const { status, visibility, ...updateData } = req.body;

      const eventData = {
        ...updateData,
        updated_by: req.user?.id || null,
      };

      // Handle status transitions if status is specified in the request
      if (status) {
        // Only allow cancellation for published events
        if (status === "cancelled" && event.visibility !== "published") {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "Only published events can be cancelled",
          });
        }

        eventData.status = status;
      }

      // Handle visibility transitions if specified in the request
      if (visibility) {
        // Check if the visibility transition is valid
        if (visibility === "archived" && event.visibility !== "unpublished") {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "Only unpublished events can be archived",
          });
        }

        eventData.visibility = visibility;
      }

      // If reservation dates are updated, update status for ticketed events
      if (
        event.event_type === "ticketed" &&
        (eventData.reservation_start || eventData.reservation_end)
      ) {
        const now = new Date();
        const reservationStart = new Date(
          eventData.reservation_start || event.reservation_start
        );
        const reservationEnd = new Date(
          eventData.reservation_end || event.reservation_end
        );

        if (now < reservationStart) {
          eventData.status = "scheduled";
        } else if (now >= reservationStart && now <= reservationEnd) {
          eventData.status = "open";
        } else {
          eventData.status = "closed";
        }
      }

      // Update event with the modified data
      await event.update(eventData, { transaction });

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Event updated successfully",
        data: {
          event_id: event.id,
          name: event.name,
          status: event.status,
          visibility: event.visibility,
        },
      });
    } catch (error) {
      await transaction.rollback();

      console.error("Error updating event:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update event",
        error: error.message,
      });
    }
  }

  /**
   * Create ticket tiers for an event
   */
  async createTicketsBulk(req, res) {
    const { eventId } = req.params;
    const { tickets } = req.body;
    const transaction = await sequelize.transaction();

    try {
      const event = await Event.findByPk(eventId);

      if (!event) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Create all ticket tiers
      const createdTickets = await Promise.all(
        tickets.map((ticket) =>
          Ticket.create(
            {
              ...ticket,
              event_id: eventId,
            },
            { transaction }
          )
        )
      );

      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: "Tickets created successfully",
        data: {
          event_id: eventId,
          tickets_count: createdTickets.length,
          tickets: createdTickets.map((ticket) => ({
            id: ticket.id,
            ticket_type: ticket.ticket_type,
            total_quantity: ticket.total_quantity,
          })),
        },
      });
    } catch (error) {
      await transaction.rollback();

      console.error("Error creating tickets:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create tickets",
        error: error.message,
      });
    }
  }

  /**
   * Create claiming slots for an event
   */
  async createClaimingSlotsBulk(req, res) {
    const { eventId } = req.params;
    const { claimingSlots } = req.body;
    const transaction = await sequelize.transaction();

    try {
      const event = await Event.findByPk(eventId);

      if (!event) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Create all claiming slots
      const createdSlots = await Promise.all(
        claimingSlots.map((slot) =>
          ClaimingSlot.create(
            {
              ...slot,
              event_id: eventId,
            },
            { transaction }
          )
        )
      );

      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: "Claiming slots created successfully",
        data: {
          event_id: eventId,
          slots_count: createdSlots.length,
          slots: createdSlots.map((slot) => ({
            id: slot.id,
            claiming_date: slot.claiming_date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            venue: slot.venue,
            max_claimers: slot.max_claimers,
          })),
        },
      });
    } catch (error) {
      await transaction.rollback();

      console.error("Error creating claiming slots:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create claiming slots",
        error: error.message,
      });
    }
  }

  /**
   * Delete an event (move to archived for unpublished events)
   */
  async deleteEvent(req, res) {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    try {
      const event = await Event.findByPk(id);

      if (!event) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Apply deletion rules based on visibility
      if (event.visibility === "published") {
        // Published events can only be cancelled, not deleted
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message:
            "Published events cannot be deleted, they must be cancelled first",
        });
      } else if (event.visibility === "unpublished") {
        // Unpublished events move to archived state
        await event.update(
          {
            visibility: "archived",
            status: "closed",
            updated_by: req.user?.id || null,
          },
          { transaction }
        );

        await transaction.commit();

        return res.status(200).json({
          success: true,
          message: "Event moved to archive successfully",
          data: {
            event_id: event.id,
            status: "closed",
            visibility: "archived",
          },
        });
      } else if (event.visibility === "archived") {
        // Already archived, nothing to do
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Event is already archived",
        });
      }
    } catch (error) {
      await transaction.rollback();

      console.error("Error deleting event:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete event",
        error: error.message,
      });
    }
  }

  /**
   * Permanently delete an event from archive
   */
  async permanentlyDeleteEvent(req, res) {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    try {
      const event = await Event.findByPk(id);

      if (!event) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Only allow permanent deletion for archived events
      if (event.visibility !== "archived") {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Only archived events can be permanently deleted",
        });
      }

      // Perform hard delete (force: true overrides paranoid mode)
      await event.destroy({ force: true, transaction });

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Event permanently deleted successfully",
      });
    } catch (error) {
      await transaction.rollback();

      console.error("Error permanently deleting event:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to permanently delete event",
        error: error.message,
      });
    }
  }

  /**
   * Get all events with filtering options
   */
  async getEvents(req, res) {
    try {
      const {
        status,
        visibility,
        event_type,
        category,
        from_date,
        to_date,
        page = 1,
        limit = 10,
      } = req.query;

      // Build filter conditions
      const whereConditions = {};

      if (status) whereConditions.status = status;
      if (visibility) whereConditions.visibility = visibility;
      if (event_type) whereConditions.event_type = event_type;
      if (category) whereConditions.category = category;

      // Date range filtering
      if (from_date && to_date) {
        whereConditions.event_date = {
          [Op.between]: [from_date, to_date],
        };
      } else if (from_date) {
        whereConditions.event_date = {
          [Op.gte]: from_date,
        };
      } else if (to_date) {
        whereConditions.event_date = {
          [Op.lte]: to_date,
        };
      }

      // Calculate pagination
      const offset = (page - 1) * limit;

      // Fetch events with pagination
      const { count, rows: events } = await Event.findAndCountAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: Ticket,
            as: "tickets",
            attributes: [
              "id",
              "ticket_type",
              "price",
              "total_quantity",
              "available_quantity",
            ],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        data: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(count / limit),
          events,
        },
      });
    } catch (error) {
      console.error("Error fetching events:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch events",
        error: error.message,
      });
    }
  }

  /**
   * Get a single event by ID
   */
  async getEvent(req, res) {
    try {
      const { id } = req.params;

      const event = await Event.findByPk(id, {
        include: [
          {
            model: Ticket,
            as: "tickets",
            attributes: [
              "id",
              "seat_type",
              "ticket_type",
              "price",
              "total_quantity",
              "available_quantity",
              "max_per_user",
            ],
          },
          {
            model: ClaimingSlot,
            as: "claimingSlots",
            attributes: [
              "id",
              "claiming_date",
              "start_time",
              "end_time",
              "venue",
              "max_claimers",
              "current_claimers",
            ],
          },
        ],
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error) {
      console.error("Error fetching event:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch event",
        error: error.message,
      });
    }
  }

  /**
   * Cancel an event
   * - Only for published events
   * - Sets status to cancelled but keeps visibility as published
   */
  async cancelEvent(req, res) {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    try {
      const event = await Event.findByPk(id);

      if (!event) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Only published events can be cancelled
      if (event.visibility !== "published") {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Only published events can be cancelled",
        });
      }

      await event.update(
        {
          status: "cancelled",
          // Keep visibility as published
          updated_by: req.user?.id || null,
        },
        { transaction }
      );

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Event cancelled successfully",
        data: {
          event_id: event.id,
          name: event.name,
          status: "cancelled",
          visibility: "published",
        },
      });
    } catch (error) {
      await transaction.rollback();

      console.error("Error cancelling event:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to cancel event",
        error: error.message,
      });
    }
  }

  /**
   * Archive an event
   * - Available for cancelled events or when display period is over
   */
  async archiveEvent(req, res) {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    try {
      const event = await Event.findByPk(id);

      if (!event) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      const now = new Date();
      const displayEndDate = event.display_end_date
        ? new Date(event.display_end_date)
        : null;

      // Check if event is eligible for archiving
      const isDisplayPeriodOver = displayEndDate && now > displayEndDate;
      const isCancelled = event.status === "cancelled";
      const isUnpublished = event.visibility === "unpublished";

      if (!isCancelled && !isDisplayPeriodOver && !isUnpublished) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message:
            "Event can only be archived if it is cancelled, unpublished, or the display period is over",
        });
      }

      await event.update(
        {
          visibility: "archived",
          status: event.status === "cancelled" ? "cancelled" : "closed",
          updated_by: req.user?.id || null,
        },
        { transaction }
      );

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Event archived successfully",
        data: {
          event_id: event.id,
          name: event.name,
          status: event.status,
          visibility: "archived",
        },
      });
    } catch (error) {
      await transaction.rollback();

      console.error("Error archiving event:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to archive event",
        error: error.message,
      });
    }
  }

  /**
   * Publish a draft event
   * - Changes visibility to published
   * - Sets appropriate status based on event type
   */
  async publishEvent(req, res) {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    try {
      const event = await Event.findByPk(id);

      if (!event) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Only draft events can be published
      if (event.status !== "draft") {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Only draft events can be published",
        });
      }

      // Set status based on event type and dates
      let newStatus;
      const now = new Date();

      switch (event.event_type) {
        case "coming_soon":
          newStatus = "scheduled";
          break;
        case "free":
          newStatus = "closed";
          break;
        case "ticketed":
          // Check reservation dates if available
          if (event.reservation_start && event.reservation_end) {
            const reservationStart = new Date(event.reservation_start);
            const reservationEnd = new Date(event.reservation_end);

            if (now < reservationStart) {
              newStatus = "scheduled";
            } else if (now >= reservationStart && now <= reservationEnd) {
              newStatus = "open";
            } else {
              newStatus = "closed";
            }
          } else {
            // Default if no reservation dates set
            newStatus = "scheduled";
          }
          break;
        default:
          newStatus = "scheduled";
      }

      await event.update(
        {
          status: newStatus,
          visibility: "published",
          updated_by: req.user?.id || null,
        },
        { transaction }
      );

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Event published successfully",
        data: {
          event_id: event.id,
          name: event.name,
          status: newStatus,
          visibility: "published",
        },
      });
    } catch (error) {
      await transaction.rollback();

      console.error("Error publishing event:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to publish event",
        error: error.message,
      });
    }
  }

  /**
   * Restore an archived event to unpublished state
   */
  async restoreEvent(req, res) {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    try {
      const event = await Event.findByPk(id);

      if (!event) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Only archived events can be restored
      if (event.visibility !== "archived") {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Only archived events can be restored",
        });
      }

      await event.update(
        {
          visibility: "unpublished",
          // Keep status as is
          updated_by: req.user?.id || null,
        },
        { transaction }
      );

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Event restored successfully",
        data: {
          event_id: event.id,
          name: event.name,
          status: event.status,
          visibility: "unpublished",
        },
      });
    } catch (error) {
      await transaction.rollback();

      console.error("Error restoring event:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to restore event",
        error: error.message,
      });
    }
  }
}

module.exports = new EventController();
