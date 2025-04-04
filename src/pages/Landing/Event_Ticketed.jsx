import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For back navigation
import Header from "../../components/Header";
import LoginPopup from "./LoginPopup";
import TigerTicket from "../../assets/TigerTicket.svg"; // Correct import
import { IoChevronBackOutline } from "react-icons/io5";

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
        <IoChevronBackOutline className="text-3xl" />
      </button>

      <div className="flex justify-center items-center p-5 mt-10">
        <div className="text-white p-6 flex max-w-7xl w-full rounded-lg">
          {/* Left Image Placeholder */}
          <div className="bg-gray-300 min-w-[300px] max-w-[300px] min-h-[450px] max-h-[450px] rounded-lg ml-[50px]"></div>

          {/* Right Content */}
          <div className="w-2/3 pl-6">
            <div className="bg-[#F09C32] text-black font-Poppins font-bold px-4 py-2 rounded-lg inline-block mb-4">
              UAAP SEASON 87 MEN’S BASKETBALL
            </div>

            <h2 className="font-bold font-Poppins text-lg mb-2">EVENT DETAILS:</h2>
            <p className="font-Poppins text-justify text-sm text-gray-300 mb-4">
              Get ready to ignite the pride as we mark the beginning of another electrifying
              season of the University Athletic Association of the Philippines! UAAP Season 87
              Kickoff is here to celebrate the spirit of sportsmanship, excellence, and camaraderie
              among the finest student-athletes from across the league.
              <br />
              <br />
              Experience an unforgettable opening ceremony packed with high-energy performances,
              inspiring messages, and a vibrant parade of teams, each showcasing their university's
              unique colors and culture. This year’s theme, "Elevating Excellence, Uniting Passion,"
              reflects the dedication and resilience of the UAAP community in its pursuit of
              greatness on and off the field.
              <br />
              <br />
              Be part of the action as we introduce this season's host school, unveil exciting new
              initiatives, and officially begin the much-awaited competition. Join us in cheering
              for your favorite teams and athletes as they embark on their journey to glory!
              <br />
              <br />
              Let’s show the world what it means to embody school pride and unity. See you there!
            </p>

            <p className="text-sm mb-2 font-Poppins">
              <strong>Location:</strong> Mall of Asia Arena
            </p>
            <p className="text-sm mb-2 font-Poppins">
              <strong>Time:</strong> 6:00 PM
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
              <a href="#" onClick={toggleLoginPopup} className="text-[#F09C32] hover:underline">
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
