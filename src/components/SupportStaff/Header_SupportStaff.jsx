import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import tigertix_logo from "../../assets/tigertix_logo.png";

const Header_Admin = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(""); // State to store the admin's name

  useEffect(() => {
    // Retrieve the username from sessionStorage
    const storedName = sessionStorage.getItem("username");
    if (storedName) {
      setUserName(storedName); // Set the username in state
    } else {
      setUserName("Support Staff"); // Fallback if no username is found
    }
  }, []);

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

      alert("Logged out successfully!");
      navigate("/"); // Redirect to Landing Page
      sessionStorage.clear(); // Clear session storage
    } catch (error) {
      console.error("Logout error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="flex bg-custom_yellow py-3 px-8 items-center justify-between font-Poppins shadow-2xl">
      {/* Logo */}
      <Link to="/admin-dashboard" className="flex items-center">
        <img
          src={tigertix_logo}
          className="w-40 transform transition-transform duration-300 hover:scale-105"
          alt="Tigertix Logo"
        />
      </Link>

      {/* Right-side content */}
      <div className="flex items-center gap-4">
        {/* Display the admin's username */}
        <span className="text-gray-800 font-medium">Hi, {userName}!</span>

        {/* Profile Icon - Routes to Support Staff Profile */}
        <Link to="/support-staff-profile">
          <FaUser className="text-gray-800 text-lg cursor-pointer hover:text-gray-600" />
        </Link>

        {/* Logout Icon - Calls handleLogout function */}
        <button onClick={handleLogout} className="bg-transparent border-none">
          <FaSignOutAlt className="text-gray-800 text-lg cursor-pointer hover:text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default Header_Admin;