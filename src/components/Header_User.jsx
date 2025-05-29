import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaBell, FaSignOutAlt, FaChevronDown, FaBars, FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios"; // Added missing axios import
import tigertix_logo from "../assets/tigertix_logo.png";

import { handleApiError } from "../utils/apiErrorHandler";


const Header_User = () => {
  const [publishedEvents, setPublishedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(""); // State for selected event
  const [user, setUser] = useState(null); // State for user data
  const [loading, setLoading] = useState(true); // State for loading
  const [isRedirecting, setIsRedirecting] = useState(false); // State to prevent multiple clicks
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [userName, setUserName] = useState(""); // State to store the user's name

  useEffect(() => {
    // Fetch published events
    const fetchPublishedEvents = async () => {
      try {
        const API_BASE_URL = `${import.meta.env.VITE_API_URL}`; // Replace with your backend URL
        const response = await fetch(`${API_BASE_URL}/api/events/published`);
        const data = await response.json();

        if (response.ok && data.success) {
          setPublishedEvents(data.data);
        } else {
          console.error("Failed to fetch published events.");
        }
      } catch (error) {
        if (!handleApiError(error, navigate)) {
          console.error("Error fetching published events:", error);
        }
      } finally {
        setLoading(false); // Set loading to false regardless of outcome
      }
    };

    // Fetch both user data and published events
    fetchPublishedEvents();
  }, [navigate]);

  useEffect(() => {
    // Retrieve the username from sessionStorage
    const storedName = sessionStorage.getItem("username");
    if (storedName) {
      setUserName(storedName); // Set the username in state
    } else {
      setUserName("User"); // Fallback if no username is found
    }
  }, []);

  const handleEventChange = async (event) => {
    // Added async keyword
    const eventId = event.target.value;
    if (!eventId) return;

    setSelectedEvent(eventId);
    setIsRedirecting(true);

    try {
      // We need to get the full event details from any endpoint that will return them
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
      if (!handleApiError(error, navigate)) {
        console.error("Error determining event type:", error);
      }
      navigate(`/event-ticketed-enduser/${eventId}`);
    } finally {
      setTimeout(() => {
        setIsRedirecting(false);
      }, 500);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include", // ✅ Important! Sends cookies with request
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Logout failed");
      }

      console.log("🔴 Logging out...");

      // Clear session storage
      sessionStorage.clear();

      alert("Logged out successfully!");
      navigate("/"); // Redirect to Landing Page
    } catch (error) {
      console.error("Logout error:", error.message);
      alert(error.message);
    }
  };

return (
  <>
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
        {/* Mobile Menu Button (beside logo) */}
        <button
          className="block sm:hidden ml-2 text-2xl text-gray-800"
          onClick={() => setMenuOpen(true)}
          aria-label="Open events menu"
        >
          <FaBars />
        </button>
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

    {/* Mobile Events Modal */}
    {menuOpen && (
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
            {loading ? (
              <li className="py-2 text-gray-500">Loading events...</li>
            ) : publishedEvents.length > 0 ? (
              publishedEvents.map((event) => (
                <li key={event.id}>
                  <button
                    className="w-full text-left py-2 px-3 rounded hover:bg-gray-100"
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
              <li className="py-2 text-gray-500">No events available yet</li>
            )}
          </ul>
        </div>
      </div>
    )}
  </>
  );
};

export default Header_User;
