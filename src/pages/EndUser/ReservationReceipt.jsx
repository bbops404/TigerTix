import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header_User";
import { useLocation } from "react-router-dom";
import QRCode from "react-qr-code";

const Label = ({ label, value }) => {
  return (
    <div className="w-full grid grid-cols-[30%_70%] items-start text-sm py-1">
      <label className="block text-gray-700 text-left font-bold mb-1">
        {label}
      </label>
      <div className="text-gray-900 text-left rounded-lg font-semibold">
        {value}
      </div>
    </div>
  );
};

const ReservationReceipt = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State for reservation data and current date
  const [receiptData, setReceiptData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Set current date for the receipt

    // Set loading state
    setIsLoading(true);

    // Get data from location state if available, otherwise try localStorage
    if (location.state) {
      setReceiptData(location.state);
      setIsLoading(false);
    } else {
      // Try to retrieve from localStorage as fallback
      try {
        const savedData = localStorage.getItem("reservationData");
        if (savedData) {
          setReceiptData(JSON.parse(savedData));
        } else {
          // No data available, redirect back to reservation page
          navigate("/reservation", { replace: true });
        }
      } catch (error) {
        console.error("Error retrieving reservation data:", error);
        navigate("/reservation", { replace: true });
      } finally {
        setIsLoading(false);
      }
    }
  }, [location, navigate]);

  // Handle download receipt functionality
  const handleDownload = () => {
    window.print();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#202020]">
        <Header showSearch={false} showAuthButtons={false} />
        <div className="flex flex-col justify-center items-center flex-grow text-white">
          <div className="animate-pulse">Loading receipt data...</div>
        </div>
      </div>
    );
  }

  // Handle missing data case
  if (!receiptData) {
    return (
      <div className="flex flex-col min-h-screen bg-[#202020]">
        <Header showSearch={false} showAuthButtons={false} />
        <div className="flex flex-col justify-center items-center flex-grow text-white">
          <div className="text-red-500 mb-4">Receipt data not found</div>
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

  // Destructure data with defaults to prevent errors
  const {
    ticketType = "",
    ticketCount = 1,
    ticketPrice = 0,
    emails = [],
    timeSlot = "N/A",
    userEmail = "",
    eventName = "Event",
    eventDate = "",
    eventTime = "",
    eventVenue = "",
    reservationId = "N/A",
    claimingVenue = "UST IPEA",
    firstName = "",
    lastName = "",
  } = receiptData;

  // Calculate total price
  const totalPrice = ticketPrice * ticketCount;

  // Format QR code value
  const qrValue = `UST-TICKET-${reservationId}-${eventName}-${ticketType}-${ticketCount}`;

  // Get user's name for display
  const displayName = `${firstName || ""} ${lastName || ""}`.trim() || "N/A";

  return (
    <div className="flex flex-col min-h-screen bg-[#202020]">
      <Header showSearch={false} showAuthButtons={false} />

      <div className="flex flex-col justify-center items-center flex-grow py-8">
        <div className="font-Poppins w-[90vw] lg:w-[80vw] h-auto min-h-[70vh] bg-[#D9D9D9] flex flex-col justify-start text-center text-4xl font-bold p-5 gap-6 rounded-lg shadow-xl">
          Reservation Receipt
          <div className="w-[95%] lg:w-[90%] h-auto min-h-[70%] bg-white self-center grid grid-cols-1 md:grid-cols-[40%_60%] p-4 rounded-lg shadow-md">
            <div className="font-Poppins text-center justify-start font-bold text-lg">
              YOUR QR CODE:
              <div className="font-Poppins w-full h-auto py-4 flex justify-center items-center">
                <QRCode value={qrValue} size={150} level="H" />
              </div>
              <div className="mt-2">
                RESERVATION ID:{" "}
                <span className="text-[#F09C32]">{reservationId}</span>
              </div>
              <div className="mt-4 text-xs text-gray-600 font-normal">
                Please present this QR code when claiming your ticket(s)
              </div>
            </div>

            {/* Receipt details section */}
            <div className="mt-4 md:mt-0">
              <Label label="Name:" value={displayName} />
              <Label
                label="Email:"
                value={userEmail || emails?.[0] || "email@ust.edu.ph"}
              />

              <Label label="Event:" value={eventName} />
              <Label label="Event Date:" value={eventDate} />
              <Label label="Event Time:" value={eventTime || "TBA"} />
              <Label label="Venue:" value={eventVenue || "TBA"} />
              <Label
                label="Ticket Type:"
                value={ticketType || "Not specified"}
              />
              <Label
                label="Reserved Tickets:"
                value={
                  <div className="text-sm">
                    {emails && emails.length > 0
                      ? emails.map((email, index) => (
                          <div key={index} className="mb-1">
                            {email}
                          </div>
                        ))
                      : "None specified"}
                  </div>
                }
              />
              <Label label="Batch:" value={timeSlot || "Not specified"} />
              <Label
                label="Claiming Venue:"
                value={claimingVenue || "UST IPEA"}
              />
              <Label
                label="Price Per Person:"
                value={`₱${parseFloat(ticketPrice).toFixed(2)}`}
              />
              <Label
                label="Total Amount:"
                value={`₱${totalPrice.toFixed(2)}`}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 text-lg justify-center">
            <button
              onClick={handleDownload}
              className="font-Poppins w-full md:w-[30%] py-2 bg-[#000000] text-[#FFAB40] hover:bg-[#FFAB40] hover:text-[#000000] transition duration-300 font-bold rounded-md shadow-xl"
            >
              DOWNLOAD
            </button>
            <button
              className="font-Poppins w-full md:w-[30%] py-2 bg-[#FFFFFF] text-[#000000] hover:bg-[#FFAB40] hover:text-[#000000] transition duration-300 font-bold rounded-md shadow-xl"
              onClick={() => navigate("/home")}
            >
              GO BACK
            </button>
          </div>
        </div>

        <div className="mt-6 w-[90vw] lg:w-[80vw] p-4 bg-[#F0F0F0] rounded-lg text-black text-sm">
          <p className="text-center font-semibold">Important Reminders</p>
          <ul className="list-disc ml-6 mt-2">
            <li>You must bring a valid UST ID when claiming your ticket.</li>
            <li>
              All ticket holders must present their UST ID for verification.
            </li>
            <li>Ticket claiming deadline: 3 hours before the event starts.</li>
            <li>
              Unclaimed tickets may result in account restrictions for future
              events.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReservationReceipt;
