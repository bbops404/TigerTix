import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaBars } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import tigertix_logo from "../assets/tigertix_logo.png";

const Header_User = () => {
  const [publishedEvents, setPublishedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("User");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublishedEvents = async () => {
      try {
        const API_BASE_URL = "http://localhost:5002";
        const response = await fetch(`${API_BASE_URL}/api/events/published`);
        const data = await response.json();

        if (response.ok && data.success) {
          setPublishedEvents(data.data);
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

  useEffect(() => {
    const storedName = sessionStorage.getItem("username");
    setUserName(storedName || "User");
  }, []);

  const handleEventChange = async (event) => {
    const eventId = event.target.value;
    if (!eventId) return;

    setSelectedEvent(eventId);
    setIsRedirecting(true);

    try {
      const API_BASE_URL = "http://localhost:5002";
      const response = await axios.get(`${API_BASE_URL}/api/events/ticketed/${eventId}`);

      if (response.data.success) {
        const eventType = response.data.data.event_type;

        switch (eventType) {
          case "ticketed":
            navigate(`/event-ticketed-enduser/${eventId}`);
            break;
          case "free":
            navigate(`/event-free-enduser/${eventId}`);
            break;
          case "coming_soon":
            navigate(`/event-coming-soon-enduser/${eventId}`);
            break;
          default:
            navigate(`/event-ticketed-enduser/${eventId}`);
        }
      } else {
        navigate(`/event-ticketed-enduser/${eventId}`);
      }
    } catch (error) {
      console.error("Error determining event type:", error);
      navigate(`/event-ticketed-enduser/${eventId}`);
    } finally {
      setTimeout(() => {
        setIsRedirecting(false);
      }, 500);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5002/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Logout failed");
      }

      sessionStorage.clear();
      alert("Logged out successfully!");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="flex bg-custom_yellow py-3 px-4 sm:px-8 items-center justify-between font-Poppins shadow-2xl relative">
      {/* Logo and Mobile Menu Button */}
      <div className="flex items-center flex-shrink-0">
        <Link to="/home" className="flex items-center">
          <img
            src={tigertix_logo}
            className="w-32 sm:w-40 transform transition-transform duration-300 hover:scale-105"
            alt="Tigertix Logo"
          />
        </Link>

        {/* Mobile Menu Button */}
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
                ) : (
                  <li className="py-2 px-4 text-sm text-black">No events available yet</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Selection (Desktop only) */}
      <div className="relative group hidden sm:flex flex-1 justify-center mx-4">
        <select
          value={selectedEvent}
          onChange={handleEventChange}
          className="font-Poppins text-[15px] font-medium bg-white py-3 px-5 rounded-xl text-[#2D2D2D] transition-all duration-300 w-full sm:w-[200px] md:w-[400px] h-[50px] border border-gray-300 cursor-pointer focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          disabled={isRedirecting || loading}
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

      {/* Right-side content */}
      <div className="flex items-center gap-4">
        <span className="text-gray-800 font-medium">Hi, {userName}!</span>
        <Link to="/my-profile">
          <FaUser className="text-gray-800 text-lg cursor-pointer hover:text-gray-600" />
        </Link>
        <FaSignOutAlt
          className="text-gray-800 text-lg cursor-pointer hover:text-gray-600"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default Header_User;