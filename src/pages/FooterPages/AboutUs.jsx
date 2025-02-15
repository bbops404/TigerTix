import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import tigertix_logo from "../../assets/tigertix_logo.png";

const AboutUs = () => {
    return (
      <div className="bg-[#202020] text-white min-h-screen">
        <Header />
        <div className="p-16 max-w-6xl mx-auto font-Poppins">
          <h1 className="text-4xl font-bold text-center">About Us</h1>
  
          <div className="mt-10 flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2 text-gray-300 text-justify">
              <p>
                TigerTix is the premier ticket reservation platform designed
                exclusively for UST's IPEA events. Our mission is to enhance the
                event experience for Thomasians by simplifying the ticketing
                process, eliminating long queues, and ensuring smooth
                reservations for high-demand events like UAAP games. By
                leveraging technology, TigerTix empowers both users and
                organizers with features that streamline event management,
                creating an efficient and enjoyable experience for all.
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
                <img
                  src={tigertix_logo}
                  className="w-100 transform transition-transform duration-300 hover:scale-105"
                  alt="Tigertix Logo"
                />
            </div>
          </div>
  
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-[#D9D9D9] p-8 rounded-lg shadow-md text-black">
              <h2 className="text-2xl font-semibold text-center">Mission</h2>
              <p className="mt-4 text-center text-justify">
                To revolutionize the event ticketing process at UST by providing
                an intuitive, reliable, and secure platform that caters to the
                diverse needs of students, staff, and administrators, fostering
                convenience and accessibility for all.
              </p>
            </div>
  
            <div className="bg-[#D9D9D9] p-8 rounded-lg shadow-md text-black">
              <h2 className="text-2xl font-semibold text-center">Vision</h2>
              <p className="mt-4 text-center text-justify">
                To become the go-to ticketing system in the UST community,
                celebrated for its innovation, efficiency, and user-centered
                approach, while inspiring other institutions to adopt modern
                solutions for event management.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default AboutUs;