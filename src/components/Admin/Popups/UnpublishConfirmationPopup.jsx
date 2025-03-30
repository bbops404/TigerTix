import React from "react";

const UnpublishConfirmationPopup = ({
  isOpen,
  onClose,
  eventId,
  eventName,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#272727] border border-[#FFAB40] rounded-lg p-6 w-[90%] max-w-md">
        <div className="flex items-start mb-4">
          <div className="bg-[#FFAB40]/20 p-3 rounded-full mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#FFAB40]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-[#FFAB40] text-xl font-semibold">
              Unpublish Event
            </h2>
            <p className="text-white text-sm mt-1">
              Are you sure you want to unpublish this event?
              {eventName && (
                <span className="font-semibold block mt-1">"{eventName}"</span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-[#1E1E1E] p-4 rounded-lg border border-[#333333] mb-6">
          <p className="text-[#FFAB40] text-sm font-medium mb-2">Note:</p>
          <ul className="text-white text-sm space-y-2">
            <li className="flex items-start">
              <span className="text-[#FFAB40] mr-2">•</span>
              <span>
                This event will be moved to your{" "}
                <span className="font-bold">Draft</span> section.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-[#FFAB40] mr-2">•</span>
              <span>
                It will no longer be visible to users on the platform.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-[#FFAB40] mr-2">•</span>
              <span>
                All current reservations will remain in the system but users
                won't be able to make new reservations.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-[#FFAB40] mr-2">•</span>
              <span>You can republish this event at any time.</span>
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
            className="bg-[#FFAB40] text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#F59C19] transition-colors"
          >
            Unpublish Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnpublishConfirmationPopup;
