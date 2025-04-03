import { Link } from "react-router-dom";
import { FaUser, FaBell, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import tigertix_logo from "../assets/tigertix_logo.png";

const Header_User = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="flex bg-custom_yellow py-3 px-4 md:px-8 items-center justify-between font-Poppins shadow-2xl relative">
      {/* Logo */}
      <Link to="/home" className="flex items-center">
        <img
          src={tigertix_logo}
          className="w-24 sm:w-32 md:w-40 transform transition-transform duration-300 hover:scale-105"
          alt="Tigertix Logo"
        />
      </Link>

      {/* Dropdown Selection with Arrow Icon */}
      <div className="relative flex items-center flex-1 mx-4 max-w-lg">
        <FaChevronDown className="absolute left-3 text-gray-600" />
        <select className="border rounded-lg pl-8 pr-4 py-1 w-full appearance-none focus:outline-none text-black">
          <option value="" disabled selected hidden>
            Search Event
          </option>
          <option>Option 1</option>
          <option>Option 2</option>
        </select>
      </div>

      {/* Right-side content */}
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="hidden sm:inline text-gray-800 font-medium">Hi, Name!</span>

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
            <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-[#F3B05B] shadow-lg rounded-lg p-4 z-50">
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