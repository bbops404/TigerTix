import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For back navigation
import Header from "../../components/Header";
import ReservationEventCard from "../../components/ReservationEventCard"; // Import the new component
import { IoChevronBackOutline } from "react-icons/io5";
import ConfirmationEventModal from "../../components/ConfirmationEventModal";

const Reservation = () => {
  const [ticketType, setTicketType] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [emails, setEmails] = useState([""]);
  const [timeSlot, setTimeSlot] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [formState, setFormState] = useState(null);

  // Assuming the user's email is retrieved from auth context or similar
  const userEmail = "email0@ust.edu.ph"; // This should come from your auth system

  // Ensure the first email is always the user's email
  useEffect(() => {
    const newEmails = [...emails];
    newEmails[0] = userEmail;
    setEmails(newEmails);
  }, []);

  // Reset summary if any field changes
  useEffect(() => {
    if (
      formState &&
      (ticketType !== formState.ticketType ||
        ticketCount !== formState.ticketCount ||
        JSON.stringify(emails) !== JSON.stringify(formState.emails) ||
        timeSlot !== formState.timeSlot)
    ) {
      setShowSummary(false);
    }
  }, [ticketType, ticketCount, emails, timeSlot, formState]);

  const ticketPrices = {
    "Gen Ad": 100,
    "Upper Box": 200,
    "Lower Box": 300,
    Patron: 500,
  };

  const validateForm = () => {
    // Check if ticket type is selected
    if (!ticketType) {
      setValidationError("Please select a ticket type");
      return false;
    }

    // Check if time slot is selected
    if (!timeSlot) {
      setValidationError("Please select a time slot for claiming tickets");
      return false;
    }

    // Check if all emails are filled for additional tickets
    for (let i = 1; i < ticketCount; i++) {
      if (!emails[i] || !emails[i].trim()) {
        setValidationError(`Please provide email for ticket ${i + 1}`);
        return false;
      }

      // Basic email validation (could be enhanced)
      if (!emails[i].includes("@") || !emails[i].includes(".")) {
        setValidationError(`Please provide a valid email for ticket ${i + 1}`);
        return false;
      }
    }

    setValidationError("");
    return true;
  };

  const handleAddReservation = () => {
    if (validateForm()) {
      // Store current form state to detect changes
      setFormState({
        ticketType,
        ticketCount,
        emails: [...emails],
        timeSlot,
      });

      console.log("Reservation Added", {
        ticketType,
        ticketCount,
        emails,
        timeSlot,
      });

      // Show the summary directly instead of the confirmation modal
      setShowSummary(true);
    }
  };

  const handleSummaryConfirmation = () => {
    // Show the confirmation modal when the CONFIRM button in summary is clicked
    setShowConfirmModal(true);
  };

  const handleConfirmReservation = () => {
    console.log("Final Reservation Confirmed", {
      ticketType,
      ticketCount,
      emails,
      timeSlot,
    });

    // Close the modal
    setShowConfirmModal(false);

    // Navigate to the receipt page after final confirmation
    navigate("/reservation-receipt", {
      state: {
        ticketType,
        ticketCount,
        emails,
        timeSlot,
        ticketPrices,
        userEmail,
      },
    });
  };

  const navigate = useNavigate();

  return (
    <div className="bg-[#121212] text-white min-h-screen">
      <Header showSearch={false} showAuthButtons={true} />

      {/* Back Button (Upper Left) */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-[100px] left-4 text-white font-Poppins font-bold"
      >
        <IoChevronBackOutline className="text-3xl" />
      </button>

      {/* Main Content */}
      <div className="w-full flex flex-col lg:flex-row px-4 lg:px-20 py-8 font-Poppins">
        <ReservationEventCard
          ticketPrices={ticketPrices}
          ticketType={ticketType}
          setTicketType={setTicketType}
          ticketCount={ticketCount}
          setTicketCount={setTicketCount}
          emails={emails}
          setEmails={setEmails}
          timeSlot={timeSlot}
          setTimeSlot={setTimeSlot}
          handleAddReservation={handleAddReservation}
          userEmail={userEmail} // Pass the user's email to the card component
          validationError={validationError}
        />
      </div>

      {/* Reservation Summary (Shown Only After Clicking ADD) */}
      {showSummary && (
        <div className="">
          <hr className="w-[calc(100%-40px)] lg:w-[calc(100%-160px)] mx-auto mt-10" />

          <div className="w-full flex flex-col lg:flex-row px-4 lg:px-20 py-8 font-Poppins">
            {/* Left Column */}
            <div className="w-full lg:w-1/2 p-4 lg:ml-6 mt-12">
              <h2 className="text-xl lg:text-2xl font-bold">
                NOTICE TO ALL ONLINE CUSTOMERS
              </h2>
              <h3 className="text-lg lg:text-xl font-semibold mt-6">
                Guidelines for Online Ticket Reservation
              </h3>
              <ol className="list-decimal ml-5 mt-2 text-sm space-y-2">
                <li>
                  Sign up using your active UST email to access the reservation
                  system.
                </li>
                <li>Select the event and preferred ticket type.</li>
                <li>
                  Input the full names and UST emails of all ticket holders for
                  verification.
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

            {/* Right Column */}
            <div className="w-full lg:w-1/2 p-4 lg:ml-6">
              <h2 className="font-bold text-2xl lg:text-3xl text-center">
                RESERVATION SUMMARY
              </h2>
              <div className="mt-6 m-4 lg:m-8 p-4 border bg-gray-200 text-black text-center text-lg lg:text-xl">
                <h3>
                  <u>UAAP Season 87 Men's Basketball</u>
                </h3>

                {/* Table for the summary */}
                <div className="overflow-x-auto">
                  <table className="w-full mt-10 border border-gray-200 text-center text-xs lg:text-sm">
                    <tbody>
                      <tr>
                        <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">
                          Name:
                        </td>
                        <td className="bg-gray-300 border border-white">
                          FirstName LastName
                        </td>
                      </tr>

                      <tr>
                        <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">
                          Email:
                        </td>
                        <td className="bg-gray-300 border border-white">
                          {userEmail}
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
                          {emails.map((email, index) => (
                            <div key={index}>{email}</div>
                          ))}
                        </td>
                      </tr>

                      <tr>
                        <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">
                          Batch:
                        </td>
                        <td className="bg-gray-300 border border-white">
                          {timeSlot}
                        </td>
                      </tr>

                      <tr>
                        <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">
                          Claiming Venue:
                        </td>
                        <td className="bg-gray-300 border border-white">
                          UST IPEA
                        </td>
                      </tr>

                      <tr>
                        <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">
                          Total Amount to be Paid:
                        </td>
                        <td className="bg-gray-300 border border-white">
                          ₱
                          {ticketType
                            ? ticketPrices[ticketType] * ticketCount
                            : 0}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Confirm Button */}
              <div className="mt-8 text-center">
                <button
                  className="font-Poppins bg-black text-[#F09C32] font-bold text-lg py-3 px-7 w-full lg:min-w-[300px] rounded-lg inline-block mb-4 uppercase cursor-pointer transition-all transform hover:scale-105 hover:bg-black-600"
                  onClick={handleSummaryConfirmation}
                >
                  CONFIRM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal - only shown when clicking CONFIRM in summary */}
      <ConfirmationEventModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmReservation}
        ticketType={ticketType}
        ticketCount={ticketCount}
        emails={emails}
        timeSlot={timeSlot}
        ticketPrices={ticketPrices}
        userEmail={userEmail}
      />
    </div>
  );
};

export default Reservation;
