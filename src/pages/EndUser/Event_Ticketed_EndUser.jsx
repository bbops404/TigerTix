import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header_User from "../../components/Header_User";
import TigerTicket from "../../assets/TigerTicket.svg";
import { IoChevronBackOutline } from "react-icons/io5";
import { handleApiError } from "../../utils/apiErrorHandler";

const Event_Ticketed_EndUser = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasReservation, setHasReservation] = useState(false);
  const [reservationChecked, setReservationChecked] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventAndCheckReservation = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

        // Fetch event details
        const eventResponse = await fetch(
          `${API_BASE_URL}/api/user/events/ticketed/${id}`,
          {
            credentials: "include",
          }
        );
        const eventData = await eventResponse.json();

        if (eventData.success) {
          setEvent(eventData.data);

          // Get current user details
          const userResponse = await fetch(`${API_BASE_URL}/api/users/me`, {
            credentials: "include",
          });
          const userData = await userResponse.json();

          if (userData.success && userData.data) {
            const userId = userData.data.user_id;
            const status = userData.data.status;
            setUserStatus(status);

            // Get user's reservations
            const reservationsResponse = await fetch(
              `${API_BASE_URL}/api/reservations/user/${userId}`,
              {
                credentials: "include",
              }
            );
            const reservationsData = await reservationsResponse.json();

            if (reservationsData.success) {
              const userReservations = reservationsData.data || [];

              const hasExistingReservation = userReservations.some(
                (reservation) => reservation.event_id === id
              );

              setHasReservation(hasExistingReservation);
            }
          }
        } else {
          setError("Failed to fetch event details.");
        }
      } catch (err) {
        if (!handleApiError(err, navigate)) {
          console.error("Error fetching event:", err);
          setError("Failed to fetch event details. Please try again later.");
        }
      } finally {
        setReservationChecked(true);
        setLoading(false);
      }
    };

    fetchEventAndCheckReservation();
  }, [id, navigate]);

  const handleReserveClick = () => {
    // Check user status before allowing reservation
    if (userStatus === "restricted") {
      alert(
        "Your account is currently restricted. You cannot make reservations."
      );
      return;
    }

    if (userStatus === "suspended") {
      alert("Your account is suspended. You cannot make reservations.");
      return;
    }

    navigate(`/reservation?eventId=${id}`, { state: { eventId: id } });
  };

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

      const hours = parseInt(timeString, 10);
      if (!isNaN(hours)) {
        const period = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:00 ${period}`;
      }

      return timeString;
    } catch (e) {
      console.error("Error formatting time:", e);
      return timeString;
    }
  };

  // Check if the event is open for reservations
  const isReservationOpen = () => {
    if (!event) return false;
    return (
      event.status === "open" &&
      event.event_type === "ticketed" &&
      userStatus === "active"
    );
  };

  // Check if the event has available tickets
  const hasAvailableTickets = () => {
    if (!event || !event.Tickets || event.Tickets.length === 0) return false;
    return event.Tickets.some((ticket) => ticket.remaining_quantity > 0);
  };

  // Get status message for the reserve button
  const getReservationStatus = () => {
    if (!event) return "Loading...";

    if (userStatus === "restricted") return "Restricted";
    if (userStatus === "suspended") return "Suspended";

    if (hasReservation) return "Reserved";
    if (event.status === "closed") return "Reservation Closed";
    if (event.status === "cancelled") return "Event Cancelled";
    if (event.status === "draft") return "Coming Soon";
    if (event.status === "scheduled") return "Not Open Yet";
    if (!hasAvailableTickets()) return "Sold Out";

    return "RESERVE";
  };

  // Render loading state
  if (loading) {
    return (
      <div className="bg-[#121212] text-white min-h-screen">
        <Header_User />
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <div className="text-xl">Loading event details...</div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-[#121212] text-white min-h-screen">
        <Header_User />
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] text-white min-h-screen font-Poppins">
      <Header_User />

      {/* Back Button (Upper Left) */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-[100px] left-4 text-white font-Poppins font-bold"
      >
        <IoChevronBackOutline className="text-3xl" />
      </button>

      <div className="flex justify-center items-center p-5 mt-10">
        <div className="text-white p-6 flex flex-col md:flex-row max-w-7xl w-full rounded-lg">
          {/* Left Image */}
          <div className="min-w-[300px] max-w-[300px] min-h-[450px] max-h-[450px] rounded-lg mx-auto md:ml-[50px] mb-6 md:mb-0 overflow-hidden bg-gray-800">
            {event.image ? (
              <img
                src={
                  event.image.startsWith("http")
                    ? event.image
                    : `${import.meta.env.VITE_API_URL}${
                        event.image.startsWith("/") ? "" : "/"
                      }${event.image}`
                }
                alt={event.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Image failed to load:", e.target.src);
                  e.target.style.display = "none";
                  const container = e.target.parentNode;
                  if (!container.querySelector(".image-fallback")) {
                    const fallback = document.createElement("div");
                    fallback.className =
                      "w-full h-full flex items-center justify-center image-fallback";
                    fallback.innerHTML = `<span class="text-white text-center p-4 font-Poppins">${
                      event.name || "Event image unavailable"
                    }</span>`;
                    container.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-center p-4">
                  {event.name || "No image available"}
                </span>
              </div>
            )}
          </div>
          {/* Right Content */}
          <div className="w-full pl-8">
            <div className="bg-[#F09C32] text-black font-Poppins font-bold px-4 py-2 rounded-lg inline-block mb-4">
              {event.name}
            </div>

            <h2 className="font-bold font-Poppins text-sm mb-2">
              EVENT DETAILS:
            </h2>
            <p className="font-Poppins text-justify text-sm text-gray-300 mb-4">
              {event.details}
            </p>

            <p className="text-sm mb-2 font-Poppins">
              <strong>Location:</strong> {event.venue}
            </p>
            <p className="text-sm mb-2 font-Poppins">
              <strong>Date:</strong> {formatDate(event.event_date)}
            </p>
            <p className="text-sm mb-2 font-Poppins">
              <strong>Time:</strong> {formatTime(event.event_time)}
            </p>
            <p className="text-sm mb-2 font-Poppins">
              <strong>Status:</strong>{" "}
              <span
                className={`${
                  event.status === "open" ? "text-green-500" : "text-yellow-500"
                }`}
              >
                {event.status.toUpperCase()}
              </span>
            </p>
            <hr className="border-t border-gray-400 my-4" />
            <p className="text-base mb-2 font-Poppins">
              <strong>Tickets</strong>
            </p>

            {/* Ticket Prices */}
            <div className="bg-[#694C26] p-4 rounded-lg flex flex-wrap text-sm">
              {event.Tickets && event.Tickets.length > 0 ? (
                event.Tickets.map((ticket, index) => (
                  <div
                    key={index}
                    className="flex-1 flex items-center space-x-2 text-left font-Poppins"
                  >
                    <img
                      src={TigerTicket}
                      alt="Ticket Icon"
                      className="w-6 h-6"
                    />
                    <div>
                      <p className="font-bold">
                        ₱{parseFloat(ticket.price).toLocaleString()}
                      </p>
                      <p>{ticket.seat_type}</p>
                      <p className="text-xs text-gray-400">
                        {ticket.remaining_quantity} of {ticket.total_quantity}{" "}
                        remaining
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">
                  No tickets available for this event.
                </p>
              )}
            </div>

            {/* Reservation Period */}
            {event.reservation_start_date && event.reservation_end_date && (
              <div className="mt-4 p-2 bg-[#2a2a2a] rounded-lg">
                <p className="text-sm font-Poppins">
                  <strong>Reservation Period:</strong>{" "}
                  {formatDate(event.reservation_start_date)} to{" "}
                  {formatDate(event.reservation_end_date)}
                </p>
                {event.reservation_start_time && event.reservation_end_time && (
                  <p className="text-sm font-Poppins">
                    <strong>Time:</strong>{" "}
                    {formatTime(event.reservation_start_time)} to{" "}
                    {formatTime(event.reservation_end_time)}
                  </p>
                )}
              </div>
            )}

            {/* Reserve Button Section */}
            <div className="flex flex-col items-end mt-6">
              {reservationChecked ? (
                <button
                  className={`font-Poppins font-bold py-3 px-7 min-w-[300px] rounded-lg inline-block mb-2 uppercase transition-all transform hover:scale-105 
                ${
                  isReservationOpen() &&
                  hasAvailableTickets() &&
                  !hasReservation
                    ? "text-[#F09C32] outline outline-1 outline-[#F09C32] cursor-pointer"
                    : "bg-neutral-700 text-gray-400 cursor-not-allowed"
                }`}
                  onClick={
                    isReservationOpen() &&
                    hasAvailableTickets() &&
                    !hasReservation
                      ? handleReserveClick
                      : undefined
                  }
                  disabled={
                    !isReservationOpen() ||
                    !hasAvailableTickets() ||
                    hasReservation
                  }
                >
                  {getReservationStatus()}
                </button>
              ) : (
                <div className="font-Poppins font-bold py-3 px-7 min-w-[300px] rounded-lg inline-block mb-2 uppercase bg-neutral-700 text-gray-400">
                  Checking reservation status...
                </div>
              )}

              {/* Show view reservations button below reserve button */}
              {hasReservation && (
                <button
                  onClick={() => navigate("/my-reservations")}
                  className="text-custom_yellow font-Poppins text-sm hover:underline"
                >
                  Click here to view your reservations
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event_Ticketed_EndUser;
