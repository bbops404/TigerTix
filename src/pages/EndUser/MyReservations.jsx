import React, { useState, useEffect } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { VscAccount } from "react-icons/vsc";
import Header_User from "../../components/Header_User";
import axios from "axios";

// Reservation item component with improved responsiveness
const ReservationItem = ({ reservation, onViewReceipt }) => {
  // Helper function to determine status class
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "claimed":
        return "bg-green-100 text-green-800";
      case "unclaimed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-900";
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 font-Poppins p-3 sm:p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Event details - Full width on mobile, flexible on larger screens */}
      <div className="bg-gray-100 text-gray-700 text-left p-3 sm:p-2 rounded-lg shadow-md flex-1 sm:min-w-0">
        <div className="font-semibold text-sm sm:text-base truncate">
          {reservation.Event?.name || "Unknown Event"}
        </div>
        <div className="text-xs sm:text-xs mt-1 text-gray-600">
          {formatDate(reservation.Event?.event_date)} |{" "}
          {reservation.Ticket?.seat_type || "Standard Seat"}
        </div>
      </div>
      
      {/* Status and button container - Stack on mobile */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 flex-shrink-0">
        {/* Status badge */}
        <div
          className={`text-center py-2 sm:py-1.5 px-3 sm:px-2 rounded-lg shadow-md text-xs sm:text-sm font-medium ${getStatusClass(
            reservation.reservation_status
          )} sm:w-24 lg:w-28 flex-shrink-0`}
        >
          {reservation.reservation_status.toUpperCase()}
        </div>
        
        {/* View receipt button */}
        <button
          className="bg-[#FFAB40] hover:bg-[#E99A3A] rounded-lg text-center font-semibold py-2 sm:py-1.5 px-3 sm:px-2 shadow-md text-xs sm:text-sm transition-colors duration-200 sm:w-24 lg:w-28 flex-shrink-0"
          onClick={() => onViewReceipt(reservation)}
        >
          View Receipt
        </button>
      </div>
    </div>
  );
};

const MyReservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Fetch the current user's details first
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/me`,
          {
            withCredentials: true,
          }
        );

        if (response.data.success && response.data.data) {
          setUserId(response.data.data.user_id);
        } else {
          setError("Could not retrieve user information");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to authenticate. Please log in again.");
      }
    };

    fetchUserData();
  }, []);

  // Fetch reservations once we have the user ID
  useEffect(() => {
    const fetchReservations = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/reservations/user/${userId}`,
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setReservations(response.data.data);
        } else {
          setError("Could not retrieve your reservations");
        }
      } catch (err) {
        console.error("Error fetching reservations:", err);
        setError("Failed to load reservations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [userId]);

  // Handle viewing receipt
  const handleViewReceipt = (reservation) => {
    // Format date for display
    const formatDate = (dateString) => {
      if (!dateString) return "TBA";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch (e) {
        return dateString;
      }
    };

    // Format time to show AM/PM
    const formatTime = (timeString) => {
      if (!timeString) return "TBA";
      try {
        if (
          timeString.toLowerCase().includes("am") ||
          timeString.toLowerCase().includes("pm")
        ) {
          return timeString;
        }

        if (timeString.includes(":")) {
          const [hours, minutes] = timeString
            .split(":")
            .map((num) => parseInt(num, 10));
          const period = hours >= 12 ? "PM" : "AM";
          const formattedHours = hours % 12 || 12;
          return `${formattedHours}:${minutes
            .toString()
            .padStart(2, "0")} ${period}`;
        }

        return timeString;
      } catch (e) {
        return timeString;
      }
    };

    // Get user information
    const fetchUserInfo = async () => {
      try {
        const userResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/me`,
          {
            withCredentials: true,
          }
        );

        if (userResponse.data.success && userResponse.data.data) {
          const userData = userResponse.data.data;

          // Prepare comprehensive data for receipt
          const receiptData = {
            // User Information
            firstName: userData.first_name || "",
            lastName: userData.last_name || "",
            userEmail: userData.email || "",

            // Ticket Information
            ticketType: reservation.Ticket?.seat_type || "Standard Seat",
            ticketCount: 1, // Single reservation
            ticketPrice: reservation.Ticket?.price || 0,

            // Event Information
            eventName: reservation.Event?.name || "Event",
            eventDate: formatDate(reservation.Event?.event_date),
            eventTime: formatTime(reservation.Event?.event_time),
            eventVenue: reservation.Event?.venue || "UST Venue",

            // Claiming Information
            timeSlot: reservation.ClaimingSlot
              ? `${formatDate(
                  reservation.ClaimingSlot.claiming_date
                )}, ${formatTime(
                  reservation.ClaimingSlot.start_time
                )} - ${formatTime(reservation.ClaimingSlot.end_time)}`
              : "N/A",
            claimingVenue: reservation.ClaimingSlot?.venue || "UST IPEA",

            // Reservation Details
            reservationId: reservation.reservation_id,
            reservationStatus: reservation.reservation_status,

            // Email list (just the user's email for individual reservation)
            emails: [userData.email],
          };

          // Navigate to receipt page with the data (removed localStorage usage)
          navigate("/reservation-receipt", { state: receiptData });
        } else {
          // Fallback with limited information if user data can't be fetched
          const receiptData = {
            ticketType: reservation.Ticket?.seat_type || "Standard Seat",
            ticketPrice: reservation.Ticket?.price || 0,
            ticketCount: 1,
            eventName: reservation.Event?.name || "Event",
            eventDate: formatDate(reservation.Event?.event_date),
            eventTime: formatTime(reservation.Event?.event_time),
            eventVenue: reservation.Event?.venue || "UST Venue",
            timeSlot: reservation.ClaimingSlot
              ? `${formatDate(
                  reservation.ClaimingSlot.claiming_date
                )}, ${formatTime(
                  reservation.ClaimingSlot.start_time
                )} - ${formatTime(reservation.ClaimingSlot.end_time)}`
              : "N/A",
            reservationId: reservation.reservation_id,
            claimingVenue: reservation.ClaimingSlot?.venue || "UST IPEA",
            emails: [],
          };

          navigate("/reservation-receipt", { state: receiptData });
        }
      } catch (error) {
        console.error("Error fetching user data for receipt:", error);

        // Navigate with minimal data as a fallback
        const minimalData = {
          ticketType: reservation.Ticket?.seat_type || "Standard Seat",
          ticketPrice: reservation.Ticket?.price || 0,
          ticketCount: 1,
          eventName: reservation.Event?.name || "Event",
          eventDate: formatDate(reservation.Event?.event_date),
          eventTime: formatTime(reservation.Event?.event_time),
          reservationId: reservation.reservation_id,
          emails: [],
        };

        navigate("/reservation-receipt", { state: minimalData });
      }
    };

    // Execute the data fetch and navigation
    fetchUserInfo();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#202020]">
      {/* Header */}
      <Header_User />

      {/* Back button - Improved positioning for mobile */}
      <button
        onClick={() => navigate("/home")}
        className="absolute top-[80px] sm:top-[100px] left-4 text-white font-Poppins font-bold z-20"
      >
        <IoChevronBackOutline className="text-2xl sm:text-3xl" />
      </button>

      {/* Main content area - Better padding and spacing */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 pt-16 sm:pt-20 pb-8 sm:pb-16">
        {/* Profile container with avatar - Improved responsive layout */}
        <div className="relative flex flex-col items-center mt-6 sm:mt-10">
          {/* Avatar circle - Better responsive sizing */}
          <div className="absolute -top-12 sm:-top-16 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 border-4 border-[#FFAB40] bg-white rounded-full flex items-center justify-center shadow-lg z-10">
            <VscAccount 
              className="text-[#FFAB40] w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24" 
            />
          </div>

          {/* Profile card - Improved responsive design */}
          <div className="w-full max-w-6xl mt-16 sm:mt-20 md:mt-24 lg:mt-32 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="pt-8 sm:pt-12 flex flex-col lg:flex-row">
              {/* Left sidebar - Stack on mobile, side-by-side on large screens */}
              <div className="w-full lg:w-[30%] px-4 sm:px-6 py-4 sm:py-6 border-b lg:border-b-0 lg:border-r border-gray-200">
                <div className="flex flex-row lg:flex-col gap-2 sm:gap-4 lg:gap-6">
                  <button
                    className="font-Poppins flex-1 lg:w-full py-2 sm:py-3 px-3 sm:px-4 lg:px-5 justify-center cursor-pointer hover:bg-[#FFAB40] transition duration-300 flex rounded-full bg-[#F1F1F1] shadow-md text-sm sm:text-base font-medium"
                    onClick={() => navigate("/my-profile")}
                  >
                    Account Details
                  </button>
                  <button className="font-Poppins flex-1 lg:w-full py-2 sm:py-3 px-3 sm:px-4 lg:px-5 justify-center cursor-pointer transition duration-300 flex rounded-full bg-[#FFAB40] shadow-md text-sm sm:text-base font-medium">
                    My Reservations
                  </button>
                </div>
              </div>

              {/* Right content area - Better spacing and layout */}
              <div className="w-full lg:w-[70%] px-4 sm:px-6 py-4 sm:py-6">
                <div className="h-full flex flex-col">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="text-gray-700 text-center">
                        Loading your reservations...
                      </div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
                      {error}
                    </div>
                  ) : reservations.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="text-gray-700 text-center">
                        You have no reservations yet.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                      {reservations.map((reservation) => (
                        <ReservationItem
                          key={reservation.reservation_id}
                          reservation={reservation}
                          onViewReceipt={handleViewReceipt}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyReservations;