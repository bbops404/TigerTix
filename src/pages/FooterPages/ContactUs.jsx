import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import { FaArrowLeft, FaPhone } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import { FaClock } from "react-icons/fa";

const ContactUs = () => {
  return (
    <div className="bg-[#202020] text-black min-h-screen w-full">
      {/* Top Yellow Section */}
      <div className="bg-[#F09C32] w-full text-white">
        <Header />

        {/* Back Button */}
        <div className="px-6 mt-6">
          <Link to="/" className="flex items-center text-white text-xl hover:opacity-80 transition-opacity">
            <FaArrowLeft className="text-2xl" />
          </Link>
        </div>

        {/* Contact Header Section */}
        <div className="text-center py-24">
          <h1 className="text-6xl font-bold">Contact Us</h1>
          <h2 className="text-3xl mt-6">Get In Touch With Us</h2>
        </div>
      </div>

      {/* Bottom Dark Section */}
      <div className="bg-[#202020] w-full px-6 md:px-16 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Phone Box */}
          <div className="bg-gradient-to-b from-[#F0B974] to-[#F09C32] p-8 rounded-lg shadow-md flex flex-col items-center text-center w-full h-80">
            <FaPhone className="text-5xl mb-4 text-black" />
            <h2 className="text-2xl font-semibold">Phone</h2>
            <p className="mt-4 text-base">
              UST Trunkline <br />
              (+632) 8786-1611 | 3406-1611 <br />
              IPEA Office - loc. 8227 <br />
              Telefax: (+632) 8731-5744
            </p>
          </div>

          {/* Email Box */}
          <div className="bg-gradient-to-b from-[#F0B974] to-[#F09C32] p-8 rounded-lg shadow-md flex flex-col items-center text-center w-full h-80">
            <MdEmail className="text-5xl mb-4 text-black" />
            <h2 className="text-2xl font-semibold">Email</h2>
            <p className="mt-4 text-base">ipea@ust.edu.ph</p>
          </div>

          {/* Address Box */}
          <div className="bg-gradient-to-b from-[#F0B974] to-[#F09C32] p-8 rounded-lg shadow-md flex flex-col items-center text-center w-full h-80">
            <FaLocationDot className="text-5xl mb-4 text-black" />
            <h2 className="text-2xl font-semibold">Address</h2>
            <p className="mt-4 text-base">
              Quadricentennial Pavilion, University of Santo Tomas, <br />
              España Boulevard, Sampaloc, Manila, Philippines 1015
            </p>
          </div>

          {/* Office Hours Box */}
          <div className="bg-gradient-to-b from-[#F0B974] to-[#F09C32] p-8 rounded-lg shadow-md flex flex-col items-center text-center w-full h-80">
            <FaClock className="text-5xl mb-4 text-black" />
            <h2 className="text-2xl font-semibold">Office Hours</h2>
            <p className="mt-4 text-base">
              Monday - Friday <br />
              7:00 AM - 5:00 PM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
