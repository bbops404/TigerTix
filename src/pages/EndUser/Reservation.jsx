import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header_User";
import ReservationEventCard from "../../components/ReservationEventCard";
import { IoChevronBackOutline } from "react-icons/io5";
import ConfirmationEventModal from "../../components/ConfirmationEventModal";
import {
  fetchEventById,
  fetchAvailableClaimingSlots,
  fetchUserDetails,
  createReservation,
  validateDatabaseEmails,
  getUserIdsByEmail,
} from "../Services/reservationService";

const Reservation = () => {
  const [event, setEvent] = useState(null);
  const [claimingSlots, setClaimingSlots] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [ticketType, setTicketType] = useState("");
  const [ticketTypeId, setTicketTypeId] = useState(""); // To store the selected ticket ID
  const [claimingSlot, setClaimingSlot] = useState("");
  const [claimingSlotId, setClaimingSlotId] = useState(""); // To store the selected claiming slot ID
  const [ticketCount, setTicketCount] = useState(1);
  const [emails, setEmails] = useState([""]);
  const [showSummary, setShowSummary] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [formState, setFormState] = useState(null);
  const [maxPerUser, setMaxPerUser] = useState(1); // Default max tickets per user

  const navigate = useNavigate();
  const location = useLocation();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "TBA";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Format time to show AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return "TBA";

    try {
      // Check if the timeString is already in a standard format
      if (
        timeString.toLowerCase().includes("am") ||
        timeString.toLowerCase().includes("pm")
      ) {
        return timeString; // Already has AM/PM
      }

      // Handle "HH:MM" format
      if (timeString.includes(":")) {
        const [hours, minutes] = timeString
          .split(":")
          .map((num) => parseInt(num, 10));
        const period = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
        return `${formattedHours}:${minutes
          .toString()
          .padStart(2, "0")} ${period}`;
      }

      // If it's just hours (e.g., "14")
      const hours = parseInt(timeString, 10);
      if (!isNaN(hours)) {
        const period = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:00 ${period}`;
      }

      // If we can't parse it, return the original
      return timeString;
    } catch (e) {
      console.error("Error formatting time:", e);
      return timeString;
    }
  };

  // Get event ID from URL query params or location state
  const getEventId = () => {
    if (location.state && location.state.eventId) {
      return location.state.eventId;
    }

    const urlParams = new URLSearchParams(location.search);
    return urlParams.get("eventId");
  };

  const eventId = getEventId();

  // Fetch event, claiming slots, and user data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setApiError("");

        if (!eventId) {
          setApiError("No event selected. Please choose an event first.");
          setLoading(false);
          return;
        }

        // Fetch event details
        const eventResponse = await fetchEventById(eventId);
        if (eventResponse.success) {
          // Format dates and times in the event object
          const formattedEvent = {
            ...eventResponse.data,
            event_date: formatDate(eventResponse.data.event_date),
            event_time: formatTime(eventResponse.data.event_time),
            reservation_start_date: formatDate(
              eventResponse.data.reservation_start_date
            ),
            reservation_end_date: formatDate(
              eventResponse.data.reservation_end_date
            ),
            reservation_start_time: formatTime(
              eventResponse.data.reservation_start_time
            ),
            reservation_end_time: formatTime(
              eventResponse.data.reservation_end_time
            ),
          };

          setEvent(formattedEvent);

          // Set max tickets per user based on ticket data
          if (formattedEvent.Tickets && formattedEvent.Tickets.length > 0) {
            // Default to first ticket's max_per_user if no ticket is selected yet
            setMaxPerUser(formattedEvent.Tickets[0].max_per_user || 1);
          }
        } else {
          setApiError("Failed to load event details.");
        }

        // Fetch available claiming slots
        const slotsResponse = await fetchAvailableClaimingSlots(eventId);
        if (slotsResponse.success) {
          // Format dates and times in claiming slots
          const formattedSlots = slotsResponse.data.map((slot) => ({
            ...slot,
            claiming_date: formatDate(slot.claiming_date),
            start_time: formatTime(slot.start_time),
            end_time: formatTime(slot.end_time),
          }));

          setClaimingSlots(formattedSlots);
        } else {
          console.warn("Could not fetch claiming slots, using empty array");
          setClaimingSlots([]);
        }

        // Fetch current user details
        try {
          const userResponse = await fetchUserDetails();
          if (userResponse.success) {
            setUser(userResponse.data);

            // Set the first email as the user's email
            const newEmails = [...emails];
            newEmails[0] = userResponse.data.email;
            setEmails(newEmails);
          } else {
            console.warn("Could not fetch user details, using fallback");

            // Use a minimal fallback user
            const fallbackUser = {
              user_id: "fallback-user",
              email: "user@example.com",
              first_name: "User",
              last_name: "",
            };

            setUser(fallbackUser);

            // Set the email in the emails array
            const newEmails = [...emails];
            newEmails[0] = fallbackUser.email;
            setEmails(newEmails);
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          // Use fallback data but don't block the flow
          const fallbackUser = {
            user_id: "fallback-user",
            email: "user@example.com",
            first_name: "User",
            last_name: "",
          };

          setUser(fallbackUser);

          // Set the email in the emails array
          const newEmails = [...emails];
          newEmails[0] = fallbackUser.email;
          setEmails(newEmails);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setApiError("Failed to load necessary data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  // Reset summary if any field changes
  useEffect(() => {
    if (
      formState &&
      (ticketType !== formState.ticketType ||
        ticketCount !== formState.ticketCount ||
        JSON.stringify(emails) !== JSON.stringify(formState.emails) ||
        claimingSlot !== formState.claimingSlot)
    ) {
      setShowSummary(false);
    }
  }, [ticketType, ticketCount, emails, claimingSlot, formState]);

  // Update max tickets per user when ticket type changes
  useEffect(() => {
    if (event && event.Tickets && event.Tickets.length > 0) {
      const selectedTicket = event.Tickets.find(
        (ticket) => ticket.ticket_type === ticketType
      );
      if (selectedTicket) {
        setTicketTypeId(selectedTicket.id);
        setMaxPerUser(selectedTicket.max_per_user || 1);

        // Adjust ticket count if it exceeds new max
        if (ticketCount > selectedTicket.max_per_user) {
          setTicketCount(selectedTicket.max_per_user);
        }
      }
    }
  }, [ticketType, event]);

  // Update claiming slot ID when time slot changes
  useEffect(() => {
    if (claimingSlots && claimingSlots.length > 0) {
      const selectedSlot = claimingSlots.find(
        (slot) =>
          `${slot.claiming_date}, ${slot.start_time} - ${slot.end_time}` ===
          claimingSlot
      );
      if (selectedSlot) {
        setClaimingSlotId(selectedSlot.id);
      }
    }
  }, [claimingSlot, claimingSlots]);

  // Generate claiming slot display format
  const formatClaimingSlots = () => {
    if (!claimingSlots || claimingSlots.length === 0) return [];

    return claimingSlots.map((slot) => ({
      value: `${slot.claiming_date}, ${slot.start_time} - ${slot.end_time}`,
      label: `${slot.claiming_date}, ${slot.start_time} - ${slot.end_time} (${slot.venue})`,
      id: slot.id,
      maxClaimers: slot.max_claimers,
      currentClaimers: slot.current_claimers,
      remaining: slot.max_claimers - slot.current_claimers,
    }));
  };

  // Format ticket prices for display
  const getTicketPrices = () => {
    if (!event || !event.Tickets) return {};

    const prices = {};
    event.Tickets.forEach((ticket) => {
      prices[ticket.ticket_type] = parseFloat(ticket.price);
    });

    return prices;
  };

  const validateForm = async () => {
    // Check if event is loaded
    if (!event) {
      setValidationError(
        "Event information not loaded. Please refresh the page."
      );
      return false;
    }

    // Check if ticket type is selected
    if (!ticketType || !ticketTypeId) {
      setValidationError("Please select a ticket type");
      return false;
    }

    // Check if claiming slot is selected
    if (!claimingSlot || !claimingSlotId) {
      setValidationError("Please select a time slot for claiming tickets");
      return false;
    }

    // Validate ticket count against max per user
    if (ticketCount > maxPerUser) {
      setValidationError(
        `You can only reserve up to ${maxPerUser} tickets of this type.`
      );
      return false;
    }

    // Check if all emails are filled for additional tickets
    for (let i = 1; i < ticketCount; i++) {
      if (!emails[i] || !emails[i].trim()) {
        setValidationError(`Please provide email for ticket ${i + 1}`);
        return false;
      }
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (let i = 1; i < ticketCount; i++) {
      if (!emailRegex.test(emails[i])) {
        setValidationError(
          `Please provide a valid email format for ticket ${i + 1}`
        );
        return false;
      }
    }

    // Validate emails exist in the database
    try {
      // Only validate additional emails (not the current user's email)
      if (ticketCount > 1) {
        const emailsToValidate = emails.slice(1, ticketCount);
        const emailValidation = await validateDatabaseEmails(emailsToValidate);

        if (!emailValidation.valid) {
          const notFoundList =
            emailValidation.notFoundEmails?.join(", ") || "One or more emails";
          setValidationError(
            `${notFoundList} not found in the system. Ensure all users are registered.`
          );
          return false;
        }
      }
    } catch (error) {
      console.error("Error validating emails:", error);
      setValidationError("Could not validate emails. Please try again.");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleAddReservation = async () => {
    // Show loading state or disable button while validating
    setValidationError("Validating emails...");

    const isValid = await validateForm();
    if (isValid) {
      // Store current form state to detect changes
      setFormState({
        ticketType,
        ticketCount,
        emails: [...emails],
        claimingSlot,
      });

      // Show the summary
      setShowSummary(true);
      setValidationError("");
    }
  };

  const handleSummaryConfirmation = () => {
    // Show the confirmation modal when the CONFIRM button in summary is clicked
    setShowConfirmModal(true);
  };

  const handleConfirmReservation = async () => {
    try {
      // Set submission state to true to show loading indicators
      setIsSubmitting(true);
      setValidationError("Processing your reservation...");

      if (!user || !user.user_id) {
        setIsSubmitting(false);
        setValidationError(
          "User information not available. Please log in again."
        );
        return;
      }

      // Do a final validation of emails in the database
      if (ticketCount > 1) {
        const emailsToValidate = emails.slice(1, ticketCount);
        const emailValidation = await validateDatabaseEmails(emailsToValidate);

        if (!emailValidation.valid) {
          setIsSubmitting(false);
          setValidationError(
            emailValidation.message ||
              "Some email addresses were not found in the system."
          );
          setShowConfirmModal(false);
          return;
        }
      }

      // Get user IDs from emails
      let additionalUserIds = [];
      if (ticketCount > 1) {
        try {
          const emailsToConvert = emails.slice(1, ticketCount);
          const response = await getUserIdsByEmail(emailsToConvert);

          if (response.success && response.userIds) {
            // Filter out null values
            additionalUserIds = response.userIds.filter((id) => id !== null);

            // Check if we got all the user IDs we needed
            if (additionalUserIds.length !== emailsToConvert.length) {
              setIsSubmitting(false);
              setValidationError(
                "Some users could not be found. Please check the email addresses."
              );
              setShowConfirmModal(false);
              return;
            }
          } else {
            throw new Error(response.message || "Failed to get user IDs");
          }
        } catch (error) {
          console.error("Error getting user IDs:", error);
          setIsSubmitting(false);
          setValidationError(
            "Error retrieving user details. Please try again."
          );
          setShowConfirmModal(false);
          return;
        }
      }

      // Create reservation data object for API
      const reservationData = {
        main_reserver_id: user.user_id,
        user_ids: additionalUserIds, // This will be an empty array if ticketCount is 1
        event_id: eventId,
        ticket_id: ticketTypeId,
        claiming_id: claimingSlotId,
      };

      console.log(
        "Sending reservation data:",
        JSON.stringify(reservationData, null, 2)
      );

      // Call API to create reservation
      const response = await createReservation(reservationData);

      if (response.success) {
        // Close the modal
        setShowConfirmModal(false);

        // Store reservation data for receipt page
        const receiptData = {
          ticketType,
          ticketCount,
          emails: emails.slice(0, ticketCount),
          timeSlot: claimingSlot,
          ticketPrices: getTicketPrices(),
          ticketPrice: getTicketPrices()[ticketType] || 0,
          userEmail: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          eventName: event.name,
          eventDate: event.event_date,
          eventTime: event.event_time,
          eventVenue: event.venue,
          event: event,
          reservationId:
            response.data && response.data.length > 0
              ? response.data[0]?.reservation_id
              : "N/A",
          claimingVenue:
            claimingSlots.find((slot) => slot.id === claimingSlotId)?.venue ||
            "UST IPEA",
        };

        // Store in localStorage as a backup
        localStorage.setItem("reservationData", JSON.stringify(receiptData));

        // Navigate to the receipt page
        navigate("/reservation-receipt", { state: receiptData });
      } else {
        // Enhanced error display
        console.error("Reservation failed:", response);
        setValidationError(
          response.message || "Failed to create reservation. Please try again."
        );

        // If there are details in the error, log them for debugging
        if (response.details) {
          console.error("Error details:", response.details);
        }

        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      setValidationError(
        "An unexpected error occurred while creating your reservation."
      );
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#121212] text-white min-h-screen">
        <Header showSearch={false} showAuthButtons={true} />
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <div className="text-xl">Loading reservation details...</div>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="bg-[#121212] text-white min-h-screen">
        <Header showSearch={false} showAuthButtons={true} />
        <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)]">
          <div className="text-xl text-red-500 mb-4">{apiError}</div>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-2 bg-[#F09C32] text-black rounded-lg font-bold"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-custom_black text-white min-h-screen font-Poppins">
      <Header showSearch={false} showAuthButtons={true} />

      {/* Back Button (Upper Left) */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-[100px] left-4 text-white font-Poppins font-bold"
      >
        <IoChevronBackOutline className="text-3xl" />
      </button>

      <div className="container mx-auto px-4 py-8 mt-12">
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            <ReservationEventCard
              event={event}
              ticketPrices={getTicketPrices()}
              ticketType={ticketType}
              setTicketType={setTicketType}
              ticketCount={ticketCount}
              setTicketCount={setTicketCount}
              emails={emails}
              setEmails={setEmails}
              timeSlot={claimingSlot}
              setTimeSlot={setClaimingSlot}
              timeSlotOptions={formatClaimingSlots()}
              handleAddReservation={handleAddReservation}
              userEmail={user?.email || emails[0]}
              validationError={validationError}
              maxTickets={maxPerUser}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        {/* Reservation Summary (Shown Only After Clicking ADD) */}
        {showSummary && (
          <div className="mt-10">
            <hr className="w-full max-w-6xl mx-auto mb-8" />

            <div className="flex justify-center">
              <div className="w-full max-w-6xl flex flex-col lg:flex-row">
                {/* Left Column */}
                <div className="w-full lg:w-1/2 p-4">
                  <h2 className="text-xl lg:text-2xl font-bold">
                    NOTICE TO ALL ONLINE CUSTOMERS
                  </h2>
                  <h3 className="text-lg lg:text-xl font-semibold mt-6">
                    Guidelines for Online Ticket Reservation
                  </h3>
                  <ol className="list-decimal ml-5 mt-2 text-sm space-y-2">
                    <li>
                      Sign up using your active UST email to access the
                      reservation system.
                    </li>
                    <li>Select the event and preferred ticket type.</li>
                    <li>
                      Input the full names and UST emails of all ticket holders
                      for verification.
                    </li>
                    <li>Review your reservation details before confirming.</li>
                    <li>
                      Check your email for the confirmation and QR code for
                      claiming.
                    </li>
                    <li>
                      Present a valid UST ID and the confirmation email upon
                      claiming.
                    </li>
                    <li>
                      Failure to claim the reserved ticket may result in account
                      restrictions.
                    </li>
                    <li>
                      Contact support for any inquiries or issues regarding the
                      reservation.
                    </li>
                  </ol>
                </div>

                {/* Right Column - Reservation Summary */}
                <div className="w-full lg:w-1/2 p-4">
                  <h2 className="font-bold text-2xl lg:text-3xl text-center">
                    RESERVATION SUMMARY
                  </h2>
                  <div className="mt-6 p-4 border bg-gray-200 text-black text-center text-lg lg:text-xl">
                    <h3>
                      <u>{event.name}</u>
                    </h3>

                    {/* Table for the summary */}
                    <div className="overflow-x-auto">
                      <table className="w-full mt-6 border border-gray-200 text-center text-xs lg:text-sm">
                        <tbody>
                          <tr>
                            <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">
                              Name:
                            </td>
                            <td className="bg-gray-300 border border-white">
                              {user?.first_name} {user?.last_name}
                            </td>
                          </tr>

                          <tr>
                            <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">
                              Email:
                            </td>
                            <td className="bg-gray-300 border border-white">
                              {user?.email || emails[0]}
                            </td>
                          </tr>

                          <tr>
                            <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">
                              Quantity:
                            </td>
                            <td className="bg-gray-300 border border-white">
                              {ticketCount}
                            </td>
                          </tr>

                          <tr>
                            <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">
                              Reserved For:
                            </td>
                            <td className="bg-gray-300 border border-white">
                              {emails
                                .slice(0, ticketCount)
                                .map((email, index) => (
                                  <div key={index}>{email}</div>
                                ))}
                            </td>
                          </tr>

                          <tr>
                            <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">
                              Batch:
                            </td>
                            <td className="bg-gray-300 border border-white">
                              {claimingSlot}
                            </td>
                          </tr>

                          <tr>
                            <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">
                              Claiming Venue:
                            </td>
                            <td className="bg-gray-300 border border-white">
                              {claimingSlots.find(
                                (slot) => slot.id === claimingSlotId
                              )?.venue || "UST IPEA"}
                            </td>
                          </tr>

                          <tr>
                            <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">
                              Price Per Person:
                            </td>
                            <td className="bg-gray-300 border border-white">
                              <span>
                                ₱
                                {ticketType && getTicketPrices()[ticketType]
                                  ? parseFloat(
                                      getTicketPrices()[ticketType]
                                    ).toFixed(2)
                                  : "0.00"}
                              </span>
                            </td>
                          </tr>

                          <tr>
                            <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">
                              Total Amount to be Paid:
                            </td>
                            <td className="bg-gray-300 border border-white">
                              <span>
                                ₱
                                {ticketType && getTicketPrices()[ticketType]
                                  ? (
                                      getTicketPrices()[ticketType] *
                                      ticketCount
                                    ).toFixed(2)
                                  : "0.00"}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <div className="mt-8 text-center">
                    <button
                      className="font-Poppins bg-black text-[#F09C32] font-bold text-lg py-3 px-7 w-full lg:min-w-[300px] rounded-lg inline-block mb-4 uppercase cursor-pointer transition-all transform hover:scale-105 hover:bg-black-600 disabled:opacity-50"
                      onClick={handleSummaryConfirmation}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "PROCESSING..." : "CONFIRM"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal - only shown when clicking CONFIRM in summary */}
      <ConfirmationEventModal
        isOpen={showConfirmModal}
        onClose={() => !isSubmitting && setShowConfirmModal(false)}
        onConfirm={handleConfirmReservation}
        ticketType={ticketType}
        ticketCount={ticketCount}
        emails={emails.slice(0, ticketCount)}
        timeSlot={claimingSlot}
        ticketPrices={getTicketPrices()}
        userEmail={user?.email || emails[0]}
        eventName={event?.name}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Reservation;
