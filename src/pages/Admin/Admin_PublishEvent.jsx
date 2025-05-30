import React, { useState, useRef, useEffect } from "react";
import Sidebar_Admin from "../../components/Admin/SideBar_Admin";
import Header_Admin from "../../components/Admin/Header_Admin";
import {
  PlusIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
  InfoIcon,
  AlertCircleIcon,
  MapIcon,
  EyeIcon,
  CheckCircleIcon,
  CalendarIcon,
} from "lucide-react";

const formatImageUrl = (imageUrl) => {
  const API_URL = import.meta.env.VITE_API_URL;

  if (!imageUrl) return null;

  // If the URL is already absolute (with http), return it as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Handle both /api/uploads and /uploads paths consistently
  let formattedUrl = imageUrl;

  // If path includes /api/uploads, remove the /api prefix
  if (formattedUrl.startsWith("/api/uploads/")) {
    formattedUrl = formattedUrl.replace("/api/uploads/", "/uploads/");
  }

  // If path doesn't start with /, add it
  if (!formattedUrl.startsWith("/")) {
    formattedUrl = `/${formattedUrl}`;
  }

  // Remove trailing slash from API_URL if it exists
  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;

  return `${baseUrl}${formattedUrl}`;
};

// Modified EventDetails component with updated event types and validation
const EventDetails = ({ onNext, initialData }) => {
  useEffect(() => {
    console.log("EventDetails component received initialData:", initialData);
    // Check if initialData has what we need
    if (initialData) {
      if (initialData.eventName) setEventName(initialData.eventName);
      if (initialData.eventDescription)
        setEventDescription(initialData.eventDescription);
      if (initialData.eventDate) setEventDate(initialData.eventDate);
      if (initialData.venue) {
        // Check if venue is in the predefined options
        if (venueOptions.includes(initialData.venue)) {
          setVenue(initialData.venue);
        } else {
          // If not, set it as "Others" and put the value in customVenue
          setVenue("Others");
          setCustomVenue(initialData.venue);
        }
      }
      if (initialData.startTime) setStartTime(initialData.startTime);
      if (initialData.endTime) setEndTime(initialData.endTime);
      if (initialData.eventCategory)
        setEventCategory(initialData.eventCategory);
      if (initialData.eventType) setEventType(initialData.eventType);
      if (initialData.imagePreview) setImagePreview(initialData.imagePreview);
      if (initialData.venueMapPreview) setVenueMapPreview(initialData.venueMapPreview);
    }
  }, [initialData]);
  
  const [eventName, setEventName] = useState(initialData?.eventName || "");
  const [eventDescription, setEventDescription] = useState(
    initialData?.eventDescription || ""
  );
  const [eventDate, setEventDate] = useState(initialData?.eventDate || "");
  const [venue, setVenue] = useState(initialData?.venue || "");
  const [customVenue, setCustomVenue] = useState("");
  const [startTime, setStartTime] = useState(initialData?.startTime || "");
  const [endTime, setEndTime] = useState(initialData?.endTime || ""); // End time is optional
  const [eventCategory, setEventCategory] = useState(
    initialData?.eventCategory || ""
  );
  const [eventType, setEventType] = useState(
    initialData?.eventType || "ticketed"
  );
  const [eventImage, setEventImage] = useState(initialData?.eventImage || null);
  const [imagePreview, setImagePreview] = useState(
    initialData?.imagePreview ? formatImageUrl(initialData.imagePreview) : null
  );
  const [venueMap, setVenueMap] = useState(initialData?.venueMap || null);
  const [venueMapPreview, setVenueMapPreview] = useState(
    initialData?.venueMapPreview ? formatImageUrl(initialData.venueMapPreview) : null
  );
  const [venueMapS3Key, setVenueMapS3Key] = useState(initialData?.venueMapS3Key || null);
  const [mapImage, setMapImage] = useState(initialData?.mapImage || null);
  const [errors, setErrors] = useState({});
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [showMapPreview, setShowMapPreview] = useState(false);
  const fileInputRef = useRef(null);
  const mapInputRef = useRef(null);
  const venueInputRef = useRef(null);

  // Define today at component level so it's available throughout the component
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  // Venue suggestions array
  const venueOptions = [
    "MOA Arena",
    "Smart Araneta Coliseum",
    "UST Quadricentennial Pavilion",
    "UST Gymnasium", 
    "UST Main Building",
    "UST Tan Yan Kee Student Center",
    "UST Plaza Mayor",
    "Others"
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventImage(file);

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMapUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // If there's an existing map, we should delete it from S3
      if (venueMap && venueMapS3Key) {
        // Call the delete endpoint
        eventService.deleteVenueMap(venueMapS3Key)
          .then(response => {
            console.log("Old venue map deleted successfully");
          })
          .catch(error => {
            console.error("Error deleting old venue map:", error);
          });
      }

      setVenueMap(file);

      // Create map preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result;
        setVenueMapPreview(preview);
        setMapImage(preview);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleMapUploadButtonClick = () => {
    mapInputRef.current.click();
  };

  const handleReplaceImageClick = () => {
    fileInputRef.current.click();
  };

  const handlePreviewMap = () => {
    if (venueMapPreview) {
      setShowMapPreview(true);
    }
  };

  const handleClosePreview = () => {
    setShowMapPreview(false);
  };

  const handleVenueChange = (e) => {
    const selectedVenue = e.target.value;
    setVenue(selectedVenue);
    
    // If it's not "Others", clear the custom venue
    if (selectedVenue !== "Others") {
      setCustomVenue("");
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!eventName.trim()) newErrors.eventName = "Event name is required";
    if (!eventDescription.trim())
      newErrors.eventDescription = "Event description is required";

    // Enhanced date validation
    if (!eventDate) {
      newErrors.eventDate = "Event date is required";
    } else {
      const selectedDate = new Date(eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

      if (selectedDate < today) {
        newErrors.eventDate = "Event date must be today or in the future";
      }
    }

    // Venue validation - check if a venue is selected and if it's "Others", ensure custom venue is filled
    if (venue === "") {
      newErrors.venue = "Venue is required";
    } else if (venue === "Others" && !customVenue.trim()) {
      newErrors.customVenue = "Please specify the venue";
    }
    
    if (!startTime) newErrors.startTime = "Start time is required";
    if (!eventCategory) newErrors.eventCategory = "Category is required";
    // End time is optional, so no validation needed

    // Validate time if both start and end time are provided
    if (startTime && endTime && startTime >= endTime) {
      newErrors.timeRange = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      // Collect event details data
      const eventDetailsData = {
        eventName,
        eventDescription,
        eventDate,
        venue: venue === "Others" ? customVenue : venue, // Use custom venue if "Others" is selected
        startTime,
        endTime,
        eventCategory,
        eventType,
        eventImage,
        imagePreview,
        venueMap,
        venueMapPreview,
        venueMapS3Key,
        mapImage
      };

      // Pass data to parent
      onNext(eventDetailsData);
    } else {
      // Scroll to the top to show errors
      window.scrollTo(0, 0);
    }
  };

  return (
    <div>
      <p className="text-[#FFAB40] text-3xl font-semibold mb-2">Add an Event</p>
      <p className="text-[13px] text-[#B8B8B8] mb-4">
        Create a new event for the reservation system by filling out the
        necessary details. Ensure all information is accurate before saving.
      </p>

      {Object.keys(errors).length > 0 && (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4">
          <div className="flex items-center text-red-500 mb-2">
            <AlertCircleIcon className="h-5 w-5 mr-2" />
            <p className="font-semibold">Please fix the following errors:</p>
          </div>
          <ul className="list-disc pl-10 text-sm text-red-400">
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <hr className="border-t border-gray-600 my-4" />

      <div className="grid grid-cols-2 gap-1 items-start">
        <div className="bg-[#FFAB40] w-8/12 h-[450px] rounded-xl flex items-center justify-center relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
          />
          {imagePreview ? (
            <div 
              className="relative w-full h-full group"
              onMouseEnter={() => setIsImageHovered(true)}
              onMouseLeave={() => setIsImageHovered(false)}
            >
              <img
                src={imagePreview}
                alt="Event"
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  console.warn(`Image preview failed to load: ${imagePreview}`);
                  setImagePreview(null); // Reset on error
                }}
              />
              {isImageHovered && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center transition-opacity duration-200">
                  <button
                    onClick={handleReplaceImageClick}
                    className="bg-[#FFAB40] text-[#2E2E2E] text-sm font-semibold py-2 px-4 rounded-full hover:bg-[#FF9800] transition-colors duration-200"
                  >
                    Replace Image
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleUploadButtonClick}
              className={`bg-[#2E2E2E] text-[#FFAB40] text-sm font-semibold py-2 px-4 rounded-full ${
                errors.image ? "border-2 border-red-500" : ""
              }`}
            >
              Upload Image
            </button>
          )}
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Event Name:</p>
            <input
              type="text"
              placeholder="Enter Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className={`w-full bg-[#1E1E1E] border ${
                errors.eventName ? "border-red-500" : "border-[#333333]"
              } text-white rounded px-2 py-1.5 text-sm`}
            />
          </div>
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Event Description:</p>
            <textarea
              placeholder="Enter Event Description"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className={`w-full bg-[#1E1E1E] border ${
                errors.eventDescription ? "border-red-500" : "border-[#333333]"
              } text-white rounded px-2 py-1.5 text-sm h-20 resize-none`}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[#FFAB40] text-sm mb-1">Event Date:</p>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} // Set minimum date to today
                className={`w-full bg-[#1E1E1E] border ${
                  errors.eventDate ? "border-red-500" : "border-[#333333]"
                } text-white rounded px-2 py-1.5 text-sm`}
              />
              {errors.eventDate && (
                <p className="text-red-500 text-xs mt-1">
                  <AlertCircleIcon className="h-3 w-3 inline mr-1" />
                  {errors.eventDate}
                </p>
              )}
            </div>
            <div className="relative">
              <p className="text-[#FFAB40] text-sm mb-1">Event Venue:</p>
              <select
                value={venue}
                onChange={handleVenueChange}
                className={`w-full bg-[#1E1E1E] border ${
                  errors.venue ? "border-red-500" : "border-[#333333]"
                } text-white rounded px-2 py-1.5 text-sm`}
              >
                <option value="">Select Venue</option>
                {venueOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {venue === "Others" && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Enter venue name"
                    value={customVenue}
                    onChange={(e) => setCustomVenue(e.target.value)}
                    className={`w-full bg-[#1E1E1E] border ${
                      errors.customVenue ? "border-red-500" : "border-[#333333]"
                    } text-white rounded px-2 py-1.5 text-sm`}
                  />
                  {errors.customVenue && (
                    <p className="text-red-500 text-xs mt-1">
                      <AlertCircleIcon className="h-3 w-3 inline mr-1" />
                      {errors.customVenue}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Venue Map Upload Section */}
          {venue && (
            <div>
              <p className="text-[#FFAB40] text-sm mb-1">Venue Map (Optional):</p>
              <div className="bg-[#2A2A2A] border border-[#333333] rounded-lg p-3">
                <input
                  type="file"
                  ref={mapInputRef}
                  onChange={handleMapUpload}
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                />
                
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={handleMapUploadButtonClick}
                      className="bg-[#FFAB40] text-[#2E2E2E] text-xs font-semibold py-2 px-4 rounded-full hover:bg-[#FF9800] transition-colors duration-200 flex-1"
                    >
                      {venueMap ? 'Replace Map' : 'Upload Map'}
                    </button>
                    
                    {venueMapPreview && (
                      <button
                        onClick={handlePreviewMap}
                        className="bg-[#333333] text-white text-xs font-semibold py-2 px-4 rounded-full hover:bg-[#444444] transition-colors duration-200 flex-1"
                      >
                        Preview Map
                      </button>
                    )}
                  </div>
                  
                  {venueMap && (
                    <div className="text-[#B8B8B8] text-xs bg-[#1E1E1E] rounded px-2 py-1">
                      <span className="text-[#FFAB40]">✓</span> Map uploaded: {venueMap.name}
                    </div>
                  )}
                </div>
                
            
              </div>
            </div>
          )}

          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Time of Event:</p>
            <div className="flex space-x-2 items-center">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`w-full bg-[#1E1E1E] border ${
                  errors.startTime ? "border-red-500" : "border-[#333333]"
                } text-white rounded px-2 py-1.5 text-sm`}
              />
              <p className="text-white text-sm">to</p>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-2 py-1.5 text-sm"
                placeholder="Optional"
              />
            </div>
            <p className="text-[#B8B8B8] text-xs mt-1">End time is optional</p>
            {errors.timeRange && (
              <p className="text-red-500 text-xs mt-1">
                <AlertCircleIcon className="h-3 w-3 inline mr-1" />
                {errors.timeRange}
              </p>
            )}
          </div>
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Category:</p>
            <select
              value={eventCategory}
              onChange={(e) => setEventCategory(e.target.value)}
              className={`w-full bg-[#1E1E1E] border ${
                errors.eventCategory ? "border-red-500" : "border-[#333333]"
              } text-white rounded px-2 py-1.5 text-sm`}
            >
              <option value="">Select Category</option>
              <option value="IPEA Event">IPEA Event</option>
              <option value="UAAP">UAAP</option>
            </select>
          </div>
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Event Type:</p>
            <div className="flex space-x-4 flex-wrap justify-evenly">
              <label className="inline-flex items-center mb-2">
                <input
                  type="radio"
                  value="ticketed"
                  checked={eventType === "ticketed"}
                  onChange={() => setEventType("ticketed")}
                  className="form-radio bg-[#1E1E1E] border-[#333333] text-white"
                />
                <span className="ml-2 text-white text-sm">Ticketed Event</span>
              </label>
              <label className="inline-flex items-center mb-2">
                <input
                  type="radio"
                  value="coming_soon"
                  checked={eventType === "coming_soon"}
                  onChange={() => setEventType("coming_soon")}
                  className="form-radio bg-[#1E1E1E] border-[#333333] text-white"
                />
                <span className="ml-2 text-white text-sm">Coming Soon</span>
              </label>
              <label className="inline-flex items-center mb-2">
                <input
                  type="radio"
                  value="free"
                  checked={eventType === "free"}
                  onChange={() => setEventType("free")}
                  className="form-radio bg-[#1E1E1E] border-[#333333] text-white"
                />
                <span className="ml-2 text-white text-sm">
                  Free/Promotional
                </span>
              </label>
            </div>

            {eventType === "coming_soon" && (
              <div className="mt-2 p-2 bg-[#2A2A2A] rounded border border-[#FFAB40] text-xs text-[#B8B8B8]">
                <p className="flex items-center">
                  <InfoIcon className="h-3 w-3 mr-1 text-[#FFAB40]" /> "Coming
                  Soon" events will be displayed with minimal details and a
                  "Coming Soon" tag.
                </p>
              </div>
            )}

            {eventType === "free" && (
              <div className="mt-2 p-2 bg-[#2A2A2A] rounded border border-[#FFAB40] text-xs text-[#B8B8B8]">
                <p className="flex items-center">
                  <InfoIcon className="h-3 w-3 mr-1 text-[#FFAB40]" />{" "}
                  Free/Promotional events are for display only with no ticket
                  cost.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden button for parent component to trigger submit */}
      <button className="hidden event-submit-button" onClick={handleSubmit} />

      {/* Map Preview Popup */}
      {showMapPreview && venueMapPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={handleClosePreview}>
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={handleClosePreview}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors duration-200 z-10"
            >
              ×
            </button>
            <img
              src={venueMapPreview}
              alt="Venue Map Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                console.warn(`Map preview failed to load: ${venueMapPreview}`);
                setShowMapPreview(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
// Modified TicketDetails component with validation

const TicketDetails = ({ onBack, onNext, eventType, initialData }) => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [venueMapPreview, setVenueMapPreview] = useState(initialData?.mapImage || null);

  useEffect(() => {
    console.log("TicketDetails component received initialData:", initialData);

    if (initialData) {
      // Set tier type if available
      if (initialData.tierType) {
        setTierType(initialData.tierType);
      }

      // For free events, initialize free seating data
      if (eventType === "free" && initialData.freeSeating) {
        setFreeSeatingTickets(
          initialData.freeSeating.numberOfTickets?.toString() || ""
        );
        setFreeSeatingMaxPerPerson(
          initialData.freeSeating.maxPerPerson?.toString() || ""
        );
        // Price is always 0 for free events
      }

      // For ticketed events with free seating
      else if (
        initialData.tierType === "freeSeating" &&
        initialData.freeSeating
      ) {
        setFreeSeatingTickets(
          initialData.freeSeating.numberOfTickets?.toString() || ""
        );
        setFreeSeatingPrice(initialData.freeSeating.price?.toString() || "");
        setFreeSeatingMaxPerPerson(
          initialData.freeSeating.maxPerPerson?.toString() || ""
        );
      }

      // For ticketed events with multiple tiers
      else if (initialData.ticketTiers) {
        setIncludeTiers(true);
        setTicketTiers(initialData.ticketTiers);

        // Calculate total tickets
        const total = Object.values(initialData.ticketTiers).reduce(
          (sum, tier) =>
            sum + (tier.checked && tier.number ? parseInt(tier.number) : 0),
          0
        );
        setTotalTickets(total);
      }

      // Set the "include tiers" for coming soon events
      if (eventType === "coming_soon") {
        setIncludeTiers(initialData.hasTierInfo || false);
      }
    }
  }, [initialData, eventType]);

  const [totalTickets, setTotalTickets] = useState(0);
  const [tierType, setTierType] = useState(
    initialData?.tierType || "freeSeating"
  );
  const [includeTiers, setIncludeTiers] = useState(
    initialData?.hasTierInfo || false
  );
  const [errors, setErrors] = useState({});

  // Free seating specific fields
  const [freeSeatingTickets, setFreeSeatingTickets] = useState(
    initialData?.freeSeating?.numberOfTickets
      ? initialData.freeSeating.numberOfTickets.toString()
      : ""
  );
  const [freeSeatingPrice, setFreeSeatingPrice] = useState(
    initialData?.freeSeating?.price
      ? initialData.freeSeating.price.toString()
      : ""
  );
  const [freeSeatingMaxPerPerson, setFreeSeatingMaxPerPerson] = useState(
    initialData?.freeSeating?.maxPerPerson
      ? initialData.freeSeating.maxPerPerson.toString()
      : ""
  );
    // Check if map data exists
    const hasMapData = initialData?.mapImage || initialData?.mapData;

    // Map Modal Component
    const MapModal = () => {
      if (!showMapModal) return null;
  
      return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E1E1E] rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-600">
              <h3 className="text-white text-xl font-semibold">Event Venue Map</h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-100px)]">
              {venueMapPreview ? (
                <img 
                  src={venueMapPreview} 
                  alt="Venue Map" 
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p>No map data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

  // Initialize ticket tiers
  const defaultTiers = {
    "General Admission": {
      number: "",
      price: "",
      maxPerPerson: "",
      checked: false,
      isEditing: false,
    },
    "Upper Box": {
      number: "",
      price: "",
      maxPerPerson: "",
      checked: false,
      isEditing: false,
    },
    "Lower Box": {
      number: "",
      price: "",
      maxPerPerson: "",
      checked: false,
      isEditing: false,
    },
    Patron: {
      number: "",
      price: "",
      maxPerPerson: "",
      checked: false,
      isEditing: false,
    },
    VIP: {
      number: "",
      price: "",
      maxPerPerson: "",
      checked: false,
      isEditing: false,
    },
  };

  // Setup initial ticket tiers from initialData if available
  const [ticketTiers, setTicketTiers] = useState(() => {
    if (initialData?.ticketTiers) {
      return initialData.ticketTiers;
    }
    return defaultTiers;
  });

  const [editingTierName, setEditingTierName] = useState("");

  // Recalculate total tickets when component mounts
  useEffect(() => {
    if (tierType === "ticketed") {
      const total = Object.values(ticketTiers).reduce(
        (sum, tier) =>
          sum + (tier.checked && tier.number ? parseInt(tier.number) : 0),
        0
      );
      setTotalTickets(total);
    }
  }, []);

  const handleNumberChange = (tier, value) => {
    // Allow only numbers
    if (value === "" || /^\d*$/.test(value)) {
      const updatedTiers = { ...ticketTiers };
      updatedTiers[tier].number = value;
      setTicketTiers(updatedTiers);

      // Recalculate total tickets
      const total = Object.values(updatedTiers).reduce(
        (sum, tier) =>
          sum + (tier.checked && tier.number ? parseInt(tier.number) : 0),
        0
      );
      setTotalTickets(total);
    }
  };

  const handlePriceChange = (tier, value) => {
    // Allow only numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const updatedTiers = { ...ticketTiers };
      updatedTiers[tier].price = value;
      setTicketTiers(updatedTiers);
    }
  };

  // Handler for max tickets per person
  const handleMaxPerPersonChange = (tier, value) => {
    // Allow only numbers
    if (value === "" || /^\d*$/.test(value)) {
      const updatedTiers = { ...ticketTiers };
      updatedTiers[tier].maxPerPerson = value;
      setTicketTiers(updatedTiers);
    }
  };

  const handleCheckboxChange = (tier, isChecked) => {
    const updatedTiers = { ...ticketTiers };
    updatedTiers[tier].checked = isChecked;

    // Reset fields if unchecked
    if (!isChecked) {
      updatedTiers[tier].number = "";
      updatedTiers[tier].price = "";
      updatedTiers[tier].maxPerPerson = "";
    }

    setTicketTiers(updatedTiers);

    // Recalculate total tickets
    const total = Object.values(updatedTiers).reduce(
      (sum, tier) =>
        sum + (tier.checked && tier.number ? parseInt(tier.number) : 0),
      0
    );
    setTotalTickets(total);
  };

  const addNewTier = () => {
    // Generate a unique tier name
    const baseName = "Custom Tier";
    let newTierName = baseName;
    let counter = 1;
    while (ticketTiers[newTierName]) {
      newTierName = `${baseName} ${counter}`;
      counter++;
    }

    // Add new tier to the state
    setTicketTiers((prevTiers) => ({
      ...prevTiers,
      [newTierName]: {
        number: "",
        price: "",
        maxPerPerson: "",
        checked: false,
        isEditing: false,
      },
    }));
  };

  const deleteTier = (tierToDelete) => {
    // Create a new object without the deleted tier
    const { [tierToDelete]: removedTier, ...remainingTiers } = ticketTiers;

    // Update state and recalculate total tickets
    setTicketTiers(remainingTiers);

    // Recalculate total tickets
    const total = Object.values(remainingTiers).reduce(
      (sum, tier) =>
        sum + (tier.checked && tier.number ? parseInt(tier.number) : 0),
      0
    );
    setTotalTickets(total);
  };

  // FIXED FUNCTIONS FOR TIER NAME EDITING
  const startEditingTierName = (tier) => {
    const updatedTiers = { ...ticketTiers };
    updatedTiers[tier].isEditing = true;
    setTicketTiers(updatedTiers);
    // Initialize the editing name field with the current tier name
    setEditingTierName(tier);
  };

  const saveNewTierName = () => {
    if (!editingTierName || !editingTierName.trim()) return;

    const oldTierName = Object.keys(ticketTiers).find(
      (key) => ticketTiers[key].isEditing
    );

    if (!oldTierName) return;

    // Create a copy of the tier data
    const updatedTiers = { ...ticketTiers };
    const oldTierData = { ...updatedTiers[oldTierName] };

    // Remove the old tier entry
    delete updatedTiers[oldTierName];

    // Add a new entry with the updated name, preserving all other data
    updatedTiers[editingTierName.trim()] = {
      ...oldTierData,
      isEditing: false,
    };

    // Update the state
    setTicketTiers(updatedTiers);
    setEditingTierName("");
  };

  const handleTierNameChange = (newName) => {
    setEditingTierName(newName);
  };

  // Handle free seating tickets change
  const handleFreeSeatingTicketsChange = (value) => {
    // Allow only numbers
    if (value === "" || /^\d*$/.test(value)) {
      setFreeSeatingTickets(value);
    }
  };

  // Handle free seating price change
  const handleFreeSeatingPriceChange = (value) => {
    // Allow only numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFreeSeatingPrice(value);
    }
  };

  // Handle free seating max per person change
  const handleFreeSeatingMaxPerPersonChange = (value) => {
    // Allow only numbers
    if (value === "" || /^\d*$/.test(value)) {
      setFreeSeatingMaxPerPerson(value);
    }
  };

  // Validate the form
  const validate = () => {
    const newErrors = {};

    if (eventType === "coming_soon" && !includeTiers) {
      // No validation needed if coming soon with no tiers
      return true;
    }

    if (tierType === "freeSeating") {
      if (!freeSeatingTickets)
        newErrors.freeSeatingTickets = "Number of tickets is required";
      if (eventType !== "free" && !freeSeatingPrice)
        newErrors.freeSeatingPrice = "Price is required";
      if (!freeSeatingMaxPerPerson)
        newErrors.freeSeatingMaxPerPerson =
          "Max tickets per person is required";
    } else {
      // Check if at least one tier is selected
      const anyTierChecked = Object.values(ticketTiers).some(
        (tier) => tier.checked
      );
      if (!anyTierChecked) {
        newErrors.tiers = "At least one ticket tier must be selected";
      } else {
        // Check if all selected tiers have required fields
        let tierErrors = false;
        Object.entries(ticketTiers).forEach(([tierName, tier]) => {
          if (tier.checked) {
            if (!tier.number) tierErrors = true;
            if (eventType !== "free" && !tier.price) tierErrors = true;
            if (!tier.maxPerPerson) tierErrors = true;
          }
        });

        if (tierErrors) {
          newErrors.tierDetails =
            "All selected tiers must have number, price, and max per person values";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      // Scroll to the top to show errors
      window.scrollTo(0, 0);
      return;
    }

    // For coming soon events - include tier information if selected
    if (eventType === "coming_soon") {
      if (includeTiers) {
        // Include ticket tiers similar to a regular ticketed event
        const parsedTicketTiers = {};

        Object.keys(ticketTiers).forEach((tier) => {
          parsedTicketTiers[tier] = {
            ...ticketTiers[tier],
            number:
              ticketTiers[tier].number === ""
                ? 0
                : parseInt(ticketTiers[tier].number),
            price:
              ticketTiers[tier].price === ""
                ? 0
                : parseFloat(ticketTiers[tier].price),
            maxPerPerson:
              ticketTiers[tier].maxPerPerson === ""
                ? 0
                : parseInt(ticketTiers[tier].maxPerPerson),
          };
        });

        onNext({
          eventType: "coming_soon",
          hasTierInfo: true,
          tierType,
          ticketTiers: parsedTicketTiers,
          totalTickets:
            tierType === "freeSeating"
              ? freeSeatingTickets === ""
                ? 0
                : parseInt(freeSeatingTickets)
              : totalTickets,
          freeSeating: {
            numberOfTickets:
              freeSeatingTickets === "" ? 0 : parseInt(freeSeatingTickets),
            price: freeSeatingPrice === "" ? 0 : parseFloat(freeSeatingPrice),
            maxPerPerson:
              freeSeatingMaxPerPerson === ""
                ? 0
                : parseInt(freeSeatingMaxPerPerson),
          },
        });
      } else {
        // Simple version without ticket details
        onNext({
          eventType: "coming_soon",
          hasTierInfo: false,
        });
      }
      return;
    }

    // For free events, set up free seating with zero price
    if (eventType === "free") {
      onNext({
        eventType: "free",
        tierType: "freeSeating",
        freeSeating: {
          numberOfTickets:
            freeSeatingTickets === "" ? 0 : parseInt(freeSeatingTickets),
          price: 0, // Always zero for free events
          maxPerPerson:
            freeSeatingMaxPerPerson === ""
              ? 0
              : parseInt(freeSeatingMaxPerPerson),
        },
      });
      return;
    }

    // For ticketed events with full ticket details
    const parsedTicketTiers = {};

    Object.keys(ticketTiers).forEach((tier) => {
      parsedTicketTiers[tier] = {
        ...ticketTiers[tier],
        number:
          ticketTiers[tier].number === ""
            ? 0
            : parseInt(ticketTiers[tier].number),
        price:
          ticketTiers[tier].price === ""
            ? 0
            : parseFloat(ticketTiers[tier].price),
        maxPerPerson:
          ticketTiers[tier].maxPerPerson === ""
            ? 0
            : parseInt(ticketTiers[tier].maxPerPerson),
      };
    });

    // Collect ticket information
    const ticketDetailsData = {
      eventType: "ticketed",
      tierType,
      ticketTiers: parsedTicketTiers,
      totalTickets:
        tierType === "freeSeating"
          ? freeSeatingTickets === ""
            ? 0
            : parseInt(freeSeatingTickets)
          : totalTickets,
      freeSeating: {
        numberOfTickets:
          freeSeatingTickets === "" ? 0 : parseInt(freeSeatingTickets),
        price: freeSeatingPrice === "" ? 0 : parseFloat(freeSeatingPrice),
        maxPerPerson:
          freeSeatingMaxPerPerson === ""
            ? 0
            : parseInt(freeSeatingMaxPerPerson),
      },
    };

    // Pass the collected data to the parent component
    onNext(ticketDetailsData);
  };

  // Add this function before the return statements
  const renderMapSection = () => {
    if (!initialData?.mapImage) return null;

    return (
      <div className=" rounded-lg mb-4">
        <div className="flex">
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-light">See Venue Map here:</p>
            <button
              onClick={() => setShowMapModal(true)}
              className="bg-[#FFAB40] text-[#2E2E2E] text-xs font-semibold py-1.5 px-3 rounded-full hover:bg-[#FF9800] transition-colors duration-200 flex items-center"
            >
              <EyeIcon className="h-3 w-3 mr-1" />
              View Map
            </button>
          </div>
        </div>
      </div>
    );
  };

  // For Coming Soon events
  if (eventType === "coming_soon") {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
              Coming Soon Details
            </p>
            <p className="text-[13px] text-[#B8B8B8] mb-4">
              Provide basic information for this "Coming Soon" event. Full
              details can be added later.
            </p>
          </div>
        </div>

        <hr className="border-t border-gray-600 my-4" />

        {renderMapSection()}

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4">
            <div className="flex items-center text-red-500 mb-2">
              <AlertCircleIcon className="h-5 w-5 mr-2" />
              <p className="font-semibold">Please fix the following errors:</p>
            </div>
            <ul className="list-disc pl-10 text-sm text-red-400">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-[#1E1E1E] p-4 rounded-lg mb-6">
          <div className="flex items-center mb-4">
            <InfoIcon className="h-5 w-5 mr-2 text-[#FFAB40]" />
            <p className="text-white text-sm">
              This event will be published with a "Coming Soon" tag.
              Reservations will not be available until you update it later.
            </p>
          </div>

          <div className="my-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTiers}
                onChange={(e) => setIncludeTiers(e.target.checked)}
                className="form-checkbox h-5 w-5 text-[#FFAB40] bg-[#2C2C2C] border-gray-600 rounded focus:ring-0 focus:outline-none"
              />
              <span className="text-white">
                Include ticket tier information (optional)
              </span>
            </label>
            <p className="text-[#B8B8B8] text-xs mt-1 ml-7">
              This will allow you to set up ticket tiers if it is available.
            </p>
          </div>
        </div>

        {/* Only show ticket configuration if includeTiers is checked */}
        {includeTiers && (
          <div className="mt-6">
            <div className="flex items-center mb-4">
              <div className="mr-4">
                <input
                  type="radio"
                  id="freeSeating"
                  name="tierType"
                  value="freeSeating"
                  checked={tierType === "freeSeating"}
                  onChange={() => setTierType("freeSeating")}
                />
                <label
                  htmlFor="freeSeating"
                  className="ml-2 text-sm text-white"
                >
                  Free Seating
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="ticketed"
                  name="tierType"
                  value="ticketed"
                  checked={tierType === "ticketed"}
                  onChange={() => setTierType("ticketed")}
                />
                <label htmlFor="ticketed" className="ml-2 text-sm text-white">
                  Ticketed
                </label>
              </div>
            </div>

            {/* Display for Free Seating */}
            {tierType === "freeSeating" && (
              <div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">
                      Number of Tickets:
                    </label>
                    <input
                      type="text"
                      value={freeSeatingTickets}
                      onChange={(e) =>
                        handleFreeSeatingTicketsChange(e.target.value)
                      }
                      className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                               border ${
                                 errors.freeSeatingTickets
                                   ? "border-red-500"
                                   : "border-gray-600"
                               } focus:outline-none focus:border-[#FFAB40]`}
                      placeholder="Total available tickets"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">
                      Price (₱):
                    </label>
                    <input
                      type="text"
                      value={freeSeatingPrice}
                      onChange={(e) =>
                        handleFreeSeatingPriceChange(e.target.value)
                      }
                      className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                               border ${
                                 errors.freeSeatingPrice
                                   ? "border-red-500"
                                   : "border-gray-600"
                               } focus:outline-none focus:border-[#FFAB40]`}
                      placeholder="Ticket price"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">
                      Max Tickets Per Person:
                    </label>
                    <input
                      type="text"
                      value={freeSeatingMaxPerPerson}
                      onChange={(e) =>
                        handleFreeSeatingMaxPerPersonChange(e.target.value)
                      }
                      className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                               border ${
                                 errors.freeSeatingMaxPerPerson
                                   ? "border-red-500"
                                   : "border-gray-600"
                               } focus:outline-none focus:border-[#FFAB40]`}
                      placeholder="Max tickets per person"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Show ticket tiers for Coming Soon when selected */}
            {tierType === "ticketed" && (
              <>
                {errors.tiers && (
                  <div className="bg-red-900/20 border border-red-500 rounded-md p-2 mb-4">
                    <p className="text-red-400 text-sm flex items-center">
                      <AlertCircleIcon className="h-4 w-4 mr-1" />
                      {errors.tiers}
                    </p>
                  </div>
                )}

                {errors.tierDetails && (
                  <div className="bg-red-900/20 border border-red-500 rounded-md p-2 mb-4">
                    <p className="text-red-400 text-sm flex items-center">
                      <AlertCircleIcon className="h-4 w-4 mr-1" />
                      {errors.tierDetails}
                    </p>
                  </div>
                )}

                <button
                  onClick={addNewTier}
                  className="flex items-center bg-white text-black px-4 py-2 rounded-full hover:bg-[#FFAB40] transition-colors text-sm ml-auto mb-6"
                >
                  <PlusIcon className="mr-2 h-4 w-4" /> Add Tier
                </button>

                <div className="mb-2 grid grid-cols-[auto,200px,1fr,1fr,1fr,auto,auto] gap-4 items-center">
                  <div></div>
                  <p className="text-sm text-[#B8B8B8]">Tier Name</p>
                  <p className="text-sm text-[#B8B8B8]">Number of Tickets</p>
                  <p className="text-sm text-[#B8B8B8]">Price (₱)</p>
                  <p className="text-sm text-[#B8B8B8]">Max Per Person</p>
                  <div></div>
                  <div></div>
                </div>

                <div className="space-y-3">
                  {Object.keys(ticketTiers).map((tier) => (
                    <div
                      key={tier}
                      className="grid grid-cols-[auto,200px,1fr,1fr,1fr,auto,auto] gap-4 items-center"
                    >
                      <input
                        type="checkbox"
                        checked={ticketTiers[tier].checked}
                        onChange={(e) =>
                          handleCheckboxChange(tier, e.target.checked)
                        }
                        className="form-checkbox h-5 w-5 text-[#FFAB40] bg-[#2C2C2C] border-gray-600 rounded focus:ring-0 focus:outline-none"
                      />
                      {ticketTiers[tier].isEditing ? (
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={editingTierName}
                            onChange={(e) =>
                              handleTierNameChange(e.target.value)
                            }
                            className="bg-[#2C2C2C] text-white text-sm px-2 py-1 rounded mr-2"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <p className="text-white text-sm whitespace-nowrap mr-2">
                            {tier}
                          </p>
                        </div>
                      )}
                      <input
                        type="text"
                        placeholder="Number of tickets"
                        disabled={!ticketTiers[tier].checked}
                        value={ticketTiers[tier].number}
                        onChange={(e) =>
                          handleNumberChange(tier, e.target.value)
                        }
                        className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded placeholder-gray-500 
                                   border border-gray-600 focus:outline-none focus:border-[#FFAB40] 
                                   whitespace-nowrap overflow-hidden text-ellipsis"
                      />
                      <input
                        type="text"
                        placeholder="Price"
                        disabled={!ticketTiers[tier].checked}
                        value={ticketTiers[tier].price}
                        onChange={(e) =>
                          handlePriceChange(tier, e.target.value)
                        }
                        className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded placeholder-gray-500 
                                   border border-gray-600 focus:outline-none focus:border-[#FFAB40] 
                                   whitespace-nowrap overflow-hidden text-ellipsis"
                      />
                      <input
                        type="text"
                        placeholder="Max per person"
                        disabled={!ticketTiers[tier].checked}
                        value={ticketTiers[tier].maxPerPerson}
                        onChange={(e) =>
                          handleMaxPerPersonChange(tier, e.target.value)
                        }
                        className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded placeholder-gray-500 
                                   border border-gray-600 focus:outline-none focus:border-[#FFAB40] 
                                   whitespace-nowrap overflow-hidden text-ellipsis"
                      />
                      <button
                        onClick={
                          ticketTiers[tier].isEditing
                            ? saveNewTierName
                            : () => startEditingTierName(tier)
                        }
                        className={
                          ticketTiers[tier].isEditing
                            ? "text-green-500 hover:text-green-700 transition-colors"
                            : "text-[#FFAB40] hover:text-[#FFC661] transition-colors"
                        }
                      >
                        {ticketTiers[tier].isEditing ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          <EditIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteTier(tier)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <hr className="border-t border-gray-600 my-4" />

            <div className="mt-4 flex items-center justify-end">
              <span className="text-white text-sm mr-6">
                Total Number of Tickets:
              </span>
              <span className="text-[#FFAB40] font-semibold">
                {tierType === "freeSeating"
                  ? freeSeatingTickets === ""
                    ? 0
                    : parseInt(freeSeatingTickets)
                  : totalTickets}
              </span>
            </div>
          </div>
        )}

        {/* Hidden button for parent component to trigger submit */}
        <button
          className="hidden ticket-submit-button"
          onClick={handleSubmit}
        />
      </div>
    );
  }

  // For free events
  if (eventType === "free") {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
              Free Event Details
            </p>
            <p className="text-[13px] text-[#B8B8B8] mb-4">
              Configure the details for your free event.
            </p>
          </div>
        </div>

        <hr className="border-t border-gray-600 my-4" />

        {renderMapSection()}

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4">
            <div className="flex items-center text-red-500 mb-2">
              <AlertCircleIcon className="h-5 w-5 mr-2" />
              <p className="font-semibold">Please fix the following errors:</p>
            </div>
            <ul className="list-disc pl-10 text-sm text-red-400">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-[#1E1E1E] p-4 rounded-lg mb-4">
          <div className="flex items-center mb-4">
            <InfoIcon className="h-5 w-5 mr-2 text-[#FFAB40]" />
            <p className="text-white text-sm">
              This is a free event. All tickets will be available at no cost.
            </p>
          </div>

          <div className="flex flex-col">
            <label className="text-white text-sm mb-1">
              Number of Free Tickets:
            </label>
            <input
              type="text"
              value={freeSeatingTickets}
              onChange={(e) => handleFreeSeatingTicketsChange(e.target.value)}
              className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                       border ${
                         errors.freeSeatingTickets
                           ? "border-red-500"
                           : "border-gray-600"
                       } focus:outline-none focus:border-[#FFAB40]`}
              placeholder="Total available tickets"
            />
          </div>

          <div className="flex flex-col mt-4">
            <label className="text-white text-sm mb-1">
              Max Tickets Per Person:
            </label>
            <input
              type="text"
              value={freeSeatingMaxPerPerson}
              onChange={(e) =>
                handleFreeSeatingMaxPerPersonChange(e.target.value)
              }
              className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                       border ${
                         errors.freeSeatingMaxPerPerson
                           ? "border-red-500"
                           : "border-gray-600"
                       } focus:outline-none focus:border-[#FFAB40]`}
              placeholder="Max tickets per person"
            />
          </div>
        </div>

        {/* Hidden button for parent component to trigger submit */}
        <button
          className="hidden ticket-submit-button"
          onClick={handleSubmit}
        />
      </div>
    );
  }

  // Regular ticketed event
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
            Ticket Details
          </p>
          <p className="text-[13px] text-[#B8B8B8] mb-4">
            Configure the ticket tiers and pricing for your event.
          </p>
        </div>
      </div>

      <hr className="border-t border-gray-600 my-4" />

      {renderMapSection()}

      {Object.keys(errors).length > 0 && (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4">
          <div className="flex items-center text-red-500 mb-2">
            <AlertCircleIcon className="h-5 w-5 mr-2" />
            <p className="font-semibold">Please fix the following errors:</p>
          </div>
          <ul className="list-disc pl-10 text-sm text-red-400">
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center mb-4">
        <div className="mr-4">
          <input
            type="radio"
            id="freeSeating"
            name="tierType"
            value="freeSeating"
            checked={tierType === "freeSeating"}
            onChange={() => setTierType("freeSeating")}
          />
          <label htmlFor="freeSeating" className="ml-2 text-sm text-white">
            Free Seating
          </label>
        </div>
        <div>
          <input
            type="radio"
            id="ticketed"
            name="tierType"
            value="ticketed"
            checked={tierType === "ticketed"}
            onChange={() => setTierType("ticketed")}
          />
          <label htmlFor="ticketed" className="ml-2 text-sm text-white">
            Ticketed
          </label>
        </div>
      </div>

      {/* Display for Free Seating */}
      {tierType === "freeSeating" && (
        <div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-white text-sm mb-1">
                Number of Tickets:
              </label>
              <input
                type="text"
                value={freeSeatingTickets}
                onChange={(e) => handleFreeSeatingTicketsChange(e.target.value)}
                className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                         border ${
                           errors.freeSeatingTickets
                             ? "border-red-500"
                             : "border-gray-600"
                         } focus:outline-none focus:border-[#FFAB40]`}
                placeholder="Total available tickets"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-white text-sm mb-1">Price (₱):</label>
              <input
                type="text"
                value={freeSeatingPrice}
                onChange={(e) => handleFreeSeatingPriceChange(e.target.value)}
                className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                         border ${
                           errors.freeSeatingPrice
                             ? "border-red-500"
                             : "border-gray-600"
                         } focus:outline-none focus:border-[#FFAB40]`}
                placeholder="Ticket price"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-white text-sm mb-1">
                Max Tickets Per Person:
              </label>
              <input
                type="text"
                value={freeSeatingMaxPerPerson}
                onChange={(e) =>
                  handleFreeSeatingMaxPerPersonChange(e.target.value)
                }
                className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                         border ${
                           errors.freeSeatingMaxPerPerson
                             ? "border-red-500"
                             : "border-gray-600"
                         } focus:outline-none focus:border-[#FFAB40]`}
                placeholder="Max tickets per person"
              />
            </div>
          </div>
        </div>
      )}

      {/* Only show ticket tiers and Add Tier button when "Ticketed" is selected */}
      {tierType === "ticketed" && (
        <>
          {errors.tiers && (
            <div className="bg-red-900/20 border border-red-500 rounded-md p-2 mb-4">
              <p className="text-red-400 text-sm flex items-center">
                <AlertCircleIcon className="h-4 w-4 mr-1" />
                {errors.tiers}
              </p>
            </div>
          )}

          {errors.tierDetails && (
            <div className="bg-red-900/20 border border-red-500 rounded-md p-2 mb-4">
              <p className="text-red-400 text-sm flex items-center">
                <AlertCircleIcon className="h-4 w-4 mr-1" />
                {errors.tierDetails}
              </p>
            </div>
          )}

          <button
            onClick={addNewTier}
            className="flex items-center bg-white text-black px-4 py-2 rounded-full hover:bg-[#FFAB40] transition-colors text-sm ml-auto mb-6"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Add Tier
          </button>

          <div className="mb-2 grid grid-cols-[auto,200px,1fr,1fr,1fr,auto,auto] gap-4 items-center">
            <div></div>
            <p className="text-sm text-[#B8B8B8]">Tier Name</p>
            <p className="text-sm text-[#B8B8B8]">Number of Tickets</p>
            <p className="text-sm text-[#B8B8B8]">Price (₱)</p>
            <p className="text-sm text-[#B8B8B8]">Max Per Person</p>
            <div></div>
            <div></div>
          </div>

          <div className="space-y-3">
            {Object.keys(ticketTiers).map((tier) => (
              <div
                key={tier}
                className="grid grid-cols-[auto,200px,1fr,1fr,1fr,auto,auto] gap-4 items-center"
              >
                <input
                  type="checkbox"
                  checked={ticketTiers[tier].checked}
                  onChange={(e) => handleCheckboxChange(tier, e.target.checked)}
                  className="form-checkbox h-5 w-5 text-[#FFAB40] bg-[#2C2C2C] border-gray-600 rounded focus:ring-0 focus:outline-none"
                />
                {ticketTiers[tier].isEditing ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={editingTierName}
                      onChange={(e) => handleTierNameChange(e.target.value)}
                      className="bg-[#2C2C2C] text-white text-sm px-2 py-1 rounded mr-2"
                    />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <p className="text-white text-sm whitespace-nowrap mr-2">
                      {tier}
                    </p>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Number of tickets"
                  disabled={!ticketTiers[tier].checked}
                  value={ticketTiers[tier].number}
                  onChange={(e) => handleNumberChange(tier, e.target.value)}
                  className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded placeholder-gray-500 
                             border border-gray-600 focus:outline-none focus:border-[#FFAB40] 
                             whitespace-nowrap overflow-hidden text-ellipsis"
                />
                <input
                  type="text"
                  placeholder="Price"
                  disabled={!ticketTiers[tier].checked}
                  value={ticketTiers[tier].price}
                  onChange={(e) => handlePriceChange(tier, e.target.value)}
                  className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded placeholder-gray-500 
                             border border-gray-600 focus:outline-none focus:border-[#FFAB40] 
                             whitespace-nowrap overflow-hidden text-ellipsis"
                />
                {/* Input for Max Per Person */}
                <input
                  type="text"
                  placeholder="Max per person"
                  disabled={!ticketTiers[tier].checked}
                  value={ticketTiers[tier].maxPerPerson}
                  onChange={(e) =>
                    handleMaxPerPersonChange(tier, e.target.value)
                  }
                  className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded placeholder-gray-500 
                             border border-gray-600 focus:outline-none focus:border-[#FFAB40] 
                             whitespace-nowrap overflow-hidden text-ellipsis"
                />
                {/* Editing button that changes to a check mark when editing */}
                <button
                  onClick={
                    ticketTiers[tier].isEditing
                      ? saveNewTierName
                      : () => startEditingTierName(tier)
                  }
                  className={
                    ticketTiers[tier].isEditing
                      ? "text-green-500 hover:text-green-700 transition-colors"
                      : "text-[#FFAB40] hover:text-[#FFC661] transition-colors"
                  }
                >
                  {ticketTiers[tier].isEditing ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <EditIcon className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => deleteTier(tier)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <hr className="border-t border-gray-600 my-4" />

      <div className="mt-4 flex items-center justify-end">
        <span className="text-white text-sm mr-6">
          Total Number of Tickets:
        </span>
        <span className="text-[#FFAB40] font-semibold">
          {tierType === "freeSeating"
            ? freeSeatingTickets === ""
              ? 0
              : parseInt(freeSeatingTickets)
            : totalTickets}
        </span>
      </div>

      {/* Hidden button for parent component to trigger submit */}
      <button className="hidden ticket-submit-button" onClick={handleSubmit} />

      {/* Map Modal */}
      {showMapModal && <MapModal />}
    </div>
  );
};
// Updated ClaimingDetails component that skips for free and coming soon events
// Enhanced ClaimingDetails component with validation for total slots
const ClaimingDetails = ({
  onBack,
  onNext,
  eventType,
  initialData,
  eventDate,
  ticketDetails,
}) => {
  useEffect(() => {
    console.log("ClaimingDetails component received initialData:", initialData);

    if (initialData) {
      // Initialize date list from available dates
      if (
        initialData.availableDates &&
        Array.isArray(initialData.availableDates)
      ) {
        setDateList(initialData.availableDates);
      }

      // Initialize claiming summaries
      if (
        initialData.claimingSummaries &&
        Array.isArray(initialData.claimingSummaries)
      ) {
        setClaimingSummaries(initialData.claimingSummaries);

        // Extract unique dates from claiming summaries if no availableDates were provided
        if (!initialData.availableDates) {
          const uniqueDates = [
            ...new Set(
              initialData.claimingSummaries.map((summary) => summary.date)
            ),
          ];
          setDateList(uniqueDates);
        }
      }
    }
  }, [initialData]);

  const [claimingDate, setClaimingDate] = useState("");
  const [claimingStartTime, setClaimingStartTime] = useState("");
  const [claimingEndTime, setClaimingEndTime] = useState("");
  const [claimingVenue, setClaimingVenue] = useState("");
  const [maxReservations, setMaxReservations] = useState("");
  const [dateList, setDateList] = useState(initialData?.availableDates || []);
  const [selectedDate, setSelectedDate] = useState(null);
  const [claimingSummaries, setClaimingSummaries] = useState(
    initialData?.claimingSummaries || []
  );
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  // Calculate total tickets from ticketDetails
  const getTotalTickets = () => {
    if (!ticketDetails) return 0;

    if (eventType === "free") {
      return ticketDetails.freeSeating?.numberOfTickets || 0;
    }

    if (ticketDetails.tierType === "freeSeating") {
      return ticketDetails.freeSeating?.numberOfTickets || 0;
    } else {
      let total = 0;
      if (ticketDetails.ticketTiers) {
        Object.entries(ticketDetails.ticketTiers)
          .filter(([_, tierData]) => tierData.checked)
          .forEach(([_, tierData]) => {
            total += tierData.number || 0;
          });
      }
      return total;
    }
  };

  // Calculate total claiming slots from claiming summaries
  const getTotalClaimingSlots = () => {
    return claimingSummaries.reduce((total, summary) => {
      return total + (summary.maxReservations || 0);
    }, 0);
  };

  // Calculate remaining slots that need to be assigned
  const calculateRemainingSlots = () => {
    const totalTickets = getTotalTickets();
    const currentClaimingSlots = getTotalClaimingSlots();

    if (currentClaimingSlots >= totalTickets) {
      return 0; // Don't suggest adding more if we already have enough or too many
    }

    return totalTickets - currentClaimingSlots;
  };

  // Helper function to auto-fill the max reservations field with the remaining slots
  const autoFillRemainingSlots = () => {
    const remaining = calculateRemainingSlots();
    if (remaining > 0) {
      setMaxReservations(remaining.toString());
    }
  };

  const validateClaimingDate = (claimingDate) => {
    if (!claimingDate || !eventDate) return true; // Skip validation if either date is missing

    const eventDateObj = new Date(eventDate);
    const claimingDateObj = new Date(claimingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    // Claiming date must be after today and before event date
    return claimingDateObj >= today && claimingDateObj < eventDateObj;
  };

  // Add notification for invalid claiming date
  const getClaimingDateNotification = (claimingDate) => {
    if (!claimingDate || !eventDate) return null;

    const eventDateObj = new Date(eventDate);
    const claimingDateObj = new Date(claimingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    // If claiming date is before today
    if (claimingDateObj < today) {
      return {
        type: "error",
        message: "Claiming date must be today or in the future",
      };
    }

    // If claiming date is on or after event date
    if (claimingDateObj >= eventDateObj) {
      return {
        type: "error",
        message: "Claiming date must be before the event date",
      };
    }

    // If claiming date is very close to the event date (less than 2 days before)
    const daysBefore = Math.floor(
      (eventDateObj - claimingDateObj) / (1000 * 60 * 60 * 24)
    );
    if (daysBefore < 2) {
      return {
        type: "warning",
        message: `Claiming date is only ${daysBefore} day(s) before the event`,
      };
    }

    return null;
  };

  // Sync dates from summaries to datelist
  const syncDateListWithSummaries = (summaries) => {
    const uniqueDates = [...new Set(summaries.map((summary) => summary.date))];
    setDateList(uniqueDates);
    if (selectedDate && !uniqueDates.includes(selectedDate))
      setSelectedDate(null);
  };

  // Add date to the list
  const addDate = () => {
    if (claimingDate && !dateList.includes(claimingDate)) {
      // Check if claiming date is valid
      if (!validateClaimingDate(claimingDate)) {
        setErrors({
          ...errors,
          claimingDate: "Claiming date must be before the event date",
        });
        return;
      }

      setDateList([...dateList, claimingDate]);
      setSelectedDate(claimingDate);
      setClaimingDate("");
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check if there's already a claiming schedule with the same date and time
  const isDuplicateSchedule = (date, startTime, endTime) => {
    return claimingSummaries.some(
      (summary) =>
        summary.date === date &&
        summary.startTime === startTime &&
        summary.endTime === endTime &&
        summary.venue === claimingVenue && // Add venue check
        (!selectedSummary || summary.id !== selectedSummary.id)
    );
  };

  // Handle max reservations change - only allow positive numbers
  const handleMaxReservationsChange = (value) => {
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) > 0)) {
      setMaxReservations(value);
    }
  };

  // Handle summary selection from the table
  const handleSelectSummary = (summary) => {
    setSelectedSummary(summary);
    setIsEditing(true);
    setClaimingDate(summary.date);
    setClaimingStartTime(summary.startTime);
    setClaimingEndTime(summary.endTime);
    setClaimingVenue(summary.venue);
    setMaxReservations(summary.maxReservations.toString());
  };

  // Clear all form fields
  const clearForm = () => {
    setClaimingDate("");
    setClaimingStartTime("");
    setClaimingEndTime("");
    setClaimingVenue("");
    setMaxReservations("");
    setSelectedDate(null);
    setSelectedSummary(null);
    setIsEditing(false);
  };

  // Updated validation function to ensure claiming slots match tickets before proceeding
  // Updated claiming validation to ensure total slots match tickets before proceeding
  const validate = () => {
    const newErrors = {};

    // Only validate for ticketed events, skip validation for free and coming soon
    if (eventType === "ticketed") {
      if (claimingSummaries.length === 0) {
        newErrors.summaries = "At least one claiming schedule must be added";
      }

      // Validate all claiming dates against event date and today
      if (eventDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
        const eventDateObj = new Date(eventDate);

        const invalidClaimingDates = claimingSummaries.filter((summary) => {
          const claimingDateObj = new Date(summary.date);
          return claimingDateObj < today || claimingDateObj >= eventDateObj;
        });

        if (invalidClaimingDates.length > 0) {
          newErrors.claimingDates =
            "All claiming dates must be between today and the event date";
        }
      }

      // Validate total claiming slots equals total tickets
      const totalTickets = getTotalTickets();
      const totalClaimingSlots = getTotalClaimingSlots();

      if (totalClaimingSlots !== totalTickets) {
        newErrors.totalSlots = `Total claiming slots (${totalClaimingSlots}) must match total tickets (${totalTickets})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  // Updated handleSubmit function to ensure validation
  const handleSubmit = () => {
    // For free or promotional events - skip this step
    if (eventType === "free") {
      // Simple empty structure since free events skip claiming details
      onNext({
        eventType: "free",
        claimingSummaries: [],
        availableDates: [],
      });
      return;
    }

    // For coming soon events - skip this step
    if (eventType === "coming_soon") {
      onNext({
        eventType: "coming_soon",
        claimingSummaries: [],
        availableDates: [],
      });
      return;
    }

    // For regular ticketed events, validate first
    if (!validate()) {
      // Scroll to the top to show errors
      window.scrollTo(0, 0);
      return;
    }

    // Create copy of summaries and synchronize dates
    const finalSummaries = [...claimingSummaries];
    const uniqueDates = [
      ...new Set(finalSummaries.map((summary) => summary.date)),
    ];

    // Ensure total claiming slots match the total tickets one last time
    const totalTickets = getTotalTickets();
    const totalClaimingSlots = getTotalClaimingSlots();

    if (totalClaimingSlots !== totalTickets) {
      setErrors({
        totalSlots: `Total claiming slots (${totalClaimingSlots}) must exactly match total tickets (${totalTickets}) before proceeding.`,
      });
      window.scrollTo(0, 0);
      return;
    }

    // If all validations pass, proceed to next step
    onNext({
      eventType: "ticketed",
      claimingSummaries: finalSummaries,
      availableDates: uniqueDates,
    });
  };

  // For free/promotional events, show a simplified message
  if (eventType === "free") {
    return (
      <div className="w-full">
        <div className="mb-4">
          <p className="text-[#FFAB40] text-2xl font-semibold mb-1">
            Free Event - No Claiming Details Required
          </p>
          <p className="text-xs text-[#B8B8B8]">
            Free/Promotional events don't require claiming details.
          </p>
        </div>

        <hr className="border-t border-gray-600 my-3" />

        <div className="bg-[#1E1E1E] rounded-lg p-4 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="mb-4 flex justify-center">
              <InfoIcon className="h-12 w-12 text-[#FFAB40]" />
            </div>
            <p className="text-white text-lg mb-2">Claiming Details Skipped</p>
            <p className="text-[#B8B8B8] text-sm">
              For free/promotional events, claiming details are not required.
              Users can directly access or view the event without needing to
              claim tickets.
            </p>
          </div>
        </div>

        <button
          className="hidden claiming-submit-button"
          onClick={handleSubmit}
        />
      </div>
    );
  }

  // For coming soon events, show a simplified message
  if (eventType === "coming_soon") {
    return (
      <div className="w-full">
        <div className="mb-4">
          <p className="text-[#FFAB40] text-2xl font-semibold mb-1">
            Coming Soon - No Claiming Details Required
          </p>
          <p className="text-xs text-[#B8B8B8]">
            "Coming Soon" events don't require claiming details yet.
          </p>
        </div>

        <hr className="border-t border-gray-600 my-3" />

        <div className="bg-[#1E1E1E] rounded-lg p-4 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="mb-4 flex justify-center">
              <InfoIcon className="h-12 w-12 text-[#FFAB40]" />
            </div>
            <p className="text-white text-lg mb-2">
              Claiming Details Not Required Yet
            </p>
            <p className="text-[#B8B8B8] text-sm">
              Since this is a "Coming Soon" event, you can skip this step. You
              can return later to add claiming details before the event goes
              live.
            </p>
          </div>
        </div>

        <button
          className="hidden claiming-submit-button"
          onClick={handleSubmit}
        />
      </div>
    );
  }

  // For ticketed events - regular form
  return (
    <div className="w-full mt-6">
      <div className="mb-4">
        <p className="text-[#FFAB40] text-2xl font-semibold mb-1">
          Claiming Details
        </p>
        <p className="text-xs text-[#B8B8B8]">
          Provide time, date, and location for claiming tickets. Ensure these
          details are clear for a smooth claiming process.
        </p>
      </div>
      <hr className="border-t border-gray-600 my-3" />
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4">
          <div className="flex items-center text-red-500 mb-2">
            <AlertCircleIcon className="h-5 w-5 mr-2" />
            <p className="font-semibold">Please fix the following errors:</p>
          </div>
          <ul className="list-disc pl-10 text-sm text-red-400">
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-col space-y-3">
        {eventDate && (
          <div className="p-3 bg-[#1E1E1E] border-l-4 border-[#FFAB40] rounded-r">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-[#FFAB40]" />
                  <span className="text-white text-sm">
                    Event Date: <span className="text-[#FFAB40] font-semibold">{formatDate(eventDate)}</span>
                  </span>
                </div>
                <div className="flex items-center">
                  <InfoIcon className="h-4 w-4 mr-2 text-[#FFAB40]" />
                  <span className="text-white text-sm">
                    Tickets: <span className="text-[#FFAB40] font-semibold">{getTotalTickets()}</span>
                  </span>
                </div>
                <div className="flex items-center">
                  <InfoIcon className="h-4 w-4 mr-2 text-[#FFAB40]" />
                  <span className="text-white text-sm">
                    Claiming Slots:{" "}
                    <span
                      className={`font-semibold ${
                        getTotalClaimingSlots() === getTotalTickets()
                          ? "text-[#4CAF50]"
                          : "text-[#FFAB40]"
                      }`}
                    >
                      {getTotalClaimingSlots()}
                    </span>
                  </span>
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center">
                {getTotalClaimingSlots() === getTotalTickets() ? (
                  <span className="text-[#4CAF50] text-sm flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    All Slots Assigned
                  </span>
                ) : (
                  <span className="text-[#FFAB40] text-sm flex items-center">
                    <AlertCircleIcon className="h-4 w-4 mr-1" />
                    {getTotalClaimingSlots() > getTotalTickets()
                      ? "Exceeds Available Tickets"
                      : `${getTotalTickets() - getTotalClaimingSlots()} Slots Remaining`}
                  </span>
                )}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  getTotalClaimingSlots() === getTotalTickets()
                    ? "bg-[#4CAF50]"
                    : getTotalClaimingSlots() > getTotalTickets()
                    ? "bg-red-500"
                    : "bg-[#FFAB40]"
                }`}
                style={{
                  width: `${Math.min(
                    (getTotalClaimingSlots() / getTotalTickets()) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Date input section */}
        {!isEditing && (
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="flex items-center flex-1">
                <input
                  type="date"
                  value={claimingDate}
                  onChange={(e) => setClaimingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // Set min to today
                  max={eventDate}
                  className="w-auto max-w-xs bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
                  placeholder="Select claiming date"
                />
                <button
                  onClick={addDate}
                  className="ml-2 bg-[#FFAB40] text-black px-3 py-1 rounded-full text-xs font-semibold hover:bg-[#FFB74D] transition-colors"
                >
                  Add Date
                </button>
              </div>

              {/* Date validation message */}
              {claimingDate && getClaimingDateNotification(claimingDate) && (
                <div
                  className={`ml-2 text-xs flex items-center ${
                    getClaimingDateNotification(claimingDate).type === "error"
                      ? "text-red-400"
                      : "text-[#FFAB40]"
                  }`}
                >
                  <AlertCircleIcon className="h-3 w-3 mr-1" />
                  <span>{getClaimingDateNotification(claimingDate).message}</span>
                </div>
              )}
            </div>

            {/* Date requirement info */}
            <div className="flex items-center mt-1 text-xs text-[#B8B8B8]">
              <InfoIcon className="h-3 w-3 mr-1" />
              <span>Select a date between today and the event date</span>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          {/* Left side: Date section */}
          <div className="w-1/2">
            {isEditing ? (
              <div className="flex flex-col">
                <p className="text-[#FFAB40] text-sm mb-1">Claiming Date:</p>
                <input
                  type="date"
                  value={claimingDate}
                  onChange={(e) => setClaimingDate(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
                />
                <p className="text-[#B8B8B8] text-xs mt-1">
                  Edit date directly when updating a schedule.
                </p>
              </div>
            ) : (
              <>
                <p className="text-[#FFAB40] text-sm mb-1">
                  Available Claiming Dates:
                </p>
                {dateList.length > 0 ? (
                  <table className="w-full bg-[#1E1E1E] rounded overflow-hidden">
                    <thead className="bg-[#FFAB40]">
                      <tr>
                        <th className="py-1 px-3 text-left text-sm text-black font-semibold">
                          Date
                        </th>
                        <th className="py-1 px-3 text-left text-sm text-black font-semibold">
                          Schedules
                        </th>
                        <th className="py-1 px-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dateList.map((date, index) => {
                        // Count schedules for this date
                        const schedulesForDate = claimingSummaries.filter(
                          (summary) => summary.date === date
                        ).length;

                        return (
                          <tr
                            key={index}
                            className={`border-t border-[#333333] cursor-pointer ${
                              selectedDate === date
                                ? "bg-[#FFAB40]/70"
                                : "hover:bg-[#2A2A2A]"
                            }`}
                            onClick={() => {
                              setSelectedDate(date);
                              setClaimingDate(date);
                              setClaimingStartTime("");
                              setClaimingEndTime("");
                              setClaimingVenue("");
                              setMaxReservations("");
                              setSelectedSummary(null);
                              setIsEditing(false);
                            }}
                          >
                            <td
                              className={`py-1 px-3 text-sm ${
                                selectedDate === date
                                  ? "text-black"
                                  : "text-white"
                              }`}
                            >
                              {formatDate(date)}
                            </td>
                            <td
                              className={`py-1 px-3 text-sm ${
                                selectedDate === date
                                  ? "text-black"
                                  : "text-white"
                              }`}
                            >
                              {schedulesForDate} schedule
                              {schedulesForDate !== 1 ? "s" : ""}
                            </td>
                            <td className="py-1 px-2 text-right w-8">
                              {selectedDate === date && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    // Check if there are claiming summaries for this date
                                    const hasClaimingSchedules =
                                      claimingSummaries.some(
                                        (summary) => summary.date === date
                                      );

                                    if (hasClaimingSchedules) {
                                      // Cannot remove date with existing schedules
                                      setErrors({
                                        ...errors,
                                        dateRemoval:
                                          "Cannot remove a date with existing claiming schedules",
                                      });
                                      window.scrollTo(0, 0);
                                    } else {
                                      // Safe to remove
                                      setDateList(
                                        dateList.filter((d) => d !== date)
                                      );
                                      setSelectedDate(null);
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="w-full bg-[#1E1E1E] rounded p-3 h-24 flex items-center justify-center">
                    <p className="text-sm text-gray-400 italic">
                      No dates added yet.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="w-1/2 space-y-3">
            <div className="flex flex-col">
              <p className="text-[#FFAB40] text-sm mb-1">Claiming Time:</p>
              <div className="flex space-x-2 items-center">
                <input
                  type="time"
                  value={claimingStartTime}
                  onChange={(e) => setClaimingStartTime(e.target.value)}
                  className="bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
                />
                <p className="text-white text-sm">to</p>
                <input
                  type="time"
                  value={claimingEndTime}
                  onChange={(e) => setClaimingEndTime(e.target.value)}
                  className="bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <p className="text-[#FFAB40] text-sm mb-1">Claiming Venue:</p>
              <input
                type="text"
                placeholder="Enter venue for ticket claiming"
                value={claimingVenue}
                onChange={(e) => setClaimingVenue(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
              />
            </div>

            {/* Max Reservations with Auto-fill button */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[#FFAB40] text-sm">Max Reservations:</p>
                {calculateRemainingSlots() > 0 && !isEditing && (
                  <button
                    onClick={autoFillRemainingSlots}
                    className="text-xs text-[#FFAB40] hover:text-[#FFC661] underline"
                  >
                    Auto-fill remaining ({calculateRemainingSlots()})
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Enter max number of reservations"
                value={maxReservations}
                onChange={(e) => handleMaxReservationsChange(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
              />
              <p className="text-[#B8B8B8] text-xs mt-1">
                Maximum allowed for this claiming schedule.
                
              </p>
            </div>
            {/* Add/Update Button */}
            <div className="flex justify-between mt-1">
              {isEditing && (
                <button
                  onClick={clearForm}
                  className="flex items-center bg-gray-700 text-white px-3 py-1 rounded-full hover:bg-gray-600 text-sm font-semibold"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={() => {
                  if (isEditing) {
                    if (
                      claimingDate &&
                      claimingVenue &&
                      claimingStartTime &&
                      claimingEndTime
                    ) {
                      // Check for duplicate schedules when editing
                      const isDuplicate = claimingSummaries.some(
                        (summary) =>
                          summary.id !== selectedSummary.id &&
                          summary.date === claimingDate &&
                          summary.startTime === claimingStartTime &&
                          summary.endTime === claimingEndTime &&
                          summary.venue === claimingVenue // Add venue check
                      );

                      if (isDuplicate) {
                        setErrors({
                          ...errors,
                          duplicateSchedule:
                            "A claiming schedule with the same date, time, and venue already exists",
                        });
                        window.scrollTo(0, 0);
                        return;
                      }

                      const summaryData = {
                        id: selectedSummary.id,
                        date: claimingDate,
                        venue: claimingVenue,
                        startTime: claimingStartTime,
                        endTime: claimingEndTime,
                        maxReservations:
                          maxReservations === ""
                            ? 0
                            : parseInt(maxReservations),
                      };

                      const updatedSummaries = claimingSummaries.map((s) =>
                        s.id === selectedSummary.id ? summaryData : s
                      );

                      // Check if total slots match total tickets
                      const totalTickets = getTotalTickets();
                      const newTotalClaimingSlots = updatedSummaries.reduce(
                        (total, summary) =>
                          total + (summary.maxReservations || 0),
                        0
                      );

                      setClaimingSummaries(updatedSummaries);
                      syncDateListWithSummaries(updatedSummaries);
                      clearForm();
                    } else {
                      setErrors({
                        ...errors,
                        incompleteForm:
                          "Please provide all required information (date, venue, and time)",
                      });
                      window.scrollTo(0, 0);
                    }
                  } else {
                    const dateToUse = claimingDate || selectedDate;

                    if (
                      dateToUse &&
                      claimingVenue &&
                      claimingStartTime &&
                      claimingEndTime
                    ) {
                      if (claimingDate && !dateList.includes(claimingDate)) {
                        setDateList([...dateList, claimingDate]);
                      }

                      // Check for duplicate schedules
                      const isDuplicate = isDuplicateSchedule(
                        dateToUse,
                        claimingStartTime,
                        claimingEndTime
                      );

                      if (isDuplicate) {
                        setErrors({
                          ...errors,
                          duplicateSchedule:
                            "A claiming schedule with the same date and time already exists",
                        });
                        window.scrollTo(0, 0);
                        return;
                      }

                      const summaryData = {
                        id: Date.now(),
                        date: dateToUse,
                        venue: claimingVenue,
                        startTime: claimingStartTime,
                        endTime: claimingEndTime,
                        maxReservations:
                          maxReservations === ""
                            ? 0
                            : parseInt(maxReservations),
                      };

                      const updatedSummaries = [
                        ...claimingSummaries,
                        summaryData,
                      ];

                      setClaimingSummaries(updatedSummaries);
                      syncDateListWithSummaries(updatedSummaries);
                      clearForm();
                    } else {
                      setErrors({
                        ...errors,
                        incompleteForm:
                          "Please provide all required information (date, venue, and time)",
                      });
                      window.scrollTo(0, 0);
                    }
                  }
                }}
                className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ml-auto ${
                  isEditing
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-white hover:bg-[#FFAB40] text-black"
                }`}
                disabled={!isEditing && !selectedDate && !claimingDate}
              >
                {isEditing ? (
                  <>
                    <CheckIcon className="mr-1 h-4 w-4" /> Save Changes
                  </>
                ) : (
                  <>
                    <PlusIcon className="mr-1 h-4 w-4" /> Add Schedule
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Enhanced claiming schedule summary section with ticket count validation */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[#FFAB40] text-sm">
            Claiming Schedule Summary:
            <span className="text-[#B8B8B8] text-xs ml-2">
              (Click a row to edit)
            </span>
          </p>
        </div>

        {claimingSummaries.length > 0 ? (
          <div>
            <table className="w-full bg-[#1E1E1E] rounded overflow-hidden">
              <thead className="bg-[#FFAB40]">
                <tr>
                  <th className="py-1 px-3 text-left text-sm text-black font-semibold">
                    Date
                  </th>
                  <th className="py-1 px-3 text-left text-sm text-black font-semibold">
                    Time
                  </th>
                  <th className="py-1 px-3 text-left text-sm text-black font-semibold">
                    Venue
                  </th>
                  <th className="py-1 px-3 text-left text-sm text-black font-semibold">
                    Max
                  </th>
                  <th className="py-1 px-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {claimingSummaries.map((summary) => (
                  <tr
                    key={summary.id}
                    className={`border-t border-[#333333] cursor-pointer ${
                      selectedSummary?.id === summary.id
                        ? "bg-[#FFAB40]/70"
                        : "hover:bg-[#2A2A2A]"
                    }`}
                    onClick={() => handleSelectSummary(summary)}
                  >
                    <td
                      className={`py-1 px-3 text-sm ${
                        selectedSummary?.id === summary.id
                          ? "text-black"
                          : "text-white"
                      }`}
                    >
                      {formatDate(summary.date)}
                    </td>
                    <td
                      className={`py-1 px-3 text-sm ${
                        selectedSummary?.id === summary.id
                          ? "text-black"
                          : "text-white"
                      }`}
                    >
                      {summary.startTime} to {summary.endTime}
                    </td>
                    <td
                      className={`py-1 px-3 text-sm ${
                        selectedSummary?.id === summary.id
                          ? "text-black"
                          : "text-white"
                      }`}
                    >
                      {summary.venue}
                    </td>
                    <td
                      className={`py-1 px-3 text-sm ${
                        selectedSummary?.id === summary.id
                          ? "text-black"
                          : "text-white"
                      }`}
                    >
                      {summary.maxReservations}
                    </td>
                    <td className="py-1 px-2 text-right">
                      {selectedSummary?.id === summary.id && (
                        <div className="flex space-x-1 justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              // Check if this deletion would cause total slots to not match total tickets
                              const totalTickets = getTotalTickets();
                              const newTotalClaimingSlots = claimingSummaries
                                .filter((s) => s.id !== summary.id)
                                .reduce(
                                  (total, s) =>
                                    total + (s.maxReservations || 0),
                                  0
                                );

                              if (newTotalClaimingSlots !== totalTickets) {
                                setErrors({
                                  ...errors,
                                  totalSlotsAfterDeletion: `Deleting this schedule would make total claiming slots (${newTotalClaimingSlots}) not match total tickets (${totalTickets})`,
                                });
                                window.scrollTo(0, 0);
                                return;
                              }

                              const updatedSummaries = claimingSummaries.filter(
                                (s) => s.id !== summary.id
                              );
                              setClaimingSummaries(updatedSummaries);
                              syncDateListWithSummaries(updatedSummaries);
                              clearForm();
                            }}
                            className="text-red-500 hover:text-red-700 bg-black rounded-full p-1"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="w-full bg-[#1E1E1E] rounded p-3 h-16 flex items-center justify-center">
            <p className="text-sm text-gray-400 italic">
              No claiming schedules added yet.
            </p>
          </div>
        )}
      </div>
      {/* Hidden button for parent component to trigger submit */}
      <button
        className="hidden claiming-submit-button"
        onClick={handleSubmit}
      />
    </div>
  );
};
// Enhanced AvailabilityDetails component with validation
const AvailabilityDetails = ({
  onBack,
  onNext,
  eventType,
  initialData,
  eventDate,
  eventDetails, // Added eventDetails prop to access the image
}) => {
  // Initialize state with initialData values if they exist
  const [displayStartDate, setDisplayStartDate] = useState(
    initialData?.displayPeriod?.startDate || ""
  );
  const [displayEndDate, setDisplayEndDate] = useState(
    initialData?.displayPeriod?.endDate || ""
  );
  const [displayStartTime, setDisplayStartTime] = useState(
    initialData?.displayPeriod?.startTime || ""
  );
  const [displayEndTime, setDisplayEndTime] = useState(
    initialData?.displayPeriod?.endTime || ""
  );

  // Get today's date in YYYY-MM-DD format for min date validation
  const today = new Date().toISOString().split('T')[0];

  // Reservation period state - only for ticketed events
  const [reservationStartDate, setReservationStartDate] = useState(
    initialData?.reservationPeriod?.startDate || ""
  );
  const [reservationEndDate, setReservationEndDate] = useState(
    initialData?.reservationPeriod?.endDate || ""
  );
  const [reservationStartTime, setReservationStartTime] = useState(
    initialData?.reservationPeriod?.startTime || ""
  );
  const [reservationEndTime, setReservationEndTime] = useState(
    initialData?.reservationPeriod?.endTime || ""
  );

  // Error state
  const [errors, setErrors] = useState({});
  // Warnings for date issues that don't block submission but should be noted
  const [warnings, setWarnings] = useState({});

  // Log initialData but don't reset form values
  useEffect(() => {
    console.log(
      "AvailabilityDetails component received initialData:",
      initialData
    );
  }, []);

  // Validate the availability details
  const validate = () => {
    const newErrors = {};
    const newWarnings = {};

    // Validate display period for all event types
    if (!displayStartDate)
      newErrors.displayStartDate = "Start display date is required";
    if (!displayEndDate)
      newErrors.displayEndDate = "End display date is required";

    // Validate dates are not before today
    if (displayStartDate && displayStartDate < today) {
      newErrors.displayStartDate = "Start display date cannot be before today";
    }
    if (displayEndDate && displayEndDate < today) {
      newErrors.displayEndDate = "End display date cannot be before today";
    }

    // Validate display times
    if (!displayStartTime)
      newErrors.displayStartTime = "Start display time is required";
    if (!displayEndTime)
      newErrors.displayEndTime = "End display time is required";

    // For ticketed events only, validate reservation period
    if (eventType === "ticketed") {
      if (!reservationStartDate)
        newErrors.reservationStartDate = "Start reservation date is required";
      if (!reservationEndDate)
        newErrors.reservationEndDate = "End reservation date is required";
      if (!reservationStartTime)
        newErrors.reservationStartTime = "Start reservation time is required";
      if (!reservationEndTime)
        newErrors.reservationEndTime = "End reservation time is required";

      // Validate reservation dates are not before today
      if (reservationStartDate && reservationStartDate < today) {
        newErrors.reservationStartDate = "Start reservation date cannot be before today";
      }
      if (reservationEndDate && reservationEndDate < today) {
        newErrors.reservationEndDate = "End reservation date cannot be before today";
      }

      // Validate reservation period is within display period
      if (
        reservationStartDate &&
        displayStartDate &&
        reservationStartDate < displayStartDate
      ) {
        newErrors.reservationStartDate =
          "Reservation start date must be within the display period";
      }

      if (
        reservationEndDate &&
        displayEndDate &&
        reservationEndDate > displayEndDate
      ) {
        newErrors.reservationEndDate =
          "Reservation end date must be within the display period";
      }

      // For same date, validate reservation times are within display times
      if (reservationStartDate === displayStartDate) {
        if (reservationStartTime < displayStartTime) {
          newErrors.reservationStartTime =
            "Reservation start time must be within display period";
        }
      }

      if (reservationEndDate === displayEndDate) {
        if (reservationEndTime > displayEndTime) {
          newErrors.reservationEndTime =
            "Reservation end time must be within display period";
        }
      }
    }

    // Date range validation
    if (
      displayStartDate &&
      displayEndDate &&
      displayStartDate > displayEndDate
    ) {
      newErrors.displayDateRange = "Display end date must be after start date";
    }

    if (
      eventType === "ticketed" &&
      reservationStartDate &&
      reservationEndDate &&
      reservationStartDate > reservationEndDate
    ) {
      newErrors.reservationDateRange =
        "Reservation end date must be after start date";
    }

    // New validation: Ensure display and reservation periods are before the event date
    if (
      displayEndDate &&
      eventDate &&
      new Date(displayEndDate) > new Date(eventDate)
    ) {
      newErrors.displayEndDateEvent =
        "Display end date must be before or on the event date";
    }

    if (
      eventType === "ticketed" &&
      reservationEndDate &&
      eventDate &&
      new Date(reservationEndDate) > new Date(eventDate)
    ) {
      newErrors.reservationEndDateEvent =
        "Reservation end date must be before or on the event date";
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      // Scroll to the top to show errors
      window.scrollTo(0, 0);
      return;
    }

    // For all event types, use expanded data structure with display period
    const availabilityData = {
      eventType,
      displayPeriod: {
        startDate: displayStartDate || new Date().toISOString().split("T")[0], // default to today
        endDate:
          displayEndDate ||
          new Date(new Date().setMonth(new Date().getMonth() + 3))
            .toISOString()
            .split("T")[0], // default to three months from now
        startTime: displayStartTime || "00:00", // default to 12:00 AM
        endTime: displayEndTime || "23:59", // default to 11:59 PM
      },
    };

    // Only add reservation period for ticketed events
    if (eventType === "ticketed") {
      availabilityData.reservationPeriod = {
        startDate:
          reservationStartDate ||
          displayStartDate ||
          new Date().toISOString().split("T")[0],
        endDate:
          reservationEndDate ||
          displayEndDate ||
          new Date(new Date().setMonth(new Date().getMonth() + 3))
            .toISOString()
            .split("T")[0],
        startTime: reservationStartTime || "08:00",
        endTime: reservationEndTime || "20:00",
      };
    }

    // Pass the data to the parent component
    onNext(availabilityData);
  };

  // For free events, show a simplified form with only display period
  if (eventType === "free") {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
              Free Event Display Period
            </p>
            <p className="text-[13px] text-[#B8B8B8] mb-4">
              Set when this free event should appear on the platform
            </p>
          </div>
        </div>

        <hr className="border-t border-gray-600 my-4" />

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4">
            <div className="flex items-center text-red-500 mb-2">
              <AlertCircleIcon className="h-5 w-5 mr-2" />
              <p className="font-semibold">Please fix the following errors:</p>
            </div>
            <ul className="list-disc pl-10 text-sm text-red-400">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {Object.keys(warnings).length > 0 && (
          <div className="bg-yellow-900/30 border border-yellow-500 rounded-md p-3 mb-4">
            <div className="flex items-center text-yellow-500 mb-2">
              <AlertCircleIcon className="h-5 w-5 mr-2" />
              <p className="font-semibold">
                Warnings (you can still continue):
              </p>
            </div>
            <ul className="list-disc pl-10 text-sm text-yellow-400">
              {Object.values(warnings).map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-6">
          <div className="w-1/3">
            <p className="text-[#FFAB40] text-sm mb-2">Event Preview</p>
            <div className="w-full aspect-square bg-[#1E1E1E] border-2 border-dashed border-[#FFAB40] rounded-lg flex items-center justify-center overflow-hidden">
              {eventDetails?.imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={eventDetails.imagePreview}
                    alt="Event"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-[#FFAB40] text-black px-2 py-1 rounded text-xs font-medium">
                    FREE
                  </span>
                </div>
              ) : (
                <div className="text-center p-4">
                  <span className="bg-[#FFAB40] text-black px-2 py-1 rounded text-xs font-medium mb-2 inline-block">
                    FREE
                  </span>
                  <div className="text-[#B8B8B8] text-sm mt-2">
                    Event Image Preview
                  </div>
                </div>
              )}
            </div>

            {/* Display event date reference */}
            {eventDate && (
              <div className="mt-3 p-2 bg-[#2A2A2A] rounded border border-[#FFAB40]">
                <p className="text-sm text-white">
                  <span className="text-[#FFAB40]">Event Date:</span>{" "}
                  {new Date(eventDate).toLocaleDateString()}
                </p>
                <p className="text-xs text-[#B8B8B8] mt-1">
                  All display periods should end before this date
                </p>
              </div>
            )}
          </div>

          <div className="w-2/3 space-y-4">
            {/* Display Period Section */}
            <div className="border border-gray-700 rounded-lg p-4">
              <p className="text-[#FFAB40] font-medium mb-3">Display Period</p>
              <div className="space-y-3">
                {errors.displayDateRange && (
                  <div className="bg-red-900/20 border border-red-500 rounded-md p-2 mb-2">
                    <p className="text-red-400 text-sm flex items-center">
                      <AlertCircleIcon className="h-4 w-4 mr-1" />
                      {errors.displayDateRange}
                    </p>
                  </div>
                )}

                {errors.displayEndDateEvent && (
                  <div className="bg-red-900/20 border border-red-500 rounded-md p-2 mb-2">
                    <p className="text-red-400 text-sm flex items-center">
                      <AlertCircleIcon className="h-4 w-4 mr-1" />
                      {errors.displayEndDateEvent}
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <p className="text-[#FFAB40] text-sm mb-1">
                      Start Display Date:
                    </p>
                    <input
                      type="date"
                      value={displayStartDate}
                      onChange={(e) => setDisplayStartDate(e.target.value)}
                      min={today}
                      className={`w-full bg-[#1E1E1E] border ${
                        errors.displayStartDate
                          ? "border-red-500"
                          : "border-[#333333]"
                      } text-white rounded px-3 py-2 text-sm`}
                    />
                  </div>
                  <div className="w-1/2">
                    <p className="text-[#FFAB40] text-sm mb-1">
                      Start Display Time:
                    </p>
                    <input
                      type="time"
                      value={displayStartTime}
                      onChange={(e) => setDisplayStartTime(e.target.value)}
                      className={`w-full bg-[#1E1E1E] border ${
                        errors.displayStartTime
                          ? "border-red-500"
                          : "border-[#333333]"
                      } text-white rounded px-3 py-2 text-sm`}
                      placeholder="00:00"
                    />
                  </div>
                </div>
                <p className="text-[#B8B8B8] text-xs mt-1 mb-3">
                  When should this event appear on the platform?
                </p>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <p className="text-[#FFAB40] text-sm mb-1">
                      End Display Date:
                    </p>
                    <input
                      type="date"
                      value={displayEndDate}
                      onChange={(e) => setDisplayEndDate(e.target.value)}
                      min={today}
                      max={eventDate} // Ensure date picker doesn't allow dates after event
                      className={`w-full bg-[#1E1E1E] border ${
                        errors.displayEndDate || errors.displayEndDateEvent
                          ? "border-red-500"
                          : "border-[#333333]"
                      } text-white rounded px-3 py-2 text-sm`}
                    />
                  </div>
                  <div className="w-1/2">
                    <p className="text-[#FFAB40] text-sm mb-1">
                      End Display Time:
                    </p>
                    <input
                      type="time"
                      value={displayEndTime}
                      onChange={(e) => setDisplayEndTime(e.target.value)}
                      className={`w-full bg-[#1E1E1E] border ${
                        errors.displayEndTime
                          ? "border-red-500"
                          : "border-[#333333]"
                      } text-white rounded px-3 py-2 text-sm`}
                      placeholder="23:59"
                    />
                  </div>
                </div>
                <p className="text-[#B8B8B8] text-xs mt-1 mb-3">
                  When should this event stop showing on the platform? (Must be
                  before the event date)
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[#B8B8B8] text-xs mt-4 border-t border-gray-600 pt-4">
          Note: Free events don't require a reservation period. Users can simply
          view the event during the display period.
        </p>

        {/* Hidden button for parent component to trigger submit */}
        <button
          className="hidden availability-submit-button"
          onClick={handleSubmit}
        />
      </div>
    );
  }

  // For coming soon events, show only display period
  if (eventType === "coming_soon") {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
              "Coming Soon" Display Period
            </p>
            <p className="text-[13px] text-[#B8B8B8] mb-4">
              Set when this "Coming Soon" event should appear on the platform
            </p>
          </div>
        </div>

        <hr className="border-t border-gray-600 my-4" />

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4">
            <div className="flex items-center text-red-500 mb-2">
              <AlertCircleIcon className="h-5 w-5 mr-2" />
              <p className="font-semibold">Please fix the following errors:</p>
            </div>
            <ul className="list-disc pl-10 text-sm text-red-400">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-6">
          <div className="w-1/3">
            <p className="text-[#FFAB40] text-sm mb-2">Event Preview</p>
            <div className="w-full aspect-square bg-[#1E1E1E] border-2 border-dashed border-[#FFAB40] rounded-lg flex items-center justify-center overflow-hidden">
              {eventDetails?.imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={eventDetails.imagePreview}
                    alt="Event"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-[#FFAB40] text-black px-2 py-1 rounded text-xs font-medium">
                    COMING SOON
                  </span>
                </div>
              ) : (
                <div className="text-center p-4">
                  <span className="bg-[#FFAB40] text-black px-2 py-1 rounded text-xs font-medium mb-2 inline-block">
                    COMING SOON
                  </span>
                  <div className="text-[#B8B8B8] text-sm mt-2">
                    Event Image Preview
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-2/3 space-y-4">
            <div className="border border-gray-700 rounded-lg p-4">
              <p className="text-[#FFAB40] font-medium mb-3">Display Period</p>
              <div className="space-y-3">
                {errors.displayDateRange && (
                  <div className="bg-red-900/20 border border-red-500 rounded-md p-2 mb-2">
                    <p className="text-red-400 text-sm flex items-center">
                      <AlertCircleIcon className="h-4 w-4 mr-1" />
                      {errors.displayDateRange}
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <p className="text-[#FFAB40] text-sm mb-1">
                      Start Display Date:
                    </p>
                    <input
                      type="date"
                      value={displayStartDate}
                      onChange={(e) => setDisplayStartDate(e.target.value)}
                      min={today}
                      className={`w-full bg-[#1E1E1E] border ${
                        errors.displayStartDate
                          ? "border-red-500"
                          : "border-[#333333]"
                      } text-white rounded px-3 py-2 text-sm`}
                    />
                    <p className="text-xs text-[#B8B8B8] mt-1">
                      When should this "Coming Soon" event start appearing?
                    </p>
                  </div>
                  <div className="w-1/2">
                    <p className="text-[#FFAB40] text-sm mb-1">
                      Start Display Time:
                    </p>
                    <input
                      type="time"
                      value={displayStartTime}
                      onChange={(e) => setDisplayStartTime(e.target.value)}
                      className={`w-full bg-[#1E1E1E] border ${
                        errors.displayStartTime
                          ? "border-red-500"
                          : "border-[#333333]"
                      } text-white rounded px-3 py-2 text-sm`}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <p className="text-[#FFAB40] text-sm mb-1">
                      End Display Date:
                    </p>
                    <input
                      type="date"
                      value={displayEndDate}
                      onChange={(e) => setDisplayEndDate(e.target.value)}
                      min={today}
                      className={`w-full bg-[#1E1E1E] border ${
                        errors.displayEndDate
                          ? "border-red-500"
                          : "border-[#333333]"
                      } text-white rounded px-3 py-2 text-sm`}
                    />
                    <p className="text-xs text-[#B8B8B8] mt-1">
                      When should the "Coming Soon" notice be removed if not
                      updated?
                    </p>
                  </div>
                  <div className="w-1/2">
                    <p className="text-[#FFAB40] text-sm mb-1">
                      End Display Time:
                    </p>
                    <input
                      type="time"
                      value={displayEndTime}
                      onChange={(e) => setDisplayEndTime(e.target.value)}
                      className={`w-full bg-[#1E1E1E] border ${
                        errors.displayEndTime
                          ? "border-red-500"
                          : "border-[#333333]"
                      } text-white rounded px-3 py-2 text-sm`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[#B8B8B8] text-xs mt-4 border-t border-gray-600 pt-4">
          Note: This event will be displayed with a "COMING SOON" label until
          you update it with complete information.
        </p>

        {/* Hidden button for parent component to trigger submit */}
        <button
          className="hidden availability-submit-button"
          onClick={handleSubmit}
        />
      </div>
    );
  }

  // For ticketed events - full form with both periods
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
            Event Availability
          </p>
          <p className="text-[13px] text-[#B8B8B8] mb-4">
            Set display and reservation periods for this event
          </p>
        </div>
      </div>

      <hr className="border-t border-gray-600 my-4" />

      {Object.keys(errors).length > 0 && (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4">
          <div className="flex items-center text-red-500 mb-2">
            <AlertCircleIcon className="h-5 w-5 mr-2" />
            <p className="font-semibold">Please fix the following errors:</p>
          </div>
          <ul className="list-disc pl-10 text-sm text-red-400">
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {Object.keys(warnings).length > 0 && (
        <div className="bg-yellow-900/30 border border-yellow-500 rounded-md p-3 mb-4">
          <div className="flex items-center text-yellow-500 mb-2">
            <AlertCircleIcon className="h-5 w-5 mr-2" />
            <p className="font-semibold">Warnings (you can still continue):</p>
          </div>
          <ul className="list-disc pl-10 text-sm text-yellow-400">
            {Object.values(warnings).map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-6">
        {/* Event Picture Preview */}
        <div className="w-1/3">
          <p className="text-[#FFAB40] text-sm mb-2">Event Preview</p>
          <div className="w-full aspect-square bg-[#1E1E1E] border-2 border-dashed border-[#FFAB40] rounded-lg flex items-center justify-center overflow-hidden">
            {eventDetails?.imagePreview ? (
              <img
                src={eventDetails.imagePreview}
                alt="Event"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-[#B8B8B8] text-sm">Event Image Preview</div>
            )}
          </div>

          {/* Display event date reference */}
          {eventDate && (
            <div className="mt-3 p-2 bg-[#2A2A2A] rounded border border-[#FFAB40]">
              <p className="text-sm text-white">
                <span className="text-[#FFAB40]">Event Date:</span>{" "}
                {new Date(eventDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-[#B8B8B8] mt-1">
                All display and reservation periods should end before this date
              </p>
            </div>
          )}
        </div>

        {/* Availability Period Inputs */}
        <div className="w-2/3 space-y-4">
          {/* Display Period Section */}
          <div className="border border-gray-700 rounded-lg p-4">
            <p className="text-[#FFAB40] font-medium mb-3">Display Period</p>
            <div className="space-y-3">
              {errors.displayDateRange && (
                <div className="bg-red-900/20 border border-red-500 rounded-md p-2 mb-2">
                  <p className="text-red-400 text-sm flex items-center">
                    <AlertCircleIcon className="h-4 w-4 mr-1" />
                    {errors.displayDateRange}
                  </p>
                </div>
              )}

              {errors.displayEndDateEvent && (
                <div className="bg-red-900/20 border border-red-500 rounded-md p-2 mb-2">
                  <p className="text-red-400 text-sm flex items-center">
                    <AlertCircleIcon className="h-4 w-4 mr-1" />
                    {errors.displayEndDateEvent}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <div className="w-1/2">
                  <p className="text-[#FFAB40] text-sm mb-1">
                    Start Display Date:
                  </p>
                  <input
                    type="date"
                    value={displayStartDate}
                    onChange={(e) => setDisplayStartDate(e.target.value)}
                    min={today}
                    className={`w-full bg-[#1E1E1E] border ${
                      errors.displayStartDate
                        ? "border-red-500"
                        : "border-[#333333]"
                    } text-white rounded px-3 py-2 text-sm`}
                  />
                </div>
                <div className="w-1/2">
                  <p className="text-[#FFAB40] text-sm mb-1">
                    Start Display Time:
                  </p>
                  <input
                    type="time"
                    value={displayStartTime}
                    onChange={(e) => setDisplayStartTime(e.target.value)}
                    className={`w-full bg-[#1E1E1E] border ${
                      errors.displayStartTime
                        ? "border-red-500"
                        : "border-[#333333]"
                    } text-white rounded px-3 py-2 text-sm`}
                    placeholder="00:00"
                  />
                </div>
              </div>
              <p className="text-[#B8B8B8] text-xs mt-1 mb-3">
                When should this event appear on the platform?
              </p>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <p className="text-[#FFAB40] text-sm mb-1">
                    End Display Date:
                  </p>
                  <input
                    type="date"
                    value={displayEndDate}
                    onChange={(e) => setDisplayEndDate(e.target.value)}
                    min={today}
                    max={eventDate} // Ensure date picker doesn't allow dates after event
                    className={`w-full bg-[#1E1E1E] border ${
                      errors.displayEndDate || errors.displayEndDateEvent
                        ? "border-red-500"
                        : "border-[#333333]"
                    } text-white rounded px-3 py-2 text-sm`}
                  />
                </div>
                <div className="w-1/2">
                  <p className="text-[#FFAB40] text-sm mb-1">
                    End Display Time:
                  </p>
                  <input
                    type="time"
                    value={displayEndTime}
                    onChange={(e) => setDisplayEndTime(e.target.value)}
                    className={`w-full bg-[#1E1E1E] border ${
                      errors.displayEndTime
                        ? "border-red-500"
                        : "border-[#333333]"
                    } text-white rounded px-3 py-2 text-sm`}
                    placeholder="23:59"
                  />
                </div>
              </div>
              <p className="text-[#B8B8B8] text-xs mt-1 mb-3">
                When should this event stop showing on the platform? (Must be
                before the event date)
              </p>
            </div>
          </div>

          {/* Reservation Period Section */}
          <div className="border border-gray-700 rounded-lg p-4">
            <p className="text-[#FFAB40] font-medium mb-3">
              Reservation Period
            </p>
            <div className="space-y-3">
              {errors.reservationDateRange && (
                <div className="bg-red-900/20 border border-red-500 rounded-md p-2 mb-2">
                  <p className="text-red-400 text-sm flex items-center">
                    <AlertCircleIcon className="h-4 w-4 mr-1" />
                    {errors.reservationDateRange}
                  </p>
                </div>
              )}

              {errors.reservationEndDateEvent && (
                <div className="bg-red-900/20 border border-red-500 rounded-md p-2 mb-2">
                  <p className="text-red-400 text-sm flex items-center">
                    <AlertCircleIcon className="h-4 w-4 mr-1" />
                    {errors.reservationEndDateEvent}
                  </p>
                </div>
              )}

              {warnings.shortReservationPeriod && (
                <div className="bg-yellow-900/20 border border-yellow-500 rounded-md p-2 mb-2">
                  <p className="text-yellow-400 text-sm flex items-center">
                    <AlertCircleIcon className="h-4 w-4 mr-1" />
                    {warnings.shortReservationPeriod}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[#FFAB40] text-sm mb-1">
                  Start Reservation Date:
                </p>
                <input
                  type="date"
                  value={reservationStartDate}
                  onChange={(e) => setReservationStartDate(e.target.value)}
                  min={today}
                  className={`w-full bg-[#1E1E1E] border ${
                    errors.reservationStartDate
                      ? "border-red-500"
                      : "border-[#333333]"
                  } text-white rounded px-3 py-2 text-sm`}
                />
                <p className="text-[#B8B8B8] text-xs mt-1">
                  When can users start making reservations?
                </p>
              </div>

              <div>
                <p className="text-[#FFAB40] text-sm mb-1">
                  End Reservation Date:
                </p>
                <input
                  type="date"
                  value={reservationEndDate}
                  onChange={(e) => setReservationEndDate(e.target.value)}
                  min={today}
                  max={eventDate} // Ensure date picker doesn't allow dates after event
                  className={`w-full bg-[#1E1E1E] border ${
                    errors.reservationEndDate || errors.reservationEndDateEvent
                      ? "border-red-500"
                      : "border-[#333333]"
                  } text-white rounded px-3 py-2 text-sm`}
                />
                <p className="text-[#B8B8B8] text-xs mt-1">
                  When do reservations close? (Must be before the event date)
                </p>
              </div>

              <div>
                <p className="text-[#FFAB40] text-sm mb-1">
                  Reservation Start Time:
                </p>
                <input
                  type="time"
                  value={reservationStartTime}
                  onChange={(e) => setReservationStartTime(e.target.value)}
                  className={`w-full bg-[#1E1E1E] border ${
                    errors.reservationStartTime
                      ? "border-red-500"
                      : "border-[#333333]"
                  } text-white rounded px-3 py-2 text-sm`}
                />
                <p className="text-[#B8B8B8] text-xs mt-1">
                  Time when reservations become available
                </p>
              </div>

              <div>
                <p className="text-[#FFAB40] text-sm mb-1">
                  Reservation End Time:
                </p>
                <input
                  type="time"
                  value={reservationEndTime}
                  onChange={(e) => setReservationEndTime(e.target.value)}
                  className={`w-full bg-[#1E1E1E] border ${
                    errors.reservationEndTime
                      ? "border-red-500"
                      : "border-[#333333]"
                  } text-white rounded px-3 py-2 text-sm`}
                />
                <p className="text-[#B8B8B8] text-xs mt-1">
                  Time when reservations are no longer available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden button for parent component to trigger submit */}
      <button
        className="hidden availability-submit-button"
        onClick={handleSubmit}
      />
    </div>
  );
};
const SummaryDetails = ({
  eventDetails,
  ticketDetails,
  claimingDetails,
  availabilityDetails,
  onBack,
  onNext,
}) => {
  // Get event type
  const eventType = eventDetails?.eventType || "ticketed";
  const [showMapModal, setShowMapModal] = useState(false);

  // Map Modal Component
  const MapModal = () => {
    if (!showMapModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1E1E1E] rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-600">
            <h3 className="text-white text-xl font-semibold">Event Venue Map</h3>
            <button
              onClick={() => setShowMapModal(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 overflow-auto max-h-[calc(90vh-100px)]">
            {eventDetails?.venueMapPreview ? (
              <img 
                src={eventDetails.venueMapPreview} 
                alt="Venue Map" 
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <div className="text-center text-gray-400 py-8">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p>No map data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Calculate total tickets
  const getTotalTickets = () => {
    if (eventType === "free") {
      return ticketDetails?.freeSeating?.numberOfTickets || 0;
    }

    if (eventType === "coming_soon" && ticketDetails?.hasTierInfo) {
      if (ticketDetails.tierType === "freeSeating") {
        return ticketDetails?.freeSeating?.numberOfTickets || 0;
      } else {
        let total = 0;
        if (ticketDetails?.ticketTiers) {
          Object.entries(ticketDetails.ticketTiers)
            .filter(([_, tierData]) => tierData.checked)
            .forEach(([_, tierData]) => {
              total += tierData.number || 0;
            });
        }
        return total;
      }
    }

    if (ticketDetails?.tierType === "freeSeating") {
      return ticketDetails?.freeSeating?.numberOfTickets || 0;
    } else {
      let total = 0;
      if (ticketDetails?.ticketTiers) {
        Object.entries(ticketDetails.ticketTiers)
          .filter(([_, tierData]) => tierData.checked)
          .forEach(([_, tierData]) => {
            total += tierData.number || 0;
          });
      }
      return total;
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
            Summary Details
          </p>
          <p className="text-[13px] text-[#B8B8B8] mb-4">
            Review and confirm the details of your event
          </p>
        </div>
      </div>

      <hr className="border-t border-gray-600 my-4" />

      <div className="space-y-6">
        {/* Event Details Summary */}
        <div>
          <h3 className="text-[#FFAB40] text-xl font-semibold mb-2">
            Event Information
          </h3>
          <div className="bg-[#1E1E1E] rounded-lg p-4">
            <div className="flex gap-4">
              <div className="w-1/3">
                {eventDetails?.imagePreview ? (
                  <div className="relative">
                    <img
                      src={eventDetails.imagePreview}
                      alt="Event"
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    {eventType === "coming_soon" && (
                      <div className="absolute top-2 left-2 bg-[#FFAB40] text-black px-2 py-1 rounded-md text-xs font-semibold">
                        COMING SOON
                      </div>
                    )}
                    {eventType === "free" && (
                      <div className="absolute top-2 left-2 bg-[#FFAB40] text-black px-2 py-1 rounded-md text-xs font-semibold">
                        FREE
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-[#333333] rounded-lg flex items-center justify-center relative">
                    <span className="text-gray-500 text-sm">No Image</span>
                    {eventType === "coming_soon" && (
                      <div className="absolute top-2 left-2 bg-[#FFAB40] text-black px-2 py-1 rounded-md text-xs font-semibold">
                        COMING SOON
                      </div>
                    )}
                    {eventType === "free" && (
                      <div className="absolute top-2 left-2 bg-[#FFAB40] text-black px-2 py-1 rounded-md text-xs font-semibold">
                        FREE
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="w-2/3 space-y-2">
                <div>
                  <p className="text-[#B8B8B8] text-xs">Event Name</p>
                  <p className="text-white">
                    {eventDetails?.eventName || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-[#B8B8B8] text-xs">Event Date</p>
                  <p className="text-white">
                    {eventDetails?.eventDate || "N/A"}
                    {eventType === "coming_soon" && (
                      <span className="text-[#FFAB40] ml-2 text-xs">
                        (Tentative)
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[#B8B8B8] text-xs">Venue</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white">
                      {eventDetails?.venue || "N/A"}
                      {eventType === "coming_soon" && (
                        <span className="text-[#FFAB40] ml-2 text-xs">
                          (Tentative)
                        </span>
                      )}
                    </p>
                    {eventDetails?.venueMapPreview && (
                      <button
                        onClick={() => setShowMapModal(true)}
                        className="bg-[#FFAB40] text-[#2E2E2E] text-xs font-semibold py-1.5 px-3 rounded-full hover:bg-[#FF9800] transition-colors duration-200 flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Map
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[#B8B8B8] text-xs">Time</p>
                  <p className="text-white">
                    {eventDetails?.startTime &&
                      `${eventDetails.startTime}${
                        eventDetails.endTime
                          ? ` to ${eventDetails.endTime}`
                          : ""
                      }`}
                    {!eventDetails?.startTime && "N/A"}
                    {eventType === "coming_soon" && (
                      <span className="text-[#FFAB40] ml-2 text-xs">
                        (Tentative)
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[#B8B8B8] text-xs">Category</p>
                  <p className="text-white">
                    {eventDetails?.eventCategory || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-[#B8B8B8] text-xs">Event Type</p>
                  <p className="text-white">
                    {eventType === "ticketed" && "Ticketed Event"}
                    {eventType === "coming_soon" && "Coming Soon Event"}
                    {eventType === "free" && "Free Event"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-[#B8B8B8] text-xs">Description</p>
              <p className="text-white text-sm">
                {eventDetails?.eventDescription || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Details Summary */}
        {(eventType === "ticketed" ||
          eventType === "free" ||
          (eventType === "coming_soon" && ticketDetails?.hasTierInfo)) && (
          <div>
            <h3 className="text-[#FFAB40] text-xl font-semibold mb-2">
              TICKETS
            </h3>
            <div className="bg-[#1E1E1E] rounded-lg p-4">
              {eventType === "free" && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="mr-3 text-[#FFAB40]">
                      <InfoIcon className="h-8 w-8" />
                    </div>
                    <div>
                      <span className="text-white font-semibold">
                        Free Event
                      </span>
                      <p className="text-gray-400 text-sm">
                        This is a free event. All tickets are available at no
                        cost.
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Total tickets:{" "}
                        {ticketDetails?.freeSeating?.numberOfTickets || 0}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Max per person:{" "}
                        {ticketDetails?.freeSeating?.maxPerPerson || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Coming Soon with NO ticket info */}
              {eventType === "coming_soon" && !ticketDetails?.hasTierInfo && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="mr-3 text-[#FFAB40]">
                      <InfoIcon className="h-8 w-8" />
                    </div>
                    <div>
                      <span className="text-white font-semibold">
                        Coming Soon
                      </span>
                      <p className="text-gray-400 text-sm">
                        Ticket details will be available when this event is
                        fully published.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Coming Soon WITH ticket tiers */}
              {eventType === "coming_soon" && ticketDetails?.hasTierInfo && (
                <div>
                  <div className="flex items-center mb-3">
                    <div className="mr-3 text-[#FFAB40]">
                      <InfoIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        Coming Soon - Preliminary Ticket Structure
                      </p>
                      <p className="text-gray-400 text-sm">
                        These ticket details are planned but not yet available
                        for reservations.
                      </p>
                    </div>
                  </div>

                  {ticketDetails.tierType === "freeSeating" ? (
                    <div className="flex items-center mt-4 mb-3 bg-[#272727] p-3 rounded-lg">
                      <div className="mr-3">
                        <span className="inline-flex items-center">
                          <svg
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400"
                          >
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                            <line x1="7" y1="7" x2="7.01" y2="7"></line>
                          </svg>
                        </span>
                      </div>
                      <div>
                        <span className="text-white text-xl font-bold">
                          ₱{ticketDetails.freeSeating.price}
                        </span>
                        <p className="text-gray-400 text-sm">
                          1 ticket, Free Seating
                        </p>
                        <p className="text-gray-400 text-xs">
                          Max per person:{" "}
                          {ticketDetails.freeSeating.maxPerPerson}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-4 mt-4 mb-3">
                      {ticketDetails?.ticketTiers &&
                        Object.entries(ticketDetails.ticketTiers)
                          .filter(([_, tierData]) => tierData.checked)
                          .map(([tierName, tierData]) => (
                            <div
                              key={tierName}
                              className="bg-[#272727] p-3 rounded-lg flex items-center"
                            >
                              <div className="mr-3">
                                <span className="inline-flex items-center">
                                  <svg
                                    viewBox="0 0 24 24"
                                    width="24"
                                    height="24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-gray-400"
                                  >
                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                  </svg>
                                </span>
                              </div>
                              <div>
                                <span className="text-white text-xl font-bold">
                                  ₱{tierData.price}
                                </span>
                                <p className="text-gray-400 text-sm">
                                  1 ticket, {tierName}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  Max per person: {tierData.maxPerPerson}
                                </p>
                              </div>
                            </div>
                          ))}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-700">
                    <p className="text-gray-400 text-sm font-semibold">
                      Planned capacity:{" "}
                      <span className="text-[#FFAB40]">
                        {getTotalTickets()} tickets
                      </span>
                    </p>
                    <p className="text-gray-400 text-xs mt-1 italic">
                      Final ticket details may change when the event is fully
                      published.
                    </p>
                  </div>
                </div>
              )}

              {eventType === "ticketed" &&
                ticketDetails?.tierType === "freeSeating" && (
                  <div className="flex items-center mb-4">
                    <div className="bg-[#272727] p-3 rounded-lg flex items-center">
                      <div className="mr-3">
                        <span className="inline-flex items-center">
                          <svg
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400"
                          >
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                            <line x1="7" y1="7" x2="7.01" y2="7"></line>
                          </svg>
                        </span>
                      </div>
                      <div>
                        <span className="text-white text-xl font-bold">
                          ₱{ticketDetails.freeSeating.price}
                        </span>
                        <p className="text-gray-400 text-sm">
                          1 ticket, Free Seating
                        </p>
                        <p className="text-gray-400 text-xs">
                          Max per person:{" "}
                          {ticketDetails.freeSeating.maxPerPerson}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              {eventType === "ticketed" &&
                ticketDetails?.tierType === "ticketed" && (
                  <div className="flex flex-wrap gap-4 mb-4">
                    {ticketDetails?.ticketTiers &&
                      Object.entries(ticketDetails.ticketTiers)
                        .filter(([_, tierData]) => tierData.checked)
                        .map(([tierName, tierData]) => (
                          <div
                            key={tierName}
                            className="bg-[#272727] p-3 rounded-lg flex items-center"
                          >
                            <div className="mr-3">
                              <span className="inline-flex items-center">
                                <svg
                                  viewBox="0 0 24 24"
                                  width="24"
                                  height="24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-gray-400"
                                >
                                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                </svg>
                              </span>
                            </div>
                            <div>
                              <span className="text-white text-xl font-bold">
                                ₱{tierData.price}
                              </span>
                              <p className="text-gray-400 text-sm">
                                1 ticket, {tierName}
                              </p>
                              <p className="text-gray-400 text-xs">
                                Max per person: {tierData.maxPerPerson}
                              </p>
                            </div>
                          </div>
                        ))}
                  </div>
                )}

              {(eventType === "ticketed" ||
                eventType === "free" ||
                (eventType === "coming_soon" &&
                  ticketDetails?.hasTierInfo)) && (
                <div className="mt-4 border-t border-gray-700 pt-4">
                  <p className="uppercase text-white font-medium">
                    TOTAL NUMBER OF TICKETS:{" "}
                    <span className="text-[#FFAB40]">
                      {getTotalTickets()}{" "}
                      {eventType === "coming_soon" ? "Planned" : "Available"}{" "}
                      Tickets
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Claiming Details Summary - only for ticketed events */}
        {eventType === "ticketed" &&
          claimingDetails &&
          claimingDetails.claimingSummaries &&
          claimingDetails.claimingSummaries.length > 0 && (
            <div>
              <h3 className="text-[#FFAB40] text-xl font-semibold mb-2">
                CLAIMING DETAILS
              </h3>
              <div className="bg-[#1E1E1E] rounded-lg p-4">
                <table className="w-full">
                  <thead className="bg-[#2C2C2C]">
                    <tr>
                      <th className="py-2 px-3 text-left text-sm text-[#FFAB40]">
                        Date
                      </th>
                      <th className="py-2 px-3 text-left text-sm text-[#FFAB40]">
                        Time
                      </th>
                      <th className="py-2 px-3 text-left text-sm text-[#FFAB40]">
                        Venue
                      </th>
                      <th className="py-2 px-3 text-left text-sm text-[#FFAB40]">
                        Max Reservations
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {claimingDetails.claimingSummaries.map((summary, index) => (
                      <tr key={index} className="border-t border-[#333333]">
                        <td className="py-2 px-3 text-sm text-white">
                          {new Date(summary.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="py-2 px-3 text-sm text-white">
                          {summary.startTime} to {summary.endTime}
                        </td>
                        <td className="py-2 px-3 text-sm text-white">
                          {summary.venue}
                        </td>
                        <td className="py-2 px-3 text-sm text-white">
                          {summary.maxReservations}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Availability Details Summary */}
        {availabilityDetails && (
          <div>
            <h3 className="text-[#FFAB40] text-xl font-semibold mb-2">
              AVAILABILITY PERIOD
            </h3>
            <div className="bg-[#1E1E1E] rounded-lg p-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[#FFAB40] font-medium mb-2">
                    Display Period:
                  </h4>
                  <div className="text-white space-y-1">
                    <p>
                      <span className="text-[#B8B8B8] text-sm">
                        Start Date:
                      </span>{" "}
                      {availabilityDetails.displayPeriod?.startDate
                        ? new Date(
                            availabilityDetails.displayPeriod.startDate
                          ).toLocaleDateString()
                        : "Not set"}
                    </p>
                    <p>
                      <span className="text-[#B8B8B8] text-sm">
                        Start Time:
                      </span>{" "}
                      {availabilityDetails.displayPeriod?.startTime ||
                        "Not set"}
                    </p>
                    <p>
                      <span className="text-[#B8B8B8] text-sm">End Date:</span>{" "}
                      {availabilityDetails.displayPeriod?.endDate
                        ? new Date(
                            availabilityDetails.displayPeriod.endDate
                          ).toLocaleDateString()
                        : "Not set"}
                    </p>
                    <p>
                      <span className="text-[#B8B8B8] text-sm">End Time:</span>{" "}
                      {availabilityDetails.displayPeriod?.endTime || "Not set"}
                    </p>
                  </div>
                </div>

                {eventType === "ticketed" &&
                  availabilityDetails.reservationPeriod && (
                    <div>
                      <h4 className="text-[#FFAB40] font-medium mb-2">
                        Reservation Period:
                      </h4>
                      <div className="text-white space-y-1">
                        <p>
                          <span className="text-[#B8B8B8] text-sm">
                            Start Date:
                          </span>{" "}
                          {availabilityDetails.reservationPeriod?.startDate
                            ? new Date(
                                availabilityDetails.reservationPeriod.startDate
                              ).toLocaleDateString()
                            : "Not set"}
                        </p>
                        <p>
                          <span className="text-[#B8B8B8] text-sm">
                            Start Time:
                          </span>{" "}
                          {availabilityDetails.reservationPeriod?.startTime ||
                            "Not set"}
                        </p>
                        <p>
                          <span className="text-[#B8B8B8] text-sm">
                            End Date:
                          </span>{" "}
                          {availabilityDetails.reservationPeriod?.endDate
                            ? new Date(
                                availabilityDetails.reservationPeriod.endDate
                              ).toLocaleDateString()
                            : "Not set"}
                        </p>
                        <p>
                          <span className="text-[#B8B8B8] text-sm">
                            End Time:
                          </span>{" "}
                          {availabilityDetails.reservationPeriod?.endTime ||
                            "Not set"}
                        </p>
                      </div>
                    </div>
                  )}

                {eventType === "free" && (
                  <div>
                    <h4 className="text-[#FFAB40] font-medium mb-2">
                      Reservation Period:
                    </h4>
                    <div className="text-[#B8B8B8] italic">
                      <p>No reservation period for free events</p>
                      <p className="mt-2 text-sm">
                        Free events don't require users to make reservations.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {eventType === "coming_soon" && (
                <div className="mt-4 pt-3 border-t border-gray-600 text-[#B8B8B8] text-sm">
                  <p>
                    Note: Reservation period will be set when this "Coming Soon"
                    event is fully published.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Publishing Status */}
        <div>
          <h3 className="text-[#FFAB40] text-xl font-semibold mb-2">
            PUBLISHING STATUS
          </h3>
          <div className="bg-[#1E1E1E] rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-white">
                {eventType === "coming_soon"
                  ? "Ready to publish as COMING SOON"
                  : eventType === "free"
                  ? "Ready to publish as FREE EVENT"
                  : "Ready to publish as TICKETED EVENT"}
              </span>
            </div>
            <p className="text-[#B8B8B8] text-sm mt-2 pl-6">
              {eventType === "coming_soon"
                ? "This event will be published with a 'Coming Soon' status. Users can view the event but cannot make reservations yet."
                : eventType === "free"
                ? "This free event will be published and immediately visible to users. No payment required for tickets."
                : "This ticketed event will be published according to the availability period you set."}
            </p>
            <div className="mt-4 text-sm">
              <p className="text-white">
                <span className="text-[#B8B8B8]">Visibility:</span> Published
              </p>
              <p className="text-white">
                <span className="text-[#B8B8B8]">Status:</span>{" "}
                {eventType === "coming_soon" || eventType === "free"
                  ? "Closed"
                  : "Scheduled"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && <MapModal />}
    </div>
  );
};

const Admin_PublishEvent = ({
  onPublish = () => console.warn("No publish handler"),
  onSaveAsDraft = () => console.warn("No save as draft handler"),
  isSubmitting = false,
  initialData = null,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventDetails, setEventDetails] = useState(
    initialData?.eventDetails || null
  );
  const [ticketDetails, setTicketDetails] = useState(
    initialData?.ticketDetails || null
  );
  const [claimingDetails, setClaimingDetails] = useState(
    initialData?.claimingDetails || null
  );
  const [availabilityDetails, setAvailabilityDetails] = useState(
    initialData?.availabilityDetails || null
  );

  // Update state when initialData changes (for coming soon conversions)
  useEffect(() => {
    if (initialData) {
      if (initialData.eventDetails) setEventDetails(initialData.eventDetails);
      if (initialData.ticketDetails)
        setTicketDetails(initialData.ticketDetails);
      if (initialData.claimingDetails)
        setClaimingDetails(initialData.claimingDetails);
      if (initialData.availabilityDetails)
        setAvailabilityDetails(initialData.availabilityDetails);
    }
  }, [initialData]);

  const isValidEventDetails = () => {
    // Check if eventDetails exists and has minimum required fields
    if (!eventDetails) return false;

    const requiredFields = [
      "eventName", // Event name is mandatory
      "eventDescription", // Description is mandatory
      "eventCategory", // Category is mandatory
      "eventType", // Event type is mandatory
      "eventDate", // Date is mandatory
      "venue", // Venue is mandatory
    ];

    // Check that all required fields have non-empty values
    return requiredFields.every(
      (field) => eventDetails[field] && eventDetails[field].trim() !== ""
    );
  };

  // Get the next step based on event type
  const getNextStep = (currentStep, eventType) => {
    // For free events: Skip tickets and claiming steps
    if (eventType === "free") {
      if (currentStep === 1) return 4; // From event details to availability
      if (currentStep === 4) return 5; // From availability to summary
    }

    // For coming soon events: Skip claiming step
    if (eventType === "coming_soon") {
      if (currentStep === 2) return 4; // From tickets to availability
      if (currentStep === 4) return 5; // From availability to summary
    }

    // Default flow for ticketed events
    return currentStep + 1;
  };

  const handleEventDetailsNext = (details) => {
    setEventDetails(details);
    // Pass the map data to the ticket details section
    setTicketDetails(prev => ({
      ...prev,
      mapImage: details.venueMapPreview || details.mapImage
    }));
    setCurrentStep(getNextStep(1, details.eventType));
  };

  const handleTicketDetailsNext = (details) => {
    setTicketDetails(details);
    setCurrentStep(
      getNextStep(2, details.eventType || eventDetails?.eventType)
    );
  };

  const handleClaimingDetailsNext = (details) => {
    setClaimingDetails(details);
    setCurrentStep(
      getNextStep(3, details.eventType || eventDetails?.eventType)
    );
  };

  const handleAvailabilityDetailsNext = (details) => {
    setAvailabilityDetails(details);
    setCurrentStep(
      getNextStep(4, details.eventType || eventDetails?.eventType)
    );
  };

  // Modified section of handleSummaryNext method to use container props
  const handleSummaryNext = () => {
    // Ensure all required data is available
    if (!eventDetails) {
      console.error("Missing event details");
      return;
    }

    // Prepare full event data based on event type
    let fullEventData = {
      eventDetails,
      availabilityDetails,
    };

    // Add specific details based on event type
    const eventType = eventDetails?.eventType || "ticketed";

    if (eventType === "free") {
      fullEventData = {
        ...fullEventData,
        ticketDetails,
        eventType: "free",
      };
    } else if (eventType === "coming_soon") {
      fullEventData = {
        ...fullEventData,
        ticketDetails,
        eventType: "coming_soon",
      };
    } else {
      // Regular ticketed event
      fullEventData = {
        ...fullEventData,
        ticketDetails,
        claimingDetails,
        eventType: "ticketed",
      };
    }

    // Debug log
    console.log("Sending event data:", fullEventData);

    // Call the onPublish prop function from the container
    onPublish(fullEventData);
  };

  const handleSaveAsDraft = () => {
    // Collect current data regardless of which step the user is on
    const draftData = {
      eventDetails,
      ticketDetails,
      claimingDetails,
      availabilityDetails,
      currentStep,
      savedAt: new Date().toISOString(),
    };

    // Call the onSaveAsDraft prop function from the container
    onSaveAsDraft(draftData);
  };

  // Handle going back to previous step
  const handleBack = () => {
    // Get the previous step based on event type
    const eventType = eventDetails?.eventType || "ticketed";

    if (eventType === "free") {
      if (currentStep === 4)
        setCurrentStep(1); // From availability back to details
      else if (currentStep === 5) setCurrentStep(4); // From summary back to availability
    } else if (eventType === "coming_soon") {
      if (currentStep === 4)
        setCurrentStep(2); // From availability back to tickets
      else if (currentStep === 5)
        setCurrentStep(4); // From summary back to availability
      else setCurrentStep(currentStep - 1); // Normal back
    } else {
      // Normal back for ticketed
      setCurrentStep(currentStep - 1);
    }
  };

  // Get the event type from current eventDetails
  const eventType = eventDetails?.eventType || "ticketed";

  // Helper function to determine button text
  const getNextButtonText = (step) => {
    if (step === 5) {
      // For coming soon conversions, use a different text
      if (eventDetails?.comingSoonConversion) {
        return "Convert to Published Event";
      }

      // Final publish button based on event type
      if (eventType === "coming_soon") return "Save as Coming Soon";
      if (eventType === "free") return "Publish Free Event";
      return "Publish Ticketed Event";
    }
    return "Next";
  };

  // Helper function to determine which steps to show
  const shouldShowStep = (step) => {
    if (eventType === "free") {
      // For free events: Only show steps 1 (details), 4 (availability), and 5 (summary)
      return step === 1 || step === 4 || step === 5;
    }

    if (eventType === "coming_soon") {
      // For coming soon: Don't show step 3 (claiming)
      return step !== 3;
    }

    // All steps for ticketed events
    return true;
  };

  return (
    <div className="flex-col font-Poppins">
      <Header_Admin />
      <div className="flex">
        <Sidebar_Admin />

        <div className="bg-[#272727] flex items-center justify-center w-full p-6">
          <div className="w-full max-w-4xl">
            {/* Special heading for Coming Soon conversions */}
            {eventDetails?.comingSoonConversion && <div></div>}

            {currentStep === 1 && (
              <EventDetails
                onNext={handleEventDetailsNext}
                initialData={eventDetails}
              />
            )}

            {currentStep === 2 && shouldShowStep(2) && (
              <TicketDetails
                eventType={eventType}
                onBack={handleBack}
                onNext={handleTicketDetailsNext}
                initialData={ticketDetails}
              />
            )}

            {currentStep === 3 && shouldShowStep(3) && (
              <ClaimingDetails
                eventType={eventType}
                onBack={handleBack}
                onNext={handleClaimingDetailsNext}
                initialData={claimingDetails}
                eventDate={eventDetails?.eventDate}
                ticketDetails={ticketDetails} // Pass ticketDetails for validation
              />
            )}

            {currentStep === 4 && shouldShowStep(4) && (
              <AvailabilityDetails
                eventType={eventType}
                onBack={handleBack}
                onNext={handleAvailabilityDetailsNext}
                initialData={availabilityDetails}
                eventDate={eventDetails?.eventDate}
                eventDetails={eventDetails} // Pass eventDetails to display image
              />
            )}

            {currentStep === 5 && (
              <SummaryDetails
                eventDetails={eventDetails}
                ticketDetails={ticketDetails}
                claimingDetails={claimingDetails}
                availabilityDetails={availabilityDetails}
                onBack={handleBack}
                onNext={handleSummaryNext}
              />
            )}

            <hr className="border-t border-gray-600 my-4" />

            <div className="flex justify-between space-x-4">
              {/* Left side - Save as Draft button */}
              <button
                onClick={handleSaveAsDraft}
                disabled={isSubmitting || !isValidEventDetails()}
                className={`bg-neutral-700 text-white px-9 py-2 rounded-full text-xs font-semibold transition-colors 
                  ${
                    isSubmitting || !isValidEventDetails()
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-600"
                  }`}
              >
                {isSubmitting ? "Saving..." : "Save as Draft"}
              </button>

              {/* Right side - Navigation buttons */}
              <div className="flex space-x-4">
                {currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="bg-neutral-900 text-white px-9 py-2 rounded-full text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                )}

                {currentStep === 1 && (
                  <button
                    onClick={() => {
                      document.querySelector(".event-submit-button").click();
                    }}
                    disabled={isSubmitting}
                    className="bg-white text-black px-9 py-2 rounded-full text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                )}

                {currentStep === 2 && (
                  <button
                    onClick={() => {
                      document.querySelector(".ticket-submit-button").click();
                    }}
                    disabled={isSubmitting}
                    className="bg-white text-black px-9 py-2 rounded-full text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                )}

                {currentStep === 3 && (
                  <button
                    onClick={() => {
                      document.querySelector(".claiming-submit-button").click();
                    }}
                    disabled={isSubmitting}
                    className="bg-white text-black px-9 py-2 rounded-full text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                )}

                {currentStep === 4 && (
                  <button
                    onClick={() => {
                      document
                        .querySelector(".availability-submit-button")
                        .click();
                    }}
                    disabled={isSubmitting}
                    className="bg-white text-black px-9 py-2 rounded-full text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                )}

                {currentStep === 5 && (
                  <button
                    onClick={handleSummaryNext}
                    disabled={isSubmitting}
                    className="bg-[#FFAB40] text-black px-9 py-2 rounded-full text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? "Publishing..."
                      : getNextButtonText(currentStep)}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin_PublishEvent;