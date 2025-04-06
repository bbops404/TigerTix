import React, { useState, useEffect } from "react";
import { AlertCircleIcon, InfoIcon } from "lucide-react";

const AvailabilityDetailsForm = ({
  data,
  onChange,
  onSubmit,
  eventImagePreview,
  eventDate,
  submitButtonText = "Save",
}) => {
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});

  // Reset errors when data changes and ensure form updates with new data
  useEffect(() => {
    if (data) {
      setErrors({});
      setWarnings({});

      // Initialize with default values if missing
      const updatedData = { ...data };
      let needsUpdate = false;

      if (!updatedData.displayPeriod) {
        updatedData.displayPeriod = {
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
        };
        needsUpdate = true;
      }

      if (
        updatedData.eventType === "ticketed" &&
        !updatedData.reservationPeriod
      ) {
        updatedData.reservationPeriod = {
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
        };
        needsUpdate = true;
      }

      if (needsUpdate) {
        onChange(updatedData);
      }
    }
  }, [data, onChange]);

  const {
    eventType = "ticketed",
    displayPeriod = {
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
    },
    reservationPeriod = {
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
    },
  } = data || {};

  // Handle input changes for display period
  const handleDisplayPeriodChange = (field, value) => {
    onChange({
      ...data,
      displayPeriod: {
        ...displayPeriod,
        [field]: value,
      },
    });
  };

  // Handle input changes for reservation period
  const handleReservationPeriodChange = (field, value) => {
    onChange({
      ...data,
      reservationPeriod: {
        ...reservationPeriod,
        [field]: value,
      },
    });
  };

  // Validate the availability details
  const validate = () => {
    const newErrors = {};
    const newWarnings = {};

    // Validate display period for all event types
    if (!displayPeriod.startDate)
      newErrors.displayStartDate = "Start display date is required";
    if (!displayPeriod.endDate)
      newErrors.displayEndDate = "End display date is required";

    // Validate display times
    if (!displayPeriod.startTime)
      newErrors.displayStartTime = "Start display time is required";
    if (!displayPeriod.endTime)
      newErrors.displayEndTime = "End display time is required";

    // For ticketed events only, validate reservation period
    if (eventType === "ticketed") {
      if (!reservationPeriod.startDate)
        newErrors.reservationStartDate = "Start reservation date is required";
      if (!reservationPeriod.endDate)
        newErrors.reservationEndDate = "End reservation date is required";
      if (!reservationPeriod.startTime)
        newErrors.reservationStartTime = "Start reservation time is required";
      if (!reservationPeriod.endTime)
        newErrors.reservationEndTime = "End reservation time is required";
    }

    // Date range validation
    if (
      displayPeriod.startDate &&
      displayPeriod.endDate &&
      displayPeriod.startDate > displayPeriod.endDate
    ) {
      newErrors.displayDateRange = "Display end date must be after start date";
    }

    if (
      eventType === "ticketed" &&
      reservationPeriod.startDate &&
      reservationPeriod.endDate &&
      reservationPeriod.startDate > reservationPeriod.endDate
    ) {
      newErrors.reservationDateRange =
        "Reservation end date must be after start date";
    }

    // New validation: Ensure display and reservation periods are before the event date
    if (
      displayPeriod.endDate &&
      eventDate &&
      new Date(displayPeriod.endDate) > new Date(eventDate)
    ) {
      newErrors.displayEndDateEvent =
        "Display end date must be before or on the event date";
    }

    if (
      eventType === "ticketed" &&
      reservationPeriod.endDate &&
      eventDate &&
      new Date(reservationPeriod.endDate) > new Date(eventDate)
    ) {
      newErrors.reservationEndDateEvent =
        "Reservation end date must be before or on the event date";
    }

    // Check for too short of a reservation period (warning, not error)
    if (
      eventType === "ticketed" &&
      reservationPeriod.startDate &&
      reservationPeriod.endDate
    ) {
      const startDate = new Date(reservationPeriod.startDate);
      const endDate = new Date(reservationPeriod.endDate);
      const diffDays = Math.floor(
        (endDate - startDate) / (1000 * 60 * 60 * 24)
      );

      if (diffDays < 3) {
        newWarnings.shortReservationPeriod = `Short reservation period (${diffDays} days). Consider giving users more time to make reservations.`;
      }
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
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

  // For free events, show a simplified form with only display period
  if (eventType === "free") {
    return (
      <div className="w-full">
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
              {eventImagePreview ? (
                <img
                  src={eventImagePreview}
                  alt="Event Preview"
                  className="w-full h-full object-cover"
                />
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
                      value={displayPeriod.startDate}
                      onChange={(e) =>
                        handleDisplayPeriodChange("startDate", e.target.value)
                      }
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
                      value={displayPeriod.startTime}
                      onChange={(e) =>
                        handleDisplayPeriodChange("startTime", e.target.value)
                      }
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
                      value={displayPeriod.endDate}
                      onChange={(e) =>
                        handleDisplayPeriodChange("endDate", e.target.value)
                      }
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
                      value={displayPeriod.endTime}
                      onChange={(e) =>
                        handleDisplayPeriodChange("endTime", e.target.value)
                      }
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

  // For coming soon events, show only display period
  if (eventType === "coming_soon") {
    return (
      <div className="w-full">
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
              {eventImagePreview ? (
                <img
                  src={eventImagePreview}
                  alt="Event Preview"
                  className="w-full h-full object-cover"
                />
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
                      value={displayPeriod.startDate}
                      onChange={(e) =>
                        handleDisplayPeriodChange("startDate", e.target.value)
                      }
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
                      value={displayPeriod.startTime}
                      onChange={(e) =>
                        handleDisplayPeriodChange("startTime", e.target.value)
                      }
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
                      value={displayPeriod.endDate}
                      onChange={(e) =>
                        handleDisplayPeriodChange("endDate", e.target.value)
                      }
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
                      value={displayPeriod.endTime}
                      onChange={(e) =>
                        handleDisplayPeriodChange("endTime", e.target.value)
                      }
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

  // For ticketed events - full form with both periods
  return (
    <div className="w-full">
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
            {eventImagePreview ? (
              <img
                src={eventImagePreview}
                alt="Event Preview"
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
                    value={displayPeriod.startDate}
                    onChange={(e) =>
                      handleDisplayPeriodChange("startDate", e.target.value)
                    }
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
                    value={displayPeriod.startTime}
                    onChange={(e) =>
                      handleDisplayPeriodChange("startTime", e.target.value)
                    }
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
                    value={displayPeriod.endDate}
                    onChange={(e) =>
                      handleDisplayPeriodChange("endDate", e.target.value)
                    }
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
                    value={displayPeriod.endTime}
                    onChange={(e) =>
                      handleDisplayPeriodChange("endTime", e.target.value)
                    }
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
                  value={reservationPeriod.startDate}
                  onChange={(e) =>
                    handleReservationPeriodChange("startDate", e.target.value)
                  }
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
                  value={reservationPeriod.endDate}
                  onChange={(e) =>
                    handleReservationPeriodChange("endDate", e.target.value)
                  }
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
                  value={reservationPeriod.startTime}
                  onChange={(e) =>
                    handleReservationPeriodChange("startTime", e.target.value)
                  }
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
                  value={reservationPeriod.endTime}
                  onChange={(e) =>
                    handleReservationPeriodChange("endTime", e.target.value)
                  }
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

export default AvailabilityDetailsForm;
