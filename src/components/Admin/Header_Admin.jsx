import { Link } from "react-router-dom";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import tigertix_logo from "../../assets/tigertix_logo.png";

const Header_Admin = () => {
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
        <Link to="/admin-profile">
          <FaUser className="text-gray-800 text-lg cursor-pointer hover:text-gray-600" />
        </Link>

        {/* Logout Icon - Routes to Landing Page */}
        <Link to="/">
          <FaSignOutAlt className="text-gray-800 text-lg cursor-pointer hover:text-gray-600" />
        </Link>
      </div>
    </div>
  );
};

export default Header_Admin;
