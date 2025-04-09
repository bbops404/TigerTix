import React, { useState, useEffect } from "react";
import AvailabilityDetailsForm from "../Forms/AvailabilityDetailsForm.jsx";
import eventService from "../../../pages/Services/eventService"; // Import your eventService
import { InfoIcon, AlertCircleIcon, AlertTriangleIcon } from "lucide-react";

const EditAvailabilityDetailsPopup = ({
  isOpen,
  onClose,
  eventData,
  eventImagePreview,
  onSave,
}) => {
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusChangeWarning, setStatusChangeWarning] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch availability data when the popup opens
  useEffect(() => {
    if (eventData && isOpen) {
      setIsLoading(true);
      setError(null);
      setStatusChangeWarning(null);
      setShowConfirmation(false);

      const fetchAvailabilityData = async () => {
        try {
          console.log(
            `Fetching availability details for event ID: ${eventData.id}`
          );

          // For availability, we can use the event data that already exists
          // But we'll format it for the form
          if (eventData) {
            processEventData(eventData);
          } else {
            // If no data is provided, try to fetch it
            const response = await eventService.events.getById(eventData.id);

            if (response && response.data) {
              processEventData(response.data);
            } else {
              setError(
                "Failed to load availability details. Unexpected response format."
              );
              initializeDefaultFormData();
            }
          }
        } catch (err) {
          console.error("Error fetching availability details:", err);
          setError(`Failed to load availability details: ${err.message}`);
          initializeDefaultFormData();
        }
      };

      // Initialize default form data
      const initializeDefaultFormData = () => {
        const defaultData = {
          ...eventData,
          displayPeriod: {
            startDate: "",
            endDate: "",
            startTime: "",
            endTime: "",
          },
          reservationPeriod: {
            startDate: "",
            endDate: "",
            startTime: "",
            endTime: "",
          },
          eventType: eventData.eventType || "ticketed",
        };

        setFormData(defaultData);
        setIsLoading(false);
      };

      // Process the event data
      const processEventData = (data) => {
        try {
          console.log("Processing event data for availability form:", data);

          // Format the data to match what AvailabilityDetailsForm expects
          const availabilityData = {
            ...data,
            eventType: data.eventType || data.event_type || "ticketed",
            displayPeriod: {
              startDate: data.display_start_date || "",
              endDate: data.display_end_date || "",
              startTime: data.display_start_time || "",
              endTime: data.display_end_time || "",
            },
            reservationPeriod: {
              startDate: data.reservation_start_date || "",
              endDate: data.reservation_end_date || "",
              startTime: data.reservation_start_time || "",
              endTime: data.reservation_end_time || "",
            },
            // Pass along the event date for validation
            eventDate: data.eventDate || data.event_date || "",
            // Pass the current status and visibility for validation
            status: data.status || "",
            visibility: data.visibility || "",
          };

          console.log("Processed availability data:", availabilityData);
          setFormData(availabilityData);
        } catch (err) {
          console.error("Error processing availability data:", err);
          setError(`Error processing availability data: ${err.message}`);
          initializeDefaultFormData();
        } finally {
          setIsLoading(false);
        }
      };

      // Start the fetch process
      fetchAvailabilityData();
    }
  }, [eventData, isOpen]);

  // Check for status changes when form data changes
  useEffect(() => {
    if (formData && eventData) {
      checkStatusChanges(formData);
    }
  }, [formData]);

  // Check if the changes would result in a status change
  const checkStatusChanges = (currentFormData) => {
    // Only process for published events that are scheduled (not yet taking reservations)
    if (
      eventData.visibility === "published" &&
      eventData.status === "scheduled" &&
      eventData.event_type === "ticketed"
    ) {
      const warnings = [];

      // Check if display dates have been changed
      const originalDisplayStart = eventData.display_start_date;
      const originalDisplayEnd = eventData.display_end_date;
      const newDisplayStart = currentFormData.displayPeriod.startDate;
      const newDisplayEnd = currentFormData.displayPeriod.endDate;

      if (
        originalDisplayStart !== newDisplayStart ||
        originalDisplayEnd !== newDisplayEnd
      ) {
        warnings.push({
          type: "display",
          message:
            "Changing display dates for a published event will cause it to be temporarily unpublished while changes take effect.",
        });
      }

      // Check if reservation dates would change status
      const now = new Date();
      const newReservationStart = new Date(
        `${currentFormData.reservationPeriod.startDate}T${currentFormData.reservationPeriod.startTime}`
      );

      // If reservation start is set to now or in the past
      if (newReservationStart <= now) {
        warnings.push({
          type: "reservation",
          message:
            "Setting the reservation start to a current or past date/time will immediately open reservations for this event.",
        });
      }

      if (warnings.length > 0) {
        setStatusChangeWarning(warnings);
      } else {
        setStatusChangeWarning(null);
      }
    }
  };

  const handleSave = () => {
    if (formData) {
      console.log("Saving availability details:", formData);

      // If there are status change warnings and confirmation wasn't shown yet, show confirmation
      if (statusChangeWarning && !showConfirmation) {
        setShowConfirmation(true);
        return;
      }

      // Make sure all required fields are present in the payload
      const updatedData = {
        ...eventData,
        // Include display period as a top-level property
        displayPeriod: formData.displayPeriod || {
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
        },
        // Include reservation period as a top-level property
        reservationPeriod: formData.reservationPeriod || {
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
        },
        // Also include the full availability data
        availabilityDetails: formData,
        // Flag to indicate these are edited availability settings
        isAvailabilityEdit: true,
        // Add a flag if display dates were changed for a published event
        displayDatesChanged: statusChangeWarning?.some(
          (w) => w.type === "display"
        ),
        // Add a flag if reservation dates would cause immediate opening
        reservationStartNow: statusChangeWarning?.some(
          (w) => w.type === "reservation"
        ),
      };

      // Pass the edit type as 'availability' to ensure the correct saving logic is used
      onSave(updatedData, "availability");
      onClose();
    }
  };

  const confirmationDialog = (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
      <div className="bg-[#272727] border border-[#FFAB40] rounded-lg p-6 w-[90%] max-w-md">
        <div className="flex items-start mb-4">
          <div className="bg-[#FFAB40]/20 p-3 rounded-full mr-4">
            <AlertTriangleIcon className="h-6 w-6 text-[#FFAB40]" />
          </div>
          <div>
            <h2 className="text-[#FFAB40] text-xl font-semibold">
              Confirm Changes
            </h2>
            <p className="text-white text-sm mt-1">
              Your changes will affect the event status:
            </p>
          </div>
        </div>

        <div className="bg-[#1E1E1E] p-4 rounded-lg border border-[#333333] mb-6">
          <ul className="text-white text-sm space-y-3">
            {statusChangeWarning?.map((warning, index) => (
              <li key={index} className="flex items-start">
                <span className="text-[#FFAB40] mr-2">•</span>
                <span>{warning.message}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowConfirmation(false)}
            className="bg-[#333333] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#444444] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-[#FFAB40] text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#F59C19] transition-colors"
          >
            Proceed with Changes
          </button>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#272727] border border-[#FFAB40] rounded-3xl p-6 w-[90%] max-w-5xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#FFAB40] text-2xl font-semibold">
              Edit Availability Details
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
            <span className="text-white">Loading availability details...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#272727] border border-[#FFAB40] rounded-3xl p-6 w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#FFAB40] text-2xl font-semibold">
              Edit Availability Details
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-[#FFAB40]"
            >
              ✕
            </button>
          </div>
          <hr className="border-t border-gray-600 my-4" />
          <div className="mb-4">
            <p className="text-[13px] text-[#B8B8B8]">
              Modify when the event should appear on the platform and be
              available for reservations.
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

          {/* Status change warning for published events */}
          {eventData.visibility === "published" &&
            eventData.status === "scheduled" && (
              <div className="bg-[#332200] border border-[#FFAB40] rounded-md p-3 mb-4">
                <p className="text-[#FFAB40] text-sm flex items-center">
                  <InfoIcon className="h-4 w-4 mr-2" />
                  This event is published but not yet taking reservations.
                  Changes to availability dates may affect its visibility and
                  status.
                </p>
              </div>
            )}

          {/* Dynamic warning based on form changes */}
          {statusChangeWarning && statusChangeWarning.length > 0 && (
            <div className="bg-yellow-900/30 border border-yellow-500 rounded-md p-3 mb-4">
              <p className="text-yellow-400 text-sm font-medium mb-2 flex items-center">
                <AlertTriangleIcon className="h-4 w-4 mr-2" />
                Your changes will affect the event status:
              </p>
              <ul className="text-yellow-400 text-sm list-disc pl-6">
                {statusChangeWarning.map((warning, index) => (
                  <li key={index}>{warning.message}</li>
                ))}
              </ul>
            </div>
          )}

          <hr className="border-t border-gray-600 my-4" />

          <AvailabilityDetailsForm
            data={formData}
            onChange={setFormData}
            onSubmit={null}
            eventImagePreview={eventImagePreview || formData?.imagePreview}
            eventDate={formData?.eventDate}
            submitButtonText={null}
          />

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
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && confirmationDialog}
    </>
  );
};

export default EditAvailabilityDetailsPopup;
