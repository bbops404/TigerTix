import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaBell, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import tigertix_logo from "../assets/tigertix_logo.png";
import axios from "axios";

const Header_User = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [firstName, setFirstName] = useState("");


  // useEffect(() => {
  //   // Fetching user data from the API
  //   const fetchFirstName = async () => {
  //     try {
  //       const response = await axios.get("http://localhost:5003/users");
  //       const users = response.data;

  //       // Assuming you want the first name of the first user in the list
  //       if (users.length > 0) {
  //         setFirstName(users[0].first_name);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user data:", error);
  //     }
  //   };

  //   fetchFirstName();
  // }, []);

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
  <div className="flex bg-custom_yellow py-3 px-8 items-center justify-between font-Poppins shadow-2xl relative">
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
      <span className="text-gray-800 font-medium">Hi, {/*firstName*/} Name!</span>

      {/* Profile Icon - Routes to My Profile */}
      <Link to="/my-profile">
        <FaUser className="text-gray-800 text-lg cursor-pointer hover:text-gray-600" />
      </Link>

      {/* Notification Icon with Toggle */}
      <div className="relative">
        <FaBell
          className="text-gray-800 text-lg cursor-pointer hover:text-gray-600"
          onClick={() => setShowNotifications(!showNotifications)}
        />
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-72 bg-[#F3B05B] shadow-lg rounded-lg p-4 z-50">
            <h3 className="font-bold text-black flex items-center gap-2">
              Notifications <span className="bg-black text-white text-xs px-2 py-1 rounded-md">3</span>
            </h3>
            <div className="mt-2 p-3 border rounded-lg bg-gray-100 text-[12px] text-[#606060]">
              📢 An event you registered for starts in 15 minutes!
            </div>
            <div className="mt-2 p-3 border rounded-lg bg-gray-100 text-[12px] text-[#606060]">
              🏀 UAAP SEASON 87 MEN'S BASKETBALL Tickets Available
            </div>
            <div className="mt-2 p-3 border rounded-lg bg-gray-100 text-[12px] text-[#606060]">
              🏀 UAAP SEASON 87 WOMEN'S BASKETBALL Tickets Available
            </div>
          </div>
        )}
      </div>

      {/* Logout Icon - Routes to Landing Page */}
      <Link to="/">
        <FaSignOutAlt className="text-gray-800 text-lg cursor-pointer hover:text-gray-600" />
      </Link>
    </div>
  </div>

  );
};

export default Header_User;