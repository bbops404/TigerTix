import React, { useEffect, useState } from "react";
import LoginPopup from "../Landing/LoginPopup"; // Import the LoginPopup component
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Header_User from "../../components/Header_User";

import { FaArrowLeft } from "react-icons/fa";
import tigertix_logo from "../../assets/tigertix_logo.png";

const AboutUs = () => {
  // 🔹 State for login popup
    const [loginPopup, setLoginPopup] = useState(false);
  
    const toggleLoginPopup = () => {
      setLoginPopup((prev) => !prev);
    };
  
    // 🔹 Check if login popup should be shown on load
    useEffect(() => {
      const shouldShowLogin = sessionStorage.getItem("showLoginPopup");
      if (shouldShowLogin === "true") {
        setLoginPopup(true);
        sessionStorage.removeItem("showLoginPopup");
      }
    }, []); // Dependency array ensures this runs only once on mount

    const isLoggedIn = !!sessionStorage.getItem("authToken"); // Replace with your token logic

  return (
    <div className="bg-[#202020] text-white min-h-screen">
      {/* Conditionally render the header */}
      {isLoggedIn ? (
        <Header_User />
      ) : (
        <Header toggleLoginPopup={toggleLoginPopup} />
      )}

      {loginPopup && (
        <LoginPopup
          loginPopup={loginPopup}
          toggleLoginPopup={toggleLoginPopup}
        />
      )}
      <div className="px-6 mt-6">
        <Link to="/" className="flex items-center text-white text-xl hover:opacity-80 transition-opacity">
          <FaArrowLeft className="text-2xl" />
        </Link>
      </div>

      <div className="p-16 max-w-6xl mx-auto font-Poppins">
        <h1 className="text-4xl font-bold text-center">ABOUT US</h1>

        <div className="mt-10 flex flex-col md:flex-row items-center gap-10">

          <div className="md:w-1/2 text-white text-justify">
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
              className="w-120 transform transition-transform duration-300 hover:scale-105"
              alt="Tigertix Logo"
            />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-gradient-to-b from-transparent to-custom_yellow p-8 rounded-lg shadow-md text-white">
            <h2 className="text-2xl font-semibold text-center">Mission</h2>
            <p className="mt-4 text-center text-justify">
              To revolutionize the event ticketing process at UST by providing
              an intuitive, reliable, and secure platform that caters to the
              diverse needs of students, staff, and administrators, fostering
              convenience and accessibility for all.
            </p>
          </div>


          <div className="bg-gradient-to-b from-transparent to-custom_yellow p-8 rounded-lg shadow-md text-white">
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
