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
}) => {
  const [isAgreed, setIsAgreed] = useState(false);
  const [showError, setShowError] = useState(false);

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    if (!isAgreed) {
      setShowError(true);
      return;
    }

    setShowError(false);
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 font-Poppins">
      <div className="bg-custom_yellow text-custom_black rounded-lg w-11/12 max-w-md md:max-w-lg p-5 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
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
            UAAP Season 87 Men's Basketball
          </h3>

          <div className="grid grid-cols-2 gap-2 text-sm text-custom_black">
            <div className="font-medium ">Ticket Type:</div>
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

            <div className="font-medium text-custom_black border-t border-gray-700 pt-2 mt-2">
              Total Amount:
            </div>
            <div className="font-bold text-[#F09C32] border-t border-gray-700 pt-2 mt-2">
              ₱{ticketType ? ticketPrices[ticketType] * ticketCount : 0}
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
            className="py-2 px-4 rounded bg-white hover:bg-gray-600 transition-colors"
          >
            CANCEL
          </button>

          <button
            onClick={handleConfirmClick}
            className="py-2 px-4 rounded bg-black text-[#F09C32] font-bold hover:bg-gray-600 transition-colors"
          >
            CONFIRM RESERVATION
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationEventModal;
