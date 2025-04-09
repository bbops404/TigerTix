import React, { useState, useEffect } from "react";
import EventDetailsForm from "../Forms/EventDetailsForm.jsx";
import { formatImageUrl } from "../../../utils/imageUtils.js";

const EditEventDetailsPopup = ({ isOpen, onClose, eventData, onSave }) => {
  const [formData, setFormData] = useState(null);

  // Update formData when eventData changes with proper formatting
  useEffect(() => {
    if (eventData) {
      // Format the image URL properly
      const originalImageUrl = eventData.imagePreview || eventData.image;
      const formattedImageUrl = originalImageUrl
        ? formatImageUrl(originalImageUrl)
        : null;

      // Debug image URLs
      console.log("Original image URL:", originalImageUrl);
      console.log("Formatted image URL:", formattedImageUrl);

      // Format the data to match what EventDetailsForm expects
      const formattedData = {
        // Ensure all expected fields exist with proper naming
        eventName: eventData.eventName || "",
        eventDescription: eventData.eventDescription || eventData.details || "",
        eventDate: eventData.eventDate || "",
        venue: eventData.venue || "",
        startTime: eventData.startTime || "",
        endTime: eventData.endTime || "",
        eventCategory: eventData.eventCategory || "",
        eventType: eventData.eventType || "ticketed",
        // Use the properly formatted image URL
        imagePreview: formattedImageUrl,
        // Preserve the ID and any other necessary fields
        id: eventData.id,
        // Include any additional fields that might be needed when saving
        status: eventData.status,
        visibility: eventData.visibility,
      };

      setFormData(formattedData);
    }
  }, [eventData]);

  // Update the handleSave method in EditEventDetailsPopup.jsx

  const handleSave = () => {
    if (!formData) return;

    // Make sure all needed fields from the original event are preserved
    const updatedEvent = {
      ...eventData, // Preserve original data
      ...formData, // Apply changes from form

      // Properly handle image data
      eventImage: formData.eventImage, // New image file if uploaded
      imagePreview: formData.imagePreview, // Preview URL

      // For API integration - ensure these fields exist
      eventName: formData.eventName,
      eventDescription: formData.eventDescription || formData.details,
      eventDate: formData.eventDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      venue: formData.venue,
      eventCategory: formData.eventCategory,
      eventType: formData.eventType,
    };

    console.log("Saving updated event with image data:", {
      hasEventImage: !!updatedEvent.eventImage,
      imagePreview: updatedEvent.imagePreview ? "[Preview URL exists]" : "none",
      originalImage: eventData.image || "none",
    });

    // Pass the edit type as 'event' to ensure the correct saving logic is used
    onSave(updatedEvent, "event");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#272727] border border-[#FFAB40] rounded-3xl p-6 w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#FFAB40] text-2xl font-semibold">
            Edit Event Details
          </h2>
          <button onClick={onClose} className="text-white hover:text-[#FFAB40]">
            ✕
          </button>
        </div>
        <hr className="border-t border-gray-600 my-4" />

        {formData ? (
          <EventDetailsForm
            data={formData}
            onChange={setFormData}
            onSubmit={null}
            submitButtonText={null}
          />
        ) : (
          <div className="text-white flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFAB40] mr-3"></div>
            <span>Loading event data...</span>
          </div>
        )}
        <hr className="border-t border-gray-600 my-4" />

        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-700 text-white px-5 py-2 rounded-full text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-[#FFAB40] text-black px-5 py-2 rounded-full text-sm font-semibold"
            disabled={!formData}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEventDetailsPopup;
