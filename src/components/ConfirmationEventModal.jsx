import React, { useState } from "react";
import { IoCloseOutline } from "react-icons/io5";

const ConfirmationEventModal = ({
  isOpen,
  onClose,
  onConfirm,
  ticketType,
  ticketCount,
  emails,
  timeSlot,
  ticketPrices,
  userEmail,
  eventName,
  isSubmitting = false,
}) => {
  const [isAgreed, setIsAgreed] = useState(false);
  const [showError, setShowError] = useState(false);

  if (!isOpen) return null;

  const handleConfirmClick = async () => {
    if (!isAgreed) {
      setShowError(true);
      return;
    }

    setShowError(false);

    try {
      // Call the onConfirm function passed from parent
      await onConfirm();
    } catch (error) {
      console.error("Error during confirmation:", error);
      // The parent component will handle the error display
    }
  };

  const calculateTotal = () => {
    if (!ticketType || !ticketPrices) return 0;
    return ticketPrices[ticketType] * ticketCount;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 font-Poppins">
      <div className="bg-[#F09C32] text-custom_black rounded-lg w-11/12 max-w-md md:max-w-lg p-5 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-3 right-3 text-gray-700 hover:text-black disabled:opacity-50"
        >
          <IoCloseOutline className="text-2xl" />
        </button>

        {/* Modal header */}
        <h2 className="text-xl font-bold text-center mb-4 text-custom_black">
          Confirm Your Reservation
        </h2>

        {/* Warning/Information */}
        <div className="mb-5 p-3 bg-white rounded-lg text-sm">
          <p className="font-semibold text-custom_black mb-1">IMPORTANT:</p>
          <p>
            Once confirmed, this reservation is final and cannot be modified.
            Please review all details carefully.
          </p>
        </div>

        {/* Reservation details */}
        <div className="bg-white p-3 rounded-lg mb-5">
          <h3 className="font-semibold mb-2 text-center underline">
            {eventName || "Event Reservation"}
          </h3>

          <div className="grid grid-cols-2 gap-2 text-sm text-custom_black">
            <div className="font-medium">Ticket Type:</div>
            <div>{ticketType || "Not selected"}</div>

            <div className="font-medium">Quantity:</div>
            <div>{ticketCount}</div>

            <div className="font-medium">Batch:</div>
            <div>{timeSlot || "Not selected"}</div>

            <div className="font-medium">Primary Email:</div>
            <div className="truncate">{userEmail}</div>

            {ticketCount > 1 && (
              <>
                <div className="font-medium text-custom_black">
                  Additional Emails:
                </div>
                <div className="text-xs">
                  {emails.slice(1).map((email, index) => (
                    <div key={index} className="truncate">
                      {email || "Not provided"}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="font-medium text-custom_black border-t border-gray-300 pt-2 mt-2">
              Price Per Person:
            </div>
            <div className="font-medium text-[#F09C32] border-t border-gray-300 pt-2 mt-2">
              ₱
              {ticketType && ticketPrices
                ? parseFloat(ticketPrices[ticketType]).toFixed(2)
                : "0.00"}
            </div>

            <div className="font-medium text-custom_black">Total Amount:</div>
            <div className="font-bold text-[#F09C32]">
              ₱{calculateTotal().toFixed(2)}
            </div>
          </div>
        </div>

        {/* Agreement checkbox */}
        <div className="flex items-start mb-2">
          <input
            type="checkbox"
            id="agreement"
            className="mt-1 mr-2"
            checked={isAgreed}
            onChange={() => {
              setIsAgreed(!isAgreed);
              if (showError) setShowError(false);
            }}
            disabled={isSubmitting}
          />
          <label htmlFor="agreement" className="text-xs">
            I have reviewed the details and understand that I must claim my
            tickets with a valid UST ID. Unclaimed tickets may result in account
            restrictions.
          </label>
        </div>

        {/* Error message */}
        {showError && (
          <div className="text-red-600 text-xs mb-3 font-medium">
            Please agree to the terms before confirming your reservation.
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col md:flex-row md:justify-between gap-3 text-sm">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="py-2 px-4 rounded bg-white hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            CANCEL
          </button>

          <button
            onClick={handleConfirmClick}
            disabled={isSubmitting}
            className="py-2 px-4 rounded bg-black text-[#F09C32] font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                PROCESSING...
              </>
            ) : (
              "CONFIRM RESERVATION"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationEventModal;
