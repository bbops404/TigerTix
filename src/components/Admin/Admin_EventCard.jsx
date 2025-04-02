import React, { useState, useRef, useEffect } from "react";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaTimesCircle,
} from "react-icons/fa";

const Admin_EventCard = ({
  event,
  onEdit,
  onDelete,
  onViewDetails,
  onUnpublish,
  onCancel,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close the dropdown when mouse leaves the card
  useEffect(() => {
    if (!isHovered && isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  }, [isHovered, isDropdownOpen]);

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div
      className={`rounded-md shadow-md transition-all duration-300 cursor-pointer w-64 h-96 relative overflow-hidden
        ${isHovered ? "shadow-xl transform scale-[1.02]" : ""}
        ${isClicked ? "transform scale-[0.98] shadow-inner" : ""}`}
      onClick={(e) => {
        setIsClicked(true);
        // Reset the click effect after a short delay
        setTimeout(() => setIsClicked(false), 200);
        onViewDetails && onViewDetails(event.id);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Full-card background image */}
      <div className="absolute inset-0 w-full h-full">
        {event.imagePreview ? (
          <img
            src={event.imagePreview}
            alt={event.eventName}
            className={`w-full h-full object-cover transition-transform duration-500 
              ${isHovered ? "transform scale-110" : ""}`}
          />
        ) : (
          <div className="w-full h-full bg-gray-700"></div>
        )}
      </div>

      {/* Gradient overlay at the bottom for text */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 
        transition-all duration-300 ${isHovered ? "h-3/5" : "h-1/2"}`}
      >
        {/* Event Title with truncation */}
        <h3
          className="text-lg font-bold text-white uppercase truncate"
          title={event.eventName}
        >
          {event.eventName}
        </h3>

        {/* Category tag */}
        <div className="mt-1 mb-2">
          <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full">
            {event.eventCategory}
          </span>
        </div>

        {/* Date and Time */}
        <div className="flex items-center text-white text-sm mt-2">
          <FaCalendarAlt className="mr-2 text-[#FFAB40] flex-shrink-0" />
          <span className="truncate">
            {event.eventDate} • {event.startTime}{" "}
            {event.endTime && `- ${event.endTime}`}
          </span>
        </div>

        {/* Venue */}
        <div className="flex items-center text-white text-sm mt-1">
          <FaMapMarkerAlt className="mr-2 text-[#FFAB40] flex-shrink-0" />
          <span className="truncate">{event.venue}</span>
        </div>

        {/* View Details Button */}
        <div
          className={`mt-3 mb-2 transition-all duration-300 ${
            isHovered ? "opacity-100 transform translate-y-0" : "opacity-80"
          }`}
        >
          <button
            className="w-full bg-[#ffa735] text-custom_black py-2 text-sm font-semibold rounded-full hover:bg-[#F59C19] active:bg-[#E08600] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails && onViewDetails(event.id);
            }}
          >
            View Details
          </button>
        </div>
      </div>

      {/* 3-dot menu in the top left */}
      <div
        className={`absolute top-2 left-2 z-20 transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-75"
        }`}
      >
        <button
          onClick={handleDropdownToggle}
          className="p-2 bg-custom_black text-white rounded-full hover:bg-custom_black/80 active:bg-custom_black transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        {/* Dropdown menu with expanded options */}
        <div
          ref={dropdownRef}
          className={`absolute left-0 top-10 bg-custom_black rounded-md py-1 shadow-lg z-20 w-48 transform transition-transform origin-top-left ${
            isDropdownOpen ? "block" : "hidden"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(event.id, "event");
            }}
            className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
          >
            <FaEdit className="mr-2 text-custom_yellow" />
            <span>Edit Event Details</span>
          </button>
          <div className="border-t border-custom_yellow"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(event.id, "ticket");
            }}
            className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
          >
            <FaEdit className="mr-2 text-custom_yellow" />
            <span>Edit Ticket Details</span>
          </button>
          <div className="border-t border-custom_yellow"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(event.id, "claiming");
            }}
            className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
          >
            <FaEdit className="mr-2 text-custom_yellow" />
            <span>Edit Claiming Details</span>
          </button>
          <div className="border-t border-custom_yellow"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(event.id, "availability");
            }}
            className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
          >
            <FaEdit className="mr-2 text-custom_yellow" />
            <span>Edit Availability</span>
          </button>
          <div className="border-t border-custom_yellow"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(event.id);
            }}
            className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
          >
            <FaTrash className="mr-2 text-red-400" />
            <span>Delete</span>
          </button>
          <div className="border-t border-custom_yellow"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnpublish && onUnpublish(event.id);
            }}
            className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
          >
            <FaEdit className="mr-2 text-red-400" />
            <span>Unpublish</span>
          </button>
          <div className="border-t border-custom_yellow"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel && onCancel(event.id);
            }}
            className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
          >
            <FaTimesCircle className="mr-2 text-red-400" />
            <span>Cancel Event</span>
          </button>
        </div>
      </div>

      {/* Event type badge in the top right with hover effect */}
      {event.eventType && (
        <div
          className={`absolute top-2 right-2 transition-transform duration-300 ${
            isHovered ? "transform translate-y-0" : "opacity-90"
          }`}
        >
          {event.eventType === "ticketed" && (
            <span className="px-2 py-1 bg-black/70 text-[#FFAB40] text-xs rounded hover:bg-black/90 transition-colors">
              Ticketed
            </span>
          )}
          {event.eventType === "free" && (
            <span className="px-2 py-1 bg-black/70 text-green-400 text-xs rounded hover:bg-black/90 transition-colors">
              Free
            </span>
          )}
          {event.eventType === "coming_soon" && (
            <span className="px-2 py-1 bg-black/70 text-[#FFAB40] text-xs rounded hover:bg-black/90 transition-colors">
              Coming Soon
            </span>
          )}
        </div>
      )}

      {/* Highlight border effect on hover */}
      <div
        className={`absolute inset-0 pointer-events-none border-2 border-transparent rounded-md transition-colors duration-300 ${
          isHovered ? "border-[#FFAB40]/50" : ""
        }`}
      ></div>
    </div>
  );
};

export default Admin_EventCard;
