import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Added missing import
import TigerTicket from "../../assets/TigerTicket.svg";
import Header_User from "../../components/Header_User";
import { IoChevronBackOutline } from "react-icons/io5";

const Event_Ticketed_EndUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState(location.state?.event || {});

  useEffect(() => {
    if (!event) {
      setEvent(location.state?.event);
    }
  }, [event, location.state]);

  if (!event) {
    return <p className="text-white">Event data is not available.</p>;
  }

  const tickets = event?.tickets || [
    { price: "₱100", label: "General Admission" },
    { price: "₱200", label: "Upper Box" },
    { price: "₱300", label: "Lower Box" },
    { price: "₱400", label: "Patron" },
  ];

  return (
    <div className="bg-[#121212] text-white min-h-screen">
      <Header_User />

      <button
        onClick={() => navigate(-1)}
        className="absolute top-[100px] left-4 text-white font-Poppins font-bold"
      >
        <IoChevronBackOutline className="text-3xl" />
      </button>

      <div className="flex justify-center items-center p-4 mt-4">
        <div className="text-white p-6 flex max-w-7xl w-full rounded-lg">
          <div className="bg-gray-300 min-w-[300px] max-w-[300px] min-h-[450px] max-h-[450px] rounded-lg ml-[50px]">
            <img src={event?.image} alt={event?.name} className="w-full h-full object-cover rounded-lg" />
          </div>

          <div className="w-full pl-10">
            <div className="bg-[#F09C32] text-black font-Poppins font-bold px-4 py-2 rounded-full inline-block mb-4">
              {event?.name || "Event Name"}
            </div>

            <h2 className="font-bold font-Poppins text-lg mb-2">EVENT DETAILS:</h2>
            <p className="font-Poppins text-justify text-sm text-gray-300 mb-4">
              {event?.details || "Event description goes here."}
            </p>
            <p className="text-sm mt-4 mb-2 font-Poppins">
              <strong>Location:</strong> {event?.location || "N/A"}
            </p>
            <p className="text-sm mb-2 font-Poppins">
              <strong>Time:</strong> {event?.time || "N/A"}
            </p>
            <p className="text-sm mb-2 font-Poppins">
              <strong>Tickets:</strong>
            </p>

            <div className="bg-[#694C26] p-4 mt-4 rounded-lg flex justify-between text-sm">
              {tickets.map((ticket, index) => (
                <div key={index} className="flex items-center space-x-2 text-left font-Poppins">
                  <img src={TigerTicket} alt="Ticket Icon" className="w-6 h-6" />
                  <div>
                    <p className="font-bold">{ticket.price}</p>
                    <p>{ticket.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-9">
              <button
                aria-label="Reserve tickets for the event"
                className="font-Poppins text-[#F09C32] font-bold py-3 px-7 min-w-[300px] rounded-lg inline-block mb-4 uppercase cursor-pointer transition-all transform hover:scale-105 outline outline-1 outline-[#F09C32]"
                onClick={() => navigate("/reservation", { state: { event } })} // Pass the event data here
              >
                RESERVE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event_Ticketed_EndUser;