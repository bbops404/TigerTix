import React from "react";

const AvailabilityDetailsForm = ({
  data,
  onChange,
  onSubmit,
  eventImagePreview,
  submitButtonText = "Save",
}) => {
  const { startDate, endDate, startTime, endTime } = data;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...data,
      [name]: value,
    });
  };

  return (
    <div className="w-full">
      <div className="flex gap-6">
        {/* Event Picture Preview */}
        <div className="w-1/3">
          <p className="text-[#FFAB40] text-sm mb-2">Event Preview</p>
          <div className="w-full aspect-square bg-[#1E1E1E] border-2 border-dashed border-[#FFAB40] rounded-lg flex items-center justify-center overflow-hidden">
            {eventImagePreview ? (
              <img
                src={eventImagePreview}
                alt="Event"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-[#B8B8B8] text-sm">Event Image Preview</div>
            )}
          </div>
        </div>

        {/* Availability Period Inputs */}
        <div className="w-2/3 space-y-4">
          <div className="space-y-3">
            <div>
              <p className="text-[#FFAB40] text-sm mb-1">Start Date:</p>
              <input
                type="date"
                name="startDate"
                value={startDate}
                onChange={handleInputChange}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="text-[#FFAB40] text-sm mb-1">End Date:</p>
              <input
                type="date"
                name="endDate"
                value={endDate}
                onChange={handleInputChange}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="text-[#FFAB40] text-sm mb-1">Daily Opening Time:</p>
              <input
                type="time"
                name="startTime"
                value={startTime}
                onChange={handleInputChange}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
              />
              <p className="text-[#B8B8B8] text-xs mt-1">
                Time when reservations open each day
              </p>
            </div>

            <div>
              <p className="text-[#FFAB40] text-sm mb-1">Daily Closing Time:</p>
              <input
                type="time"
                name="endTime"
                value={endTime}
                onChange={handleInputChange}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
              />
              <p className="text-[#B8B8B8] text-xs mt-1">
                Time when reservations close each day
              </p>
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

export default AvailabilityDetailsForm;
