import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const eventService = {
  // ======== DRAFT EVENT OPERATIONS ========

  // Create a new draft event
  createDraftEvent: async (eventData) => {
    const draftData = {
      ...eventData,
      visibility: "unpublished",
      status: "draft",
    };
    const response = await api.post("/events/draft", draftData);
    return response.data;
  },

  // Get all draft events
  getDraftEvents: async () => {
    const response = await api.get("/events/draft");
    return response.data;
  },

  // Update a draft event
  updateDraftEvent: async (eventId, eventData) => {
    const response = await api.put(`/events/${eventId}/draft`, eventData);
    return response.data;
  },

  // Publish a draft event as upcoming with incomplete details
  publishAsUpcoming: async (eventId, eventData) => {
    const publishData = {
      ...eventData,
      visibility: "published",
      status: "closed",
    };
    const response = await api.patch(`/events/${eventId}/publish`, publishData);
    return response.data;
  },

  // Publish a draft event with full details
  publishWithSchedule: async (eventId, eventData) => {
    const publishData = {
      ...eventData,
      visibility: "published",
      status: "scheduled",
    };
    const response = await api.patch(`/events/${eventId}/publish`, publishData);
    return response.data;
  },

  // ======== EVENT OPERATIONS ========

  // Get all events with optional filters
  getAllEvents: async (filters = {}) => {
    const response = await api.get("/events", { params: filters });
    return response.data;
  },

  // Get upcoming events
  getUpcomingEvents: async () => {
    const response = await api.get("/events/upcoming");
    return response.data;
  },

  // Get archived events
  getArchivedEvents: async () => {
    const response = await api.get("/events/archived");
    return response.data;
  },

  // Get a single event by ID
  getEventById: async (eventId) => {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  },

  // Create a new event (used for direct publishing)
  createEvent: async (eventData) => {
    // Determine the visibility and status based on event type
    let visibility = "published";
    let status;

    if (eventData.event_type === "coming_soon") {
      status = "closed"; // Upcoming events are initially closed
    } else if (eventData.event_type === "free") {
      status = "closed"; // Free events are always closed for reservations
    } else {
      // For ticketed events, check if reservation period is in future
      const reservationStartDate = eventData.reservation_start;
      if (reservationStartDate && new Date(reservationStartDate) > new Date()) {
        status = "scheduled";
      } else {
        status = "open";
      }
    }

    const data = {
      ...eventData,
      visibility,
      status,
    };

    const response = await api.post("/events", data);
    return response.data;
  },

  // Update an event
  updateEvent: async (eventId, eventData) => {
    const response = await api.put(`/events/${eventId}`, eventData);
    return response.data;
  },

  // Change event status
  changeEventStatus: async (eventId, status) => {
    const response = await api.patch(`/events/${eventId}/status`, { status });
    return response.data;
  },

  // Change event visibility
  changeEventVisibility: async (eventId, visibility) => {
    const response = await api.patch(`/events/${eventId}/visibility`, {
      visibility,
    });
    return response.data;
  },

  // Cancel an event (ONLY for Published events)
  cancelEvent: async (eventId) => {
    const response = await api.patch(`/events/${eventId}/cancel`, {
      status: "cancelled",
      visibility: "published", // Cancelled events remain published but with cancelled status
    });
    return response.data;
  },

  // Delete an event (for Unpublished events - moves to Archive)
  deleteEvent: async (eventId) => {
    const response = await api.patch(`/events/${eventId}/delete`, {
      visibility: "archived",
      status: "closed",
    });
    return response.data;
  },

  // Archive an event (after display period is over or other conditions)
  archiveEvent: async (eventId) => {
    const response = await api.patch(`/events/${eventId}/archive`, {
      visibility: "archived",
      status: "closed",
    });
    return response.data;
  },

  // Restore an event from archive
  restoreFromArchive: async (eventId) => {
    const response = await api.patch(`/events/${eventId}/restore`);
    return response.data;
  },

  // Permanent delete from archive
  permanentDeleteFromArchive: async (eventId) => {
    const response = await api.delete(`/events/${eventId}/permanent-delete`);
    return response.data;
  },

  // Update event when reservation becomes full
  markReservationFull: async (eventId) => {
    const response = await api.patch(`/events/${eventId}/reservation-full`, {
      status: "closed",
      visibility: "published", // Still visible but closed for reservations
    });
    return response.data;
  },

  // Update event after display period ends with incomplete reservations
  markDisplayPeriodEnded: async (eventId) => {
    const response = await api.patch(`/events/${eventId}/display-ended`, {
      status: "closed",
      visibility: "unpublished", // No longer visible to users
    });
    return response.data;
  },

  // ======== SCHEDULED TASKS ========

  // Open reservations when reservation period starts
  openReservations: async (eventId) => {
    const response = await api.patch(`/events/${eventId}/open-reservations`, {
      status: "open",
    });
    return response.data;
  },

  // Close reservations when reservation period ends
  closeReservations: async (eventId) => {
    const response = await api.patch(`/events/${eventId}/close-reservations`, {
      status: "closed",
    });
    return response.data;
  },

  // ======== IMAGE UPLOAD OPERATIONS ========

  // Upload event image
  // Option 1: Separate image upload function that doesn't require an event ID
  // Upload event image
  uploadEventImage: async (imageFile) => {
    try {
      // Validate the image file
      if (!imageFile) {
        throw new Error("No image file provided");
      }

      // More lenient file type checking
      const isValidImageType = imageFile.type.startsWith("image/");
      if (!isValidImageType) {
        throw new Error("Invalid image type. Please use JPG, PNG or GIF");
      }

      const formData = new FormData();
      formData.append("image", imageFile);

      // Use the general image upload endpoint
      const response = await axios.post(`${API_URL}/uploads/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },
  // ======== TICKET OPERATIONS ========

  // Get all tickets for an event
  getEventTickets: async (eventId) => {
    const response = await api.get(`/events/${eventId}/tickets`);
    return response.data;
  },

  // Create a ticket type for an event
  createTicket: async (eventId, ticketData) => {
    const response = await api.post(`/events/${eventId}/tickets`, ticketData);
    return response.data;
  },

  // Create multiple ticket types at once
  createTicketsBulk: async (eventId, tickets) => {
    const response = await api.post(`/events/${eventId}/tickets/bulk`, {
      tickets,
    });
    return response.data;
  },

  // Update a ticket type
  updateTicket: async (ticketId, ticketData) => {
    const response = await api.put(`/tickets/${ticketId}`, ticketData);
    return response.data;
  },

  // Delete a ticket type
  deleteTicket: async (ticketId) => {
    const response = await api.delete(`/tickets/${ticketId}`);
    return response.data;
  },

  // Get ticket availability
  getTicketAvailability: async (eventId) => {
    const response = await api.get(`/events/${eventId}/ticket-availability`);
    return response.data;
  },

  // ======== CLAIMING SLOT OPERATIONS ========

  // Get all claiming slots for an event
  getEventClaimingSlots: async (eventId) => {
    const response = await api.get(`/events/${eventId}/claiming-slots`);
    return response.data;
  },

  // Create a claiming slot for an event
  createClaimingSlot: async (eventId, slotData) => {
    const response = await api.post(
      `/events/${eventId}/claiming-slots`,
      slotData
    );
    return response.data;
  },

  // Create multiple claiming slots at once
  createClaimingSlotsBulk: async (eventId, claimingSlots) => {
    const response = await api.post(`/events/${eventId}/claiming-slots/bulk`, {
      claimingSlots,
    });
    return response.data;
  },

  // Update a claiming slot
  updateClaimingSlot: async (slotId, slotData) => {
    const response = await api.put(`/claiming-slots/${slotId}`, slotData);
    return response.data;
  },

  // Delete a claiming slot
  deleteClaimingSlot: async (slotId) => {
    const response = await api.delete(`/claiming-slots/${slotId}`);
    return response.data;
  },

  // Get claiming slot availability
  getClaimingSlotAvailability: async (eventId) => {
    const response = await api.get(
      `/events/${eventId}/claiming-slot-availability`
    );
    return response.data;
  },

  // Get reservations for a claiming slot
  getClaimingSlotReservations: async (slotId) => {
    const response = await api.get(`/claiming-slots/${slotId}/reservations`);
    return response.data;
  },
};

export default eventService;
