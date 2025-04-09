// services/adminReservationService.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5002/api";

// Create axios instance with credentials
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const adminReservationService = {
  // Get all reservations (with pagination and filtering)
  getAllReservations: async () => {
    try {
      const response = await apiClient.get("/reservations");
      return response.data;
    } catch (error) {
      console.error("Error fetching reservations:", error);
      throw error;
    }
  },

  // Mark a single reservation as claimed
  markAsClaimed: async (reservationId) => {
    try {
      const response = await apiClient.patch(
        `/reservations/${reservationId}/mark-claimed`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error marking reservation ${reservationId} as claimed:`,
        error
      );
      throw error;
    }
  },

  // Mark multiple reservations as claimed
  markMultipleAsClaimed: async (reservationIds) => {
    try {
      // Use the bulk endpoint for better performance
      const response = await apiClient.post("/reservations/bulk-claim", {
        reservation_ids: reservationIds,
      });

      if (response.data.success) {
        // Format the response to match the expected format
        const results = [];

        // Add successful results
        response.data.successful.forEach((id) => {
          results.push({ id, success: true });
        });

        // Add failed results
        response.data.failed.forEach((item) => {
          results.push({
            id: item.reservation_id,
            success: false,
            error: item.reason,
          });
        });

        return results;
      } else {
        throw new Error(
          response.data.message || "Failed to mark reservations as claimed"
        );
      }
    } catch (error) {
      console.error("Error marking multiple reservations as claimed:", error);
      throw error;
    }
  },

  // Reinstate a single unclaimed reservation
  reinstateReservation: async (reservationId) => {
    try {
      const response = await apiClient.patch(
        `/reservations/${reservationId}/reinstate`
      );
      return response.data;
    } catch (error) {
      console.error(`Error reinstating reservation ${reservationId}:`, error);
      throw error;
    }
  },

  // Reinstate multiple unclaimed reservations
  reinstateMultipleReservations: async (reservationIds) => {
    try {
      // Process each reservation sequentially
      const results = [];

      for (const id of reservationIds) {
        try {
          const response = await apiClient.patch(
            `/reservations/${id}/reinstate`
          );
          results.push({ id, success: true, data: response.data });
        } catch (error) {
          results.push({
            id,
            success: false,
            error: error.response?.data?.message || error.message,
          });
        }
      }

      return results;
    } catch (error) {
      console.error("Error reinstating multiple reservations:", error);
      throw error;
    }
  },

  // Restore unclaimed reservations (refund ticket slots)
  restoreUnclaimedReservations: async (reservationIds) => {
    try {
      const response = await apiClient.patch("/reservations/restore", {
        reservation_ids: reservationIds,
      });
      return response.data;
    } catch (error) {
      console.error("Error restoring unclaimed reservations:", error);
      throw error;
    }
  },

  // Trigger pending to unclaimed update check
  checkAndUpdatePendingReservations: async () => {
    try {
      const response = await apiClient.post("/reservations/update-pending");
      return response.data;
    } catch (error) {
      console.error("Error updating pending reservations:", error);
      throw error;
    }
  },
};

export default adminReservationService;
