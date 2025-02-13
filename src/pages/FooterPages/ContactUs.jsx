import React from "react";
import Header from "../../components/Header";
import { FaPhone } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import { FaClock } from "react-icons/fa";

const ContactUs = () => {
  return (
    <div className="bg-[#202020] text-white min-h-screen font-Poppins">
      <div className="bg-[#D9D9D9] text-black py-16 text-center">
        <h1 className="text-5xl font-bold">Contact Us</h1>
        <h2 className="text-2xl mt-4">Get In Touch With Us</h2>
      </div>
      
      <div className="p-16 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Phone Box */}
        <div className="bg-[#D9D9D9] text-black p-8 rounded-lg shadow-md flex flex-col items-center text-center">
          <FaPhone className="text-4xl mb-4" />
          <h2 className="text-2xl font-semibold">Phone</h2>
          <p className="mt-4">
            UST Trunkline <br />
            (+632) 8786-1611 | 3406-1611 <br />
            IPEA Office - loc. 8227 <br />
            Telefax: (+632) 8731-5744
          </p>
        </div>

        {/* Email Box */}
        <div className="bg-[#D9D9D9] text-black p-8 rounded-lg shadow-md flex flex-col items-center text-center">
          <MdEmail className="text-4xl mb-4" />
          <h2 className="text-2xl font-semibold">Email</h2>
          <p className="mt-4">ipea@ust.edu.ph</p>
        </div>

        {/* Address Box */}
        <div className="bg-[#D9D9D9] text-black p-8 rounded-lg shadow-md flex flex-col items-center text-center">
          <FaLocationDot className="text-4xl mb-4" />
          <h2 className="text-2xl font-semibold">Address</h2>
          <p className="mt-4">
            Quadricentennial Pavilion, University of Santo Tomas, <br />
            España Boulevard, Sampaloc, Manila, Philippines 1015
          </p>
        </div>

        {/* Office Hours Box */}
        <div className="bg-[#D9D9D9] text-black p-8 rounded-lg shadow-md flex flex-col items-center text-center">
          <FaClock className="text-4xl mb-4" />
          <h2 className="text-2xl font-semibold">Office Hours</h2>
          <p className="mt-4">
            Monday - Friday <br />
            7:00 AM - 5:00 PM
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
