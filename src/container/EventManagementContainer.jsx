// In EventManagementContainer.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Admin_EventsManagement from "../pages/Admin/Admin_EventsManagement";
import eventService from "../pages/Services/eventService";

import axios from "axios";
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
  const API_URL = `${import.meta.env.VITE_API_URL}/api`;
  // Function to categorize events by their status
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
        status: event.status || "draft",
        visibility: event.visibility || "unpublished",
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

      // Check if it's an archived event first
      if (event.visibility === "archived") {
        categorized.ARCHIVED.push(mappedEvent);
        return; // Skip further categorization
      }

      // Check if display period has ended
      const now = new Date();
      const hasDisplayEnded =
        event.display_end_date &&
        event.display_end_time &&
        new Date(`${event.display_end_date}T${event.display_end_time}`) < now;

      // Check if event date has passed
      const isEventDatePassed =
        event.event_date && new Date(event.event_date) < now;

      // Check if reservation period has ended
      const isReservationEnded =
        event.reservation_end_date &&
        event.reservation_end_time &&
        new Date(
          `${event.reservation_end_date}T${event.reservation_end_time}`
        ) < now;

      // If display period has ended, unpublish the event
      if (hasDisplayEnded) {
        // Only unpublish if the event is not already closed
        if (event.status !== "closed") {
          categorized.UNPUBLISHED.push(mappedEvent);
        } else {
          // If it's already closed, keep it in its current published category
          if (event.visibility === "published") {
            if (isEventDatePassed) {
              categorized.COMPLETED.push(mappedEvent);
            } else {
              categorized.SCHEDULED.push(mappedEvent);
            }
          } else {
            categorized.UNPUBLISHED.push(mappedEvent);
          }
        }
        return;
      }

      // Now handle published events
      if (event.visibility === "published") {
        // Special handling for "coming soon" event type
        if (
          event.event_type === "coming_soon" &&
          event.status === "scheduled"
        ) {
          categorized["COMING SOON"].push(mappedEvent);
          return;
        }

        // Other published events based on status
        if (event.status === "open") {
          categorized.OPEN.push(mappedEvent);
        } else if (event.status === "scheduled") {
          categorized.SCHEDULED.push(mappedEvent);
        } else if (event.status === "closed") {
          // If event date has passed, move to COMPLETED
          if (isEventDatePassed) {
            categorized.COMPLETED.push(mappedEvent);
          } else {
            // Move closed events to PUBLISHED instead of SCHEDULED
            categorized.OPEN.push(mappedEvent);
          }
        } else if (event.status === "cancelled") {
          categorized.CANCELLED.push(mappedEvent);
        }
      }
      // Handle unpublished events
      else {
        if (event.status === "draft") {
          categorized.DRAFT.push(mappedEvent);
        } else if (event.status === "closed") {
          // If event date has passed, move to COMPLETED
          if (isEventDatePassed) {
            categorized.COMPLETED.push(mappedEvent);
          } else {
            categorized.UNPUBLISHED.push(mappedEvent);
          }
        } else {
          // All other unpublished events go to UNPUBLISHED
          categorized.UNPUBLISHED.push(mappedEvent);
        }
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
                  archivedResponse, // Add this
                ] = await Promise.all([
                  eventService.events.getAll({ visibility: "published" }),
                  eventService.events.getDrafts(),
                  eventService.events.getComingSoon(),
                  eventService.events.getAll({ visibility: "unpublished" }),
                  eventService.events.getAll({ visibility: "archived" }), // Fetch archived events
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
                // Add archived events to the map - this was missing!
                fetchSuccessful =
                  addEventsToMap(archivedResponse?.data || []) ||
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

  // New method to handle availability updates
  const handleAvailabilityUpdate = async (eventData) => {
    try {
      console.log("Handling availability update with data:", eventData);

      // Extract display and reservation periods
      const {
        displayPeriod,
        reservationPeriod,
        displayDatesChanged,
        reservationStartNow,
      } = eventData;

      // Prepare data for API
      const updatePayload = {
        display_start_date: displayPeriod.startDate,
        display_end_date: displayPeriod.endDate,
        display_start_time: displayPeriod.startTime,
        display_end_time: displayPeriod.endTime,
      };

      // Only include reservation period for ticketed events
      if (eventData.eventType === "ticketed") {
        updatePayload.reservation_start_date = reservationPeriod.startDate;
        updatePayload.reservation_end_date = reservationPeriod.endDate;
        updatePayload.reservation_start_time = reservationPeriod.startTime;
        updatePayload.reservation_end_time = reservationPeriod.endTime;
      }

      // Handle status updates if necessary
      if (displayDatesChanged) {
        // If display dates changed for published event, temporarily unpublish
        updatePayload.visibility = "unpublished";
        console.log("Display dates changed, setting visibility to unpublished");

        // Show notification about temporary unpublishing
        toast.info(
          "Display dates were changed. Event will be temporarily unpublished and republished.",
          {
            position: "bottom-right",
            autoClose: 3000,
          }
        );
      }

      if (reservationStartNow) {
        // If reservation start is now or in the past, update status to open
        updatePayload.status = "open";
        console.log("Reservation start is now or past, setting status to open");

        // Show notification about opening reservations
        toast.info(
          "Reservation period will start immediately. Event status will be set to 'Open'.",
          {
            position: "bottom-right",
            autoClose: 3000,
          }
        );
      }

      // Call the API to update the event
      await eventService.events.update(eventData.id, updatePayload);

      // If we changed the visibility to unpublished, we need to publish it again after a short delay
      if (displayDatesChanged) {
        console.log(
          "Scheduling re-publish of event after display date changes"
        );

        // Wait a short time then re-publish the event
        setTimeout(async () => {
          try {
            await eventService.events.updateStatus(eventData.id, {
              visibility: "published",
            });
            console.log(
              "Event successfully re-published after display date changes"
            );

            // Show toast notification for successful republishing
            toast.success(
              "Event has been republished with updated display dates",
              {
                position: "bottom-right",
                autoClose: 3000,
              }
            );

            // Refresh the events list to reflect the changes
            await fetchEvents();
          } catch (err) {
            console.error("Failed to re-publish event:", err);
            toast.error("Failed to republish event. Please try manually.", {
              position: "bottom-right",
              autoClose: 4000,
            });
          }
        }, 2000); // Wait 2 seconds before re-publishing
      } else {
        // If no display date changes, we should still refresh the events
        await fetchEvents();
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating event availability:", error);
      throw error;
    }
  };

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
          // Handle event basic details update
          let imageUrl = updatedEvent.imagePreview || updatedEvent.image;

          if (
            updatedEvent.eventImage &&
            updatedEvent.eventImage instanceof File
          ) {
            try {
              const imageResponse = await eventService.uploadEventImage(
                updatedEvent.eventImage
              );

              if (imageResponse && imageResponse.imageUrl) {
                imageUrl = imageResponse.imageUrl;
              }
            } catch (imageError) {
              console.error("Error uploading image:", imageError);
            }
          }

          await eventService.events.update(updatedEvent.id, {
            name: updatedEvent.eventName,
            details: updatedEvent.eventDescription,
            event_date: updatedEvent.eventDate,
            event_time: updatedEvent.startTime,
            event_end_time: updatedEvent.endTime,
            venue: updatedEvent.venue,
            category: updatedEvent.eventCategory,
            ...(imageUrl && { image: imageUrl }),
          });
          break;

        case "ticket":
          if (updatedEvent.ticketDetails) {
            try {
              // IMPROVED APPROACH: Instead of trying to update existing tickets,
              // we'll delete all existing tickets and create new ones

              // Step 1: Get existing tickets
              const existingTicketsResponse =
                await eventService.tickets.getByEventId(updatedEvent.id);
              const existingTickets = existingTicketsResponse.data || [];

              // Step 2: Delete all existing tickets
              if (existingTickets.length > 0) {
                console.log(
                  `Removing ${existingTickets.length} existing tickets`
                );

                for (const ticket of existingTickets) {
                  try {
                    await eventService.tickets.delete(ticket.id);
                    console.log(`Deleted ticket ${ticket.id}`);
                  } catch (err) {
                    console.warn(`Could not delete ticket ${ticket.id}:`, err);
                    // Continue with other tickets even if this one fails
                  }
                }
              }

              // Step 3: Prepare tickets for API
              let ticketsToCreate = [];

              if (updatedEvent.eventType === "free") {
                // Free event - single free ticket tier
                ticketsToCreate.push({
                  seat_type: "Free Seating",
                  ticket_type: "General Admission",
                  price: 0, // Always 0 for free events
                  total_quantity:
                    parseInt(
                      updatedEvent.ticketDetails.freeSeating.numberOfTickets
                    ) || 0,
                  max_per_user:
                    parseInt(
                      updatedEvent.ticketDetails.freeSeating.maxPerPerson
                    ) || 1,
                });
              } else if (
                updatedEvent.ticketDetails.tierType === "freeSeating"
              ) {
                // Free seating
                ticketsToCreate.push({
                  seat_type: "Free Seating",
                  ticket_type: "General Admission",
                  price:
                    parseFloat(updatedEvent.ticketDetails.freeSeating.price) ||
                    0,
                  total_quantity:
                    parseInt(
                      updatedEvent.ticketDetails.freeSeating.numberOfTickets
                    ) || 0,
                  max_per_user:
                    parseInt(
                      updatedEvent.ticketDetails.freeSeating.maxPerPerson
                    ) || 1,
                });
              } else {
                // Ticketed with multiple tiers
                Object.entries(updatedEvent.ticketDetails.ticketTiers)
                  .filter(([_, tierData]) => tierData.checked)
                  .forEach(([tierName, tierData]) => {
                    ticketsToCreate.push({
                      seat_type: tierName,
                      ticket_type: "Reserved Seating",
                      price: parseFloat(tierData.price) || 0,
                      total_quantity: parseInt(tierData.number) || 0,
                      max_per_user: parseInt(tierData.maxPerPerson) || 1,
                    });
                  });
              }

              // Step 4: Create new tickets using bulk endpoint
              console.log("Creating new tickets:", ticketsToCreate);
              if (ticketsToCreate.length > 0) {
                await eventService.tickets.createBulk(
                  updatedEvent.id,
                  ticketsToCreate
                );
              } else {
                console.warn("No tickets to create");
              }
            } catch (err) {
              console.error("Error handling tickets:", err);
              throw err; // Re-throw to be caught by the main try/catch
            }
          }
          break;

        case "claiming":
          // For claiming slots
          try {
            // First clear existing claiming slots
            await eventService.claimingSlots.clearAll(updatedEvent.id);

            // Then create new ones if we have them
            if (
              updatedEvent.claimingSummaries &&
              updatedEvent.claimingSummaries.length > 0
            ) {
              const claimingData = updatedEvent.claimingSummaries.map(
                (summary) => ({
                  claiming_date: summary.date,
                  start_time: summary.startTime,
                  end_time: summary.endTime,
                  venue: summary.venue,
                  max_claimers: summary.maxReservations,
                })
              );

              await eventService.claimingSlots.createBulk(
                updatedEvent.id,
                claimingData
              );
            }
          } catch (error) {
            console.error("Error updating claiming slots:", error);
            throw error;
          }
          break;

        case "availability":
          // Use the new specialized method for handling availability updates
          await handleAvailabilityUpdate(updatedEvent);
          break;

        default:
          console.warn(`Unknown edit type: ${editType}`);
          break;
      }

      // Refresh the event's status after saving
      await eventService.refreshEventStatus(updatedEvent.id);

      // Refresh the events list
      await refreshEvents();

      // Show success message
      toast.success(`Event ${editType} details updated successfully`, {
        position: "bottom-right",
        autoClose: 3000,
      });

      return true;
    } catch (err) {
      console.error(`Error updating event ${editType}:`, err);
      toast.error(`Failed to update ${editType} details. ${err.message}`, {
        position: "bottom-right",
        autoClose: 5000,
      });

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

      if (
        (event && event.visibility === "archived") ||
        event.status === "draft"
      ) {
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
      setLoading(true);

      // Get the event to check its current state
      const event = findEventById(eventId);

      if (!event) {
        console.error(`Event with ID ${eventId} not found`);
        return false;
      }

      // Check if there's an active reservation period
      const now = new Date();
      const nowISODate = now.toISOString().split("T")[0];
      const nowISOTime = now.toISOString().split("T")[1].substring(0, 8);

      const hasActiveReservation =
        event.eventType === "ticketed" &&
        event.reservation_start_date &&
        event.reservation_end_date &&
        new Date(
          `${event.reservation_end_date}T${
            event.reservation_end_time || "23:59:59"
          }`
        ) > now;

      // If there's an active reservation, ask for confirmation
      if (hasActiveReservation && event.status === "open") {
        const confirmEnd = window.confirm(
          `"${event.eventName}" has an active reservation period. Unpublishing will end the reservation period immediately. Do you want to continue?`
        );

        if (!confirmEnd) {
          setLoading(false);
          return false;
        }

        // Update both visibility and reservation end date/time
        await eventService.events.update(eventId, {
          visibility: "unpublished",
          display_end_date: nowISODate,
          display_end_time: nowISOTime,
          reservation_end_date: nowISODate,
          reservation_end_time: nowISOTime,
          status: "closed", // Also change status to closed since reservation is ending
        });

        toast.info(
          `Reservation period for "${event.eventName}" has been ended`,
          {
            position: "bottom-right",
            autoClose: 4000,
          }
        );
      } else {
        // Just update visibility and display end date/time
        await eventService.events.update(eventId, {
          visibility: "unpublished",
          display_end_date: nowISODate,
          display_end_time: nowISOTime,
        });
      }

      // Refresh the event's status (backend will handle any status changes if needed)
      await eventService.refreshEventStatus(eventId);

      // Refresh the events list
      await fetchEvents();

      // Show success toast
      toast.success(`Event "${event.eventName}" unpublished successfully`, {
        position: "bottom-right",
        autoClose: 3000,
        toastId: `unpublish-success-${eventId}`,
      });

      return true;
    } catch (err) {
      console.error("Error unpublishing event immediately:", err);

      // Show error toast
      toast.error("Failed to unpublish event. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
        toastId: `unpublish-error-${eventId}`,
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handler for publishing an event immediately
  // Updated handlePublishNow function in EventManagementContainer.jsx
  const handlePublishNow = async (eventId, isComingSoon = false) => {
    try {
      setLoading(true);

      // Get the event to check its current state
      const event = findEventById(eventId);

      if (!event) {
        console.error(`Event with ID ${eventId} not found`);
        return false;
      }

      // Special handling for Coming Soon events
      if (isComingSoon && event.eventType === "coming_soon") {
        // Prepare event data for PublishEvent page
        const eventData = {
          eventDetails: {
            eventId: event.id, // Include the original event ID
            eventName: event.eventName,
            eventDescription: event.details,
            eventDate: event.eventDate,
            venue: event.venue,
            startTime: event.startTime,
            endTime: event.endTime,
            eventCategory: event.eventCategory,
            eventType: "ticketed", // Convert to ticketed event
            imagePreview: event.imagePreview,
            comingSoonConversion: true, // Flag to indicate this is a converted coming soon event
          },
        };

        // Save the event data to localStorage for the publishing page to access
        localStorage.setItem("comingSoonEventData", JSON.stringify(eventData));

        // Navigate to the publish event page
        navigate("/events/publish/convert");
        return true;
      }

      // For non-Coming Soon events, continue with the original implementation
      // Get current date and time
      const now = new Date();
      const nowISODate = now.toISOString().split("T")[0];
      const nowISOTime = now.toISOString().split("T")[1].substring(0, 8);

      // Check if there's a future display period that needs adjustment
      const displayStartDate = event.display_start_date
        ? new Date(
            `${event.display_start_date}T${
              event.display_start_time || "00:00:00"
            }`
          )
        : null;

      // Check if reservation period needs adjustment
      const reservationStartDate =
        event.eventType === "ticketed" && event.reservation_start_date
          ? new Date(
              `${event.reservation_start_date}T${
                event.reservation_start_time || "00:00:00"
              }`
            )
          : null;

      let reservationNeedsAdjustment = false;
      if (reservationStartDate && reservationStartDate > now) {
        reservationNeedsAdjustment = true;
      }

      const updateData = {
        visibility: "published",
        display_start_date: nowISODate,
        display_start_time: nowISOTime,
      };

      // Adjust reservation period if needed
      if (event.eventType === "ticketed" && reservationStartDate) {
        if (reservationStartDate < now) {
          // Reservation should have already started - ask if user wants to open it now
          const confirmOpen = window.confirm(
            `The reservation period for "${event.eventName}" was scheduled to start in the past (${event.reservation_start_date}). Would you like to open reservations now?`
          );

          if (confirmOpen) {
            updateData.reservation_start_date = nowISODate;
            updateData.reservation_start_time = nowISOTime;
            updateData.status = "open";

            toast.info(
              `Reservation period for "${event.eventName}" is now open`,
              {
                position: "bottom-right",
                autoClose: 4000,
              }
            );
          }
        } else if (reservationStartDate > now) {
          // Reservation is scheduled for the future - no problem
          toast.info(
            `Event is published, but reservation opens on ${event.reservation_start_date} at ${event.reservation_start_time}`,
            {
              position: "bottom-right",
              autoClose: 4000,
            }
          );
        }
      }

      // Update the event with all needed changes
      await eventService.events.update(eventId, updateData);

      // Refresh the event's status (backend will handle any status changes if needed)
      await eventService.refreshEventStatus(eventId);

      // Refresh the events list
      await fetchEvents();

      // Show success toast
      toast.success(`Event "${event.eventName}" published successfully`, {
        position: "bottom-right",
        autoClose: 3000,
        toastId: `publish-success-${eventId}`,
      });

      return true;
    } catch (err) {
      console.error("Error publishing event immediately:", err);

      // Show error toast
      toast.error("Failed to publish event. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
        toastId: `publish-error-${eventId}`,
      });

      return false;
    } finally {
      setLoading(false);
    }
  };
  // Handler for opening reservations
  const handleOpenReservation = async (eventId) => {
    try {
      setLoading(true);

      // Get the event to check its current state
      const event = findEventById(eventId);

      if (!event) {
        console.error(`Event with ID ${eventId} not found`);
        return false;
      }

      // Check if the event is published - must be published to open reservations
      if (event.visibility !== "published") {
        const publishFirst = window.confirm(
          `"${event.eventName}" is not published. You need to publish it first before opening reservations. Would you like to publish it now?`
        );

        if (publishFirst) {
          // Publish the event first
          const publishSuccess = await handlePublishNow(eventId);
          if (!publishSuccess) {
            return false;
          }
        } else {
          setLoading(false);
          return false;
        }
      }

      // Get current date and time
      const now = new Date();
      const nowISODate = now.toISOString().split("T")[0];
      const nowISOTime = now.toISOString().split("T")[1].substring(0, 8);

      // Check if we need to update reservation dates
      const updateData = {
        status: "open",
      };

      // If reservation period hasn't been set or is in the future, adjust it
      if (
        !event.reservation_start_date ||
        new Date(
          `${event.reservation_start_date}T${
            event.reservation_start_time || "00:00:00"
          }`
        ) > now
      ) {
        updateData.reservation_start_date = nowISODate;
        updateData.reservation_start_time = nowISOTime;

        // If reservation end date is not set, set a default (30 days from now)
        if (!event.reservation_end_date) {
          const endDate = new Date(now);
          endDate.setDate(endDate.getDate() + 30);

          updateData.reservation_end_date = endDate.toISOString().split("T")[0];
          updateData.reservation_end_time = "23:59:59";

          toast.info(
            `Reservation end date set to ${updateData.reservation_end_date}`,
            {
              position: "bottom-right",
              autoClose: 4000,
            }
          );
        }
      }

      await eventService.events.update(eventId, updateData);

      // Refresh the event's status
      await eventService.refreshEventStatus(eventId);

      // Refresh the events list
      await fetchEvents();

      // Show success toast
      toast.success(
        `Reservation of "${event.eventName}" has opened successfully`,
        {
          position: "bottom-right",
          autoClose: 3000,
          toastId: `open-success-${eventId}`,
        }
      );

      return true;
    } catch (err) {
      console.error("Error opening reservation immediately:", err);

      // Show error toast
      toast.error("Failed to open reservation. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
        toastId: `open-error-${eventId}`,
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  // In EventManagementContainer.jsx
  const handleNavigateToEdit = async (eventId, isComingSoon = false) => {
    try {
      setLoading(true);
      console.log(
        `Starting navigation to edit for event: ${eventId}, isComingSoon: ${isComingSoon}`
      );

      // Get the event to check its current state
      let event = findEventById(eventId);

      if (!event) {
        console.error(`Event with ID ${eventId} not found in local state`);
        // Try to fetch it from API directly
        try {
          const eventResponse = await eventService.events.getById(eventId);
          if (eventResponse && eventResponse.data) {
            const eventData = eventResponse.data;
            event = {
              id: eventData.id,
              eventName: eventData.name,
              eventDescription: eventData.details || "",
              eventDate: eventData.event_date,
              startTime: eventData.event_time,
              endTime: eventData.event_end_time,
              venue: eventData.venue,
              eventType: eventData.event_type,
              eventCategory: eventData.category,
              imagePreview: formatImageUrl(eventData.image),
              status: eventData.status,
              visibility: eventData.visibility,
              // Additional fields for availability
              display_start_date: eventData.display_start_date,
              display_end_date: eventData.display_end_date,
              display_start_time: eventData.display_start_time,
              display_end_time: eventData.display_end_time,
              reservation_start_date: eventData.reservation_start_date,
              reservation_end_date: eventData.reservation_end_date,
              reservation_start_time: eventData.reservation_start_time,
              reservation_end_time: eventData.reservation_end_time,
            };
          } else {
            toast.error("Could not find event details");
            setLoading(false);
            return false;
          }
        } catch (error) {
          console.error("Error fetching event:", error);
          toast.error("Could not find event details");
          setLoading(false);
          return false;
        }
      }

      // Prepare a more complete event data structure for PublishEvent page
      const eventData = {
        eventDetails: {
          eventId: event.id, // Include the original event ID
          eventName: event.eventName,
          eventDescription: event.details || event.eventDescription || "",
          eventDate: event.eventDate,
          venue: event.venue,
          startTime: event.startTime,
          endTime: event.endTime,
          eventCategory: event.eventCategory,
          eventType: isComingSoon ? "ticketed" : event.eventType, // Convert to ticketed if coming soon
          imagePreview: event.imagePreview,
          comingSoonConversion: isComingSoon, // Flag to indicate if this is a coming soon conversion
        },
        // Add availability data if available
        availabilityDetails: {
          eventType: isComingSoon ? "ticketed" : event.eventType,
          displayPeriod: {
            startDate: event.display_start_date || "",
            endDate: event.display_end_date || "",
            startTime: event.display_start_time || "",
            endTime: event.display_end_time || "",
          },
          ...(event.eventType === "ticketed" || isComingSoon
            ? {
                reservationPeriod: {
                  startDate: event.reservation_start_date || "",
                  endDate: event.reservation_end_date || "",
                  startTime: event.reservation_start_time || "",
                  endTime: event.reservation_end_time || "",
                },
              }
            : {}),
        },
      };

      console.log("Prepared event data:", JSON.stringify(eventData));

      // Save the event data to localStorage BEFORE navigating
      localStorage.setItem("comingSoonEventData", JSON.stringify(eventData));

      // Navigate based on condition - IMPROVED: Include eventId in URL
      if (isComingSoon) {
        console.log(`Navigating to /events/publish/${eventId}?convert=true`);
        navigate(`/events/publish/${eventId}?convert=true`);
      } else {
        console.log(`Navigating to /events/publish/${eventId}`);
        navigate(`/events/publish/${eventId}`);
      }

      return true;
    } catch (err) {
      console.error("Error navigating to edit event:", err);
      toast.error("Failed to prepare event for editing. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };
  const handleCloseReservation = async (eventId) => {
    try {
      setLoading(true);

      // Get the event to check its current state
      const event = findEventById(eventId);

      if (!event) {
        console.error(`Event with ID ${eventId} not found`);
        return false;
      }

      // Only confirm if the event is in 'open' status
      if (event.status === "open") {
        const confirmClose = window.confirm(
          `Are you sure you want to close reservations for "${event.eventName}"? Users will no longer be able to make new reservations.`
        );

        if (!confirmClose) {
          setLoading(false);
          return false;
        }
      } else if (event.status !== "scheduled") {
        // If the event is not in open or scheduled status, show error
        toast.error(
          `Cannot close reservations for event "${event.eventName}" because it's not currently open or scheduled.`,
          {
            position: "bottom-right",
            autoClose: 4000,
            toastId: `close-invalid-${eventId}`,
          }
        );
        setLoading(false);
        return false;
      }

      // Get current date and time
      const now = new Date();
      const nowISODate = now.toISOString().split("T")[0];
      const nowISOTime = now.toISOString().split("T")[1].substring(0, 8);

      // Set reservation end date to now if it's in the future
      if (
        event.reservation_end_date &&
        new Date(
          `${event.reservation_end_date}T${
            event.reservation_end_time || "23:59:59"
          }`
        ) > now
      ) {
        await eventService.events.update(eventId, {
          status: "closed",
          reservation_end_date: nowISODate,
          reservation_end_time: nowISOTime,
        });

        toast.info(`Reservation end date updated to current time`, {
          position: "bottom-right",
          autoClose: 3000,
        });
      } else {
        // Just update the status
        await eventService.events.updateStatus(eventId, {
          status: "closed",
        });
      }

      // Refresh the event's status
      await eventService.refreshEventStatus(eventId);

      // Refresh the events list
      await fetchEvents();

      // Show success toast
      toast.success(
        `Reservation of "${event.eventName}" has closed successfully`,
        {
          position: "bottom-right",
          autoClose: 3000,
          toastId: `close-success-${eventId}`,
        }
      );

      return true;
    } catch (err) {
      console.error("Error closing reservation immediately:", err);

      // Show error toast
      toast.error("Failed to close reservation. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
        toastId: `close-error-${eventId}`,
      });

      return false;
    } finally {
      setLoading(false);
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
      const BASE_URL = `${import.meta.env.VITE_API_URL}`;

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
      onOpenReservation={handleOpenReservation}
      onCloseReservation={handleCloseReservation}
      onRefreshEvents={handleManualRefresh}
      findEventById={findEventById}
      onNavigateToEdit={handleNavigateToEdit} // Add this new prop
    />
  );
};

export default EventsManagementContainer;
