import React from "react";
import logo_text from "../assets/logo_text.png";
import { FaFacebook } from "react-icons/fa";
import { PiInstagramLogoFill } from "react-icons/pi";
import { MdEmail } from "react-icons/md";

const Footer = () => {
  return (
    <div>
      <div className="px-16 py-5 flex bg-[linear-gradient(180deg,#000000,#2E2E2E)] justify-between font-Poppins text-sm text-white">
        <img src={logo_text} className="w-40 h-15 my-6" alt="Tigertix Logo" />
        <div className="flex flex-col text-left">
          <p className="text-left font-bold mb-3">ABOUT US</p>
          <button className="text-left hover:underline">Contact Us</button>
          <button className="text-left hover:underline">Who We Are</button>
          <button className="text-left hover:underline">
            Our Mission and Vision
          </button>
        </div>
        <div className="flex flex-col text-left">
          <p className="text-left font-bold mb-3">QUICK LINKS</p>
          <button className="text-left hover:underline">FAQS</button>
          <button className="text-left hover:underline">Events</button>
        </div>
        <div className="flex flex-col text-left">
          <p className="text-left font-bold mb-3">TERMS AND CONDITIONS</p>
          <button className="text-left hover:underline">Privacy Policy</button>
          <button className="text-left hover:underline">Terms of Use</button>
        </div>
      </div>
      <div className="flex bg-custom_yellow px-16 py-8 font-Poppins text-custom_black">
        <div className="flex text-2xl">
          <button>
            <FaFacebook className="m-1 hover:text-white" />
          </button>
          <button>
            <PiInstagramLogoFill className="m-1  hover:text-white" />
          </button>
          <button>
            <MdEmail className="m-1 hover:text-white" />
          </button>
        </div>
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
