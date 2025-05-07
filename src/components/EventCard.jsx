import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatImageUrl, handleImageError } from "../utils/imageUtils";

function EventCard({ image, name, location, date, time, buttonText, link }) {
  console.log("EventCard Image:", image); // Log the image prop

  const navigate = useNavigate();

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

  // Format date to be more readable (e.g., "April 10")
  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      // Check if the date is in ISO format or other common formats
      let dateObj;

      if (dateString.includes("-") || dateString.includes("/")) {
        // Try to parse as a date string (YYYY-MM-DD or MM/DD/YYYY)
        dateObj = new Date(dateString);
      } else {
        // If it's already a formatted string like "April 10", just return it
        return dateString;
      }

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.log("Invalid date:", dateString);
        return dateString;
      }

      // Format as "Month Day"
      const options = { month: "long", day: "numeric" };
      return dateObj.toLocaleDateString("en-US", options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Format time to include AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return "";

    try {
      // If the time already has AM/PM, return it
      if (
        timeString.includes("AM") ||
        timeString.includes("PM") ||
        timeString.includes("am") ||
        timeString.includes("pm")
      ) {
        return timeString;
      }

      // Handle 24-hour format (HH:MM)
      if (timeString.includes(":")) {
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours, 10);

        if (hour >= 0 && hour <= 23) {
          const period = hour >= 12 ? "PM" : "AM";
          const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
          return `${hour12}:${minutes} ${period}`;
        }
      }

      // If we can't parse it, return the original
      return timeString;
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  // Format date and time
  const formattedDate = formatDate(date);
  const formattedTime = formatTime(time);

  const handleCardClick = () => {
    if (link) {
      console.log("Navigating to:", link);
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
      className="text-white font-Poppins flex flex-col items-center text-center cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image container - make sure it's a relative positioned container */}
      <div className="w-[400px] h-[500px] bg-gray-700 rounded-lg shadow-md relative overflow-hidden">
        {formattedImageUrl ? (
          <img
            src={formattedImageUrl}
            alt={name}
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

      {/* Event details */}
      <p className="text-lg font-bold pt-2">{name}</p>
      <p className="text-sm text-gray-400 font-light">{location}</p>
      <div className="bg-white text-black text-xs font-bold py-1 px-2 min-w-[280px] rounded-2xl my-1">
        {formattedDate} | {formattedTime}
      </div>
      <button
        className="bg-[#F09C32] text-black text-sm mt-[10px] font-bold py-2 px-5 rounded-2xl min-w-[300px] uppercase transition-transform duration-200 hover:bg-[#d58527] hover:scale-105"
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick();
        }}
      >
        {buttonText}
      </button>
    </div>
  );
}

export default EventCard;
