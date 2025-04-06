import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  AlertCircleIcon,
  InfoIcon,
} from "lucide-react";

const ClaimingDetailsForm = ({
  data,
  onChange,
  onSubmit,
  submitButtonText = "Save",
  eventDate,
}) => {
  const [errors, setErrors] = useState({});

  // Reset errors when data changes and ensure form updates with new data
  useEffect(() => {
    if (data) {
      setErrors({});

      // We don't need to do anything else; just make sure the component
      // re-renders when data changes by including data in the dependency array
    }
  }, [data]);

  // Import React at the top
  useEffect(() => {
    // Ensure dateList is in sync with claimingSummaries if not already
    if (data && data.claimingSummaries && data.claimingSummaries.length > 0) {
      const uniqueDates = [
        ...new Set(data.claimingSummaries.map((summary) => summary.date)),
      ];

      // Check if dateList needs updating
      if (
        !data.dateList ||
        data.dateList.length !== uniqueDates.length ||
        !uniqueDates.every((date) => data.dateList.includes(date))
      ) {
        onChange({
          ...data,
          dateList: uniqueDates,
        });
      }
    }
  }, [data?.claimingSummaries]);

  const {
    eventType = "ticketed",
    claimingDate = "",
    claimingStartTime = "",
    claimingEndTime = "",
    claimingVenue = "",
    maxReservations = "",
    dateList = [],
    selectedDate = null,
    claimingSummaries = [],
    selectedSummary = null,
    isEditing = false,
  } = data || {};

  const validateClaimingDate = (claimingDate) => {
    if (!claimingDate || !eventDate) return true; // Skip validation if either date is missing

    const eventDateObj = new Date(eventDate);
    const claimingDateObj = new Date(claimingDate);

    // Claiming date must be before event date
    return claimingDateObj < eventDateObj;
  };

  // Add notification for invalid claiming date
  const getClaimingDateNotification = (claimingDate) => {
    if (!claimingDate || !eventDate) return null;

    const eventDateObj = new Date(eventDate);
    const claimingDateObj = new Date(claimingDate);

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

    const newData = {
      ...data,
      dateList: uniqueDates,
    };

    // If the selected date is no longer in the list, clear it
    if (selectedDate && !uniqueDates.includes(selectedDate)) {
      newData.selectedDate = null;
    }

    onChange(newData);
  };

  // Add date to the list
  const addDate = () => {
    if (claimingDate && !dateList.includes(claimingDate)) {
      // Check if claiming date is valid
      if (!validateClaimingDate(claimingDate)) {
        alert("Claiming date must be before the event date");
        return;
      }

      onChange({
        ...data,
        dateList: [...dateList, claimingDate],
        selectedDate: claimingDate,
        claimingDate: "",
      });
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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...data,
      [name]: value,
    });
  };

  // Handle max reservations change - only allow positive numbers
  const handleMaxReservationsChange = (value) => {
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) > 0)) {
      onChange({
        ...data,
        maxReservations: value,
      });
    }
  };

  // Handle date selection from table
  const handleDateSelection = (date) => {
    const newData = {
      ...data,
      selectedDate: date,
      claimingDate: date,
    };

    // Find if this date has an existing summary
    const relatedSummary = claimingSummaries.find(
      (summary) => summary.date === date
    );

    if (relatedSummary) {
      // If found, populate the form with the summary data
      newData.claimingStartTime = relatedSummary.startTime;
      newData.claimingEndTime = relatedSummary.endTime;
      newData.claimingVenue = relatedSummary.venue;
      newData.maxReservations = relatedSummary.maxReservations.toString();
      newData.selectedSummary = relatedSummary;
      newData.isEditing = true;
    } else {
      // Otherwise, clear the form
      newData.claimingStartTime = "";
      newData.claimingEndTime = "";
      newData.claimingVenue = "";
      newData.maxReservations = "";
      newData.selectedSummary = null;
      newData.isEditing = false;
    }

    onChange(newData);
  };

  // Handle summary selection from the table
  const handleSelectSummary = (summary) => {
    onChange({
      ...data,
      selectedSummary: summary,
      isEditing: true,
      claimingDate: summary.date,
      claimingStartTime: summary.startTime,
      claimingEndTime: summary.endTime,
      claimingVenue: summary.venue,
      maxReservations: summary.maxReservations.toString(),
    });
  };

  // Clear all form fields
  const clearForm = () => {
    onChange({
      ...data,
      claimingDate: "",
      claimingStartTime: "",
      claimingEndTime: "",
      claimingVenue: "",
      maxReservations: "",
      selectedDate: null,
      selectedSummary: null,
      isEditing: false,
    });
  };

  // Handle adding or updating claiming schedule
  const handleAddOrUpdateSchedule = () => {
    if (isEditing) {
      // Editing existing schedule
      if (
        claimingDate &&
        claimingVenue &&
        claimingStartTime &&
        claimingEndTime
      ) {
        const summaryData = {
          id: selectedSummary.id,
          date: claimingDate,
          venue: claimingVenue,
          startTime: claimingStartTime,
          endTime: claimingEndTime,
          maxReservations:
            maxReservations === "" ? 0 : parseInt(maxReservations),
        };

        const updatedSummaries = claimingSummaries.map((s) =>
          s.id === selectedSummary.id ? summaryData : s
        );

        const newData = {
          ...data,
          claimingSummaries: updatedSummaries,
        };

        onChange(newData);
        syncDateListWithSummaries(updatedSummaries);
        clearForm();
      } else {
        alert(
          "Please provide all required information (date, venue, and time)"
        );
      }
    } else {
      // Adding new schedule
      const dateToUse = claimingDate || selectedDate;

      if (dateToUse && claimingVenue && claimingStartTime && claimingEndTime) {
        // Add to date list if not already there
        let updatedDateList = dateList;
        if (claimingDate && !dateList.includes(claimingDate)) {
          updatedDateList = [...dateList, claimingDate];
        }

        const summaryData = {
          id: Date.now(),
          date: dateToUse,
          venue: claimingVenue,
          startTime: claimingStartTime,
          endTime: claimingEndTime,
          maxReservations:
            maxReservations === "" ? 0 : parseInt(maxReservations),
        };

        const updatedSummaries = [...claimingSummaries, summaryData];

        const newData = {
          ...data,
          dateList: updatedDateList,
          claimingSummaries: updatedSummaries,
        };

        onChange(newData);
        syncDateListWithSummaries(updatedSummaries);
        clearForm();
      } else {
        alert(
          "Please provide all required information (date, venue, and time)"
        );
      }
    }
  };

  // Delete a claiming slot/schedule
  const handleDeleteSchedule = (summaryId) => {
    const updatedSummaries = claimingSummaries.filter(
      (s) => s.id !== summaryId
    );
    onChange({
      ...data,
      claimingSummaries: updatedSummaries,
    });
    syncDateListWithSummaries(updatedSummaries);
    clearForm();
  };

  // Handle deleting a date from the date list
  const handleDeleteDate = (date) => {
    // Remove the date from dateList
    const updatedDateList = dateList.filter((d) => d !== date);

    // Find and remove any claiming summaries that use this date
    const updatedSummaries = claimingSummaries.filter(
      (summary) => summary.date !== date
    );

    onChange({
      ...data,
      dateList: updatedDateList,
      claimingSummaries: updatedSummaries,
      selectedDate: null,
    });
  };

  // Validate the claiming details
  const validate = () => {
    const newErrors = {};

    // Only validate for ticketed events, skip validation for free and coming soon
    if (eventType === "ticketed") {
      if (claimingSummaries.length === 0) {
        newErrors.summaries = "At least one claiming schedule must be added";
      }

      // Validate all claiming dates against event date
      if (eventDate) {
        const invalidClaimingDates = claimingSummaries.filter(
          (summary) => !validateClaimingDate(summary.date)
        );

        if (invalidClaimingDates.length > 0) {
          newErrors.claimingDates =
            "All claiming dates must be before the event date";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate() && onSubmit) {
      onSubmit(data);
    } else {
      // Scroll to the top to show errors
      window.scrollTo(0, 0);
    }
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
  }

  // For ticketed events - regular form
  return (
    <div className="w-full mt-6">
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
          <div className="mb-4 p-3 bg-[#1E1E1E] border-l-4 border-[#FFAB40] rounded-r">
            <p className="flex items-center text-sm">
              <InfoIcon className="h-4 w-4 mr-2 text-[#FFAB40]" />
              <span className="text-white">
                Event Date:{" "}
                <span className="text-[#FFAB40]">
                  {new Date(eventDate).toLocaleDateString()}
                </span>
              </span>
            </p>
            <p className="text-xs text-[#B8B8B8] ml-6 mt-1">
              All ticket claiming dates must be scheduled before this date
            </p>
          </div>
        )}

        {/* When adding claiming date, show notification if needed */}
        {!isEditing && (
          <div className="flex items-center">
            <p className="text-[#FFAB40] text-sm mr-2">Available Date:</p>
            <input
              type="date"
              name="claimingDate"
              value={claimingDate}
              onChange={handleInputChange}
              max={eventDate} // Set max date to event date
              className="w-auto max-w-xs bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
            />
            <button
              onClick={addDate}
              className="ml-2 bg-[#FFAB40] text-black px-3 py-1 rounded-full text-xs font-semibold"
            >
              Add to List
            </button>

            {/* Show notification if needed */}
            {claimingDate && getClaimingDateNotification(claimingDate) && (
              <div
                className={`ml-2 text-xs ${
                  getClaimingDateNotification(claimingDate).type === "error"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                <AlertCircleIcon className="inline h-3 w-3 mr-1" />
                {getClaimingDateNotification(claimingDate).message}
              </div>
            )}
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
                  name="claimingDate"
                  value={claimingDate}
                  onChange={handleInputChange}
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
                        <th className="py-1 px-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dateList.map((date, index) => (
                        <tr
                          key={index}
                          className={`border-t border-[#333333] cursor-pointer ${
                            selectedDate === date
                              ? "bg-[#FFAB40]/70"
                              : "hover:bg-[#2A2A2A]"
                          }`}
                          onClick={() => handleDateSelection(date)}
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
                          <td className="py-1 px-2 text-right w-8">
                            {selectedDate === date && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDate(date);
                                }}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
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
                  name="claimingStartTime"
                  value={claimingStartTime}
                  onChange={handleInputChange}
                  className="bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
                />
                <p className="text-white text-sm">to</p>
                <input
                  type="time"
                  name="claimingEndTime"
                  value={claimingEndTime}
                  onChange={handleInputChange}
                  className="bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <p className="text-[#FFAB40] text-sm mb-1">Claiming Venue:</p>
              <input
                type="text"
                name="claimingVenue"
                placeholder="Enter venue for ticket claiming"
                value={claimingVenue}
                onChange={handleInputChange}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
              />
            </div>

            <div className="flex flex-col">
              <p className="text-[#FFAB40] text-sm mb-1">Max Reservations:</p>
              <input
                type="text"
                name="maxReservations"
                placeholder="Enter max number of reservations"
                value={maxReservations}
                onChange={(e) => handleMaxReservationsChange(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
              />
              <p className="text-[#B8B8B8] text-xs mt-1">
                Maximum allowed for this claiming date.
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
                onClick={handleAddOrUpdateSchedule}
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

        {/* Claiming Schedule Summary Table */}
        <div className="mt-4">
          <p className="text-[#FFAB40] text-sm mb-1">
            Claiming Schedule Summary:
            <span className="text-[#B8B8B8] text-xs ml-2">
              (Click a row to edit)
            </span>
          </p>

          {claimingSummaries.length > 0 ? (
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
                              handleDeleteSchedule(summary.id);
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
          ) : (
            <div className="w-full bg-[#1E1E1E] rounded p-3 h-16 flex items-center justify-center">
              <p className="text-sm text-gray-400 italic">
                No claiming schedules added yet.
              </p>
            </div>
          )}
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

export default ClaimingDetailsForm;
