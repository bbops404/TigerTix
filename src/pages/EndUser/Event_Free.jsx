import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For back navigation
import Header from "../../components/Header";
import LoginPopup from "./LoginPopup";

const Event_Free = () => {
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

      <div className="flex justify-center items-center p-4 mt-16">
        <div className="text-white p-6 flex max-w-4xl w-full rounded-lg">
          {/* Left Image Placeholder */}
          <div className="bg-gray-300 w-1/2 h-180 rounded-lg"></div>

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

            {/* Login Message */}
            <p className="text-center font-bold font-Poppins mt-4 text-sm">
              To be notified for free events, please login{" "}
              <a href="#" onClick={toggleLoginPopup} className="text-[#F09C32]">
                here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event_Free;