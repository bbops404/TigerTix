import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaBell, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import { useEffect, useState } from "react";
import tigertix_logo from "../assets/tigertix_logo.png";

const Header_User = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [userName, setUserName] = useState(""); // State to store the user's name
  const [publishedEvents, setPublishedEvents] = useState([]); // State for published events
  const [selectedEvent, setSelectedEvent] = useState(""); // State for selected event

  useEffect(() => {
    // Fetch published events
    const fetchPublishedEvents = async () => {
      try {
        const API_BASE_URL = "http://localhost:5002"; // Replace with your backend URL
        const response = await fetch(`${API_BASE_URL}/api/events/published`);
        const data = await response.json();

        if (response.ok && data.success) {
          setPublishedEvents(data.data);
        } else {
          console.error("Failed to fetch published events.");
        }
      } catch (error) {
        console.error("Error fetching published events:", error);
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

  const handleEventChange = (event) => {
    const eventId = event.target.value;
    setSelectedEvent(eventId);

    if (eventId) {
      // Add a slight delay before navigation for smoother experience
      setTimeout(() => {
        navigate(`/event-ticketed/${eventId}`);
      }, 300); // 300ms delay gives visual feedback that selection was made
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
      sessionStorage.clear();

      alert("Logged out successfully!");
      navigate("/"); // Redirect to Landing Page
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