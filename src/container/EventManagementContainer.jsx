import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Admin_EventsManagement from "../pages/Admin/Admin_EventsManagement";
import eventService from "../pages/Services/eventService";
import io from "socket.io-client";

const EventsManagementContainer = () => {
  const [events, setEvents] = useState({
    OPEN: [],
    SCHEDULED: [],
    DRAFT: [],
    UNPUBLISHED: [],
    "COMING SOON": [],
    COMPLETED: [],
    CANCELLED: [],
    ARCHIVED: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch all events when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        // Fetch different types of events
        const publishedResponse = await eventService.events.getAll({
          visibility: "published",
        });

        const draftsResponse = await eventService.events.getDrafts();

        const comingSoonResponse = await eventService.events.getComingSoon();

        // Categorize events
        const categorizedEvents = categorizeEvents([
          ...(publishedResponse?.data || []),
          ...(draftsResponse?.data || []),
          ...(comingSoonResponse?.data || []),
        ]);

        setEvents(categorizedEvents);
        setError(null);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Function to categorize events by their status
  const categorizeEvents = (eventsList) => {
    const categorized = {
      OPEN: [],
      SCHEDULED: [],
      DRAFT: [],
      UNPUBLISHED: [],
      "COMING SOON": [],
      COMPLETED: [],
      CANCELLED: [],
      ARCHIVED: [],
    };

    eventsList.forEach((event) => {
      // Map the event to have frontend-friendly property names
      const mappedEvent = {
        id: event.id,
        eventName: event.name,
        eventDate: event.event_date,
        startTime: event.event_time,
        endTime: event.event_end_time,
        venue: event.venue,
        eventType: event.event_type,
        eventCategory: event.category,
        status: event.status,
        visibility: event.visibility,
        imagePreview: event.image,
        // Include other properties needed by your components
        details: event.details,
        display_start_date: event.display_start_date,
        display_end_date: event.display_end_date,
        display_start_time: event.display_start_time,
        display_end_time: event.display_end_time,
        reservation_start_date: event.reservation_start_date,
        reservation_end_date: event.reservation_end_date,
        reservation_start_time: event.reservation_start_time,
        reservation_end_time: event.reservation_end_time,
        // Include nested data if available
        tickets: event.tickets || [],
        claimingSlots: event.claimingSlots || [],
      };

      // Check if this is an event with future display date
      const isFutureDisplay = checkIfFutureDisplay(event);

      // Categorize by status and visibility
      if (event.visibility === "archived") {
        categorized.ARCHIVED.push(mappedEvent);
      } else if (event.status === "cancelled") {
        categorized.CANCELLED.push(mappedEvent);
      } else if (event.status === "draft") {
        categorized.DRAFT.push(mappedEvent);
      } else if (event.status === "open") {
        categorized.OPEN.push(mappedEvent);
      } else if (
        event.status === "scheduled" &&
        event.visibility === "published"
      ) {
        categorized.SCHEDULED.push(mappedEvent);
      } else if (
        event.status === "scheduled" &&
        event.visibility === "unpublished" &&
        isFutureDisplay
      ) {
        // Future display events should be in the UNPUBLISHED category
        categorized.UNPUBLISHED.push(mappedEvent);
      } else if (
        event.status === "closed" &&
        new Date(event.event_date) < new Date()
      ) {
        categorized.COMPLETED.push(mappedEvent);
      } else if (
        event.visibility === "unpublished" &&
        event.status !== "draft"
      ) {
        categorized.UNPUBLISHED.push(mappedEvent);
      }

      // Categorize coming soon events
      if (event.event_type === "coming_soon") {
        categorized["COMING SOON"].push(mappedEvent);
      }
    });

    return categorized;
  };

  // Helper function to check if an event has a future display date
  const checkIfFutureDisplay = (event) => {
    if (event.display_start_date && event.display_start_time) {
      const now = new Date();
      const displayStartDate = new Date(
        `${event.display_start_date}T${event.display_start_time}`
      );
      return displayStartDate > now;
    }
    return false;
  };

  // Handler for adding a new event
  const handleAddEvent = () => {
    navigate("/events/publish");
  };

  // Handler for editing an event
  const handleEditEvent = async (eventId, editType) => {
    try {
      setLoading(true);

      // Get the event details if not already available
      const event = findEventById(eventId);
      if (event) {
        // If we have the event in memory, use that data
        // Format the data according to the form structure needed by the edit popups

        if (editType === "event") {
          return {
            ...event,
            // Ensure proper property names for the form
            eventName: event.eventName,
            eventDescription: event.details,
            eventDate: event.eventDate,
            venue: event.venue,
            startTime: event.startTime,
            endTime: event.endTime,
            eventCategory: event.eventCategory,
            eventType: event.eventType,
            eventImage: null, // No need to pass the actual file object
            imagePreview: event.imagePreview,
          };
        } else if (editType === "ticket") {
          // Fetch latest ticket data
          const ticketResponse = await eventService.tickets.getByEventId(
            eventId
          );
          if (ticketResponse && ticketResponse.data) {
            // Transform ticket data for the form
            // This will depend on your ticket form structure
            return {
              ...event,
              tickets: ticketResponse.data,
            };
          }
        } else if (editType === "claiming") {
          // Fetch latest claiming slot data
          const claimingResponse =
            await eventService.claimingSlots.getByEventId(eventId);
          if (claimingResponse && claimingResponse.data) {
            // Transform claiming data for the form
            // Build the expected structure for claiming slots form
            const claimingSummaries = claimingResponse.data.map((slot) => ({
              id: slot.id,
              date: slot.claiming_date,
              venue: slot.venue,
              startTime: slot.start_time,
              endTime: slot.end_time,
              maxReservations: slot.max_claimers,
            }));

            const availableDates = [
              ...new Set(claimingSummaries.map((summary) => summary.date)),
            ];

            return {
              ...event,
              claimingSummaries,
              dateList: availableDates,
              eventDate: event.eventDate,
            };
          }
        } else if (editType === "availability") {
          // Format availability data for the form
          return {
            ...event,
            eventType: event.eventType,
            displayPeriod: {
              startDate: event.display_start_date,
              endDate: event.display_end_date,
              startTime: event.display_start_time,
              endTime: event.display_end_time,
            },
            reservationPeriod: {
              startDate: event.reservation_start_date,
              endDate: event.reservation_end_date,
              startTime: event.reservation_start_time,
              endTime: event.reservation_end_time,
            },
            eventDate: event.eventDate,
            imagePreview: event.imagePreview,
          };
        }

        return event;
      } else {
        // Fetch from API if not in memory
        const eventResponse = await eventService.events.getById(eventId);
        if (eventResponse && eventResponse.data) {
          // Transform the data based on the edit type
          const eventData = {
            id: eventResponse.data.id,
            eventName: eventResponse.data.name,
            eventDescription: eventResponse.data.details,
            eventDate: eventResponse.data.event_date,
            startTime: eventResponse.data.event_time,
            endTime: eventResponse.data.event_end_time,
            venue: eventResponse.data.venue,
            eventType: eventResponse.data.event_type,
            eventCategory: eventResponse.data.category,
            imagePreview: formatImageUrl(eventResponse.data.image),
            status: eventResponse.data.status,
            visibility: eventResponse.data.visibility,
            display_start_date: eventResponse.data.display_start_date,
            display_end_date: eventResponse.data.display_end_date,
            display_start_time: eventResponse.data.display_start_time,
            display_end_time: eventResponse.data.display_end_time,
            reservation_start_date: eventResponse.data.reservation_start_date,
            reservation_end_date: eventResponse.data.reservation_end_date,
            reservation_start_time: eventResponse.data.reservation_start_time,
            reservation_end_time: eventResponse.data.reservation_end_time,
          };

          // Additionally fetch & format data based on edit type
          if (editType === "ticket" && eventResponse.data.tickets) {
            eventData.tickets = eventResponse.data.tickets;
          }

          if (editType === "claiming" && eventResponse.data.claimingSlots) {
            const claimingSummaries = eventResponse.data.claimingSlots.map(
              (slot) => ({
                id: slot.id,
                date: slot.claiming_date,
                venue: slot.venue,
                startTime: slot.start_time,
                endTime: slot.end_time,
                maxReservations: slot.max_claimers,
              })
            );

            eventData.claimingSummaries = claimingSummaries;
            eventData.dateList = [
              ...new Set(claimingSummaries.map((summary) => summary.date)),
            ];
          }

          if (editType === "availability") {
            eventData.displayPeriod = {
              startDate: eventResponse.data.display_start_date,
              endDate: eventResponse.data.display_end_date,
              startTime: eventResponse.data.display_start_time,
              endTime: eventResponse.data.display_end_time,
            };

            eventData.reservationPeriod = {
              startDate: eventResponse.data.reservation_start_date,
              endDate: eventResponse.data.reservation_end_date,
              startTime: eventResponse.data.reservation_start_time,
              endTime: eventResponse.data.reservation_end_time,
            };
          }

          return eventData;
        }
      }

      return null;
    } catch (err) {
      console.error(`Error fetching event ${eventId} for editing:`, err);
      setError("Failed to load event details for editing.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handler for saving event changes
  const handleSaveEvent = async (updatedEvent, editType) => {
    try {
      // Show loading state
      setLoading(true);

      console.log(
        `Saving ${editType} changes for event ${updatedEvent.id}:`,
        updatedEvent
      );

      // Determine which update method to use based on edit type
      switch (editType) {
        case "event":
          // Update basic event details
          await eventService.events.update(updatedEvent.id, {
            name: updatedEvent.eventName,
            details: updatedEvent.eventDescription,
            event_date: updatedEvent.eventDate,
            event_time: updatedEvent.startTime,
            event_end_time: updatedEvent.endTime,
            venue: updatedEvent.venue,
            category: updatedEvent.eventCategory,
            // Only update image if a new one was uploaded
            ...(updatedEvent.imageUrl && { image: updatedEvent.imageUrl }),
          });
          break;

        case "ticket":
          // Process ticket changes
          if (updatedEvent.ticketDetails) {
            if (updatedEvent.eventType === "free") {
              // For free events
              const ticketData = {
                seat_type: "Free Seating",
                ticket_type: "General Admission",
                price: 0, // Always 0 for free events
                total_quantity: parseInt(
                  updatedEvent.ticketDetails.freeSeating.numberOfTickets || 0
                ),
                max_per_user: parseInt(
                  updatedEvent.ticketDetails.freeSeating.maxPerPerson || 1
                ),
              };

              // Check if we need to update an existing ticket or create a new one
              if (updatedEvent.tickets && updatedEvent.tickets.length > 0) {
                await eventService.tickets.update(
                  updatedEvent.tickets[0].id,
                  ticketData
                );
              } else {
                await eventService.tickets.create(updatedEvent.id, ticketData);
              }
            } else if (updatedEvent.ticketDetails.tierType === "freeSeating") {
              // For ticketed events with free seating
              const ticketData = {
                seat_type: "Free Seating",
                ticket_type: "General Admission",
                price: parseFloat(
                  updatedEvent.ticketDetails.freeSeating.price || 0
                ),
                total_quantity: parseInt(
                  updatedEvent.ticketDetails.freeSeating.numberOfTickets || 0
                ),
                max_per_user: parseInt(
                  updatedEvent.ticketDetails.freeSeating.maxPerPerson || 1
                ),
              };

              // Check if we need to update an existing ticket or create a new one
              if (updatedEvent.tickets && updatedEvent.tickets.length > 0) {
                await eventService.tickets.update(
                  updatedEvent.tickets[0].id,
                  ticketData
                );
              } else {
                await eventService.tickets.create(updatedEvent.id, ticketData);
              }
            } else if (updatedEvent.ticketDetails.tierType === "ticketed") {
              // For ticketed events with multiple tiers

              // First, we might need to delete existing tickets
              if (updatedEvent.tickets && updatedEvent.tickets.length > 0) {
                // We could either update existing tickets or delete and recreate
                // For simplicity, let's delete all and recreate
                for (const ticket of updatedEvent.tickets) {
                  try {
                    await eventService.tickets.delete(ticket.id);
                  } catch (err) {
                    console.error(`Error deleting ticket ${ticket.id}:`, err);
                    // Continue with other tickets even if one fails
                  }
                }
              }

              // Now create the new tickets
              const ticketsArray = [];
              Object.entries(updatedEvent.ticketDetails.ticketTiers)
                .filter(([_, tierData]) => tierData.checked)
                .forEach(([tierName, tierData]) => {
                  ticketsArray.push({
                    seat_type: tierName,
                    ticket_type: "Reserved Seating",
                    price: parseFloat(tierData.price || 0),
                    total_quantity: parseInt(tierData.number || 0),
                    max_per_user: parseInt(tierData.maxPerPerson || 1),
                  });
                });

              // Create tickets in bulk if we have any
              if (ticketsArray.length > 0) {
                await eventService.tickets.createBulk(
                  updatedEvent.id,
                  ticketsArray
                );
              }
            }
          }
          break;

        case "claiming":
          // Process claiming slot changes
          if (
            updatedEvent.claimingSummaries &&
            updatedEvent.claimingSummaries.length > 0
          ) {
            // First, we might need to delete existing claiming slots
            try {
              await eventService.claimingSlots.clearAll(updatedEvent.id);
            } catch (err) {
              console.error(
                `Error clearing claiming slots for event ${updatedEvent.id}:`,
                err
              );
              // Continue even if this fails
            }

            // Format claiming slots for API
            const claimingSlots = updatedEvent.claimingSummaries.map(
              (summary) => ({
                claiming_date: summary.date,
                start_time: summary.startTime,
                end_time: summary.endTime,
                venue: summary.venue,
                max_claimers: summary.maxReservations || 0,
              })
            );

            // Create claiming slots in bulk
            await eventService.claimingSlots.createBulk(
              updatedEvent.id,
              claimingSlots
            );
          }
          break;

        case "availability":
          // Update availability details
          await eventService.events.update(updatedEvent.id, {
            display_start_date: updatedEvent.displayPeriod?.startDate,
            display_end_date: updatedEvent.displayPeriod?.endDate,
            display_start_time: updatedEvent.displayPeriod?.startTime,
            display_end_time: updatedEvent.displayPeriod?.endTime,
            reservation_start_date: updatedEvent.reservationPeriod?.startDate,
            reservation_end_date: updatedEvent.reservationPeriod?.endDate,
            reservation_start_time: updatedEvent.reservationPeriod?.startTime,
            reservation_end_time: updatedEvent.reservationPeriod?.endTime,
          });
          break;

        default:
          console.warn(`Unknown edit type: ${editType}`);
          break;
      }

      // Refresh the events list after any edit
      await refreshEvents();

      return true;
    } catch (err) {
      console.error(`Error updating event ${editType}:`, err);
      setError(`Failed to update ${editType}. Please try again.`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  const refreshEvents = async () => {
    try {
      // Fetch all types of events
      const publishedResponse = await eventService.events.getAll({
        visibility: "published",
      });

      const draftsResponse = await eventService.events.getDrafts();

      const comingSoonResponse = await eventService.events.getComingSoon();

      // Categorize events
      const categorizedEvents = categorizeEvents([
        ...(publishedResponse?.data || []),
        ...(draftsResponse?.data || []),
        ...(comingSoonResponse?.data || []),
      ]);

      setEvents(categorizedEvents);
    } catch (err) {
      console.error("Error refreshing events:", err);
      setError("Failed to refresh events. Please reload the page.");
    }
  };
  // Handler for deleting an event
  const handleDeleteEvent = async (eventId) => {
    try {
      // For archived events, use permanent delete
      const event = findEventById(eventId);

      if (event && event.visibility === "archived") {
        await eventService.events.delete(eventId);
      } else {
        // Otherwise, archive the event
        await eventService.events.archive(eventId);
      }

      // Refresh the events list
      const updatedEvents = await eventService.events.getAll();
      setEvents(categorizeEvents(updatedEvents.data || []));

      return true;
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event. Please try again.");
      return false;
    }
  };

  // Handler for unpublishing an event
  const handleUnpublishEvent = async (eventId) => {
    try {
      await eventService.events.updateStatus(eventId, {
        visibility: "unpublished",
      });

      // Refresh the events list
      const updatedEvents = await eventService.events.getAll();
      setEvents(categorizeEvents(updatedEvents.data || []));

      return true;
    } catch (err) {
      console.error("Error unpublishing event:", err);
      setError("Failed to unpublish event. Please try again.");
      return false;
    }
  };

  // Helper function to find an event by ID
  const findEventById = (eventId) => {
    for (const category in events) {
      const event = events[category].find((e) => e.id === eventId);
      if (event) return event;
    }
    return null;
  };

  const handlePublishNow = async (eventId) => {
    try {
      // Update status to published
      await eventService.events.updateStatus(eventId, {
        visibility: "published",
      });

      // Refresh the events list
      const updatedEventsResponse = await eventService.events.getAll();
      const unpublishedResponse = await eventService.events.getAll({
        visibility: "unpublished",
      });
      const allEvents = [
        ...(updatedEventsResponse?.data || []),
        ...(unpublishedResponse?.data || []),
      ];

      setEvents(categorizeEvents(allEvents));

      return true;
    } catch (err) {
      console.error("Error publishing event immediately:", err);
      setError("Failed to publish event. Please try again.");
      return false;
    }
  };

  // In the return statement of EventsManagementContainer
  return (
    <Admin_EventsManagement
      events={events}
      loading={loading}
      error={error}
      onAddEvent={handleAddEvent}
      onEditEvent={handleEditEvent}
      onSaveEvent={handleSaveEvent}
      onDeleteEvent={handleDeleteEvent}
      onUnpublishEvent={handleUnpublishEvent}
      onPublishNow={handlePublishNow} // Add the new handler
      findEventById={findEventById}
    />
  );
};

export default EventsManagementContainer;
