import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaBell, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import tigertix_logo from "../assets/tigertix_logo.png";

const Header_User = () => {
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
        <select className="border rounded-lg pl-8 pr-4 py-1 w-[700px] appearance-none focus:outline-none text-black">
          <option value="" disabled selected hidden>
            Search Event
          </option>
          <option>Option 1</option>
          <option>Option 2</option>
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