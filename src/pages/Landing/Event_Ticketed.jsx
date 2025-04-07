import React, { useState, useEffect } from "react";
import { useNavigate, useLocation} from "react-router-dom"; // For back navigation
import Header from "../../components/Header";
import LoginPopup from "./LoginPopup";
import TigerTicket from "../../assets/TigerTicket.svg"; // Correct import
import { IoChevronBackOutline } from "react-icons/io5";

const Event_Ticketed = () => {
  const [loginPopup, setLoginPopup] = useState(false);
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Get location object
  const [event, setEvent] = useState(location.state?.event); // Store event data in state
    
    useEffect(() => {
      if (!event) {
        setEvent(location.state?.event);
      }
    }, [event, location.state]);
  
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
        <IoChevronBackOutline className="text-3xl" />
      </button>

      <div className="flex justify-center items-center p-5 mt-10">
        <div className="text-white p-6 flex max-w-7xl w-full rounded-lg">
          {/* Left Image Placeholder */}
          <div className="bg-gray-300 min-w-[300px] max-w-[300px] min-h-[450px] max-h-[450px] rounded-lg ml-[50px]">
            <img src={event?.image} alt={event?.name} className="w-full h-full object-cover rounded-lg" />
          </div>

          {/* Right Content */}
          <div className="w-2/3 pl-6">
            <div className="bg-[#F09C32] text-black font-Poppins font-bold px-4 py-2 rounded-lg inline-block mb-4">
              {event?.name || "Event Name"}
            </div>

            <h2 className="font-bold font-Poppins text-lg mb-2">EVENT DETAILS:</h2>
            <p className="font-Poppins text-justify text-sm text-gray-300 mb-4">
              {event?.details || "Event description goes here."}
            </p>

            <p className="text-sm mb-2 font-Poppins">
              <strong>Location:</strong> {event?.location || "N/A"}
            </p>
            <p className="text-sm mb-2 font-Poppins">
              <strong>Time:</strong> {event?.time || "N/A"}
            </p>
            <p className="text-sm mb-2 font-Poppins">
              <strong>Tickets:</strong>
            </p>

            {/* Ticket Prices */}
<div className="bg-[#694C26] p-4 rounded-lg flex text-sm">
  {[
    { price: "₱100", label: "General Admission" },
    { price: "₱200", label: "Upper Box" },
    { price: "₱300", label: "Lower Box" },
    { price: "₱400", label: "Patron" },
  ].map((ticket, index) => (
    <div key={index} className="flex-1 flex items-center space-x-2 text-left font-Poppins">
      <img src={TigerTicket} alt="Ticket Icon" className="w-6 h-6" />
      <div>
        <p className="font-bold">{ticket.price}</p>
        <p>{ticket.label}</p>
      </div>
    </div>
  ))}
</div>


            {/* Login Message */}
            <p className="text-center font-Poppins mt-4 text-sm">
              To reserve or view availability, please login{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default navigation behavior
                  toggleLoginPopup(); // Toggle the login popup
                }}
                className="text-[#F09C32] hover:underline"
              >
                here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event_Ticketed;
