import React from "react";
import { useNavigate } from "react-router-dom";

function EventCard({ image, name, location, date, time, buttonText, link }) {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <div className="text-white font-Poppins flex flex-col items-center text-center">
      <div
        className="w-[400px] h-[500px] bg-gray-300 bg-cover bg-center rounded-lg shadow-md"
        style={{ backgroundImage: `url(${image})` }} // Fixed syntax
      ></div>
      <p className="text-lg font-bold pt-2">{name}</p>
      <p className="text-sm text-gray-400 font-light">{location}</p>
      <div className="bg-white text-black text-xs font-bold py-1 px-2 min-w-[280px] rounded-2xl my-1">
        {date} | {time}
      </div>
      <button
        className="bg-[#F09C32] text-black text-sm mt-[10px] font-bold py-2 px-5 rounded-2xl min-w-[300px] uppercase transition-transform duration-200 hover:bg-[#d58527] hover:scale-105"
        onClick={handleButtonClick} // Navigate dynamically
      >
        {buttonText}
      </button>
    </div>
  );
}

export default EventCard;
