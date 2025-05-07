import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // For back navigation and fetching event ID
import Header_User from "../../components/Header_User";
import { IoChevronBackOutline, IoNotifications } from "react-icons/io5";
import axios from "axios";

const Event_ComingSoon = () => {
  const { id } = useParams(); // Get the event ID from the URL
  const [event, setEvent] = useState(null); // State to store event details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = "http://localhost:5002"; // Replace with your backend URL

        // Fetch event details by ID
        const response = await axios.get(
          `${API_BASE_URL}/api/user/events/coming-soon/${id}`,
          {
            withCredentials: true, // Include cookies for authentication
          }
        );
        if (response.data.success) {
          setEvent(response.data.data);
          console.log(
            "Coming Soon Event data fetched successfully:",
            response.data.data
          );
        } else {
          setError("Failed to fetch event details.");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to fetch event details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

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
    <div className="bg-[#121212] text-white min-h-screen">
      <Header_User />

      {/* Back Button (Upper Left) */}
      <button
        onClick={() => navigate("/home")}
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
                    : `http://localhost:5002${
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

            <hr className="border-t border-gray-400 my-4" />

            {/* Coming Soon Information */}
            <div className="bg-[#2a2a2a] p-4 rounded-lg mt-4">
              <p className="font-Poppins text-center text-sm mb-2">
                <strong>
                  Ticket details will be available soon. Stay tuned!
                </strong>
              </p>
              <p className="font-Poppins text-center text-xs text-gray-400">
                This event is currently in preparation. Tickets and reservation
                options will be announced when available.
              </p>
            </div>

            {/* Projected Release Information - if available */}
            {event.projected_release_date && (
              <div className="mt-4 p-2 bg-[#2a2a2a] rounded-lg">
                <p className="text-sm font-Poppins">
                  <strong>Projected Ticket Release:</strong>{" "}
                  {formatDate(event.projected_release_date)}
                </p>
              </div>
            )}

            {/* Be Notified Button */}
            <div className="flex justify-end mt-6">
              <button

                className="font-Poppins font-bold py-3 px-7 min-w-[300px] rounded-lg inline-block mb-2 uppercase transition-all transform hover:scale-105 bg-black text-[#F09C32] flex items-center justify-center space-x-2"
                onClick={() => alert("You will be notified about this event!")}
              >
                <span>Be notified!</span>
                <IoNotifications className="text-2xl bg-white p-1 rounded-full" />

              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event_ComingSoon;
