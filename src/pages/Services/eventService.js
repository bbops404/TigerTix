// frontend/src/services/eventService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

const formatImageUrl = (imageUrl) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

  if (!imageUrl) return imageUrl;

  // If the URL is already absolute (with http), return it as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    // But fix the path if it incorrectly includes /api/uploads
    if (imageUrl.includes("/api/uploads/")) {
      const fixedPath = imageUrl.replace("/api/uploads/", "/uploads/");
      return fixedPath;
    }
    return imageUrl;
  }

  // If the URL is relative and starts with /api/uploads/, remove the /api part
  if (imageUrl.startsWith("/api/uploads/")) {
    imageUrl = imageUrl.replace("/api/uploads/", "/uploads/");
  }

  // If the URL is a relative path starting with /uploads
  if (imageUrl.startsWith("/uploads/")) {
    const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
    return `${baseUrl}${imageUrl}`;
  }

  return imageUrl;
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
  uploadEventImage: async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      // Use the post method with multipart/form-data
      const response = await apiClient.post("/events/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Debug the response
      console.log("Upload image API response:", response.data);

      if (response.data && response.data.success && response.data.imageUrl) {
        // The response from backend returns the raw path - don't modify it
        // Just return the exact path as received
        return {
          success: true,
          imageUrl: response.data.imageUrl,
        };
      } else {
        throw new Error("Image upload failed - No URL returned");
      }
    } catch (error) {
      console.error("Image upload error:", error);
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
    create: (eventId, ticketData) =>
      eventService.post(`/events/${eventId}/tickets`, ticketData),
    createBulk: (eventId, ticketsData) =>
      eventService.post(`/events/${eventId}/tickets/bulk`, ticketsData),
    update: (ticketId, ticketData) =>
      eventService.put(`/tickets/${ticketId}`, ticketData),
    delete: (ticketId) => eventService.delete(`/tickets/${ticketId}`),
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

      // Send request to create tickets in bulk
      const response = await apiClient.post(
        `/events/${eventId}/tickets/bulk`,
        tickets
      );
      return response.data;
    } catch (error) {
      console.error("Error creating tickets:", error);
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

export default eventService;
