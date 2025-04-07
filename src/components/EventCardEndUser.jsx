import React, { useState } from "react";
import { IoNotifications } from "react-icons/io5";

function EventCardEndUser({
  image,
  name,
  location,
  date,
  time,
  buttonText,
  onClick, // Accept onClick as a prop
}) {
  const [notification, setNotification] = useState(true);

  return (
    <div className="text-white font-Poppins flex flex-col items-center text-center relative">
      <div
        className="w-[400px] h-[500px] bg-[#F09C32] bg-cover bg-center rounded-lg shadow-md"
        style={{ backgroundImage: `url(${image})` }}
      ></div>
      <p className="text-lg font-bold pt-2 pb-0 mb-0">{name}</p>
      <p className="text-sm text-gray-400 font-light">{location}</p>

      {/* Container for date | time and notification button */}
      <div className="flex items-center justify-between min-w-[300px] mt-0 mb-2">
        <div className="bg-white text-black text-xs font-bold py-1 px-2 rounded-2xl w-full text-center">
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
        className="bg-[#F09C32] text-black text-sm mt-1 font-bold py-2 px-5 rounded-2xl min-w-[300px] uppercase transition-transform duration-200 hover:bg-[#d58527] hover:scale-105 hover:text-white"
        onClick={onClick} // Use the onClick prop here
      >
        {buttonText}
      </button>
    </div>
  );
}

export default EventCardEndUser;