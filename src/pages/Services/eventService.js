// frontend/src/services/eventService.js
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const formatImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // If the URL is already absolute (S3 URLs are full HTTPS URLs), return it as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // For backward compatibility with local uploads (if any)
  const API_URL = `${import.meta.env.VITE_API_URL}/api`;
  let formattedUrl = imageUrl;

  // Handle local file paths (legacy support)
  if (formattedUrl.startsWith("/api/uploads/")) {
    formattedUrl = formattedUrl.replace("/api/uploads/", "/uploads/");
  }

  if (!formattedUrl.startsWith("/")) {
    formattedUrl = `/${formattedUrl}`;
  }

  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  return `${baseUrl}${formattedUrl}`;
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      }
      if (error.response.status === 403) {
        console.error("Permission denied:", error.response.data.message);
      }
    }
    return Promise.reject(error);
  }
);

const eventService = {
  // Generic methods
  get: async (endpoint, params = {}) => {
    try {
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  }, // Add these methods to your eventService.js file
  createTicketsBulk: async (eventId, ticketsData) => {
    return await apiClient.post(`/events/${eventId}/tickets/bulk`, ticketsData);
  },

  createClaimingSlotsBulk: async (eventId, claimingSlotsData) => {
    return await apiClient.post(
      `/events/${eventId}/claiming-slots/bulk`,
      claimingSlotsData
    );
  },

  post: async (endpoint, data = {}, config = {}) => {
    try {
      const response = await apiClient.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  },

  put: async (endpoint, data = {}) => {
    try {
      const response = await apiClient.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  },

  delete: async (endpoint) => {
    try {
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  },

  // Image upload
  uploadEventImage: async (file, oldImageKey = null) => {
    try {
      console.log("Starting image upload with file:", file.name, "Size:", file.size, "Type:", file.type);
      
      // If there's an old image, delete it first
      if (oldImageKey) {
        try {
          await eventService.deleteEventImage(oldImageKey);
          console.log("Old image deleted successfully:", oldImageKey);
        } catch (deleteError) {
          console.warn("Failed to delete old image:", deleteError);
          // Continue with upload even if delete fails
        }
      }
      
      const formData = new FormData();
      formData.append("image", file);

      console.log("FormData created, sending request...");
      
      const response = await apiClient.post("/events/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        transformRequest: [(data) => data], // Prevent axios from transforming FormData
      });
  
      console.log("Upload image API response:", response.data);
  
      if (response.data && response.data.success && response.data.imageUrl) {
        return {
          success: true,
          imageUrl: response.data.imageUrl,
          s3Key: response.data.s3Key,
        };
      } else {
        throw new Error("Image upload failed - No URL returned");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }
      throw error;
    }
  },

  // Add method to delete images
  deleteEventImage: async (s3Key) => {
    try {
      const response = await apiClient.delete("/events/delete-image", {
        data: { key: s3Key }
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  },

  // Venue map upload
  uploadVenueMap: async (file, oldMapKey = null) => {
    try {
      console.log("Starting venue map upload with file:", file.name, "Size:", file.size, "Type:", file.type);
      
      // If there's an old map, delete it first
      if (oldMapKey) {
        try {
          await eventService.deleteVenueMap(oldMapKey);
          console.log("Old venue map deleted successfully:", oldMapKey);
        } catch (deleteError) {
          console.warn("Failed to delete old venue map:", deleteError);
          // Continue with upload even if delete fails
        }
      }
      
      const formData = new FormData();
      formData.append("venueMap", file);

      console.log("FormData created, sending request...");
      
      const response = await apiClient.post("/events/upload-venue-map", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        transformRequest: [(data) => data], // Prevent axios from transforming FormData
      });
  
      console.log("Upload venue map API response:", response.data);
  
      if (response.data && response.data.success && response.data.imageUrl) {
        return {
          success: true,
          imageUrl: response.data.imageUrl,
          s3Key: response.data.s3Key,
        };
      } else {
        throw new Error("Venue map upload failed - No URL returned");
      }
    } catch (error) {
      console.error("Venue map upload error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }
      throw error;
    }
  },

  // Add method to delete venue maps
  deleteVenueMap: async (s3Key) => {
    try {
      const response = await apiClient.delete("/events/delete-venue-map", {
        data: { key: s3Key }
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting venue map:", error);
      throw error;
    }
  },

  // Event operations
  events: {
    getAll: (filters = {}) => eventService.get("/events", filters),
    getById: (eventId) => eventService.get(`/events/${eventId}`),
    getDrafts: () => eventService.get("/events/drafts"),
    getComingSoon: () => eventService.get("/events/coming-soon"),

    create: (eventData) => eventService.post("/events", eventData),
    createDraft: (eventData) => eventService.post("/events/draft", eventData),
    update: (eventId, eventData) =>
      eventService.put(`/events/${eventId}`, eventData),
    updateStatus: (eventId, statusData) =>
      eventService.put(`/events/${eventId}/status`, statusData),
    convert: (eventId, conversionData) =>
      eventService.post(`/events/${eventId}/convert`, conversionData),
    cancel: (eventId) => eventService.post(`/events/cancel/${eventId}`),
    archive: (eventId) => eventService.post(`/events/archive/${eventId}`),
    delete: (eventId) => eventService.delete(`/events/${eventId}`),
  },

  // Ticket operations
  tickets: {
    getByEventId: (eventId) => eventService.get(`/events/${eventId}/tickets`),

    // Create a single ticket - consistent implementation
    create: (eventId, ticketData) =>
      eventService.post(`/events/${eventId}/tickets`, ticketData),

    // Create multiple tickets - consistent implementation
    createBulk: (eventId, ticketsData) =>
      eventService.post(`/events/${eventId}/tickets/bulk`, ticketsData),

    // Update a ticket - fixed implementation
    update: (ticketId, ticketData) =>
      eventService.put(`/tickets/${ticketId}`, ticketData),

    // Delete a ticket - fixed implementation
    delete: (ticketId) => eventService.delete(`/tickets/${ticketId}`),
  },

  // Helper function for creating tickets - Improved implementation
  createTickets: async (eventId, ticketDetails, eventType) => {
    try {
      // Prepare tickets based on the tier type
      let tickets = [];

      if (eventType === "free") {
        // Free event - single free ticket tier
        tickets.push({
          seat_type: "Free Seating",
          ticket_type: "General Admission",
          price: 0, // Always 0 for free events
          total_quantity: ticketDetails.freeSeating.numberOfTickets,
          max_per_user: ticketDetails.freeSeating.maxPerPerson || 1,
        });
      } else if (ticketDetails.tierType === "freeSeating") {
        // Free seating
        tickets.push({
          seat_type: "Free Seating",
          ticket_type: "General Admission",
          price: ticketDetails.freeSeating.price || 0,
          total_quantity: ticketDetails.freeSeating.numberOfTickets,
          max_per_user: ticketDetails.freeSeating.maxPerPerson || 1,
        });
      } else {
        // Ticketed with multiple tiers
        Object.entries(ticketDetails.ticketTiers)
          .filter(([_, tierData]) => tierData.checked)
          .forEach(([tierName, tierData]) => {
            tickets.push({
              seat_type: tierName,
              ticket_type: "Reserved Seating",
              price: tierData.price || 0,
              total_quantity: tierData.number || 0,
              max_per_user: tierData.maxPerPerson || 1,
            });
          });
      }

      // Use our consistent method for bulk ticket creation
      const response = await eventService.tickets.createBulk(eventId, tickets);
      return response;
    } catch (error) {
      console.error("Error creating tickets:", error);
      throw error;
    }
  },

  // Claiming slots operations
  claimingSlots: {
    getByEventId: (eventId) =>
      eventService.get(`/events/${eventId}/claiming-slots`),
    getAvailable: (eventId) =>
      eventService.get(`/events/${eventId}/claiming-slots/available`),
    create: (eventId, slotData) =>
      eventService.post(`/events/${eventId}/claiming-slots`, slotData),
    createBulk: (eventId, slotsData) =>
      eventService.post(`/events/${eventId}/claiming-slots/bulk`, slotsData),
    clearAll: (eventId) =>
      eventService.delete(`/events/${eventId}/claiming-slots`),
    update: (slotId, slotData) =>
      eventService.put(`/claiming-slots/${slotId}`, slotData),
    delete: (slotId) => eventService.delete(`/claiming-slots/${slotId}`),
  },
  checkEventStatuses: async () => {
    try {
      const response = await apiClient.get("/events/check-status");
      return response.data;
    } catch (error) {
      console.error("Error checking event statuses:", error);
      throw error;
    }
  },

  // Add a method to trigger an immediate status refresh for a specific event
  refreshEventStatus: async (eventId) => {
    try {
      const response = await apiClient.post(
        `/events/${eventId}/refresh-status`
      );
      return response.data;
    } catch (error) {
      console.error(`Error refreshing status for event ${eventId}:`, error);
      throw error;
    }
  },

  // Add method to get events that need status updates soon
  getUpcomingStatusChanges: async () => {
    try {
      const response = await apiClient.get("/events/upcoming-status-changes");
      return response.data;
    } catch (error) {
      console.error("Error fetching upcoming status changes:", error);
      throw error;
    }
  },

  // Existing complex methods from previous implementation
  createEvent: async (eventData) => {
    console.log("Creating event with data:", eventData);

    // Make sure we have the minimum required fields
    if (!eventData || !eventData.name) {
      throw new Error("Invalid event data structure");
    }

    // Use apiClient instead of api
    return await apiClient.post("/events", eventData);
  },
  // Tickets creation method
  createTickets: async (eventId, ticketDetails, eventType) => {
    try {
      // Prepare tickets based on the tier type
      let tickets = [];

      if (eventType === "free") {
        // Free event - single free ticket tier
        tickets.push({
          seat_type: "Free Seating",
          ticket_type: "General Admission",
          price: 0, // Always 0 for free events
          total_quantity: ticketDetails.freeSeating.numberOfTickets,
          max_per_user: ticketDetails.freeSeating.maxPerPerson || 1,
        });
      } else if (ticketDetails.tierType === "freeSeating") {
        // Free seating
        tickets.push({
          seat_type: "Free Seating",
          ticket_type: "General Admission",
          price: ticketDetails.freeSeating.price || 0,
          total_quantity: ticketDetails.freeSeating.numberOfTickets,
          max_per_user: ticketDetails.freeSeating.maxPerPerson || 1,
        });
      } else {
        // Ticketed with multiple tiers
        Object.entries(ticketDetails.ticketTiers)
          .filter(([_, tierData]) => tierData.checked)
          .forEach(([tierName, tierData]) => {
            tickets.push({
              seat_type: tierName,
              ticket_type: "Reserved Seating",
              price: tierData.price || 0,
              total_quantity: tierData.number || 0,
              max_per_user: tierData.maxPerPerson || 1,
            });
          });
      }

      // Use our consistent method for bulk ticket creation
      const response = await eventService.tickets.createBulk(eventId, tickets);
      return response;
    } catch (error) {
      console.error("Error creating tickets:", error);
      throw error;
    }
  },
  updateEventAvailability: async (eventId, availabilityData) => {
    try {
      console.log("Updating event availability with data:", availabilityData);

      // Extract display and reservation periods
      const {
        displayPeriod,
        reservationPeriod,
        displayDatesChanged,
        reservationStartNow,
      } = availabilityData;

      // Prepare data for API
      const updatePayload = {
        display_start_date: displayPeriod.startDate,
        display_end_date: displayPeriod.endDate,
        display_start_time: displayPeriod.startTime,
        display_end_time: displayPeriod.endTime,
      };

      // Only include reservation period for ticketed events
      if (availabilityData.eventType === "ticketed") {
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
      }

      if (reservationStartNow) {
        // If reservation start is now or in the past, update status to open
        updatePayload.status = "open";
        console.log("Reservation start is now or past, setting status to open");
      }

      // Call the API to update the event
      const response = await apiClient.put(`/events/${eventId}`, updatePayload);

      // If we changed the visibility to unpublished, we need to publish it again after a short delay
      if (displayDatesChanged) {
        console.log(
          "Scheduling re-publish of event after display date changes"
        );

        // Wait a short time then re-publish the event
        setTimeout(async () => {
          try {
            await apiClient.put(`/events/${eventId}/status`, {
              visibility: "published",
            });
            console.log(
              "Event successfully re-published after display date changes"
            );
          } catch (err) {
            console.error("Failed to re-publish event:", err);
          }
        }, 2000); // Wait 2 seconds before re-publishing
      }

      return response.data;
    } catch (error) {
      console.error("Error updating event availability:", error);
      throw error;
    }
  },

  // Claiming slots creation method
  createClaimingSlots: async (eventId, claimingDetails) => {
    try {
      // Format claiming slots for the API
      const claimingSlots = claimingDetails.claimingSummaries.map(
        (summary) => ({
          claiming_date: summary.date,
          start_time: summary.startTime,
          end_time: summary.endTime,
          venue: summary.venue,
          max_claimers: summary.maxReservations || 0,
        })
      );

      // Send request to create claiming slots in bulk
      const response = await apiClient.post(
        `/events/${eventId}/claiming-slots/bulk`,
        claimingSlots
      );
      return response.data;
    } catch (error) {
      console.error("Error creating claiming slots:", error);
      throw error;
    }
  },

  // Save draft event method
  saveDraftEvent: async (draftData) => {
    try {
      // Prepare draft event data
      const eventPayload = {
        name: draftData.eventDetails?.eventName || "Draft Event",
        details: draftData.eventDetails?.eventDescription || "",
        event_date: draftData.eventDetails?.eventDate,
        event_time: draftData.eventDetails?.startTime,
        venue: draftData.eventDetails?.venue,
        category: draftData.eventDetails?.eventCategory,
        event_type: draftData.eventDetails?.eventType || "ticketed",
        image: draftData.eventDetails?.imageUrl, // Use the raw path from backend
        status: "draft",
        visibility: "unpublished",
      };

      console.log("Draft event payload:", eventPayload);

      // Create the draft event
      const response = await apiClient.post("/events/draft", eventPayload);
      return response.data;
    } catch (error) {
      console.error("Error saving draft event:", error);
      throw error;
    }
  },
  // Get all events with optional filters
  getAllEvents: async (filters = {}) => {
    try {
      const response = await apiClient.get("/events", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },
};
const eventServiceExtensions = {
  // Check if changing a date would modify event status
  checkStatusChanges: (
    originalEvent,
    newDisplayStart,
    newDisplayEnd,
    newReservationStart,
    newReservationEnd
  ) => {
    if (!originalEvent)
      return { displayChanged: false, reservationChanged: false };

    const displayChanged =
      originalEvent.display_start_date !== newDisplayStart ||
      originalEvent.display_end_date !== newDisplayEnd;

    // For ticketed events, also check reservation dates
    let reservationChanged = false;
    if (
      originalEvent.eventType === "ticketed" ||
      originalEvent.event_type === "ticketed"
    ) {
      reservationChanged =
        originalEvent.reservation_start_date !== newReservationStart ||
        originalEvent.reservation_end_date !== newReservationEnd;
    }

    // Check if reservation would start immediately
    let reservationStartNow = false;
    if (originalEvent.status === "scheduled" && newReservationStart) {
      const now = new Date();
      const reservationStart = new Date(
        `${newReservationStart}T${
          originalEvent.reservation_start_time || "00:00:00"
        }`
      );
      reservationStartNow = reservationStart <= now;
    }

    return {
      displayChanged,
      reservationChanged,
      reservationStartNow,
    };
  },

  // Handle event unpublish when display dates are changed
  handleTemporaryUnpublish: async (eventId) => {
    try {
      // First set to unpublished
      await apiClient.put(`/events/${eventId}/status`, {
        visibility: "unpublished",
      });

      // Wait a short time to ensure backend processing is complete
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Then republish
      const response = await apiClient.put(`/events/${eventId}/status`, {
        visibility: "published",
      });

      console.log("Event republished after display date changes");
      return response.data;
    } catch (error) {
      console.error("Failed to republish event:", error);
      throw error;
    }
  },

  // Refresh events after a status change
  updateEventWithRefresh: async (eventId, updateData) => {
    try {
      // Update the event
      const response = await apiClient.put(`/events/${eventId}`, updateData);

      // Refresh event status
      await apiClient.post(`/events/${eventId}/refresh-status`);

      return response.data;
    } catch (error) {
      console.error("Error updating event with refresh:", error);
      throw error;
    }
  },
};

// Merge the extensions into eventService object
Object.assign(eventService, eventServiceExtensions);

export default eventService;
