import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For back navigation
import Header from "../../components/Header";
import { IoNotifications } from "react-icons/io5";
import { IoChevronBackOutline } from "react-icons/io5";

const Event_Free = () => {
  const [loginPopup, setLoginPopup] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const toggleLoginPopup = () => {
    setLoginPopup(!loginPopup);
  };

  return (
    <div className="bg-[#121212] text-white min-h-screen">
      <Header showSearch={false} showAuthButtons={false} />

      {/* Back Button (Upper Left) */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-[100px] left-4 text-white font-Poppins font-bold"
      >
        <IoChevronBackOutline className="text-3xl" />
      </button>

      <div className="flex justify-center items-center p-4 mt-16">
        <div className="text-white p-6 flex max-w-7xl w-full rounded-lg">
          {/* Left Image Placeholder */}
          <div className="bg-gray-300 min-w-[300px] max-w-[300px] min-h-[450px] max-h-[450px] rounded-lg ml-[50px]"></div>

          {/* Right Content */}
          <div className="w-2/3 pl-6">
            <div className="bg-[#F09C32] text-black font-Poppins font-bold px-4 py-2 rounded-full inline-block mb-4">
              UAAP SEASON 87 MEN’S BASKETBALL
            </div>

            <h2 className="font-bold font-Poppins text-lg mb-2">
              EVENT DETAILS:
            </h2>
            <p className="font-Poppins text-justify text-sm text-gray-300 mb-4">
              Get ready to roar, UST community! The UAAP Season 87 Men's
              Basketball tournament kicks off with a clash of champions, and the
              UST Growling Tigers are set to take center stage at the iconic
              Mall of Asia Arena. Witness the fast-paced action, gravity-defying
              plays, and unyielding determination that make UAAP basketball the
              most thrilling collegiate league in the country. Whether you're
              cheering courtside or from the stands, wear your gold and white
              loud and proud! Together, let's rally behind our team as they
              fight for victory and represent the Thomasian spirit with heart
              and passion.
            </p>

            <hr></hr>

            <p className="text-sm mt-4 mb-2 font-Poppins">
              <strong>Location:</strong> Mall of Asia Arena
            </p>
            <p className="text-sm mb-2 font-Poppins">
              <strong>Time:</strong> 6:00 PM
            </p>
            <p className="text-sm mb-2 font-Poppins">
              <strong>Event Category:</strong> UAAP Game
            </p>

            <hr className="mt-4"></hr>

            <h1 className="font-bold font-Poppins text-lg text-center mt-4">
              Ticket details will be available soon. Stay tuned!
            </h1>

            {/* Be Notified Button */}
            <div className="flex justify-center mt-9">
              <button
                className="font-Poppins bg-black text-[#F09C32] font-bold py-3 px-7 min-w-[300px] 
                rounded-lg inline-block mb-4 uppercase cursor-pointer transition-all transform 
                hover:scale-105 hover:bg-black-600 flex items-center justify-center"
              >
                Be notified!
                <IoNotifications className="text-2xl ml-2 bg-white p-1 rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event_Free;
