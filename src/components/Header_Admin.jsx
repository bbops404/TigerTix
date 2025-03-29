import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import tigertix_logo from "../assets/tigertix_logo.png";

const Header_Admin = () => {
  const navigate = useNavigate();

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
    localStorage.removeItem("token");
    localStorage.removeItem("role");
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
      <Link to="/dashboard" className="flex items-center">
        <img
          src={tigertix_logo}
          className="w-40 transform transition-transform duration-300 hover:scale-105"
          alt="Tigertix Logo"
        />
      </Link>

      {/* Right-side content */}
      <div className="flex items-center gap-4">
        <span className="text-gray-800 font-medium">Hi, Admin!</span>

        {/* Profile Icon - Routes to Admin Profile */}
        <Link to="/adminprofile">
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
