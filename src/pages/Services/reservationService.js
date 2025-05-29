// services/reservationService.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// Create axios instance with credentials
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies for authentication
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

// Enhanced error handling helper
const handleApiError = (error, defaultMessage, fallbackData = null) => {
  console.error(`${defaultMessage}:`, error);

  // Return a structured error object that can be handled consistently
  const errorResponse = {
    success: false,
    message: defaultMessage,
    error: error.response?.data?.message || error.message || "Unknown error",
    statusCode: error.response?.status || 500,
    fallbackData,
  };

  // If fallback data is provided, we'll return it with error info
  if (fallbackData !== null) {
    errorResponse.data = fallbackData;
    errorResponse.usedFallback = true;
  }

  return errorResponse;
};

// Event APIs
export const fetchEventById = async (eventId) => {
  try {
    // The apiClient base URL already includes the base path, so we don't need /api prefix here
    const response = await apiClient.get(`/user/events/ticketed/${eventId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching event details:", error);
    throw error;
  }
};

// Claiming Slots APIs
export const fetchAvailableClaimingSlots = async (eventId) => {
  try {
    const response = await apiClient.get(
      `/events/${eventId}/claiming-slots/available`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching available claiming slots:", error);
    // Return empty array to prevent UI from breaking
    return { success: true, data: [] };
  }
};

// User APIs - Fixed endpoint path
export const fetchUserDetails = async () => {
  try {
    const response = await apiClient.get("/users/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    // Return minimal data to prevent UI from breaking
    return {
      success: false,
      message: "Could not fetch user details",
      error: error.message,
    };
  }
};

// Reservation APIs
// Enhanced error handling for createReservation in reservationService.js
export const createReservation = async (reservationData) => {
  try {
    console.log(
      "Sending reservation request with data:",
      JSON.stringify(reservationData, null, 2)
    );

    // Validate the data before sending
    if (
      !reservationData.event_id ||
      !reservationData.ticket_id ||
      !reservationData.claiming_id
    ) {
      return {
        success: false,
        message: "Missing required reservation details",
      };
    }

    if (!reservationData.main_reserver_id) {
      return {
        success: false,
        message: "User ID is required for reservation",
      };
    }

    const response = await apiClient.post("/reservations", reservationData);
    return response.data;
  } catch (error) {
    // Enhanced error logging
    console.error("Error creating reservation:", error);

    // Log the detailed error response if available
    if (error.response) {
      console.error("Server response:", error.response.status);
      console.error("Error details:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server");
    } else {
      console.error("Error setting up request:", error.message);
    }

    // Return more detailed error information
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create reservation",
      statusCode: error.response?.status || 500,
      details: error.response?.data || {},
    };
  }
};

/**
 * Check if the current user already has a reservation for an event
 * @param {string} eventId - The ID of the event to check
 * @returns {Promise<boolean>} - True if the user has a reservation, false otherwise
 */
export const checkUserReservation = async (eventId) => {
  try {
    // First get the current user's details to get their ID
    const userResponse = await apiClient.get("/users/me");

    if (!userResponse.data.success || !userResponse.data.data) {
      console.error("Could not fetch user details");
      return false;
    }

    const userId = userResponse.data.data.user_id;

    // Then get the user's reservations
    const reservationsResponse = await apiClient.get(
      `/users/${userId}/reservations`
    );

    if (!reservationsResponse.data.success) {
      console.error("Could not fetch user reservations");
      return false;
    }

    // Check if any reservation is for the specified event
    const hasReservation = reservationsResponse.data.data.some(
      (reservation) => reservation.event_id === eventId
    );

    return hasReservation;
  } catch (error) {
    console.error("Error checking user reservations:", error);
    return false; // Default to false in case of error
  }
};

export const getUserReservations = async (userId) => {
  try {
    const response = await apiClient.get(`/reservations/user/${userId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error fetching user reservations", {
      data: [],
    });
  }
};

// Validation helper - check if emails exist in the database
export const validateDatabaseEmails = async (emails) => {
  try {
    // Filter out empty emails
    const validEmails = emails.filter((email) => email && email.trim());

    if (validEmails.length === 0) {
      return { valid: true };
    }

    // Call API to check if emails exist in the database
    const response = await apiClient.post("/users/validate-emails", {
      emails: validEmails,
    });

    if (response.data.success) {
      return { valid: true };
    } else {
      return {
        valid: false,
        message:
          response.data.message ||
          "One or more emails are not registered in the system",
        notFoundEmails: response.data.notFoundEmails || [],
      };
    }
  } catch (error) {
    console.error("Error validating emails:", error);

    // Handle specific error responses
    if (error.response && error.response.data) {
      return {
        valid: false,
        message: error.response.data.message || "Email validation failed",
        notFoundEmails: error.response.data.notFoundEmails || [],
      };
    }

    // Generic error
    return {
      valid: false,
      message: "Failed to validate emails. Please try again.",
    };
  }
};

// Get user IDs by email addresses
export const getUserIdsByEmail = async (emails) => {
  try {
    const response = await apiClient.post("/users/get-ids-by-email", {
      emails,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Error getting user IDs by email", {
      success: true,
      userIds: emails.map(() => null), // Return null IDs as fallback
    });
  }
};

export default {
  fetchEventById,
  fetchAvailableClaimingSlots,
  fetchUserDetails,
  createReservation,
  getUserReservations,
  validateDatabaseEmails,
  getUserIdsByEmail,
};
