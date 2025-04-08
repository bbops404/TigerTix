import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoNotifications } from "react-icons/io5";
import { formatImageUrl, handleImageError } from "../utils/imageUtils";

function EventCardEndUser({
  image,
  name,
  location,
  date,
  time,
  buttonText,
  link,
}) {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(true);

  // Add state tracking for image loading and errors
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Format the image URL properly
  const formattedImageUrl = image ? formatImageUrl(image) : null;

  // Log the original and formatted URLs for debugging
  useEffect(() => {
    if (image) {
      console.log("Original image URL:", image);
      console.log("Formatted image URL:", formattedImageUrl);
    }
  }, [image, formattedImageUrl]);

  // Fallback image if none is provided
  const defaultImage = "/src/assets/tigertix_logo.png";

  // Reset image states when the image prop changes
  useEffect(() => {
    if (image) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [image]);

  const handleCardClick = () => {
    if (link) {
      console.log("Navigating to:", link);
      navigate(link);
    }
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (link) {
      navigate(link);
    }
  };

  const handleImageLoad = () => {
    console.log("Image loaded successfully:", formattedImageUrl);
    setImageLoaded(true);
    setImageError(false);
  };

  const handleLocalImageError = (e) => {
    console.error("Image failed to load:", e.target.src);
    setImageError(true);
    setImageLoaded(false);

    // Try with a modified URL if it contains '/api/uploads/'
    const originalSrc = e.target.src;
    if (originalSrc.includes("/api/uploads/")) {
      console.log("Attempting to fix image URL...");
      const fixedSrc = originalSrc.replace("/api/uploads/", "/uploads/");
      console.log("Modified URL:", fixedSrc);

      // Only change the src if it's different
      if (fixedSrc !== originalSrc) {
        e.target.src = fixedSrc;
        return; // Exit early to let the new src attempt to load
      }
    }

    // If we get here, either the URL didn't need fixing or fixing didn't help
    // Hide the broken image and show a placeholder
    e.target.style.display = "none";

    const container = e.target.parentNode;
    if (!container.querySelector(".image-placeholder")) {
      const placeholder = document.createElement("div");
      placeholder.className =
        "w-full h-full bg-gray-700 flex items-center justify-center text-white image-placeholder";
      placeholder.innerHTML = `<span class="text-center">${
        name || "Image not available"
      }</span>`;
      container.appendChild(placeholder);
    }
  };

  return (
    <div
      className="text-white font-Poppins flex flex-col items-center text-center relative cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image container - using proper image handling instead of background-image */}
      <div className="w-[400px] h-[500px] bg-gray-700 rounded-lg shadow-md relative overflow-hidden">
        {formattedImageUrl ? (
          <img
            src={formattedImageUrl}
            alt={name}
            style={{ backgroundColor: "yellow" }}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleLocalImageError}
          />
        ) : (
          <img
            src={defaultImage}
            alt={name || "Event"}
            className="w-full h-full object-contain p-4"
            onLoad={handleImageLoad}
            onError={handleLocalImageError}
          />
        )}
      </div>

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
            onClick={(e) => {
              e.stopPropagation();
              setNotification(false);
            }}
          >
            <IoNotifications className="text-xl text-[#F09C32]" />
          </button>
        )}
      </div>

      <button
        className="bg-[#F09C32] text-black text-sm mt-1 font-bold py-2 px-5 rounded-2xl min-w-[300px] uppercase transition-transform duration-200 hover:bg-[#d58527] hover:scale-105"
        onClick={handleButtonClick}
      >
        {buttonText}
      </button>
    </div>
  );
}

export default EventCardEndUser;
