import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import Header from "../../components/Header";
import { useLocation } from "react-router-dom";
import QRCode from "react-qr-code"; // You'll need to install this package

const Label = ({ label, value }) => {
  return (
    <div className="w-full grid grid-cols-[20%_70%] items-start text-sm py-1">
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

  // Get reservation data from navigation state or localStorage fallback
  const [reservationData, setReservationData] = useState(null);
  const [reservationId, setReservationId] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [eventDate, setEventDate] = useState("March 30, 2025"); // Example date

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Set current date for the receipt
    const date = new Date();
    setCurrentDate(
      date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

    // Generate a reservation ID (in a real app, this would come from the backend)
    setReservationId(`UST-${Math.floor(100000 + Math.random() * 900000)}`);

    // Get data from location state if available, otherwise try localStorage
    if (location.state) {
      setReservationData(location.state);
    } else {
      // Try to retrieve from localStorage as fallback
      const savedData = localStorage.getItem("reservationData");
      if (savedData) {
        setReservationData(JSON.parse(savedData));
      } else {
        // No data available, redirect back to reservation page
        navigate("/reservation", { replace: true });
      }
    }
  }, [location, navigate]);

  // Handle download receipt functionality
  const handleDownload = () => {
    window.print(); // Simple print for now, could be replaced with proper PDF generation
  };

  // If data is still loading or not available
  if (!reservationData) {
    return (
      <div className="flex flex-col min-h-screen bg-[#202020]">
        <Header showSearch={false} showAuthButtons={false} />
        <div className="flex flex-col justify-center items-center flex-grow text-white">
          Loading receipt data...
        </div>
      </div>
    );
  }

  const { ticketType, ticketCount, ticketPrices, emails, timeSlot, userEmail } =
    reservationData;

  return (
    <div className="flex flex-col min-h-screen bg-[#202020]">
      <Header showSearch={false} showAuthButtons={false} />

      <div className="flex flex-col justify-center items-center flex-grow">
        <div className="font-Poppins w-[80vw] h-auto min-h-[70vh] bg-[#D9D9D9] flex flex-col justify-start text-center text-4xl font-bold p-5 gap-6">
          Reservation Receipt
          <div className="w-[90%] h-auto min-h-[70%] bg-white self-center grid grid-cols-1 md:grid-cols-[40%_60%] p-4">
            <div className="font-Poppins text-center justify-start font-bold text-lg">
              YOUR QR CODE:
              <div className="font-Poppins w-full h-auto py-4 flex justify-center items-center">
                <QRCode
                  value={`UST-TICKET-${reservationId}-${ticketType}-${ticketCount}`}
                  size={150}
                  level="H"
                />
              </div>
              <div className="mt-2">
                RESERVATION ID:{" "}
                <span className="text-[#F09C32]">{reservationId}</span>
              </div>
            </div>

            <div className="mt-4 md:mt-0">
              <Label label="Name:" value={"FirstName LastName"} />
              <Label
                label="Email:"
                value={userEmail || emails?.[0] || "email@ust.edu.ph"}
              />
              <Label label="Date Reserved:" value={currentDate} />
              <Label label="Event:" value={"UAAP Season 87 Men's Basketball"} />
              <Label
                label="Ticket Tier:"
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
              <Label label="Claiming Venue:" value={"UST IPEA"} />
              <Label
                label="Total Amount:"
                value={`₱${
                  ticketType && ticketPrices
                    ? ticketPrices[ticketType] * ticketCount
                    : 0
                }`}
              />
              <Label label="Date of Event:" value={eventDate} />
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
      </div>
    </div>
  );
};

export default ReservationReceipt;
