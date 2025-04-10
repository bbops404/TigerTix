import React, { useState, useEffect } from "react";
import ClaimingDetailsForm from "../Forms/ClaimingDetailsForm.jsx";
import eventService from "../../../pages/Services/eventService"; // Import your eventService
import { AlertCircleIcon } from "lucide-react";

const EditClaimingDetailsPopup = ({ isOpen, onClose, eventData, onSave }) => {
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch claiming slots directly when the popup opens
  useEffect(() => {
    if (eventData && isOpen) {
      setIsLoading(true);
      setError(null);
      setSaveSuccess(false);

      const fetchClaimingSlots = async () => {
        try {
          console.log(`Fetching claiming slots for event ID: ${eventData.id}`);

          // Use your eventService that already has authentication configured
          const response = await eventService.claimingSlots.getByEventId(
            eventData.id
          );

          console.log("Claiming slots API response:", response);

          if (response && response.data) {
            console.log("Claiming slots fetched successfully:", response.data);

            // Process the claiming slots
            processClaimingSlots(response.data);
          } else {
            console.error("Error in claiming slots response format:", response);
            setError(
              "Failed to load claiming slots. Unexpected response format."
            );

            // Still initialize with default values
            initializeDefaultFormData();
          }
        } catch (err) {
          console.error("Error fetching claiming slots:", err);
          setError(`Failed to load claiming slots: ${err.message}`);

          // Initialize with default values even if fetch fails
          initializeDefaultFormData();
        }
      };

      // Initialize default form data
      const initializeDefaultFormData = () => {
        const defaultData = {
          ...eventData,
          dateList: [],
          claimingSummaries: [],
          claimingDate: "",
          claimingStartTime: "",
          claimingEndTime: "",
          claimingVenue: "",
          maxReservations: "",
          selectedDate: null,
          selectedSummary: null,
          isEditing: false,
          eventType: eventData.eventType || eventData.event_type || "ticketed",
        };

        setFormData(defaultData);
        setIsLoading(false);
      };

      // Process claiming slots data from API
      const processClaimingSlots = (data) => {
        try {
          console.log("Processing claiming slots data:", data);

          // Initialize with event data
          const initialFormData = {
            ...eventData,
            dateList: [],
            claimingSummaries: [],
            claimingDate: "",
            claimingStartTime: "",
            claimingEndTime: "",
            claimingVenue: "",
            maxReservations: "",
            selectedDate: null,
            selectedSummary: null,
            isEditing: false,
            eventType:
              eventData.eventType || eventData.event_type || "ticketed",
          };

          // If we have claiming slots data
          if (data && Array.isArray(data)) {
            // Transform API claiming slots to the format expected by the form
            const claimingSummaries = data.map((slot) => ({
              id: slot.id,
              date: slot.claiming_date,
              venue: slot.venue,
              startTime: slot.start_time,
              endTime: slot.end_time,
              maxReservations: slot.max_claimers,
            }));

            console.log("Transformed claiming summaries:", claimingSummaries);

            // Get unique dates for dateList
            const dateList = [
              ...new Set(claimingSummaries.map((summary) => summary.date)),
            ].sort();

            initialFormData.claimingSummaries = claimingSummaries;
            initialFormData.dateList = dateList;
          }

          console.log("Final form data:", initialFormData);
          setFormData(initialFormData);
        } catch (err) {
          console.error("Error processing claiming slots data:", err);
          setError(`Error processing claiming slots data: ${err.message}`);

          // Still initialize with default values if processing fails
          initializeDefaultFormData();
        } finally {
          setIsLoading(false);
        }
      };

      // Start the fetch process
      fetchClaimingSlots();
    }
  }, [eventData, isOpen]);

  // Form data change handler - will immediately show changes in the UI
  const handleFormDataChange = (newData) => {
    console.log("Form data changed:", newData);
    setFormData(newData);
  };

  // Save handler with improved error handling and API interaction
  const handleSave = async () => {
    if (!formData) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      console.log("Saving claiming details:", formData);

      // Only process claiming slots for ticketed events
      if (
        eventData.eventType === "ticketed" ||
        eventData.event_type === "ticketed"
      ) {
        // First, clear existing claiming slots to ensure clean slate
        await eventService.claimingSlots.clearAll(eventData.id);
        console.log("Cleared existing claiming slots");

        // If we have claiming summaries to save
        if (
          formData.claimingSummaries &&
          formData.claimingSummaries.length > 0
        ) {
          console.log(
            "Preparing to save claiming slots:",
            formData.claimingSummaries
          );

          // Format the claiming slots for API
          const claimingSlots = formData.claimingSummaries.map((summary) => ({
            claiming_date: summary.date,
            start_time: summary.startTime,
            end_time: summary.endTime,
            venue: summary.venue,
            max_claimers: summary.maxReservations || 0,
          }));

          console.log("Formatted claiming slots for API:", claimingSlots);

          // Create the claiming slots in bulk
          const response = await eventService.claimingSlots.createBulk(
            eventData.id,
            claimingSlots
          );
          console.log("Claiming slots created successfully:", response);
        }
      }

      // Create payload for the parent component
      const updatedData = {
        ...eventData,
        // Include the claiming summaries explicitly
        claimingSummaries: formData.claimingSummaries || [],
        // Include the complete form data as well
        claimingDetails: formData,
        // Flag to indicate these are edited claiming slots
        isClaimingEdit: true,
      };

      // Signal success
      setSaveSuccess(true);
      setIsSaving(false);

      // Call the parent component's save handler
      onSave(updatedData, "claiming");

      // Wait a short time to show success message before closing
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error saving claiming details:", err);
      setError(`Failed to save claiming details: ${err.message}`);
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#272727] border border-[#FFAB40] rounded-3xl p-6 w-[90%] max-w-5xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#FFAB40] text-2xl font-semibold">
              Edit Claiming Details
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-[#FFAB40]"
            >
              ✕
            </button>
          </div>
          <hr className="border-t border-gray-600 my-4" />

          <div className="flex flex-col justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFAB40] mb-4"></div>
            <span className="text-white">Loading claiming details...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#272727] border border-[#FFAB40] rounded-3xl p-6 w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#FFAB40] text-2xl font-semibold">
            Edit Claiming Details
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-[#FFAB40]"
            disabled={isSaving}
          >
            ✕
          </button>
        </div>
        <hr className="border-t border-gray-600 my-4" />
        <div className="mb-4">
          <p className="text-[13px] text-[#B8B8B8]">
            Modify time, date, and location for claiming tickets. Ensure these
            details are clear for a smooth claiming process.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4">
            <p className="text-red-400 text-sm flex items-center">
              <AlertCircleIcon className="h-4 w-4 mr-2" />
              {error}
            </p>
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-900/30 border border-green-500 rounded-md p-3 mb-4">
            <p className="text-green-400 text-sm">
              Claiming details saved successfully!
            </p>
          </div>
        )}

        <hr className="border-t border-gray-600 my-4" />

        <ClaimingDetailsForm
          data={formData}
          onChange={handleFormDataChange}
          onSubmit={null}
          submitButtonText={null}
          eventDate={eventData?.eventDate || eventData?.event_date}
        />
        <hr className="border-t border-gray-600 my-4" />

        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-700 text-white px-5 py-2 rounded-full text-sm font-semibold"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-[#FFAB40] text-black px-5 py-2 rounded-full text-sm font-semibold"
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-black rounded-full" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditClaimingDetailsPopup;
