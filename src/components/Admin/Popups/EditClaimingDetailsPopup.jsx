import React, { useState, useEffect } from "react";
import ClaimingDetailsForm from "../Forms/ClaimingDetailsForm.jsx";

const EditClaimingDetailsPopup = ({ isOpen, onClose, eventData, onSave }) => {
  const [formData, setFormData] = useState(
    eventData || {
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
    }
  );

  // Update formData when eventData changes
  useEffect(() => {
    if (eventData) {
      setFormData({
        ...eventData,
        dateList: eventData.dateList || [],
        claimingSummaries: eventData.claimingSummaries || [],
        claimingDate: eventData.claimingDate || "",
        claimingStartTime: eventData.claimingStartTime || "",
        claimingEndTime: eventData.claimingEndTime || "",
        claimingVenue: eventData.claimingVenue || "",
        maxReservations: eventData.maxReservations || "",
        selectedDate: eventData.selectedDate || null,
        selectedSummary: eventData.selectedSummary || null,
        isEditing: eventData.isEditing || false,
      });
    }
  }, [eventData]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#272727] border border-[#FFAB40] rounded-3xl p-6 w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#FFAB40] text-2xl font-semibold">
            Edit Claiming Details
          </h2>
          <button onClick={onClose} className="text-white hover:text-[#FFAB40]">
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

        <hr className="border-t border-gray-600 my-4" />

        <ClaimingDetailsForm
          data={formData}
          onChange={setFormData}
          onSubmit={null}
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
  );
};

export default EditClaimingDetailsPopup;
