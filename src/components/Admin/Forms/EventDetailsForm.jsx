// EventDetailsForm.jsx
import React, { useRef } from "react";

const EventDetailsForm = ({
  data,
  onChange,
  onSubmit,
  submitButtonText = "Save",
}) => {
  const {
    eventName,
    eventDescription,
    eventDate,
    venue,
    startTime,
    endTime,
    eventCategory,
    eventType,
    imagePreview,
  } = data;

  const fileInputRef = useRef(null);

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
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({
          ...data,
          eventImage: file,
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-1 items-start">
        <div className="bg-[#FFAB40] w-8/12 h-full rounded-xl flex items-center justify-center relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
          />
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Event"
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <button
              onClick={handleUploadButtonClick}
              className="bg-[#2E2E2E] text-[#FFAB40] text-sm font-semibold py-2 px-4 rounded-full"
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
              name="eventName"
              placeholder="Enter Event Name"
              value={eventName}
              onChange={handleInputChange}
              className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Event Description:</p>
            <textarea
              name="eventDescription"
              placeholder="Enter Event Description"
              value={eventDescription}
              onChange={handleInputChange}
              className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-2 py-1.5 text-sm h-20 resize-none"
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
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <p className="text-[#FFAB40] text-sm mb-1">Event Venue:</p>
              <input
                type="text"
                name="venue"
                placeholder="Venue"
                value={venue}
                onChange={handleInputChange}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-2 py-1.5 text-sm"
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
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-2 py-1.5 text-sm"
              />
              <p className="text-white text-sm">to</p>
              <input
                type="time"
                name="endTime"
                value={endTime}
                onChange={handleInputChange}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Category:</p>
            <select
              name="eventCategory"
              value={eventCategory}
              onChange={handleInputChange}
              className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-2 py-1.5 text-sm"
            >
              <option value="">Select Category</option>
              <option value="UST IPEA">UST IPEA</option>
              <option value="UAAP">UAAP</option>
            </select>
          </div>
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Type:</p>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="eventType"
                  value="free"
                  checked={eventType === "free"}
                  onChange={() => handleTypeChange("free")}
                  className="form-radio bg-[#1E1E1E] border-[#333333] text-white"
                />
                <span className="ml-2 text-white text-sm">Free Event</span>
              </label>
              <label className="inline-flex items-center">
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
            </div>
          </div>
        </div>
      </div>

      {/* Submit button (visible only if requested) */}
      {submitButtonText && (
        <div className="flex justify-end mt-4">
          <button
            onClick={onSubmit}
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
