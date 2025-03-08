import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import logo_text from "../assets/logo_text.png";
import { FaFacebook } from "react-icons/fa";
import { PiInstagramLogoFill } from "react-icons/pi";
import { MdEmail } from "react-icons/md";

const Footer = () => {
  return (
    <div>
      {/* Main Footer Section */}
      <div className="px-16 py-5 flex bg-[linear-gradient(180deg,#000000,#2E2E2E)] justify-between font-Poppins text-sm text-white">
        {/* Logo */}
        <img src={logo_text} className="w-40 h-15 my-6" alt="Tigertix Logo" />

        {/* About Us Section */}
        <div className="flex flex-col text-left">
          <p className="text-left font-bold mb-3">ABOUT US</p>
          <Link to="/contact-us" className="text-left hover:underline">Contact Us</Link>
          <Link to="/about-us" className="text-left hover:underline">Who We Are</Link>
          <button className="text-left hover:underline">Our Mission and Vision</button>
        </div>

        {/* Quick Links Section */}
        <div className="flex flex-col text-left">
          <p className="text-left font-bold mb-3">QUICK LINKS</p>
          <Link to="/faqs" className="text-left hover:underline">FAQs</Link>
          <button className="text-left hover:underline">Events</button>
        </div>

        {/* Terms and Conditions Section */}
        <div className="flex flex-col text-left">
          <p className="text-left font-bold mb-3">TERMS AND CONDITIONS</p>
          <Link to="/privacy-policy" className="text-left hover:underline">
            Privacy Policy
          </Link>
          <Link to="/terms-of-use" className="text-left hover:underline">
            Terms of Use
          </Link>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="flex bg-custom_yellow px-16 py-8 font-Poppins text-custom_black">
        {/* Social Media Icons */}
        <div className="flex text-2xl">
          <button>
            <FaFacebook className="m-1 hover:text-white" />
          </button>
          <button>
            <PiInstagramLogoFill className="m-1 hover:text-white" />
          </button>
          <button>
            <MdEmail className="m-1 hover:text-white" />
          </button>
        </div>

        {/* Copyright & Version Info */}
        <div className="flex-1 flex justify-center">
          <div className="text-xs font-light text-center">
            <p>© 2024 TIGERTIX. All Rights Reserved.</p>
            <p>Version 1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;