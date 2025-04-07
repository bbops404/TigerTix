import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Admin_PublishEvent from "../pages/Admin/Admin_PublishEvent";
import eventService from "../pages/Services/eventService";

const formatImageUrl = (imageUrl) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

  if (!imageUrl) return null;

  // If the URL is already absolute (with http), return it as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Handle both /api/uploads and /uploads paths consistently
  let formattedUrl = imageUrl;

  // If path includes /api/uploads, remove the /api prefix
  if (formattedUrl.startsWith("/api/uploads/")) {
    formattedUrl = formattedUrl.replace("/api/uploads/", "/uploads/");
  }

  // If path doesn't start with /, add it
  if (!formattedUrl.startsWith("/")) {
    formattedUrl = `/${formattedUrl}`;
  }

  // Remove trailing slash from API_URL if it exists
  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;

  return `${baseUrl}${formattedUrl}`;
};

const PublishEventContainer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Handle publishing an event
  // Modified handlePublishEvent function in PublishEventContainer.jsx
  const handlePublishEvent = async (eventData) => {
    try {
      setIsSubmitting(true);

      // Process image if it exists (only if present)
      if (eventData.eventDetails.eventImage) {
        console.log(
          "Uploading event image:",
          eventData.eventDetails.eventImage
        );
        const imageResponse = await eventService.uploadEventImage(
          eventData.eventDetails.eventImage
        );
        if (imageResponse && imageResponse.imageUrl) {
          eventData.eventDetails.imageUrl = imageResponse.imageUrl;
        }
      }

      // Determine if display date is in the future
      const now = new Date();
      const displayStartDate = new Date(
        `${eventData.availabilityDetails.displayPeriod.startDate}T${eventData.availabilityDetails.displayPeriod.startTime}`
      );

      // Check if display date/time is in the future
      const isDisplayInFuture = displayStartDate > now;

      // Determine the correct status and visibility based on event type and display date
      let eventStatus, eventVisibility;

      // When creating a free event, check the display date
      if (isDisplayInFuture) {
        // Future display date means scheduled status and unpublished visibility
        eventStatus = "scheduled";
        eventVisibility = "unpublished";
      } else {
        // Current or past display date
        switch (eventDetails.eventType) {
          case "coming_soon":
            eventStatus = "closed";
            eventVisibility = "published";
            break;
          case "free":
            eventStatus = "open";
            eventVisibility = "published";
            break;
          case "ticketed":
            eventStatus = "scheduled";
            eventVisibility = "published";
            break;
          default:
            eventStatus = "draft";
            eventVisibility = "unpublished";
        }
      }
      // Transform data to match backend expectations
      const eventPayload = {
        name: eventData.eventDetails.eventName,
        details: eventData.eventDetails.eventDescription,
        event_date: eventData.eventDetails.eventDate,
        event_time: eventData.eventDetails.startTime,
        // Only include event_end_time if it's not empty
        ...(eventData.eventDetails.endTime
          ? { event_end_time: eventData.eventDetails.endTime }
          : {}),
        venue: eventData.eventDetails.venue,
        category: eventData.eventDetails.eventCategory,
        event_type: eventData.eventDetails.eventType,
        // Only include image if imageUrl exists
        ...(eventData.eventDetails.imageUrl
          ? { image: eventData.eventDetails.imageUrl }
          : {}),
        status: eventStatus,
        visibility: eventVisibility,
        display_start_date:
          eventData.availabilityDetails.displayPeriod.startDate,
        display_end_date: eventData.availabilityDetails.displayPeriod.endDate,
        display_start_time:
          eventData.availabilityDetails.displayPeriod.startTime,
        display_end_time: eventData.availabilityDetails.displayPeriod.endTime,
      };

      // Add reservation period for ticketed events
      if (
        eventData.eventDetails.eventType === "ticketed" &&
        eventData.availabilityDetails.reservationPeriod
      ) {
        eventPayload.reservation_start_date =
          eventData.availabilityDetails.reservationPeriod.startDate;
        eventPayload.reservation_start_time =
          eventData.availabilityDetails.reservationPeriod.startTime;
        eventPayload.reservation_end_date =
          eventData.availabilityDetails.reservationPeriod.endDate;
        eventPayload.reservation_end_time =
          eventData.availabilityDetails.reservationPeriod.endTime;
      }

      console.log("Sending event payload:", eventPayload);

      // Create the event using the events.create method which uses the post method internally
      const response = await eventService.events.create(eventPayload);

      // Continue with ticket and claiming slot creation as before...
      if (response && response.data && response.data.event_id) {
        const eventId = response.data.event_id;

        // Only create tickets for ticketed events
        if (
          eventData.eventDetails.eventType === "ticketed" &&
          eventData.ticketDetails
        ) {
          if (eventData.ticketDetails.tierType === "freeSeating") {
            await eventService.tickets.createBulk(eventId, [
              {
                seat_type: "Free Seating",
                ticket_type: "General",
                price: eventData.ticketDetails.freeSeating.price,
                total_quantity:
                  eventData.ticketDetails.freeSeating.numberOfTickets,
                max_per_user: eventData.ticketDetails.freeSeating.maxPerPerson,
              },
            ]);
          } else if (eventData.ticketDetails.ticketTiers) {
            const ticketsData = Object.entries(
              eventData.ticketDetails.ticketTiers
            )
              .filter(([_, tierData]) => tierData.checked)
              .map(([tierName, tierData]) => ({
                seat_type: tierName,
                ticket_type: "Reserved",
                price: tierData.price,
                total_quantity: tierData.number,
                max_per_user: tierData.maxPerPerson,
              }));

            if (ticketsData.length > 0) {
              await eventService.tickets.createBulk(eventId, ticketsData);
            }
          }
        }

        // Create claiming slots for ticketed events
        if (
          eventData.eventDetails.eventType === "ticketed" &&
          eventData.claimingDetails &&
          eventData.claimingDetails.claimingSummaries &&
          eventData.claimingDetails.claimingSummaries.length > 0
        ) {
          const claimingSlotsData =
            eventData.claimingDetails.claimingSummaries.map((summary) => ({
              claiming_date: summary.date,
              start_time: summary.startTime,
              end_time: summary.endTime,
              venue: summary.venue,
              max_claimers: summary.maxReservations,
            }));

          await eventService.claimingSlots.createBulk(
            eventId,
            claimingSlotsData
          );
        }
      }

      // Redirect to events management page on success
      navigate("/events");
      return response;
    } catch (error) {
      console.error("Error publishing event:", error);
      // Error handling remains the same
      if (error.response && error.response.data) {
        console.error("Server response:", error.response.data);
        alert(
          `Failed to publish event: ${
            error.response.data.message || "Unknown error"
          }`
        );
      } else {
        alert("Failed to publish event. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle saving an event as draft
  const handleSaveAsDraft = async (draftData) => {
    try {
      setIsSubmitting(true);

      // Process image if it exists
      if (draftData.eventDetails?.eventImage) {
        const imageResponse = await eventService.uploadEventImage(
          draftData.eventDetails.eventImage
        );

        console.log("Draft image upload response:", imageResponse);

        // Store the raw path returned from the backend
        if (imageResponse && imageResponse.imageUrl) {
          draftData.eventDetails.imageUrl = imageResponse.imageUrl;
        }
      }

      // For the saveDraftEvent method, we need to ensure image is correctly set
      if (draftData.eventDetails) {
        // Create a simplified payload that matches what saveDraftEvent expects
        const draftPayload = {
          ...draftData,
          eventDetails: {
            ...draftData.eventDetails,
            ...(draftData.eventDetails?.imageUrl
              ? { image: draftData.eventDetails.imageUrl }
              : {}),
          },
        };

        console.log("Saving draft payload:", draftPayload);

        // Use the saveDraftEvent method from eventService
        const response = await eventService.saveDraftEvent(draftPayload);

        // Redirect to events management page on success
        navigate("/events");

        return response;
      } else {
        throw new Error("Missing event details in draft data");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Admin_PublishEvent
      onPublish={handlePublishEvent}
      onSaveAsDraft={handleSaveAsDraft}
      isSubmitting={isSubmitting}
    />
  );
};

export default PublishEventContainer;
