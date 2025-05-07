import React, { useState, useRef, useEffect } from "react";
import { AlertCircleIcon, InfoIcon } from "lucide-react";

const EventDetailsForm = ({
  data,
  onChange,
  onSubmit,
  submitButtonText = "Save",
}) => {
  const [errors, setErrors] = useState({});
  const [isImageHovered, setIsImageHovered] = useState(false);
  const fileInputRef = useRef(null);

  // Use useEffect to ensure we initialize with the provided data
  useEffect(() => {
    if (data) {
      setErrors({});
    }
  }, [data]);

  // Extract values from data
  const {
    eventName = "",
    eventDescription = "",
    eventDate = "",
    venue = "",
    startTime = "",
    endTime = "",
    eventCategory = "",
    eventType = "ticketed",
    eventImage = null,
    imagePreview = null,
  } = data || {};

  // Define today for date validation
  const today = new Date().toISOString().split("T")[0];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handleTypeChange = (type) => {
    onChange({ ...data, eventType: type });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("New image selected:", file.name);

      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Image preview generated");
        onChange({
          ...data,
          eventImage: file, // This is the actual file that will be uploaded
          imagePreview: reader.result, // This is the data URL for preview
        });
      };
      reader.readAsDataURL(file);
    } else {
      console.log("No file selected");
    }
  };

  const handleUploadButtonClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    e.preventDefault(); // Prevent default behavior
    fileInputRef.current.click();
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onChange({
      ...data,
      eventImage: null,
      imagePreview: null,
    });
    console.log("Image removed");
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
      if (eventType !== "coming_soon") {
        if (eventDate < today) {
          newErrors.eventDate = "Event date must be in the future";
        }
      }
    }

    if (!venue.trim()) newErrors.venue = "Venue is required";
    if (!startTime) newErrors.startTime = "Start time is required";
    if (!eventCategory) newErrors.eventCategory = "Category is required";

    // Validate time if both start and end time are provided
    if (startTime && endTime && startTime >= endTime) {
      newErrors.timeRange = "End time must be after start time";
    }

    // Image is recommended but not required
    if (!imagePreview && !eventImage) {
      newErrors.image = "Event image is recommended";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate() && onSubmit) {
      onSubmit(data);
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div>
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

      <div className="grid grid-cols-2 gap-6 items-start">
        <div
          className="w-full aspect-square bg-[#333] rounded-xl flex items-center justify-center relative overflow-hidden"
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
          />

          {imagePreview ? (
            <>
              <img
                src={imagePreview}
                alt="Event"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.warn(`Image preview failed to load: ${imagePreview}`);
                  onChange({ ...data, imagePreview: null }); // Reset on error
                }}
              />

              {/* Overlay with buttons when hovered */}
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 transition-opacity duration-200 ${
                  isImageHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                <button
                  onClick={handleUploadButtonClick}
                  className="bg-[#FFAB40] text-black text-sm font-semibold py-2 px-4 rounded-full hover:bg-[#E09933] transition-colors mb-2"
                >
                  Change Image
                </button>

                <button
                  onClick={handleRemoveImage}
                  className="bg-red-500 text-white text-sm font-semibold py-2 px-4 rounded-full hover:bg-red-600 transition-colors"
                >
                  Remove Image
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <button
                onClick={handleUploadButtonClick}
                className={`bg-[#FFAB40] text-black text-sm font-semibold py-2 px-4 rounded-full hover:bg-[#E09933] transition-colors ${
                  errors.image ? "border-2 border-red-500" : ""
                }`}
              >
                Upload Image
              </button>
              <p className="text-gray-400 text-xs mt-2">
                Recommended: 1200 x 800 pixels
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Event Name:</p>
            <input
              type="text"
              name="eventName"
              placeholder="Enter Event Name"
              value={eventName}
              onChange={handleInputChange}
              className={`w-full bg-[#1E1E1E] border ${
                errors.eventName ? "border-red-500" : "border-[#333333]"
              } text-white rounded px-2 py-1.5 text-sm`}
            />
          </div>
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Event Description:</p>
            <textarea
              name="eventDescription"
              placeholder="Enter Event Description"
              value={eventDescription}
              onChange={handleInputChange}
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
                name="eventDate"
                value={eventDate}
                onChange={handleInputChange}
                min={eventType !== "coming_soon" ? today : undefined}
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
            <div>
              <p className="text-[#FFAB40] text-sm mb-1">Event Venue:</p>
              <input
                type="text"
                name="venue"
                placeholder="Venue"
                value={venue}
                onChange={handleInputChange}
                className={`w-full bg-[#1E1E1E] border ${
                  errors.venue ? "border-red-500" : "border-[#333333]"
                } text-white rounded px-2 py-1.5 text-sm`}
              />
            </div>
          </div>
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Time of Event:</p>
            <div className="flex space-x-2 items-center">
              <input
                type="time"
                name="startTime"
                value={startTime}
                onChange={handleInputChange}
                className={`w-full bg-[#1E1E1E] border ${
                  errors.startTime ? "border-red-500" : "border-[#333333]"
                } text-white rounded px-2 py-1.5 text-sm`}
              />
              <p className="text-white text-sm">to</p>
              <input
                type="time"
                name="endTime"
                value={endTime}
                onChange={handleInputChange}
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
              name="eventCategory"
              value={eventCategory}
              onChange={handleInputChange}
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
                  name="eventType"
                  value="ticketed"
                  checked={eventType === "ticketed"}
                  onChange={() => handleTypeChange("ticketed")}
                  className="form-radio bg-[#1E1E1E] border-[#333333] text-white"
                />
                <span className="ml-2 text-white text-sm">Ticketed Event</span>
              </label>
              <label className="inline-flex items-center mb-2">
                <input
                  type="radio"
                  name="eventType"
                  value="coming_soon"
                  checked={eventType === "coming_soon"}
                  onChange={() => handleTypeChange("coming_soon")}
                  className="form-radio bg-[#1E1E1E] border-[#333333] text-white"
                />
                <span className="ml-2 text-white text-sm">Coming Soon</span>
              </label>
              <label className="inline-flex items-center mb-2">
                <input
                  type="radio"
                  name="eventType"
                  value="free"
                  checked={eventType === "free"}
                  onChange={() => handleTypeChange("free")}
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

      {/* Submit button (visible only if requested) */}
      {submitButtonText && (
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            className="bg-[#FFAB40] text-black px-5 py-2 rounded-full text-sm font-semibold"
          >
            {submitButtonText}
          </button>
        </div>
      )}
    </div>
  );
};

export default EventDetailsForm;
