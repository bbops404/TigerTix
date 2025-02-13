import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For back navigation
import Header from "../../components/Header";
import LoginPopup from "./LoginPopup";
import TigerTicket from "../../assets/TigerTicket.svg"; // Correct import

const Event_Ticketed = () => {
  const [loginPopup, setLoginPopup] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const toggleLoginPopup = () => {
    setLoginPopup(!loginPopup);
  };

  return (
    <div className="bg-[#121212] text-white min-h-screen">
      <Header toggleLoginPopup={toggleLoginPopup} />
      {loginPopup && (
        <LoginPopup loginPopup={loginPopup} toggleLoginPopup={toggleLoginPopup} />
      )}

      {/* Back Button (Upper Left) */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-[100px] left-4 text-white font-Poppins font-bold"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex justify-center items-center p-4 mt-4">
        <div className="text-white p-6 flex max-w-4xl w-full rounded-lg">
          
          {/* Left Image Placeholder */}
          <div className="bg-gray-300 w-1/2 h-[450px] rounded-lg"></div>

          {/* Right Content */}
          <div className="w-full pl-10">
            <div className="bg-[#F09C32] text-black font-Poppins font-bold px-4 py-2  rounded-full inline-block mb-4">
              UAAP SEASON 87 MEN’S BASKETBALL
            </div>

            <h2 className="font-bold font-Poppins text-lg mb-2">EVENT DETAILS:</h2>
            <p className="font-Poppins text-justify text-sm text-gray-300 mb-4">
            Get ready to roar, UST community! The UAAP Season 87 Men's Basketball tournament kicks off with a clash of champions, 
            and the UST Growling Tigers are set to take center stage at the iconic Mall of Asia Arena. Witness the fast-paced action, 
            gravity-defying plays, and unyielding determination that make UAAP basketball the most thrilling collegiate league in the country.
            Whether you're cheering courtside or from the stands, wear your gold and white loud and proud! Together, let's rally behind our team 
            as they fight for victory and represent the Thomasian spirit with heart and passion.
            </p>  

            <hr></hr>

            <p className="text-sm mt-4 mb-2 font-Poppins">
              <strong>Location:</strong> Mall of Asia Arena
            </p>
            <p className="text-sm mb-2 font-Poppins">
              <strong>Time:</strong> 6:00 PM
            </p>
            <p className="text-sm mb-2 font-Poppins">
              <strong>Tickets:</strong>
            </p>

            {/* Ticket Prices */}
            <div className="bg-[#694C26] p-4 mt-4 rounded-lg flex justify-between text-sm">
              {[
                { price: "₱100", label: "General Admission" },
                { price: "₱200", label: "Upper Box" },
                { price: "₱300", label: "Lower Box" },
                { price: "₱400", label: "Patron" },
              ].map((ticket, index) => (
                <div key={index} className="flex items-center space-x-2 text-left font-Poppins">
                  <img src={TigerTicket} alt="Ticket Icon" className="w-6 h-6" />
                  <div>
                    <p className="font-bold">{ticket.price}</p>
                    <p>{ticket.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reserve Button */}
            <div className="flex justify-end mt-9">
              <button
                className="font-Poppins bg-black text-[#F09C32] font-bold py-3 px-7 min-w-[300px] rounded-lg inline-block mb-4 uppercase cursor-pointer transition-all transform hover:scale-105 hover:bg-black-600"
                onClick={() => navigate("/reservation")} // Redirects to Reservation
              >
                RESERVE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event_Ticketed;