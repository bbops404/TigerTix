import React from "react";
import { FaExclamationTriangle, FaTimesCircle } from "react-icons/fa";

const DeleteConfirmationPopup = ({
  isOpen,
  onClose,
  eventId,
  eventName,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#272727] border border-red-500 rounded-lg p-6 w-[90%] max-w-md">
        <div className="flex items-start mb-4">
          <div className="bg-red-500/20 p-3 rounded-full mr-4">
            <FaExclamationTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-red-500 text-xl font-semibold">Delete Event</h2>
            <p className="text-white text-sm mt-1">
              Are you sure you want to delete this event?
              {eventName && (
                <span className="font-semibold block mt-1">"{eventName}"</span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-[#1E1E1E] p-4 rounded-lg border border-[#333333] mb-6">
          <p className="text-[#FF6B6B] text-sm font-medium mb-2">Warning:</p>
          <ul className="text-white text-sm space-y-2">
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>
                This action <span className="font-bold">cannot be undone</span>.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>
                All event details, tickets, and reservations will be permanently
                deleted.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>
                Users who have already reserved tickets will no longer see this
                event in their accounts.
              </span>
            </li>
          </ul>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-[#333333] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#444444] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(eventId);
              onClose();
            }}
            className="bg-red-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-600 transition-colors flex items-center justify-center"
          >
            <FaTimesCircle className="mr-2" /> Delete Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopup;
