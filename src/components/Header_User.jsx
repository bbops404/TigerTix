import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaBell, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios"; // Added missing axios import
import tigertix_logo from "../assets/tigertix_logo.png";

const Header_User = () => {
  const [publishedEvents, setPublishedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(""); // State for selected event
  const [user, setUser] = useState(null); // State for user data
  const [loading, setLoading] = useState(true); // State for loading
  const [isRedirecting, setIsRedirecting] = useState(false); // State to prevent multiple clicks

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
        console.error("Error fetching published events:", error);
      } finally {
        setLoading(false); // Set loading to false regardless of outcome
      }
    };

    // Fetch both user data and published events
    fetchPublishedEvents();
  }, []);

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
            // Default fallback
            navigate(`/event-ticketed-enduser/${eventId}`);
        }
      } else {
        // If we somehow didn't get a successful response, default to ticketed
        navigate(`/event-ticketed-enduser/${eventId}`);
      }
    } catch (error) {
      console.error("Error determining event type:", error);
      // Default fallback in case of error
      navigate(`/event-ticketed-enduser/${eventId}`);
    } finally {
      // Reset after a short delay
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
    <div className="flex bg-custom_yellow py-3 px-8 items-center justify-between font-Poppins shadow-2xl relative">
      {/* Logo */}
      <Link to="/home" className="flex items-center">
        <img
          src={tigertix_logo}
          className="w-40 transform transition-transform duration-300 hover:scale-105"
          alt="Tigertix Logo"
        />
      </Link>

      {/* Dropdown Selection */}
      <div className="relative group">
        <select
          value={selectedEvent}
          onChange={handleEventChange}
          className="font-Poppins text-[15px] font-medium bg-white py-3 px-5 pl-8 rounded-xl text-[#2D2D2D] transition-all duration-300 relative w-[565px] h-[50px] border border-gray-300 cursor-pointer focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          disabled={isRedirecting || loading} // Added loading check
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
        {/* Display the username */}
        <span className="text-gray-800 font-medium">Hi, {userName}!</span>

        {/* Profile Icon - Routes to My Profile */}
        <Link to="/my-profile">
          <FaUser className="text-gray-800 text-lg cursor-pointer hover:text-gray-600" />
        </Link>

        {/* Logout Icon - Calls handleLogout */}
        <FaSignOutAlt
          className="text-gray-800 text-lg cursor-pointer hover:text-gray-600"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default Header_User;
