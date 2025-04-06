// In EventManagementContainer.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Admin_EventsManagement from "../pages/Admin/Admin_EventsManagement";
import eventService from "../pages/Services/eventService";
import io from "socket.io-client";
import { toast } from "react-toastify";
import { formatImageUrl } from "../utils/imageUtils";

const EventsManagementContainer = () => {
  // Initialize with an empty structure for all possible categories
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
  const [initialized, setInitialized] = useState(false);
  const socketRef = useRef(null);
  const autoRefreshIntervalRef = useRef(null);
  const quickRefreshIntervalRef = useRef(null);
  const navigate = useNavigate();

  // Set up the API URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
  // Function to categorize events by their status
  const categorizeEvents = useCallback((eventsList) => {
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

    if (!Array.isArray(eventsList)) {
      console.error("Invalid events list:", eventsList);
      return categorized;
    }

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
        status: event.status || "draft", // Default to draft if status is missing
        visibility: event.visibility || "unpublished", // Default to unpublished if visibility is missing
        imagePreview: formatImageUrl(event.image),
        // Include other properties needed by components
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
        // Add timestamp for sorting
        createdAt: event.createdAt || new Date().toISOString(),
        updatedAt: event.updatedAt || new Date().toISOString(),
      };

      // First categorize by event type for "COMING SOON"
      if (event.event_type === "coming_soon") {
        categorized["COMING SOON"].push(mappedEvent);
        return; // Skip other categorization
      }

      // Then categorize by visibility and status
      if (event.visibility === "archived") {
        categorized.ARCHIVED.push(mappedEvent);
      } else if (event.status === "cancelled") {
        categorized.CANCELLED.push(mappedEvent);
      } else if (event.status === "draft") {
        categorized.DRAFT.push(mappedEvent);
      } else if (event.status === "open" && event.visibility === "published") {
        categorized.OPEN.push(mappedEvent);
      } else if (
        event.status === "scheduled" &&
        event.visibility === "published"
      ) {
        categorized.SCHEDULED.push(mappedEvent);
      } else if (event.status === "closed") {
        const now = new Date();
        const isEventDatePassed =
          event.event_date && new Date(event.event_date) < now;
        const isReservationEnded =
          event.reservation_end_date &&
          event.reservation_end_time &&
          new Date(
            `${event.reservation_end_date}T${event.reservation_end_time}`
          ) < now;

        // Check if this is a completed event (event date passed OR reservation period ended)
        if (isEventDatePassed || isReservationEnded) {
          categorized.COMPLETED.push(mappedEvent);
        } else {
          // Free events or events closed for other reasons
          if (event.visibility === "published") {
            categorized.SCHEDULED.push(mappedEvent);
          } else {
            categorized.UNPUBLISHED.push(mappedEvent);
          }
        }
      } else {
        // All other events go to UNPUBLISHED
        categorized.UNPUBLISHED.push(mappedEvent);
      }
    });

    // Sort each category by updatedAt (newest first)
    Object.keys(categorized).forEach((category) => {
      categorized[category].sort((a, b) => {
        const dateA = new Date(a.updatedAt || 0);
        const dateB = new Date(b.updatedAt || 0);
        return dateB - dateA;
      });
    });

    return categorized;
  }, []);

  // Define fetchEvents with error handling and consistency
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Add a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Fetch events timeout"));
        }, 15000); // 15 second timeout
      });

      // Default empty array for events if fetching fails
      let allEvents = [];

      try {
        // Race between the fetch operation and the timeout
        await Promise.race([
          (async () => {
            try {
              // Track successful fetches
              let fetchSuccessful = false;

              // Try fetching from multiple endpoints
              try {
                // Fetch different types of events in parallel
                const [
                  publishedResponse,
                  draftsResponse,
                  comingSoonResponse,
                  unpublishedResponse,
                ] = await Promise.all([
                  eventService.events.getAll({ visibility: "published" }),
                  eventService.events.getDrafts(),
                  eventService.events.getComingSoon(),
                  eventService.events.getAll({ visibility: "unpublished" }),
                ]);

                // Use a Map to deduplicate events by ID
                const eventMap = new Map();

                // Helper function to add events to the map
                const addEventsToMap = (events) => {
                  if (events && Array.isArray(events)) {
                    events.forEach((event) => {
                      eventMap.set(event.id, event);
                    });
                    return true;
                  }
                  return false;
                };

                // Add all events to the map and track if any were successful
                fetchSuccessful =
                  addEventsToMap(publishedResponse?.data || []) ||
                  fetchSuccessful;
                fetchSuccessful =
                  addEventsToMap(draftsResponse?.data || []) || fetchSuccessful;
                fetchSuccessful =
                  addEventsToMap(comingSoonResponse?.data || []) ||
                  fetchSuccessful;
                fetchSuccessful =
                  addEventsToMap(unpublishedResponse?.data || []) ||
                  fetchSuccessful;

                // Convert the map back to an array if we had any successful fetches
                if (fetchSuccessful) {
                  allEvents = Array.from(eventMap.values());
                }
              } catch (err) {
                console.error(
                  "Error fetching events from multiple endpoints:",
                  err
                );
                fetchSuccessful = false;
              }

              // If parallel fetching fails, try the fallback
              if (!fetchSuccessful) {
                console.log("Trying fallback event fetching...");
                const fallbackResponse = await eventService.events.getAll();
                if (
                  fallbackResponse?.data &&
                  Array.isArray(fallbackResponse.data)
                ) {
                  allEvents = fallbackResponse.data;
                  fetchSuccessful = true;
                }
              }
            } catch (err) {
              console.error("All event fetching methods failed:", err);
              // We'll continue with an empty array
            }
          })(),
          timeoutPromise,
        ]);
      } catch (err) {
        console.error("Fetch events timed out or failed:", err);
        // We'll continue with whatever events we have (which may be an empty array)
      }

      // Categorize events
      const categorizedEvents = categorizeEvents(allEvents);

      setEvents(categorizedEvents);
      setInitialized(true);
      return categorizedEvents;
    } catch (err) {
      console.error("Error in fetchEvents:", err);
      setError("Failed to load events. Please try again later.");
      // Still mark as initialized so we don't get stuck in loading state
      setInitialized(true);
      return null;
    } finally {
      setLoading(false);
    }
  }, [categorizeEvents]);

  // Define refreshEvents with user feedback
  const refreshEvents = useCallback(async () => {
    try {
      const refreshedEvents = await fetchEvents();
      if (refreshedEvents) {
        toast.success("Events refreshed successfully", {
          position: "bottom-right",
          autoClose: 2000,
          toastId: "events-refreshed", // Add a unique ID to prevent duplicates
        });
      }
      return refreshedEvents;
    } catch (error) {
      console.error("Error refreshing events:", error);
      toast.error("Failed to refresh events", {
        position: "bottom-right",
        autoClose: 3000,
        toastId: "events-refresh-error", // Add a unique ID to prevent duplicates
      });
      return null;
    }
  }, [fetchEvents]);
  const checkForStatusUpdates = useCallback(async () => {
    try {
      const response = await eventService.checkEventStatuses();

      if (response && response.success) {
        if (response.updated && response.updated.length > 0) {
          // If events were updated, refresh the events list
          console.log(
            `${response.updated.length} events were updated:`,
            response.updated
          );

          // Show toast notification with a unique ID
          toast.info(
            `${response.updated.length} event statuses were automatically updated`,
            {
              position: "bottom-right",
              autoClose: 3000,
              toastId: `status-update-${Date.now()}`, // Use timestamp to make unique
            }
          );

          // Refresh events
          await fetchEvents();
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error checking event statuses:", error);
      return false;
    }
  }, [fetchEvents]);

  const checkUpcomingStatusChanges = useCallback(async () => {
    try {
      const response = await eventService.getUpcomingStatusChanges();

      if (
        response &&
        response.success &&
        response.data &&
        response.data.length > 0
      ) {
        const upcomingChanges = response.data;

        // Log upcoming changes
        console.log("Upcoming status changes:", upcomingChanges);

        // If there are upcoming changes, set up quick polling
        if (upcomingChanges.length > 0) {
          // Clear existing quick refresh interval if it exists
          if (quickRefreshIntervalRef.current) {
            clearInterval(quickRefreshIntervalRef.current);
          }

          // Set up more frequent polling for imminent changes
          quickRefreshIntervalRef.current = setInterval(async () => {
            await checkForStatusUpdates();
          }, 10000); // Check every 10 seconds

          // Show notification for the closest change
          const closestChange = upcomingChanges.reduce((closest, current) => {
            return !closest ||
              current.minutesRemaining < closest.minutesRemaining
              ? current
              : closest;
          }, null);

          if (closestChange) {
            toast.info(
              `Event "${closestChange.name}" will ${closestChange.changeType} in ${closestChange.minutesRemaining} minutes`,
              {
                position: "bottom-right",
                autoClose: 5000,
              }
            );
          }

          // Auto-cancel quick polling after the changes are expected to happen
          const maxMinutesRemaining = Math.max(
            ...upcomingChanges.map((c) => c.minutesRemaining || 0)
          );
          setTimeout(() => {
            if (quickRefreshIntervalRef.current) {
              clearInterval(quickRefreshIntervalRef.current);
              quickRefreshIntervalRef.current = null;
            }
          }, maxMinutesRemaining * 60 * 1000 + 30000); // Max remaining time + 30 seconds buffer

          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error checking upcoming status changes:", error);
      return false;
    }
  }, [checkForStatusUpdates]);

  // Helper function to check if an event has a future display date
  const checkIfFutureDisplay = useCallback((event) => {
    if (event.display_start_date && event.display_start_time) {
      const now = new Date();
      const displayStartDate = new Date(
        `${event.display_start_date}T${event.display_start_time}`
      );
      return displayStartDate > now;
    }
    return false;
  }, []);

  // Helper function to find an event by ID
  const findEventById = (eventId) => {
    for (const category in events) {
      const event = events[category].find((e) => e.id === eventId);
      if (event) return event;
    }
    return null;
  };

  // Handler for adding a new event
  const handleAddEvent = () => {
    navigate("/events/publish");
  };

  // Handler for editing an event
  const handleEditEvent = async (eventId, editType) => {
    try {
      setLoading(true);
      // Get the event details
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
            imagePreview: eventResponse.data.image,
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

      return event;
    } catch (error) {
      console.error(`Error preparing edit for event ${eventId}:`, error);
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
      await eventService.refreshEventStatus(updatedEvent.id);

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
      await fetchEvents();

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
      await fetchEvents();

      return true;
    } catch (err) {
      console.error("Error unpublishing event:", err);
      setError("Failed to unpublish event. Please try again.");
      return false;
    }
  };

  // Handler for publishing an event immediately
  const handlePublishNow = async (eventId) => {
    try {
      // Update status to published
      await eventService.events.updateStatus(eventId, {
        visibility: "published",
      });

      // Refresh the events list
      await fetchEvents();

      return true;
    } catch (err) {
      console.error("Error publishing event immediately:", err);
      setError("Failed to publish event. Please try again.");
      return false;
    }
  };

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      // Check for status updates
      const statusesUpdated = await checkForStatusUpdates();

      // If statuses weren't updated, refresh events and show toast
      if (!statusesUpdated) {
        await refreshEvents();
      }
      // (if statuses were updated, a toast was already shown in checkForStatusUpdates)
    } catch (error) {
      console.error("Error during manual refresh:", error);
      toast.error("Error refreshing events", {
        position: "bottom-right",
        autoClose: 3000,
        toastId: "refresh-error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up initial socket connection and event listeners
  useEffect(() => {
    let isComponentMounted = true;

    // Prevent duplicate initialization
    if (socketRef.current) {
      console.log("Socket already exists, skipping initialization");
      return;
    }

    // Set up socket connection with proper error handling
    try {
      // Create proper base URL by removing /api suffix
      const BASE_URL = API_URL.replace(/\/api$/, "");

      console.log("Connecting to Socket.IO with base URL:", BASE_URL);
      socketRef.current = io(BASE_URL, {
        path: "/socket.io",
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ["websocket", "polling"],
        autoConnect: true,
        forceNew: true,
      });

      socketRef.current.on("connect", () => {
        console.log(
          "Connected to socket server with ID:",
          socketRef.current.id
        );
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        // Handle the error but don't let it block the app
        if (isComponentMounted) {
          // Only fetch events if socket fails - don't get stuck
          fetchEvents();
        }
      });

      // Add socket event listeners for server events
      socketRef.current.on("events-updated", (data) => {
        console.log("Received events-updated via socket:", data);
        if (isComponentMounted) {
          // Just fetch the events, but DON'T show a toast
          // The server will already send a toast via websocket notification
          fetchEvents().catch(console.error);
        }
      });

      socketRef.current.on("upcoming-status-changes", (data) => {
        console.log("Received upcoming-status-changes via socket:", data);
        // Only show a toast for upcoming status changes once
        if (isComponentMounted && data.upcomingChanges?.length > 0) {
          const closestChange = data.upcomingChanges.reduce(
            (closest, current) => {
              return !closest ||
                current.minutesRemaining < closest.minutesRemaining
                ? current
                : closest;
            },
            null
          );

          if (closestChange) {
            toast.info(
              `Event "${closestChange.name}" will ${closestChange.changeType} in ${closestChange.minutesRemaining} minutes`,
              {
                position: "bottom-right",
                autoClose: 5000,
                toastId: `upcoming-change-${closestChange.id}`, // Prevent duplicates
              }
            );
          }
        }
      });

      socketRef.current.on("event-updated", (data) => {
        console.log("Received event-updated via socket:", data);
        if (isComponentMounted) {
          // Refresh events but don't show another toast
          fetchEvents().catch(console.error);
        }
      });
    } catch (error) {
      console.error("Error setting up socket connection:", error);
      // Even if socket setup fails, we should still fetch events
      if (isComponentMounted) {
        fetchEvents();
      }
    }

    // Clean up socket connection on component unmount
    return () => {
      isComponentMounted = false;
      if (socketRef.current) {
        console.log("Disconnecting socket");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);
  useEffect(() => {
    let isComponentMounted = true;
    let loadingTimeoutId = null;

    // Define an async function for the initial setup
    const setupInitialData = async () => {
      if (!isComponentMounted) return;

      try {
        // Initial fetch - wait for this to complete before continuing
        await fetchEvents();

        if (!isComponentMounted) return;

        // Immediate status check - but don't wait for these to complete
        // if they're taking too long
        checkForStatusUpdates().catch((error) => {
          console.error("Error checking status updates:", error);
        });

        if (!isComponentMounted) return;

        // Check for upcoming changes
        checkUpcomingStatusChanges().catch((error) => {
          console.error("Error checking upcoming changes:", error);
        });
      } catch (error) {
        console.error("Error during initial data setup:", error);
        // Don't set error state if component unmounted
        if (isComponentMounted) {
          setError("Error loading initial data. Try refreshing the page.");
          // If there's an error, we should still set initialized to true
          // so the app doesn't get stuck loading
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    // Run the setup
    setupInitialData();

    // Safety timeout - if loading takes too long, set initialized to true anyway
    // This prevents getting stuck in a loading state
    loadingTimeoutId = setTimeout(() => {
      if (isComponentMounted && !initialized) {
        console.warn("Loading timeout reached, forcing initialization");
        setInitialized(true);
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    // Set up automatic regular status checking (every 60 seconds)
    autoRefreshIntervalRef.current = setInterval(async () => {
      if (isComponentMounted) {
        await checkForStatusUpdates();
        await checkUpcomingStatusChanges();
      }
    }, 60000);

    // Clean up intervals on component unmount
    return () => {
      isComponentMounted = false;

      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
      }

      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
        autoRefreshIntervalRef.current = null;
      }

      if (quickRefreshIntervalRef.current) {
        clearInterval(quickRefreshIntervalRef.current);
        quickRefreshIntervalRef.current = null;
      }
    };
  }, [
    fetchEvents,
    checkForStatusUpdates,
    checkUpcomingStatusChanges,
    initialized,
  ]);
  return (
    <Admin_EventsManagement
      events={events}
      loading={loading}
      initialized={initialized}
      error={error}
      onAddEvent={handleAddEvent}
      onEditEvent={handleEditEvent}
      onSaveEvent={handleSaveEvent}
      onDeleteEvent={handleDeleteEvent}
      onUnpublishEvent={handleUnpublishEvent}
      onPublishNow={handlePublishNow}
      onRefreshEvents={handleManualRefresh}
      findEventById={findEventById}
    />
  );
};

export default EventsManagementContainer;
