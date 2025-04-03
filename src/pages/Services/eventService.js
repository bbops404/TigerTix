// services/eventService.js
import axios from "axios";
import FormData from "form-data";
// Note: fs is a Node.js module and won't work in the browser
// If you're using this in a browser environment, you'll need a different approach for file handling

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export const eventService = {
  // Get all events
  getAllEvents: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/events`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get event by ID
  getEventById: async (eventId) => {
    try {
      const response = await axios.get(`${API_URL}/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new event
  createEvent: async (eventData) => {
    try {
      const response = await axios.post(`${API_URL}/events`, eventData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create draft event
  // In eventService.js
  // Create draft event
  createDraftEvent: async (draftData) => {
    try {
      // This is now a client-side function that makes an API call
      const response = await axios.post(`${API_URL}/events/draft`, draftData);
      return response.data;
    } catch (error) {
      console.error("Draft creation error:", error);
      throw error;
    }
  },
  // Update event
  updateEvent: async (eventId, updateData) => {
    try {
      const response = await axios.put(
        `${API_URL}/events/${eventId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel event
  cancelEvent: async (eventId) => {
    try {
      const response = await axios.post(`${API_URL}/events/cancel/${eventId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Archive event
  archiveEvent: async (eventId) => {
    try {
      const response = await axios.post(`${API_URL}/events/archive/${eventId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Permanently delete event
  deleteEvent: async (eventId) => {
    try {
      const response = await axios.delete(`${API_URL}/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload event image
  // browserEventService.js (for client-side)
  uploadEventImage: async (file) => {
    try {
      const formData = new FormData();
      // Only accept File objects
      formData.append("image", file);

      const response = await axios.post(
        `${API_URL}/events/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get tickets for an event
  getEventTickets: async (eventId) => {
    try {
      const response = await axios.get(`${API_URL}/events/${eventId}/tickets`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a ticket tier
  createTicket: async (eventId, ticketData) => {
    try {
      const response = await axios.post(
        `${API_URL}/events/${eventId}/tickets`,
        ticketData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create multiple ticket tiers
  createTicketsBulk: async (eventId, ticketsData) => {
    try {
      const response = await axios.post(
        `${API_URL}/events/${eventId}/tickets/bulk`,
        ticketsData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a ticket tier
  updateTicket: async (ticketId, updateData) => {
    try {
      const response = await axios.put(
        `${API_URL}/tickets/${ticketId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a ticket tier
  deleteTicket: async (ticketId) => {
    try {
      const response = await axios.delete(`${API_URL}/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get claiming slots for an event
  getEventClaimingSlots: async (eventId) => {
    try {
      const response = await axios.get(
        `${API_URL}/events/${eventId}/claiming-slots`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a claiming slot
  createClaimingSlot: async (eventId, slotData) => {
    try {
      const response = await axios.post(
        `${API_URL}/events/${eventId}/claiming-slots`,
        slotData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create multiple claiming slots
  createClaimingSlotsBulk: async (eventId, slotsData) => {
    try {
      const response = await axios.post(
        `${API_URL}/events/${eventId}/claiming-slots/bulk`,
        slotsData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a claiming slot
  updateClaimingSlot: async (slotId, updateData) => {
    try {
      const response = await axios.put(
        `${API_URL}/claiming-slots/${slotId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a claiming slot
  deleteClaimingSlot: async (slotId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/claiming-slots/${slotId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// For default import compatibility
export default eventService;
