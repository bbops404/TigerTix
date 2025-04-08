import React from "react";
import { useNavigate } from "react-router-dom";
import { formatImageUrl, handleImageError } from "../utils/imageUtils"; // Import utilities

function EventCard({ image, name, location, date, time, buttonText, link }) {
  console.log("EventCard Image:", image); // Log the image prop

  const navigate = useNavigate();

  const handleCardClick = () => {
    if (link) {
      console.log("Navigating to:", link); // Log the link to verify
      navigate(link); // Navigate to the provided link
    }
  };

  // Format the image URL using the utility function
  const formattedImage = formatImageUrl(image);
  console.log("Formatted Image URL:", formattedImage); // Log the formatted URL
  return (
    <div
      className="text-white font-Poppins flex flex-col items-center text-center cursor-pointer"
      onClick={handleCardClick} // Navigate when the card is clicked
    >
      <div
        className="w-[400px] h-[500px] bg-gray-300 bg-cover bg-center rounded-lg shadow-md"
        style={{ backgroundImage: `url(${formattedImage})` }}
      >
        {/* Handle image errors */}
        <img
          src={formattedImage}
          alt={name}
          className="hidden" // Hide the actual image element (used for error handling)
          onError={(e) => handleImageError(e, "Image not available")}
        />
      </div>
      <p className="text-lg font-bold pt-2">{name}</p>
      <p className="text-sm text-gray-400 font-light">{location}</p>
      <div className="bg-white text-black text-xs font-bold py-1 px-2 min-w-[280px] rounded-2xl my-1">
        {date} | {time}
      </div>
      <button
        className="bg-[#F09C32] text-black text-sm mt-[10px] font-bold py-2 px-5 rounded-2xl min-w-[300px] uppercase transition-transform duration-200 hover:bg-[#d58527] hover:scale-105"
        onClick={(e) => {
          e.stopPropagation(); // Prevent the card's onClick from triggering
          handleCardClick(); // Navigate to the link
        }}
      >
        {buttonText}
      </button>
    </div>
  );
}

export default EventCard;