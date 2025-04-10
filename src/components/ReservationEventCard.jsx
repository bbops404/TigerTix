import React, { useEffect } from "react";
import { PiTagBold } from "react-icons/pi";

const ReservationEventCard = ({
  event,
  ticketPrices,
  ticketType,
  setTicketType,
  ticketCount,
  setTicketCount,
  emails,
  setEmails,
  timeSlot,
  setTimeSlot,
  timeSlotOptions,
  handleAddReservation,
  userEmail,
  validationError,
  maxTickets = 1,
  isSubmitting = false,
}) => {
  // Auto-select ticket type if there's only one option
  useEffect(() => {
    const ticketTypes = Object.keys(ticketPrices);
    if (ticketTypes.length === 1 && !ticketType) {
      setTicketType(ticketTypes[0]);
    }
  }, [ticketPrices, ticketType, setTicketType]);

  useEffect(() => {
    const newEmails = [...emails];
    newEmails[0] = userEmail;
    setEmails(newEmails);
  }, [userEmail, ticketCount]);

  useEffect(() => {
    const currentEmails = [...emails];
    const newEmails = new Array(Math.max(ticketCount, 1)).fill("");

    for (let i = 0; i < Math.min(currentEmails.length, newEmails.length); i++) {
      newEmails[i] = currentEmails[i];
    }

    newEmails[0] = userEmail;

    setEmails(newEmails);
  }, [ticketCount]);

  const getRemainingSlots = (slotValue) => {
    const selectedSlot = timeSlotOptions.find(
      (option) => option.value === slotValue
    );
    if (selectedSlot) {
      return `(${selectedSlot.remaining} slots remaining)`;
    }
    return "";
  };

  if (!event) {
    return (
      <div className="w-full p-4 text-center">
        <p>Loading event details...</p>
      </div>
    );
  }

  // Determine if there's only one ticket tier
  const singleTicketTier = Object.keys(ticketPrices).length === 1;

  return (
    <div className="flex w-full flex-col lg:flex-row">
      {/* Left Column 1 - EVENT IMAGE */}
      <div className="w-full lg:w-1/3 p-6">
        <div
          className="bg-gray-700 w-full h-[300px] lg:h-[450px] rounded-lg bg-cover bg-center"
          style={{
            backgroundImage: `url('${
              event.image ||
              "https://via.placeholder.com/450x300?text=Event+Image"
            }')`,
            backgroundSize: "cover",
          }}
        ></div>
      </div>

      {/* Left Column 2 - EVENT DETAILS */}
      <div className="w-full lg:w-1/4 pl-2">
        {event && (
          <div className="inline-block bg-[#F09C32] rounded-full px-3 py-1">
            <h1 className="text-xl font-bold text-custom_black font-Poppins">
              {event.name}
            </h1>
          </div>
        )}
        <h2 className="text-l font-bold mt-4">ABOUT</h2>
        <p className="text-justify text-xs text-gray-300 mb-4">
          {event.details || "No details available for this event."}
        </p>

        <h1 className="text-2xl font-bold">Tickets</h1>

        <div className="ticket">
          {Object.entries(ticketPrices).map(([type, price]) => (
            <div key={type} className="flex flex-col mt-2">
              <div className="flex items-center">
                <PiTagBold className="text-white text-3xl mr-2" />
                <span className="text-white text-xl font-bold">
                  ₱ {parseFloat(price).toFixed(2)}
                </span>
              </div>
              <span className="text-white text-xs mt-1 ml-10">
                1 ticket, {type}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-sm mb-2">
            <strong>Venue:</strong> {event.venue || "TBA"}
          </p>
          <p className="text-sm mb-2">
            <strong>Date:</strong> {event.event_date || "TBA"}
          </p>
          <p className="text-sm mb-2">
            <strong>Time:</strong> {event.event_time || "TBA"}
          </p>
          <p className="text-sm mb-2">
            <strong>Event Category:</strong> {event.category || "General"}
          </p>
        </div>
      </div>
      {/* Divider */}
      <div className="hidden lg:block w-px bg-gray-500 mx-2"></div>

      {/* Right Column */}
      <div className="w-full lg:w-1/2 p-4 lg:ml-6">
        {validationError && (
          <div className="bg-red-500 text-white p-2 rounded-md mt-2 mb-4">
            {validationError}
          </div>
        )}

        {/* Only show ticket tier selection if there are multiple tiers */}
        {!singleTicketTier ? (
          <div className="mt-4">
            <h2 className="font-semibold">Choose a Ticket Tier</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.keys(ticketPrices).map((type) => (
                <button
                  key={type}
                  className={`px-4 py-1 rounded-full font-Poppins text-sm text-[#F09C32] font-semibold ${
                    ticketType === type
                      ? "bg-[#F09C32] text-black"
                      : "bg-black text-white"
                  }`}
                  onClick={() => setTicketType(type)}
                  disabled={isSubmitting}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <h2 className="font-semibold">Ticket Tier</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="px-4 py-1 rounded-full font-Poppins text-sm bg-[#F09C32] text-black font-semibold">
                {Object.keys(ticketPrices)[0]}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="block font-semibold">
            <u>How many tickets would you like to reserve?</u> (Max:{" "}
            {maxTickets})
          </label>
          <input
            type="number"
            min="1"
            max={maxTickets}
            placeholder={`1-${maxTickets}`}
            value={ticketCount}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 1 && value <= maxTickets) {
                setTicketCount(value);
              }
            }}
            className="w-1/4 p-2 border rounded-xl mt-2 text-black"
            disabled={isSubmitting}
          />
        </div>

        <div className="mt-4">
          <label className="block font-semibold">
            <u>Enter the email/s of the people you want to reserve for</u>
          </label>

          <p className="text-xs text-gray-300 mt-1 mb-3">
            All users must be registered in the system. Make sure you enter
            their correct email address.
          </p>

          <div className="mb-2">
            <input
              type="text"
              value={userEmail}
              disabled
              readOnly
              className="w-full p-2 mt-2 bg-gray-100 text-gray-700 border border-gray-300"
            />
            <p className="text-xs text-gray-400 mt-1">
              Your email (cannot be changed)
            </p>
          </div>

          {Array.from({ length: Math.max(0, ticketCount - 1) }).map(
            (_, index) => (
              <div key={index} className="mb-2">
                <input
                  type="text"
                  placeholder={`Email ${index + 2} (registered user)`}
                  className="w-full p-2 mt-2 text-black"
                  value={emails[index + 1] || ""}
                  onChange={(e) => {
                    const newEmails = [...emails];
                    newEmails[index + 1] = e.target.value;
                    setEmails(newEmails);
                  }}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-400 mt-1">
                  User must exist in the system
                </p>
              </div>
            )
          )}
        </div>

        <div className="mt-4">
          <label className="block font-semibold">
            <u>Time of Claiming of Tickets</u>
          </label>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="w-full p-2 border rounded-xl mt-2 text-black"
            disabled={isSubmitting}
          >
            <option value="" disabled>
              Select your preferred time
            </option>
            {timeSlotOptions && timeSlotOptions.length > 0 ? (
              timeSlotOptions.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label} {getRemainingSlots(option.value)}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No claiming slots available
              </option>
            )}
          </select>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleAddReservation}
            disabled={isSubmitting}
            className="w-1/2 bg-black text-[#F09C32] text-lg py-2 rounded-xl font-bold cursor-pointer transition-all transform hover:scale-105 hover:bg-black-600 disabled:opacity-50 flex items-center justify-center"
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
              "ADD"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationEventCard;
