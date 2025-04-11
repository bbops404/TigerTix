import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom"; // Add useParams
import Admin_PublishEvent from "../pages/Admin/Admin_PublishEvent";
import eventService from "../pages/Services/eventService";
import { toast } from "react-toastify";

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
  const [initialData, setInitialData] = useState(null);
  const [checkedLocalStorage, setCheckedLocalStorage] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams(); // Get URL parameters
  const eventId = params.id; // Extract event ID from URL params
  const searchParams = new URLSearchParams(location.search);
  const isConvertMode = searchParams.get("convert") === "true";
  const fetchEventTickets = async (eventId) => {
    try {
      console.log(
        `Fetching event details and tickets for event ID: ${eventId}`
      );

      // Get the event details including tickets
      const response = await eventService.events.getById(eventId);

      if (response && response.data) {
        const eventData = response.data;
        console.log("Successfully fetched event data:", eventData);

        // Transform the tickets data for our form if available
        const hasTickets = eventData.Tickets && eventData.Tickets.length > 0;
        const hasClaimingSlots =
          eventData.ClaimingSlots && eventData.ClaimingSlots.length > 0;

        setInitialData((prevData) => {
          if (!prevData) {
            console.warn("Previous data is null, creating new object");
            prevData = {
              eventDetails: {},
              ticketDetails: null,
              claimingDetails: null,
              availabilityDetails: {
                displayPeriod: {
                  startDate: "",
                  endDate: "",
                  startTime: "",
                  endTime: "",
                },
              },
            };
          }

          // Create a deep copy of previous data to avoid mutation issues
          let updatedData = JSON.parse(JSON.stringify(prevData));

          // Build ticket details if tickets are available
          if (hasTickets) {
            console.log("Processing tickets:", eventData.Tickets);

            // Determine ticket type (free seating or reserved)
            const singleFreeSeating =
              eventData.Tickets.length === 1 &&
              eventData.Tickets[0].seat_type === "Free Seating";

            const ticketDetails = {
              hasTierInfo: true,
              tierType: singleFreeSeating ? "freeSeating" : "ticketed",
            };

            // Handle free seating case
            if (ticketDetails.tierType === "freeSeating") {
              const ticket = eventData.Tickets[0];
              ticketDetails.freeSeating = {
                numberOfTickets: ticket.total_quantity.toString(),
                price: ticket.price.toString(),
                maxPerPerson: ticket.max_per_user.toString(),
              };
            }
            // Handle ticketed/reserved seating case
            else {
              const ticketTiers = {};
              eventData.Tickets.forEach((ticket) => {
                ticketTiers[ticket.seat_type] = {
                  number: ticket.total_quantity.toString(),
                  price: ticket.price.toString(),
                  maxPerPerson: ticket.max_per_user.toString(),
                  checked: true,
                  isEditing: false,
                };
              });
              ticketDetails.ticketTiers = ticketTiers;
            }

            updatedData.ticketDetails = ticketDetails;
          }

          // Build claiming slots data if available
          if (hasClaimingSlots) {
            console.log("Processing claiming slots:", eventData.ClaimingSlots);

            const claimingSummaries = eventData.ClaimingSlots.map((slot) => ({
              id: slot.id,
              date: slot.claiming_date,
              venue: slot.venue,
              startTime: slot.start_time,
              endTime: slot.end_time,
              maxReservations: slot.max_claimers.toString(),
            }));

            const availableDates = [
              ...new Set(claimingSummaries.map((summary) => summary.date)),
            ];

            updatedData.claimingDetails = {
              claimingSummaries,
              availableDates,
              eventType: updatedData.eventDetails.eventType || "ticketed",
            };
          }

          // Update availability details based on API response
          const availabilityDetails = {
            eventType: updatedData.eventDetails.eventType || "ticketed",
            displayPeriod: {
              startDate: eventData.display_start_date || "",
              endDate: eventData.display_end_date || "",
              startTime: eventData.display_start_time || "",
              endTime: eventData.display_end_time || "",
            },
          };

          // Add reservation period if it exists
          if (eventData.reservation_start_date) {
            availabilityDetails.reservationPeriod = {
              startDate: eventData.reservation_start_date || "",
              endDate: eventData.reservation_end_date || "",
              startTime: eventData.reservation_start_time || "",
              endTime: eventData.reservation_end_time || "",
            };
          }

          updatedData.availabilityDetails = availabilityDetails;

          console.log("Updated initial data:", updatedData);
          return updatedData;
        });
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      toast.error("Failed to load event details");
    }
  };
  // Enhanced useEffect to load event data
  useEffect(() => {
    // Skip if we've already checked localStorage
    if (checkedLocalStorage) return;

    console.log("Running useEffect to load event data");
    console.log("URL event ID:", eventId);
    console.log("Convert mode:", isConvertMode);

    // Set flag that we've checked localStorage
    setCheckedLocalStorage(true);

    // If we have an event ID in the URL, prioritize loading that
    if (eventId) {
      loadEventFromApi(eventId, isConvertMode);
      return;
    }

    // If no event ID in URL, fall back to localStorage data
    const storedEventData = localStorage.getItem("comingSoonEventData");
    console.log("storedEventData:", storedEventData ? "Present" : "Missing");

    if (storedEventData) {
      try {
        const parsedData = JSON.parse(storedEventData);
        console.log("Parsed data from localStorage:", parsedData);

        // If we have valid data, set it as initial data
        if (parsedData && parsedData.eventDetails) {
          console.log("Loading event data from localStorage:", parsedData);
          processEventData(parsedData);
        }
      } catch (error) {
        console.error("Error parsing stored event data:", error);
        localStorage.removeItem("comingSoonEventData");

        // Redirect if we're on the convert page but couldn't parse the data
        if (location.pathname.includes("/events/publish/convert")) {
          navigate("/events");
          toast.error("Invalid event data for conversion");
        }
      }
    } else if (location.pathname.includes("/events/publish/convert")) {
      // Only redirect if we're on the convert page and no data was found
      console.warn("Attempted to access convert page without event data");
      navigate("/events");
      toast.error("No event data found for conversion");
    }
  }, [
    navigate,
    location.pathname,
    checkedLocalStorage,
    eventId,
    isConvertMode,
  ]);

  // Add a new function to load event data directly from API
  const loadEventFromApi = async (id, isConverting = false) => {
    try {
      console.log(
        `Loading event ${id} directly from API. Convert mode: ${isConverting}`
      );
      setIsSubmitting(true);

      // Get the event details from API
      const response = await eventService.events.getById(id);

      if (response && response.data) {
        const event = response.data;
        console.log("API returned event data:", event);

        // Transform API data to the format expected by the form
        const eventData = {
          eventDetails: {
            eventId: event.id, // Very important - this signals we're editing not creating
            eventName: event.name,
            eventDescription: event.details || "",
            eventDate: event.event_date,
            venue: event.venue,
            startTime: event.event_time,
            endTime: event.event_end_time,
            eventCategory: event.category,
            eventType: isConverting ? "ticketed" : event.event_type,
            imagePreview: formatImageUrl(event.image),
            comingSoonConversion: isConverting,
            // Important field to ensure we update not create
            isEditing: true,
          },
          availabilityDetails: {
            eventType: isConverting ? "ticketed" : event.event_type,
            displayPeriod: {
              startDate: event.display_start_date || "",
              endDate: event.display_end_date || "",
              startTime: event.display_start_time || "",
              endTime: event.display_end_time || "",
            },
            ...(event.event_type === "ticketed" || isConverting
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

        // Process the event data to fill in all necessary details
        processEventData(eventData);

        // Also load tickets and claiming slots
        if (event.Tickets || event.tickets) {
          await fetchEventTickets(id);
        }
      } else {
        toast.error(`Unable to load event with ID: ${id}`);
        navigate("/events");
      }
    } catch (error) {
      console.error(`Error loading event ${id} from API:`, error);
      toast.error("Failed to load event data. Returning to events page.");
      navigate("/events");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a helper function to consistently process event data
  const processEventData = (parsedData) => {
    // Make sure we have proper structure and normalize field names
    const completeData = {
      eventDetails: {
        // Event basics with consistent naming
        eventId: parsedData.eventDetails.eventId,
        eventName: parsedData.eventDetails.eventName || "",
        eventDescription:
          parsedData.eventDetails.eventDescription ||
          parsedData.eventDetails.details ||
          "",
        eventDate: parsedData.eventDetails.eventDate || "",
        venue: parsedData.eventDetails.venue || "",
        startTime: parsedData.eventDetails.startTime || "",
        endTime: parsedData.eventDetails.endTime || "",
        eventCategory: parsedData.eventDetails.eventCategory || "",
        eventType: parsedData.eventDetails.eventType || "ticketed",
        // Image handling
        imagePreview: parsedData.eventDetails.imagePreview
          ? formatImageUrl(parsedData.eventDetails.imagePreview)
          : null,
        // Additional flags
        comingSoonConversion:
          parsedData.eventDetails.comingSoonConversion || false,
        // Mark as editing if we have an event ID
        isEditing: !!parsedData.eventDetails.eventId,
      },
      ticketDetails: parsedData.ticketDetails || null,
      claimingDetails: parsedData.claimingDetails || null,
      availabilityDetails: parsedData.availabilityDetails || {
        displayPeriod: {
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
        },
      },
    };

    setInitialData(completeData);
    console.log("Initial data set to:", completeData);
  };
  const compressImage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set maximum dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          // Scale down if larger than max dimensions
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw the image with new dimensions
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with reduced quality
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            "image/jpeg",
            0.7
          ); // 0.7 is the quality (70%)
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handlePublishEvent = async (eventData) => {
    try {
      setIsSubmitting(true);

      console.log("Sending event data:", eventData);

      // CRITICAL: Determine if we're editing an existing event or creating a new one
      const isEditing = !!(eventData.eventDetails.eventId || params.id);
      const eventId = eventData.eventDetails.eventId || params.id;

      console.log(
        `${isEditing ? "UPDATING" : "CREATING"} event. Event ID: ${eventId}`
      );

      // Handle image upload first and capture the URL
      let imageUrl = null;

      if (eventData.eventDetails.eventImage) {
        console.log("Preparing to upload image...");
        if (eventData.eventDetails.eventImage.size > 5 * 1024 * 1024) {
          console.log("Image too large, compressing...");
          eventData.eventDetails.eventImage = await compressImage(
            eventData.eventDetails.eventImage
          );
        }

        // Check if we have a valid File object
        if (eventData.eventDetails.eventImage instanceof File) {
          try {
            console.log(
              "Valid File object detected, uploading:",
              eventData.eventDetails.eventImage.name
            );

            // The uploadEventImage function expects a raw File object, not FormData
            const imageResponse = await eventService.uploadEventImage(
              eventData.eventDetails.eventImage
            );

            // Log the complete response
            console.log("Image upload response:", imageResponse);

            if (imageResponse && imageResponse.imageUrl) {
              console.log(
                "Image uploaded successfully, got URL:",
                imageResponse.imageUrl
              );
              // Set the imageUrl directly from the response - don't modify it
              imageUrl = imageResponse.imageUrl;
            } else {
              console.warn(
                "Image upload response missing imageUrl:",
                imageResponse
              );
            }
          } catch (imageError) {
            console.error("Image upload failed:", imageError);
            if (imageError.response) {
              console.error("Server response:", imageError.response.data);
              console.error("Status code:", imageError.response.status);
            }
            // Continue without image
            toast.warning("Could not upload image. Proceeding without it.");
          }
        } else {
          console.warn(
            "Image is not a valid File object:",
            typeof eventData.eventDetails.eventImage
          );
        }
      } else if (
        eventData.eventDetails.imagePreview &&
        !eventData.eventDetails.imageUrl
      ) {
        // For coming soon conversion or editing, use the existing image
        console.log(
          "Using existing image URL from preview:",
          eventData.eventDetails.imagePreview
        );

        // Extract path portion if it's a full URL
        imageUrl = eventData.eventDetails.imagePreview;

        // If it's an absolute URL with our domain, extract just the path
        if (imageUrl.includes("/uploads/")) {
          const pathMatch = imageUrl.match(/\/uploads\/[^?#]+/);
          if (pathMatch) {
            imageUrl = pathMatch[0];
            console.log("Extracted path from URL:", imageUrl);
          }
        }
      }
      // Check if this is a coming soon conversion
      const isComingSoonConversion =
        eventData.eventDetails.comingSoonConversion;
      let originalEventId;

      if (isComingSoonConversion) {
        originalEventId = eventData.eventDetails.eventId || params.id;

        // Store the original ID and then remove it from the payload
        delete eventData.eventDetails.eventId;
        delete eventData.eventDetails.comingSoonConversion;

        // Show toast notification about the conversion
        toast.info(
          "Converting 'Coming Soon' event to a fully published event",
          {
            position: "bottom-right",
            autoClose: 3000,
          }
        );
      }

      // Determine if display date is in the future
      const now = new Date();
      const displayStartDate = new Date(
        `${eventData.availabilityDetails.displayPeriod.startDate}T${eventData.availabilityDetails.displayPeriod.startTime}`
      );

      // Check if display date/time is in the future
      const isDisplayInFuture = displayStartDate > now;

      // For coming soon conversions, we'll automatically set the display date to now
      // to make the event immediately visible
      if (isComingSoonConversion) {
        eventData.availabilityDetails.displayPeriod.startDate = now
          .toISOString()
          .split("T")[0];
        eventData.availabilityDetails.displayPeriod.startTime = now
          .toTimeString()
          .split(" ")[0]
          .substring(0, 8);
      }

      let eventStatus, eventVisibility;

      if (isDisplayInFuture) {
        // Future display date - should be unpubl
        // ifished for all event types
        if (eventData.eventDetails.eventType == "free") {
          eventStatus = "open";
        } else {
          eventStatus = "scheduled";
        }
        eventVisibility = "unpublished";
      } else {
        // Current or past display date
        switch (eventData.eventDetails.eventType) {
          case "free":
            eventStatus = "open";
            eventVisibility = "published";
            break;
          case "coming_soon":
            eventStatus = "closed";
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
        // Add the image URL to the payload if we have one
        ...(imageUrl ? { image: imageUrl } : {}),
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

      console.log(
        `Sending event payload (${isEditing ? "UPDATE" : "CREATE"}):`,
        eventPayload
      );

      let response;
      let finalEventId; // Store the event ID for later use

      // Choose the correct method based on whether we're editing or creating
      if (isEditing || isComingSoonConversion) {
        // Either normal edit or coming soon conversion - update the event
        const updateId = isComingSoonConversion ? originalEventId : eventId;
        console.log(`Updating existing event with ID: ${updateId}`);

        try {
          response = await eventService.events.update(updateId, eventPayload);
          // Store the ID we're working with
          finalEventId = updateId;
        } catch (updateError) {
          console.error("Error updating event:", updateError);
          // More detailed error for debugging
          if (updateError.response) {
            console.error("Update response data:", updateError.response.data);
            console.error(
              "Update response status:",
              updateError.response.status
            );
          }
          throw updateError; // Re-throw to be caught by outer catch
        }
      } else {
        // Brand new event - create it
        console.log("Creating new event");
        try {
          response = await eventService.events.create(eventPayload);
          // For a newly created event, get the ID from the response
          if (response && response.data) {
            finalEventId = response.data.event_id || response.data.id;
          }
        } catch (createError) {
          console.error("Error creating event:", createError);
          // More detailed error for debugging
          if (createError.response) {
            console.error("Create response data:", createError.response.data);
            console.error(
              "Create response status:",
              createError.response.status
            );
          }
          throw createError; // Re-throw to be caught by outer catch
        }
      }

      // Only continue if we have an event ID to work with
      if (finalEventId) {
        // Only create tickets for ticketed events
        if (
          (eventData.eventDetails.eventType === "ticketed" ||
            isComingSoonConversion) &&
          eventData.ticketDetails
        ) {
          try {
            // Get existing tickets
            const ticketsResponse = await eventService.tickets.getByEventId(
              finalEventId
            );

            // Delete existing tickets if there are any
            if (
              ticketsResponse &&
              ticketsResponse.data &&
              ticketsResponse.data.length > 0
            ) {
              // Delete existing tickets
              for (const ticket of ticketsResponse.data) {
                await eventService.tickets.delete(ticket.id);
              }
              console.log("Cleared existing tickets before creating new ones");
            }

            // Create new tickets
            if (eventData.ticketDetails.tierType === "freeSeating") {
              await eventService.tickets.createBulk(finalEventId, [
                {
                  seat_type: "Free Seating",
                  ticket_type: "Free Seating",
                  price: parseFloat(
                    eventData.ticketDetails.freeSeating.price || 0
                  ),
                  total_quantity: parseInt(
                    eventData.ticketDetails.freeSeating.numberOfTickets || 0
                  ),
                  max_per_user: parseInt(
                    eventData.ticketDetails.freeSeating.maxPerPerson || 1
                  ),
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
                  price: parseFloat(tierData.price || 0),
                  total_quantity: parseInt(tierData.number || 0),
                  max_per_user: parseInt(tierData.maxPerPerson || 1),
                }));

              if (ticketsData.length > 0) {
                await eventService.tickets.createBulk(
                  finalEventId,
                  ticketsData
                );
              }
            }
          } catch (error) {
            console.error("Error updating tickets:", error);
            toast.warning(
              "Event created but there was an issue setting up tickets"
            );
            // Continue despite errors with tickets
          }
        }

        // Create claiming slots for ticketed events
        if (
          (eventData.eventDetails.eventType === "ticketed" ||
            isComingSoonConversion) &&
          eventData.claimingDetails &&
          eventData.claimingDetails.claimingSummaries &&
          eventData.claimingDetails.claimingSummaries.length > 0
        ) {
          try {
            // Clear existing claiming slots
            await eventService.claimingSlots.clearAll(finalEventId);
            console.log(
              "Cleared existing claiming slots before creating new ones"
            );

            const claimingSlotsData =
              eventData.claimingDetails.claimingSummaries.map((summary) => ({
                claiming_date: summary.date,
                start_time: summary.startTime,
                end_time: summary.endTime,
                venue: summary.venue,
                max_claimers: parseInt(summary.maxReservations || 0),
              }));

            await eventService.claimingSlots.createBulk(
              finalEventId,
              claimingSlotsData
            );
          } catch (error) {
            console.error("Error updating claiming slots:", error);
            toast.warning(
              "Event created but there was an issue setting up claiming slots"
            );
            // Continue despite errors with claiming slots
          }
        }
      }

      // Show appropriate success message
      if (isComingSoonConversion) {
        toast.success(
          `Successfully converted "${eventData.eventDetails.eventName}" from Coming Soon to a fully published event!`,
          {
            position: "bottom-right",
            autoClose: 4000,
          }
        );
      } else if (isEditing) {
        toast.success(
          `Event "${eventData.eventDetails.eventName}" updated successfully!`,
          {
            position: "bottom-right",
            autoClose: 3000,
          }
        );
      } else {
        toast.success(
          `Event "${eventData.eventDetails.eventName}" published successfully!`,
          {
            position: "bottom-right",
            autoClose: 3000,
          }
        );
      }

      // Refresh the event's status if we have a final event ID
      if (finalEventId) {
        try {
          await eventService.refreshEventStatus(finalEventId);
        } catch (refreshError) {
          console.warn("Error refreshing event status:", refreshError);
          // Don't show error to user, this is non-critical
        }
      }

      // Remove the data from localStorage after successful submission
      localStorage.removeItem("comingSoonEventData");

      // Redirect to events management page on success
      navigate("/events");
      return response;
    } catch (error) {
      console.error("Error publishing event:", error);
      // Error handling
      if (error.response && error.response.data) {
        console.error("Server response:", error.response.data);
        toast.error(
          `Failed to publish event: ${
            error.response.data.message || "Unknown error"
          }`
        );
      } else {
        toast.error("Failed to publish event. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Also update the handleSaveAsDraft method similarly
  const handleSaveAsDraft = async (draftData) => {
    try {
      setIsSubmitting(true);

      // CRITICAL: Determine if we're editing an existing event or creating a new one
      const isEditingExistingEvent = !!(
        draftData.eventDetails?.eventId || params.id
      );
      const eventId = draftData.eventDetails?.eventId || params.id;

      console.log(
        `${isEditingExistingEvent ? "Updating" : "Creating"} draft with data:`,
        draftData
      );
      console.log("Event ID:", eventId);

      // Process image if it exists
      let imageUrl = null;
      if (draftData.eventDetails?.eventImage) {
        try {
          const imageResponse = await eventService.uploadEventImage(
            draftData.eventDetails.eventImage
          );
          console.log("Draft image upload response:", imageResponse);
          // Store the raw path returned from the backend
          if (imageResponse && imageResponse.imageUrl) {
            imageUrl = imageResponse.imageUrl;
          }
        } catch (imageError) {
          console.warn(
            "Image upload failed, proceeding without image:",
            imageError
          );
        }
      } else if (draftData.eventDetails?.imagePreview) {
        // If we have imagePreview but no new image, use the existing image
        imageUrl = draftData.eventDetails.imagePreview;
      }

      // Prepare draft event payload with null for empty time fields
      const draftPayload = {
        name: draftData.eventDetails?.eventName || "Draft Event",
        details: draftData.eventDetails?.eventDescription || "",
        event_date: draftData.eventDetails?.eventDate,

        // Only include time fields if they have a value
        ...(draftData.eventDetails?.startTime
          ? { event_time: draftData.eventDetails.startTime }
          : {}),

        ...(draftData.eventDetails?.endTime
          ? { event_end_time: draftData.eventDetails.endTime }
          : {}),

        venue: draftData.eventDetails?.venue,
        category: draftData.eventDetails?.eventCategory,
        event_type: draftData.eventDetails?.eventType || "ticketed",

        // Use image URL if it exists
        ...(imageUrl && { image: imageUrl }),

        status: "draft",
        visibility: "unpublished",
      };

      console.log(
        `${isEditingExistingEvent ? "Updating" : "Creating"} draft payload:`,
        draftPayload
      );

      let response;
      // Use the correct method based on whether we're editing or creating
      if (isEditingExistingEvent) {
        // Update existing draft using the events.update method
        response = await eventService.events.update(eventId, draftPayload);
      } else {
        // Create new draft using the events.createDraft method
        response = await eventService.events.createDraft(draftPayload);
      }

      // Show success toast
      toast.success(
        isEditingExistingEvent
          ? "Draft updated successfully"
          : "Draft saved successfully",
        {
          position: "bottom-right",
          autoClose: 3000,
        }
      );

      // Remove localStorage data after saving draft
      localStorage.removeItem("comingSoonEventData");

      // Redirect to events management page on success
      navigate("/events");

      return response;
    } catch (error) {
      console.error("Error saving draft:", error);

      // More detailed error handling
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save draft. Please try again.";

      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 4000,
      });

      throw error; // Re-throw to allow further error handling if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Admin_PublishEvent
      onPublish={handlePublishEvent}
      onSaveAsDraft={handleSaveAsDraft}
      isSubmitting={isSubmitting}
      initialData={initialData}
    />
  );
};

export default PublishEventContainer;
