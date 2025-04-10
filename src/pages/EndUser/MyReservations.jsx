import React, { useState, useEffect } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { VscAccount } from "react-icons/vsc";
import Header_User from "../../components/Header_User";
import axios from "axios";

// Reservation item component
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
    <div className="flex items-center gap-2 font-Poppins m-2 justify-between">
      <div className="bg-gray-100 text-gray-700 text-left p-2 rounded-lg shadow-md w-1/2">
        <div className="font-semibold">
          {reservation.Event?.name || "Unknown Event"}
        </div>
        <div className="text-xs mt-1">
          {formatDate(reservation.Event?.event_date)} |{" "}
          {reservation.Ticket?.ticket_type || "Standard Ticket"}
        </div>
      </div>
      <div
        className={`text-center p-1.5 rounded-lg shadow-md w-1/6 ${getStatusClass(
          reservation.reservation_status
        )}`}
      >
        {reservation.reservation_status.toUpperCase()}
      </div>
      <button
        className="bg-[#FFAB40] hover:bg-[#E99A3A] rounded-lg text-center font-semibold p-1.5 shadow-md text-sm w-1/6"
        onClick={() => onViewReceipt(reservation)}
      >
        View Receipt
      </button>
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
        const response = await axios.get("http://localhost:5002/api/users/me", {
          withCredentials: true,
        });

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
          `http://localhost:5002/api/reservations/user/${userId}`,
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
          "http://localhost:5002/api/users/me",
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
            ticketType: reservation.Ticket?.ticket_type || "Standard Ticket",
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

          // Store in localStorage as backup
          localStorage.setItem("reservationData", JSON.stringify(receiptData));

          // Navigate to receipt page with the data
          navigate("/reservation-receipt", { state: receiptData });
        } else {
          // Fallback with limited information if user data can't be fetched
          const receiptData = {
            ticketType: reservation.Ticket?.ticket_type || "Standard Ticket",
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

          localStorage.setItem("reservationData", JSON.stringify(receiptData));
          navigate("/reservation-receipt", { state: receiptData });
        }
      } catch (error) {
        console.error("Error fetching user data for receipt:", error);

        // Navigate with minimal data as a fallback
        const minimalData = {
          ticketType: reservation.Ticket?.ticket_type || "Standard Ticket",
          ticketPrice: reservation.Ticket?.price || 0,
          ticketCount: 1,
          eventName: reservation.Event?.name || "Event",
          eventDate: formatDate(reservation.Event?.event_date),
          eventTime: formatTime(reservation.Event?.event_time),
          reservationId: reservation.reservation_id,
          emails: [],
        };

        localStorage.setItem("reservationData", JSON.stringify(minimalData));
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

      {/* Back button */}
      <button
        onClick={() => navigate("/home")}
        className="absolute top-[100px] left-4 text-white font-Poppins font-bold"
      >
        <IoChevronBackOutline className="text-3xl" />
      </button>

      {/* Main content area with spacing from header */}
      <div className="container mx-auto px-2 pt-20 pb-16">
        {/* Profile container with avatar */}
        <div className="relative flex flex-col items-center mt-10">
          {/* Avatar circle - positioned relative to this container */}
          <div className="absolute -top-16 w-32 h-32 md:w-40 md:h-40 lg:w-60 lg:h-60 border-4 border-[#FFAB40] bg-white rounded-full flex items-center justify-center shadow-lg z-10">
            <VscAccount className="text-[#FFAB40]" size="70%" />
          </div>

          {/* Profile card with padding for avatar */}
          <div className="w-full md:w-4/5 lg:w-2/3 mt-24 md:mt-28 lg:mt-32 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="pt-6 md:pt-8 lg:pt-12 flex flex-col md:flex-row">
              {/* Left sidebar */}
              <div className="w-full md:w-[30%] px-3 py-4">
                <div className="flex flex-col gap-4">
                  <button
                    className="font-Poppins w-full py-2 px-3 justify-center cursor-pointer hover:bg-[#FFAB40] transition duration-300 flex rounded-full bg-[#F1F1F1] shadow-md"
                    onClick={() => navigate("/my-profile")}
                  >
                    Account Details
                  </button>
                  <button className="font-Poppins w-full py-2 px-3 justify-center cursor-pointer transition duration-300 flex rounded-full bg-[#FFAB40] shadow-md">
                    My Reservations
                  </button>
                </div>
              </div>

              {/* Right content area */}
              <div className="w-full md:w-[70%] px-3 py-4">
                <div className="h-full flex flex-col justify-between">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="text-gray-700">
                        Loading your reservations...
                      </div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                      {error}
                    </div>
                  ) : reservations.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="text-gray-700">
                        You have no reservations yet.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
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
