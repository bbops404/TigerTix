import React, { useState } from "react";
import TicketDetailsForm from "../Forms/TicketDetailsForm";

const EditTicketDetailsPopup = ({ isOpen, onClose, eventData, onSave }) => {
  const [formData, setFormData] = useState(eventData);

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
            Edit Ticket Details
          </h2>
          <button onClick={onClose} className="text-white hover:text-[#FFAB40]">
            ✕
          </button>
        </div>
        <hr className="border-t border-gray-600 my-4" />

        <div className="mb-4">
          <p className="text-[13px] text-[#B8B8B8]">
            Modify ticket types and set the total available tickets, ensuring
            they match venue capacity and event needs.
          </p>
        </div>

        <hr className="border-t border-gray-600 my-4" />

        <TicketDetailsForm
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

export default EditTicketDetailsPopup;
