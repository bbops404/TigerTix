import React, { useEffect, useState } from "react";
import tigertix_logo from "../assets/tigertix_logo.png";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaBars, FaTimes } from "react-icons/fa";

const Header = ({
  toggleLoginPopup,
  showAuthButtons = true,
  showDropdown = true,
}) => {
  const navigate = useNavigate();
  const [publishedEvents, setPublishedEvents] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false); // For mobile menu
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const fetchPublishedEvents = async () => {
      try {
        const API_BASE_URL = "http://localhost:5002";
        const response = await axios.get(`${API_BASE_URL}/api/events/published`);

        if (response.data.success) {
          setPublishedEvents(response.data.data);
        } else {
          console.error("Failed to fetch published events.");
        }
      } catch (error) {
        console.error("Error fetching published events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedEvents();
  }, []);

  const handleEventChange = async (eventId) => {
    if (!eventId) return;

    setIsRedirecting(true);

    try {
      const API_BASE_URL = "http://localhost:5002";
      const response = await axios.get(`${API_BASE_URL}/api/events/ticketed/${eventId}`);

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
      console.error("Error determining event type:", error);
      navigate(`/event-ticketed/${eventId}`);
    } finally {
      setTimeout(() => {
        setIsRedirecting(false);
      }, 500);
    }
  };

  return (
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

        {/* Mobile Menu Button */}
        {showDropdown && (
          <div className="relative block sm:hidden ml-2">
            <button
              className="text-2xl text-gray-800"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle events dropdown"
            >
              <FaBars />
            </button>

            {menuOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20">
                <ul className="py-2 max-h-60 overflow-y-auto">
                  {loading ? (
                    <li className="py-2 px-4 text-sm text-black">Loading events...</li>
                  ) : publishedEvents.length > 0 ? (
                    publishedEvents.map((event) => (
                      <li key={event.id}>
                        <button
                          className="w-full text-left py-2 px-4 text-sm text-black hover:bg-gray-100 transition"
                          onClick={() => {
                            setMenuOpen(false);
                            handleEventChange(event.id);
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
                  ) : (
                    <li className="py-2 px-4 text-sm text-black">No events available yet</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dropdown Selection (Desktop only) */}
      {showDropdown && (
        <div className="relative group hidden sm:flex flex-1 justify-center mx-4">
          <select
            onChange={(e) => handleEventChange(e.target.value)}
            className="font-Poppins text-[15px] font-medium bg-white py-3 px-5 rounded-xl text-[#2D2D2D] transition-all duration-300 w-full sm:w-[200px] md:w-[400px] h-[50px] border border-gray-300 cursor-pointer focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            disabled={isRedirecting}
          >
            <option value="" disabled>
              {loading
                ? "Loading events..."
                : isRedirecting
                ? "Redirecting..."
                : "Select Event"}
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
  );
};

export default Header;