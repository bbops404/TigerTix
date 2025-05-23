import React, { useEffect, useState } from "react";
import tigertix_logo from "../assets/tigertix_logo.png";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";

import { FaBars, FaTimes } from "react-icons/fa";

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
  const [menuOpen, setMenuOpen] = useState(false); // For mobile event menu

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
        const eventType = response.data.data.event_type;
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

    <>
      <div className="flex bg-custom_yellow py-3 px-4 sm:px-8 items-center justify-between font-Poppins shadow-2xl relative">
        {/* Logo and Mobile Menu Button */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/" className="flex items-center">
            <img
              src={tigertix_logo}
              className="w-32 sm:w-40 transform transition-transform duration-300 hover:scale-105"
              alt="Tigertix Logo"
            />
          </Link>
          {/* Mobile Menu Button (beside logo) */}
            {showDropdown && (
              <button
                className="block sm:hidden ml-2 text-2xl text-black"
                onClick={() => setMenuOpen(true)}
                aria-label="Open events menu"
              >
                <FaBars />
              </button>
            )}
        </div>

        {/* Dropdown Selection (Desktop only) */}

        {showDropdown && (
          <div className="relative group hidden sm:flex flex-1 justify-center mx-4">
            <select
              value={selectedEvent}
              onChange={handleEventChange}
              className="font-Poppins text-[15px] font-medium bg-white py-3 px-5 rounded-xl text-[#2D2D2D] transition-all duration-300 w-full sm:w-[200px] md:w-[400px] h-[50px] border border-gray-300 cursor-pointer focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              disabled={isRedirecting}
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


        {/* Right-side content */}

        {showAuthButtons && (
          <div className="flex gap-3 sm:gap-5">
              <button
                onClick={toggleLoginPopup}
                className="font-Poppins text-[13px] sm:text-[15px] font-medium bg-[#2D2D2D] p-2 px-4 sm:px-7 rounded-xl text-white transition-all duration-300 transform hover:scale-105 relative hover:shadow-lg hover:text-custom_yellow"
              >
                LOGIN
              </button>
              <button
                onClick={() => navigate("/verify")}
                className="font-Poppins text-[13px] sm:text-[15px] font-medium bg-white p-2 px-4 sm:px-7 rounded-xl text-[#2D2D2D] transition-all duration-300 transform hover:scale-105 relative hover:shadow-lg hover:text-yellow-600"
              >
                SIGN UP
              </button>
            </div>
        )}
      </div>

      {/* Mobile Events Modal */}
      {showDropdown && menuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-11/12 max-w-xs shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-xl text-gray-700"
              onClick={() => setMenuOpen(false)}
              aria-label="Close events menu"
            >
              <FaTimes />
            </button>
            <h2 className="text-lg font-semibold text-[#2D2D2D] mb-4">Select Event</h2>
            <ul>
              {publishedEvents.length === 0 ? (
                <li className="py-2 text-gray-500">No events available yet</li>
              ) : (
                publishedEvents.map((event) => (
                  <li key={event.id}>
                    <button
                      className="w-full text-left py-2 px-3 rounded hover:bg-gray-100 text-black"
                      onClick={async () => {
                        setMenuOpen(false);
                        await handleEventChange({ target: { value: event.id } });
                      }}
                      disabled={isRedirecting}
                    >
                      {event.name} -{" "}
                      {new Date(event.event_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;