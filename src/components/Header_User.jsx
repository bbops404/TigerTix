import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaBell, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import tigertix_logo from "../assets/tigertix_logo.png";
import { useState, useEffect } from "react";
import axios from "axios";

const Header_User = () => {
  const [publishedEvents, setPublishedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(""); // State for selected event
  const [user, setUser] = useState(null); // State for user data
  const [loading, setLoading] = useState(true); // State for loading
  const [isRedirecting, setIsRedirecting] = useState(false); // State to prevent multiple clicks
  const navigate = useNavigate();

  useEffect(() => {
    // Function to fetch user data
    const fetchUserData = async () => {
      try {
        const API_BASE_URL = "http://localhost:5002"; // Base URL
        const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
          withCredentials: true, // Important for including cookies
        });

        if (response.data.success) {
          setUser(response.data.data);
        } else {
          console.error("Failed to fetch user data.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Function to fetch published events
    const fetchPublishedEvents = async () => {
      try {
        const API_BASE_URL = "http://localhost:5002"; // Base URL
        const response = await axios.get(
          `${API_BASE_URL}/api/events/published`
        );

        if (response.data.success) {
          setPublishedEvents(response.data.data);
        } else {
          console.error("Failed to fetch published events.");
        }
      } catch (error) {
        console.error("Error fetching published events:", error);
      }
    };

    // Fetch both user data and published events
    fetchUserData();
    fetchPublishedEvents();
  }, []);

  const handleEventChange = async (event) => {
    const eventId = event.target.value;
    if (!eventId) return;

    setSelectedEvent(eventId);
    setIsRedirecting(true);

    try {
      // We need to get the full event details from any endpoint that will return them
      const API_BASE_URL = "http://localhost:5002";

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
      const response = await fetch("http://localhost:5002/auth/logout", {
        method: "POST",
        credentials: "include", // ✅ Important! Sends cookies with request
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Logout failed");
      }

      console.log("🔴 Logging out...");

      // Clear session storage
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userRole");

      // Debugging logs
      console.log(
        "Session cleared:",
        sessionStorage.getItem("authToken"),
        sessionStorage.getItem("userRole")
      );

      alert("Logged out successfully!");
      navigate("/"); // Redirect to Landing Page
      sessionStorage.clear();

      window.history.pushState(null, "", window.location.href);
      window.history.replaceState(null, "", window.location.href);
    } catch (error) {
      console.error("Logout error:", error.message);
      alert(error.message);
    }
  };

  // Get the proper display name for the user
  const getUserDisplayName = () => {
    if (loading) return "Loading...";
    if (!user) return "Guest";

    // First try to use first_name
    if (user.first_name) {
      return `${user.first_name}`;
    }
    // Fall back to username if available
    else if (user.username) {
      return user.username;
    }
    // Last resort, use email prefix
    else if (user.email) {
      return user.email.split("@")[0];
    }

    return "User"; // Default fallback
  };

  return (
    <div className="flex bg-custom_yellow py-3 px-8 items-center justify-between font-Poppins shadow-2xl">
      {/* Logo */}
      <Link to="/home" className="flex items-center">
        <img
          src={tigertix_logo}
          className="w-40 transform transition-transform duration-300 hover:scale-105"
          alt="Tigertix Logo"
        />
      </Link>

      {/* Dropdown Selection with Arrow Icon */}
      <div className="relative flex items-center group">
        <FaChevronDown className="absolute left-3 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
        <select
          value={selectedEvent}
          onChange={handleEventChange}
          className="font-Poppins text-[15px] font-medium bg-white py-3 px-5 pl-8 rounded-xl text-[#2D2D2D] transition-all duration-300 relative w-[565px] h-[50px] border border-gray-300 cursor-pointer focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          disabled={isRedirecting}
        >
          <option value="" disabled>
            {isRedirecting ? "Redirecting..." : "Select Event"}
          </option>
          {publishedEvents.length > 0 ? (
            publishedEvents.map((event) => (
              <option key={event.id} value={event.id} className="py-2">
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
        <span className="text-gray-800 font-medium">
          Hi, {getUserDisplayName()}!
        </span>

        {/* Profile Icon - Routes to My Profile */}
        <Link to="/my-profile">
          <FaUser className="text-gray-800 text-lg cursor-pointer hover:text-gray-600" />
        </Link>

        {/* Notification Icon */}
        <FaBell className="text-gray-800 text-lg cursor-pointer hover:text-gray-600" />

        {/* Logout Icon - Calls handleLogout function */}
        <button onClick={handleLogout} className="bg-transparent border-none">
          <FaSignOutAlt className="text-gray-800 text-lg cursor-pointer hover:text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default Header_User;
