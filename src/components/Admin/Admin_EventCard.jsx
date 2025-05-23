import React, { useState, useRef, useEffect } from "react";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaTimesCircle,
  FaEye,
  FaPencilAlt,
  FaTicketAlt,
  FaClock,
} from "react-icons/fa";
import { formatImageUrl, handleImageError } from "../../utils/imageUtils";

const Admin_EventCard = ({
  event,
  onEdit,
  onDelete,
  onViewDetails,
  onUnpublish,
  onOpenReservation,
  onCloseReservation,
  onPublishNow,
  onNavigateToEdit,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Event name reference
  const eventNameRef = useRef(null);

  // State to track if image loaded successfully
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const formattedImageUrl = event.imagePreview
    ? formatImageUrl(event.imagePreview)
    : null;

  useEffect(() => {
    // Reset image states when event changes
    if (event.imagePreview) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [event.imagePreview]);

  // Check if the event name is too long and needs animation
  useEffect(() => {
    if (eventNameRef.current) {
      const element = eventNameRef.current;
      // This effect now just captures the ref for potential future use
    }
  }, [event.eventName]);

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

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleLocalImageError = (e) => {
    setImageError(true);
    setImageLoaded(false);

    // Use the shared error handler
    handleImageError(e, "Image Error");
  };

  // Helper function to check if this is a future scheduled event
  const isFutureScheduledEvent = () => {
    if (
      event.status === "scheduled" &&
      event.visibility === "unpublished" &&
      event.display_start_date &&
      event.display_start_time
    ) {
      const now = new Date();
      const displayStartDate = new Date(
        `${event.display_start_date}T${event.display_start_time}`
      );
      return displayStartDate > now;
    }
    return false;
  };

  // Helper function to check if event has passed (either event date or reservation end date)
  const hasEventPassed = () => {
    const now = new Date();
    if (event.reservation_end_date && event.reservation_end_time) {
      const reservationEndDateTime = new Date(
        `${event.reservation_end_date}T${event.reservation_end_time}`
      );
      if (reservationEndDateTime < now) return true;
    }
    // Check if event date has passed
    if (event.eventDate) {
      const eventDate = new Date(event.eventDate);
      if (eventDate < now) return true;
    }

    // Check if reservation end date has passed

    return false;
  };

  // Determine dropdown menu options based on event status and visibility
  const renderDropdownOptions = () => {
    const { status, visibility, eventType } = event;
    const dropdownItems = [];

    // Common edit actions
    const editActions = [
      {
        icon: <FaEdit className="mr-2 text-custom_yellow" />,
        label: "Edit Event Details",
        action: () => onEdit && onEdit(event.id, "event"),
      },
      {
        icon: <FaTicketAlt className="mr-2 text-custom_yellow" />,
        label: "Edit Ticket Details",
        action: () => onEdit && onEdit(event.id, "ticket"),
      },
      {
        icon: <FaEdit className="mr-2 text-custom_yellow" />,
        label: "Edit Claiming Details",
        action: () => onEdit && onEdit(event.id, "claiming"),
      },
      {
        icon: <FaClock className="mr-2 text-custom_yellow" />,
        label: "Edit Availability",
        action: () => onEdit && onEdit(event.id, "availability"),
      },
    ];

    // Scenario 1: Published and taking reservations (open)
    if (status === "open" && visibility === "published") {
      dropdownItems.push(
        ...editActions.slice(0, 1), // Edit Event Details
        {
          icon: <FaTicketAlt className="mr-2 text-red-400" />,
          label: "Close Reservation",
          action: () => onCloseReservation && onCloseReservation(event.id),
        }
      );
    }
    // Scenario 3: Coming Soon
    else if (eventType === "coming_soon" && visibility === "published") {
      dropdownItems.push({
        icon: <FaEdit className="mr-2 text-green-400" />,
        label: "Edit Event", // Changed from "Publish Event" to "Edit Event"
        action: () => onNavigateToEdit && onNavigateToEdit(event.id, true), // Use new handler for navigation
      });
    }
    // Scenario 2: Published and scheduled (not yet open)
    else if (status === "scheduled" && visibility === "published") {
      dropdownItems.push(
        ...editActions,
        {
          // Edit Event Details

          icon: <FaTicketAlt className="mr-2 text-green-400" />,
          label: "Open Reservation",
          action: () => onOpenReservation && onOpenReservation(event.id),
        },
        {
          icon: <FaEye className="mr-2 text-red-400" />,
          label: "Unpublish",
          action: () => onUnpublish && onUnpublish(event.id),
        }
      );
    }

    // Scenario 4: Closed but still published - ONLY show unpublish option
    else if (status === "closed" && visibility === "published") {
      dropdownItems.push({
        icon: <FaEye className="mr-2 text-red-400" />,
        label: "Unpublish",
        action: () => onUnpublish && onUnpublish(event.id),
      });
    }
    // Scenario 5: Draft
    else if (status === "draft") {
      dropdownItems.push(
        {
          icon: <FaEdit className="mr-2 text-green-400" />,
          label: "Edit Event", // Changed from "Publish" to "Edit Event"
          action: () => onNavigateToEdit && onNavigateToEdit(event.id, false), // Use new handler for navigation
        },
        {
          icon: <FaTrash className="mr-2 text-red-400" />,
          label: "Delete",
          action: () => onDelete && onDelete(event.id),
        }
      );
    }
    // Scenario 7: Unpublished and completed/closed
    else if (visibility === "unpublished" && status === "closed") {
      // Check if event has passed before showing delete (archive) option
      if (hasEventPassed()) {
        dropdownItems.push({
          icon: <FaTrash className="mr-2 text-red-400" />,
          label: "Delete", // This is actually archive (soft delete)
          action: () => onDelete && onDelete(event.id),
        });
      } else {
        // If event hasn't passed yet, show edit options
        dropdownItems.push(...editActions, {
          icon: <FaTrash className="mr-2 text-red-400" />,
          label: "Delete",
          action: () => onDelete && onDelete(event.id),
        });
      }
    }
    // Scenario 6: Unpublished (but will go to published)
    else if (
      visibility === "unpublished" &&
      (eventType === "ticketed" ||
        eventType === "coming_soon" ||
        eventType === "free")
    ) {
      dropdownItems.push({
        icon: <FaEdit className="mr-2 text-green-400" />,
        label: "Edit Event", // Changed from "Publish" to "Edit Event"
        action: () => onNavigateToEdit && onNavigateToEdit(event.id, false), // Use new handler for navigation
      });
    }

    // Scenario 8: Archived
    else if (visibility === "archived") {
      dropdownItems.push({
        icon: <FaTrash className="mr-2 text-red-400" />,
        label: "Delete",
        action: () => onDelete && onDelete(event.id),
      });
    }

    return dropdownItems.map((item, index) => (
      <React.Fragment key={index}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            item.action();
          }}
          className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
        {index < dropdownItems.length - 1 && (
          <div className="border-t border-custom_yellow"></div>
        )}
      </React.Fragment>
    ));
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
        {formattedImageUrl && !imageError ? (
          <img
            src={formattedImageUrl}
            alt={event.eventName || "Event Image"}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleLocalImageError}
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">
            <span className="text-center">
              {imageError ? "Image Error" : "No Image"}
            </span>
          </div>
        )}
      </div>

      {/* Gradient overlay - increased height and modified to properly cover the content */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-3 
        transition-all duration-300 ${isHovered ? "h-full" : "h-2/3"}`}
      >
        {/* Event content positioned at the bottom of the gradient */}
        <div className="absolute bottom-3 left-3 right-3">
          {/* Event Title with sliding effect on hover */}
          <div className="relative overflow-hidden">
            {/* Regular truncated event name (shown when card is not hovered) */}
            {!isHovered && (
              <h3
                className="text-lg font-bold text-white uppercase shadow-md truncate"
                title={event.eventName}
              >
                {event.eventName}
              </h3>
            )}
            
            {/* Animated event name (shown when card is hovered) */}
            {isHovered && (
              <div className="relative">
                <h3
                  ref={eventNameRef}
                  className="text-lg font-bold text-white uppercase shadow-md whitespace-nowrap"
                  style={{
                    animation: "marquee 6s linear infinite", // Faster animation (reduced from 8s)
                    display: "inline-block",
                    paddingRight: "50px" // Add space after text for better readability during animation
                  }}
                >
                  {event.eventName}
                </h3>
              </div>
            )}
            
            {/* Full event name tooltip that appears on hover */}
            {isHovered && (
              <div className="absolute top-0 left-0 transform -translate-y-full bg-black/90 text-white p-2 rounded z-30 shadow-lg max-w-xs">
                {event.eventName}
              </div>
            )}
          </div>

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
              {new Date(event.eventDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              •{" "}
              {new Date(`1970-01-01T${event.startTime}`).toLocaleTimeString(
                "en-US",
                {
                  hour: "numeric",
                  minute: "2-digit",
                }
              )}
              {event.endTime &&
                ` - ${new Date(
                  `1970-01-01T${event.endTime}`
                ).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}`}
            </span>
          </div>

          {/* Venue */}
          <div className="flex items-center text-white text-sm mt-1">
            <FaMapMarkerAlt className="mr-2 text-[#FFAB40] flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>

          {/* View Details Button */}
          <div
            className={`mt-3 mb-0 transition-all duration-300 ${
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

        {/* Dropdown menu with dynamic options based on event state */}
        <div
          ref={dropdownRef}
          className={`absolute left-0 top-10 bg-custom_black rounded-md py-1 shadow-lg z-20 w-48 transform transition-transform origin-top-left ${
            isDropdownOpen ? "block" : "hidden"
          }`}
        >
          {renderDropdownOptions()}
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

      {/* Status badge if not open and not coming soon */}
      {event.status !== "open" && event.eventType !== "coming_soon" && (
        <div
          className={`absolute top-10 right-2 transition-transform duration-300 ${
            isHovered ? "transform translate-y-0" : "opacity-90"
          }`}
        >
          <span
            className={`px-2 py-1 bg-black/70 text-xs rounded hover:bg-black/90 transition-colors ${
              event.status === "scheduled"
                ? "text-yellow-400"
                : event.status === "draft"
                ? "text-blue-400"
                : event.status === "cancelled"
                ? "text-red-400"
                : "text-gray-400"
            }`}
          >
            {event.status.toUpperCase()}
          </span>
        </div>
      )}

      {/* Highlight border effect on hover */}
      <div
        className={`absolute inset-0 pointer-events-none border-2 border-transparent rounded-md transition-colors duration-300 ${
          isHovered ? "border-[#FFAB40]/50" : ""
        }`}
      ></div>
      
      {/* Add marquee animation via inline style with reduced pauses */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            5% { transform: translateX(0); } /* Shorter pause at beginning (reduced from 10%) */
            95% { transform: translateX(calc(-100% + 250px)); } /* Shorter pause at end */
            100% { transform: translateX(calc(-100% + 250px)); }
          }
        `
      }} />
    </div>
  );
};

export default Admin_EventCard;