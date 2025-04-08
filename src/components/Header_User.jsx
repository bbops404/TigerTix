import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaBell, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import tigertix_logo from "../assets/tigertix_logo.png";
import { useState, useEffect } from "react";
import axios from "axios";

const Header_User = () => {
  const [publishedEvents, setPublishedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(""); // State for selected event
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublishedEvents = async () => {
      try {
        const API_BASE_URL = "http://localhost:5002"; // Replace with your backend URL
        const response = await axios.get(`${API_BASE_URL}/api/events/published`);

        if (response.data.success) {
          setPublishedEvents(response.data.data);
        } else {
          console.error("Failed to fetch published events.");
        }
      } catch (error) {
        console.error("Error fetching published events:", error);
      }
    };

    fetchPublishedEvents();
  }, []);

  const handleEventChange = (event) => {
    const eventId = event.target.value;
    setSelectedEvent(eventId);
    if (eventId) {
      navigate(`/event-ticketed-enduser/${eventId}`); // Navigate to the dynamic event page for end users
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
      console.log("Session cleared:", sessionStorage.getItem("authToken"), sessionStorage.getItem("userRole"));
  

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
      <div className="relative flex items-center">
        <FaChevronDown className="absolute left-3 text-gray-600" />
        <select
          value={selectedEvent}
          onChange={handleEventChange}
          className="font-Poppins text-[15px] font-medium bg-white py-3 px-5 rounded-xl text-[#2D2D2D] transition-all duration-300 transform hover:scale-105 relative hover:shadow-lg hover:text-yellow-600 w-[565px] h-[50px] border border-gray-300"
        >
           <option value="" disabled>
            Select Event
          </option>
           {publishedEvents.length > 0 ? (
            publishedEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} - {new Date(event.event_date).toLocaleDateString("en-US", {
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
        <span className="text-gray-800 font-medium">Hi, Name!</span>

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