import React, { useEffect, useState } from "react";
import { PiTagBold } from "react-icons/pi";
import { validateDatabaseEmails } from "../pages/Services/reservationService";

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
  setValidationError,
  maxTickets = 1,
}) => {
  const [emailValidationErrors, setEmailValidationErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

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

  const validateEmail = async (email, index) => {
    if (!email || index === 0) return; // Skip validation for empty email or user's own email

    // Check for duplicate emails
    const isDuplicate = emails.some((existingEmail, existingIndex) => 
      existingEmail && existingIndex !== index && existingEmail.toLowerCase() === email.toLowerCase()
    );

    if (isDuplicate) {
      setEmailValidationErrors(prev => ({
        ...prev,
        [index]: "This email is already used for another ticket"
      }));
      return false;
    }

    try {
      const emailValidation = await validateDatabaseEmails([email]);
      if (!emailValidation.valid) {
        setEmailValidationErrors(prev => ({
          ...prev,
          [index]: "This email is not registered in the system"
        }));
        return false;
      } else {
        setEmailValidationErrors(prev => ({
          ...prev,
          [index]: null
        }));
        return true;
      }
    } catch (error) {
      console.error("Error validating email:", error);
      setEmailValidationErrors(prev => ({
        ...prev,
        [index]: "Error validating email. Please try again."
      }));
      return false;
    }
  };

  const handleEmailChange = (e, index) => {
    const newEmail = e.target.value;
    const newEmails = [...emails];
    newEmails[index] = newEmail;
    setEmails(newEmails);

    // Clear any existing error for this index
    setEmailValidationErrors(prev => ({
      ...prev,
      [index]: null
    }));

    // Validate the new email
    validateEmail(newEmail, index);
  };

  const validateAllEmails = async () => {
    setIsValidating(true);
    setValidationError("");

    // Check for empty emails
    for (let i = 1; i < ticketCount; i++) {
      if (!emails[i] || !emails[i].trim()) {
        setValidationError(`Please provide email for ticket ${i + 1}`);
        setIsValidating(false);
        return false;
      }
    }

    // Check for duplicates (including user's own email)
    const emailSet = new Set();
    emailSet.add(userEmail.toLowerCase()); // Add user's email to the set

    for (let i = 1; i < ticketCount; i++) {
      const email = emails[i].toLowerCase();
      if (emailSet.has(email)) {
        setValidationError("Duplicate email addresses are not allowed");
        setIsValidating(false);
        return false;
      }
      emailSet.add(email);
    }

    // Validate all emails exist in database
    try {
      const emailsToValidate = emails.slice(1, ticketCount);
      const emailValidation = await validateDatabaseEmails(emailsToValidate);

      if (!emailValidation.valid) {
        const notFoundList = emailValidation.notFoundEmails?.join(", ") || "One or more emails";
        setValidationError(`${notFoundList} not found in the system. Ensure all users are registered.`);
        setIsValidating(false);
        return false;
      }
    } catch (error) {
      console.error("Error validating emails:", error);
      setValidationError("Could not validate emails. Please try again.");
      setIsValidating(false);
      return false;
    }

    setIsValidating(false);
    return true;
  };

  const handleAddClick = async () => {
    const isValid = await validateAllEmails();
    if (!isValid) {
      return; // Stop here if validation fails
    }
    handleAddReservation();
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
          }}
        ></div>
      </div>

      {/* Left Column 2 - EVENT DETAILS */}
      <div className="w-full lg:w-1/4 pl-2">
        {event && (
          <div className="inline-block bg-custom_yellow rounded-full px-3 py-1">
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

        {/* Only show seat type selection if there are multiple tiers */}
        {!singleTicketTier ? (
          <div className="mt-4">
            <h2 className="font-semibold">Choose a Seat Type</h2>
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
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <h2 className="font-semibold">Seat Type</h2>
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
          />
        </div>

        <div className="mt-4">
          <label className="block font-semibold">
            <u>Enter the email/s of the people you want to reserve for</u>
          </label>

          <p className="text-xs text-gray-300 mt-1 mb-3">
            All users must be registered in the system. Make sure you enter
            their correct email address. Each email can only be used once.
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
                  className={`w-full p-2 mt-2 text-black ${
                    emailValidationErrors[index + 1] ? "border-red-500" : ""
                  }`}
                  value={emails[index + 1] || ""}
                  onChange={(e) => handleEmailChange(e, index + 1)}
                  onBlur={(e) => validateEmail(e.target.value, index + 1)}
                />
                {emailValidationErrors[index + 1] && (
                  <p className="text-xs text-red-500 mt-1">
                    {emailValidationErrors[index + 1]}
                  </p>
                )}
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
            onClick={handleAddClick}
            disabled={isValidating}
            className={`w-1/2 bg-black text-[#F09C32] text-lg py-2 rounded-xl font-bold cursor-pointer transition-all transform hover:scale-105 hover:bg-black-600 ${
              isValidating ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isValidating ? "Validating..." : "ADD"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationEventCard;
