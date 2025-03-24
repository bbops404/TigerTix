import React, { useEffect } from "react";
import { PiTagBold } from "react-icons/pi"; // Make sure to import the icon you're using

const ReservationEventCard = ({
  ticketPrices,
  ticketType,
  setTicketType,
  ticketCount,
  setTicketCount,
  emails,
  setEmails,
  timeSlot,
  setTimeSlot,
  handleAddReservation,
  userEmail, // User email prop
  validationError, // Added validation error prop
}) => {
  // Ensure first email is always the user's email
  useEffect(() => {
    const newEmails = [...emails];
    // Always set the first email to the user's email
    newEmails[0] = userEmail;
    setEmails(newEmails);
  }, [ticketCount]); // Re-run when ticket count changes to ensure proper email array sizing

  return (
    <div className="flex">
      {/* Left Column 1 - IMAGE PLACEHOLDER*/}
      <div className="w-1/4 p-4">
        <div className="bg-gray-300 w-full h-[450px] rounded-lg"></div>
      </div>

      {/* Left Column 2 - EVENT DETAILS*/}
      <div className="w-1/4 pl-2">
        <h2 className="text-l font-bold mt-4">ABOUT</h2>
        <p className="text-justify text-xs text-gray-300 mb-4">
          Get ready to ignite the pride as we mark the beginning of another
          electrifying season of the University Athletic Association of the
          Philippines! UAAP Season 87 Kickoff is here to celebrate the spirit of
          sportsmanship, excellence, and camaraderie among the finest
          student-athletes from across the league.
        </p>

        <h1 className="text-2xl font-bold">Tickets</h1>

        <div className="ticket">
          {Object.entries(ticketPrices).map(([type, price]) => (
            <div key={type} className="flex flex-col mt-2">
              <div className="flex items-center">
                <PiTagBold className="text-white text-3xl mr-2" />
                <span className="text-white text-xl font-bold">₱ {price}</span>
              </div>
              <span className="text-white text-xs mt-1 ml-10">
                1 ticket, {type}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-sm mb-2">
            <strong>Venue:</strong> Mall of Asia Arena
          </p>
          <p className="text-sm mb-2">
            <strong>Time:</strong> 6:00 PM
          </p>
          <p className="text-sm mb-2">
            <strong>Event Category:</strong> UAAP Game
          </p>
          <p className="text-sm mb-2">
            <strong>Ticket Claiming Venue:</strong> UST IPEA
          </p>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-1/2 p-4 ml-6">
        <h1 className="text-2xl font-bold text-center">
          RESERVE FOR THE BIG GAME!
        </h1>

        {/* Validation Error Message */}
        {validationError && (
          <div className="bg-red-500 text-white p-2 rounded-md mt-2 mb-4">
            {validationError}
          </div>
        )}

        {/* Ticket Selection */}
        <div className="mt-4">
          <h2 className="font-semibold">Choose a Ticket Tier</h2>
          <div className="flex gap-2 mt-2">
            {Object.keys(ticketPrices).map((type) => (
              <button
                key={type}
                className={`px-6 py-1 rounded-full font-Poppins text-[#F09C32] font-semibold ${
                  ticketType === type
                    ? "bg-[#F09C32] text-black"
                    : "bg-black text-white"
                }`}
                onClick={() => setTicketType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="mt-4">
          <label className="block font-semibold">
            <u>How many tickets would you like to reserve?</u>
          </label>
          <input
            type="number"
            min="1"
            max="5"
            placeholder="1-5"
            value={ticketCount}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 1 && value <= 5) {
                setTicketCount(value);
              }
            }}
            className="w-1/4 p-2 border rounded-xl mt-2 text-black"
          />
        </div>

        {/* Emails */}
        <div className="mt-4">
          <label className="block font-semibold">
            <u>Enter the email/s of the people you want to reserve for</u>
          </label>

          {/* First email (user's email) - Always present and disabled */}
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

          {/* Additional emails */}
          {Array.from({ length: Math.max(0, ticketCount - 1) }).map(
            (_, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Email ${index + 2}`}
                className="w-full p-2 mt-2 text-black"
                value={emails[index + 1] || ""}
                onChange={(e) => {
                  const newEmails = [...emails];
                  newEmails[index + 1] = e.target.value;
                  setEmails(newEmails);
                }}
              />
            )
          )}
        </div>

        {/* Claiming Time */}
        <div className="mt-4">
          <label className="block font-semibold">
            <u>Time of Claiming of Tickets</u>
          </label>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="w-3/8 p-2 border rounded-xl mt-2 text-black"
          >
            <option value="" disabled>
              Select your preferred time
            </option>
            <option>7:00 AM - 9:00 AM</option>
            <option>9:00 AM - 11:00 AM</option>
            <option>1:00 PM - 3:00 PM</option>
            <option>3:00 PM - 5:00 PM</option>
          </select>
        </div>

        {/* Add Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleAddReservation}
            className="w-1/2 bg-black text-[#F09C32] text-lg py-2 rounded-xl font-bold cursor-pointer transition-all transform hover:scale-105 hover:bg-black-600"
          >
            ADD
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationEventCard;
