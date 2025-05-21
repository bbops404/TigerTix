// Header.jsx
import React, { useEffect, useState } from "react";
import tigertix_logo from "../assets/tigertix_logo.png";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { handleApiError } from "../utils/apiErrorHandler";

const Header = ({
  toggleLoginPopup,
  showAuthButtons = true,
  showDropdown = true,
}) => {
  const navigate = useNavigate();
  const [publishedEvents, setPublishedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(""); // State for selected event
  const [isRedirecting, setIsRedirecting] = useState(false); // State to prevent multiple clicks

  useEffect(() => {
    const fetchPublishedEvents = async () => {
      try {
        const API_BASE_URL = `${import.meta.env.VITE_API_URL}`; // Replace with your backend URL
        const response = await axios.get(
          `${API_BASE_URL}/api/events/published`
        );

        if (response.data.success) {
          setPublishedEvents(response.data.data);
        } else {
          console.error("Failed to fetch published events.");
        }
      } catch (error) {
        if (!handleApiError(error, navigate)) {
          console.error("Error fetching published events:", error);
        }
      }
    };

    fetchPublishedEvents();
  }, [navigate]);

  const handleEventChange = async (event) => {
    const eventId = event.target.value;
    if (!eventId) return;

    setSelectedEvent(eventId);
    setIsRedirecting(true);

    try {
      // We need to get the full event details from any endpoint that will return them
      // Since we know from the controller code that any of the endpoints will return the event
      // regardless of its actual type, we can just use one endpoint
      const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

      const response = await axios.get(
        `${API_BASE_URL}/api/events/ticketed/${eventId}`
      );

      if (response.data.success) {
        // Now we check the actual event_type from the response
        const eventType = response.data.data.event_type;
        console.log("Detected event type:", eventType);

        // Navigate based on the actual event type
        switch (eventType) {
          case "ticketed":
            navigate(`/event-ticketed/${eventId}`);
            break;
          case "free":
            navigate(`/event-free/${eventId}`);
            break;
          case "coming_soon":
            navigate(`/event-coming-soon/${eventId}`);
            break;
          default:
            navigate(`/event-ticketed/${eventId}`);
        }
      } else {
        navigate(`/event-ticketed/${eventId}`);
      }
    } catch (error) {
      if (!handleApiError(error, navigate)) {
        console.error("Error determining event type:", error);
      }
      navigate(`/event-ticketed/${eventId}`);
    } finally {
      setTimeout(() => {
        setIsRedirecting(false);
      }, 500);
    }
  };

  return (
    <div>
      <div className="flex bg-custom_yellow py-3 px-8 items-center justify-between font-Poppins shadow-2xl relative">
        <Link to="/" className="flex items-center">
          <img
            src={tigertix_logo}
            className="w-40 transform transition-transform duration-300 hover:scale-105"
            alt="Tigertix Logo"
          />
        </Link>

        {/* Conditionally render the dropdown */}
        {showDropdown && (
          <div className="relative group">
            <select
              value={selectedEvent}
              onChange={handleEventChange}
              className="font-Poppins text-[15px] font-medium bg-white py-3 px-5 rounded-xl text-[#2D2D2D] transition-all duration-300 relative w-[565px] h-[50px] border border-gray-300 cursor-pointer focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            >
              <option value="" disabled>
                Select Event
              </option>
              {publishedEvents.length > 0 ? (
                publishedEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} -{" "}
                    {new Date(event.event_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </option>
                ))
              ) : (
                <option disabled>No events available yet</option>
              )}
            </select>
          </div>
        )}

        {showAuthButtons && (
          <div className="flex gap-5">
            <button
              onClick={toggleLoginPopup}
              className="font-Poppins text-[15px] font-medium bg-[#2D2D2D] p-2 px-7 rounded-xl text-white transition-all duration-300 transform hover:scale-105 relative hover:shadow-lg hover:text-custom_yellow"
            >
              LOGIN
            </button>
            <button
              onClick={() => navigate("/verify")}
              className="font-Poppins text-[15px] font-medium bg-white p-2 px-7 rounded-xl text-[#2D2D2D] transition-all duration-300 transform hover:scale-105 relative hover:shadow-lg hover:text-yellow-600"
            >
              SIGN UP
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
