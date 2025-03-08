import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoNotifications } from "react-icons/io5";

function EventCardEndUser({ image, name, location, date, time, buttonText, link }) {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(true);

  const handleButtonClick = () => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <div className="text-white font-Poppins flex flex-col items-center text-center relative">
      <div
        className="w-[400px] h-[500px] bg-gray-300 bg-cover bg-center rounded-lg shadow-md"
        style={{ backgroundImage: `url(${image})` }}
      ></div>
      <p className="text-lg font-bold my-1">{name}</p>
      <p className="text-sm text-gray-400 font-light">{location}</p>

      {/* Container for date | time and notification button */}
      <div className="flex items-center justify-between min-w-[300px] my-1">
        <div className="bg-white text-black text-xs font-bold py-1 px-4 rounded-2xl w-full text-center">
          {date} | {time}
        </div>
        {/* Notification Button */}
        {notification && (
          <button
            className="bg-white p-1 rounded-full transition-transform duration-200 hover:bg-gray-200 hover:scale-105 ml-1"
            onClick={() => setNotification(true)}
          >
            <IoNotifications className="text-xl text-[#F09C32]" />
          </button>
        )}
      </div>

      <button
        className="bg-[#F09C32] text-black text-sm font-bold py-2 px-5 rounded-2xl min-w-[300px] uppercase transition-transform duration-200 hover:bg-[#d58527] hover:scale-105"
        onClick={handleButtonClick}
      >
        {buttonText}
      </button>
    </div>
  );
}

export default EventCardEndUser;