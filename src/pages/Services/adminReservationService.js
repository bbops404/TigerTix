// services/adminReservationService.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

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
  // Get all reservations (with pagina
  // tion and filtering)
  getAllReservations: async () => {
    try {
      const response = await apiClient.get("/reservations");
      return response.data;
    } catch (error) {
      console.error("Error fetching reservations:", error);
      throw error;
    }
  },

  // New method to get reservation image
  getReservationImage: async (reservationId) => {
    try {
      // Assuming the backend has an endpoint to fetch reservation image
      const response = await apiClient.get(
        `/reservations/${reservationId}/image`,
        {
          responseType: "blob", // Important for handling image data
        }
      );

      // If no image found, return null or a default placeholder
      if (response.data.size === 0) {
        return null;
      }

      // Create a URL for the image blob
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error(
        `Error fetching reservation image for ID ${reservationId}:`,
        error
      );

      // Return null or a default image path if fetch fails
      return null;
    }
  },

  // Method to get multiple reservation images
  getReservationImages: async (reservationIds) => {
    try {
      // Fetch images for multiple reservations concurrently
      const imagePromises = reservationIds.map(async (reservationId) => {
        try {
          const imageUrl = await adminReservationService.getReservationImage(
            reservationId
          );
          return {
            reservationId,
            imageUrl,
          };
        } catch (error) {
          console.error(
            `Error fetching image for reservation ${reservationId}:`,
            error
          );
          return {
            reservationId,
            imageUrl: null,
          };
        }
      });

      // Wait for all image fetches to complete
      return await Promise.all(imagePromises);
    } catch (error) {
      console.error("Error fetching multiple reservation images:", error);
      return [];
    }
  },

  // Clean up image URLs to prevent memory leaks
  cleanupReservationImageUrl: (imageUrl) => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
  },

  getReservationsByEventName: async (eventName) => {
    try {
      const response = await apiClient.get("/reservations");

      if (
        !response.data ||
        !response.data.data ||
        !Array.isArray(response.data.data)
      ) {
        return [];
      }

      const allReservations = response.data.data;
      console.log(
        `Searching ${allReservations.length} reservations for event name: "${eventName}"`
      );

      // Filter by event name
      const matchingReservations = allReservations.filter(
        (res) =>
          res.event_name &&
          res.event_name.toLowerCase().includes(eventName.toLowerCase())
      );

      console.log(
        `Found ${matchingReservations.length} matching reservations for "${eventName}"`
      );

      // Try to get user data for these reservations if they have user_id
      const reservationsWithEnhancedData = await Promise.all(
        matchingReservations.map(async (reservation) => {
          // If there's a user_id field, try to get detailed user info (for email)
          if (reservation.user_id) {
            try {
              // This endpoint is based on userController.getCurrentUser and validates auth
              const userResponse = await apiClient.get(`/users/me`);
              if (
                userResponse.data &&
                userResponse.data.success &&
                userResponse.data.data
              ) {
                // Add user info to reservation
                reservation.email = userResponse.data.data.email;
              }
            } catch (userError) {
              console.log(
                `Could not fetch user details for reservation ${reservation.reservation_id}`
              );
              // Don't throw, just continue without user details
            }
          }
          return reservation;
        })
      );

      return reservationsWithEnhancedData;
    } catch (error) {
      console.error("Error fetching reservations by name:", error);
      return [];
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
