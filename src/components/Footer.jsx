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
      <div className="px-8 md:px-16 py-5 flex flex-col bg-[linear-gradient(180deg,#000000,#2E2E2E)] font-Poppins text-sm text-white gap-6 md:gap-0">
        <div className="flex flex-col md:flex-row justify-between items-center w-full">
          {/* Logo */}
          <div className="flex justify-center md:justify-start">
            <img src={logo_text} className="w-40 h-15 my-6" alt="Tigertix Logo" />
          </div>

          {/* Footer Sections Container */}
          <div className="flex flex-col md:flex-row justify-end text-center w-full md:w-auto gap-12">
            {/* About Us Section */}
            <div className="flex flex-col">
              <p className="font-bold mb-3">ABOUT US</p>
              <Link to="/contact-us" className="hover:underline">Contact Us</Link>
              <Link to="/about-us" className="hover:underline">Who We Are</Link>
              <button className="hover:underline">Our Mission and Vision</button>
            </div>

            {/* Quick Links Section */}
            <div className="flex flex-col">
              <p className="font-bold mb-3">QUICK LINKS</p>
              <Link to="/faqs" className="hover:underline">FAQs</Link>
              <button className="hover:underline">Events</button>
            </div>

            {/* Terms and Conditions Section */}
            <div className="flex flex-col">
              <p className="font-bold mb-3">TERMS AND CONDITIONS</p>
              <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
              <Link to="/terms-of-use" className="hover:underline">Terms of Use</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="flex flex-col md:flex-row items-center bg-custom_yellow px-8 md:px-16 py-6 font-Poppins text-custom_black text-center md:text-left">
        {/* Social Media Icons */}
        <div className="flex text-2xl space-x-3 mb-4 md:mb-0">
          <button>
            <FaFacebook className="hover:text-white" />
          </button>
          <button>
            <PiInstagramLogoFill className="hover:text-white" />
          </button>
          <button>
            <MdEmail className="hover:text-white" />
          </button>
        </div>

        {/* Copyright & Version Info */}
        <div className="flex-1 flex justify-center">
          <div className="text-xs font-light">
            <p>© 2024 TIGERTIX. All Rights Reserved.</p>
            <p>Version 1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;