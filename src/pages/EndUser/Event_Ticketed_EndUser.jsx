import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // For getting event ID and navigation
import Header_User from "../../components/Header_User";
import TigerTicket from "../../assets/TigerTicket.svg"; // Correct import
import { IoChevronBackOutline } from "react-icons/io5";
import axios from "axios";

const Event_Ticketed_EndUser = () => {
  const { id } = useParams(); // Get the event ID from the URL
  const [event, setEvent] = useState(null); // State to store event details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = "http://localhost:5002"; // Replace with your backend URL

        // Fetch event details by ID
        const response = await axios.get(`${API_BASE_URL}/api/user/events/ticketed/${id}`, {
          withCredentials: true, // Include cookies for authentication
        });
        if (response.data.success) {
          setEvent(response.data.data);
        } else {
          setError("Failed to fetch event details.");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to fetch event details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return <div className="text-center text-white">Loading event details...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-[#121212] text-white min-h-screen">
      <Header_User />

      {/* Back Button (Upper Left) */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-[100px] left-4 text-white font-Poppins font-bold"
      >
        <IoChevronBackOutline className="text-3xl" />
      </button>

      <div className="flex justify-center items-center p-5 mt-10">
        <div className="text-white p-6 flex max-w-7xl w-full rounded-lg">
          {/* Left Image */}
          <div
            className="min-w-[300px] max-w-[300px] min-h-[450px] max-h-[450px] rounded-lg ml-[50px] bg-cover bg-center"
            style={{
              backgroundImage: `url('${event.image || "https://via.placeholder.com/300"}')`,
            }}
          ></div>

          {/* Right Content */}
          <div className="w-2/3 pl-6">
            <div className="bg-[#F09C32] text-black font-Poppins font-bold px-4 py-2 rounded-lg inline-block mb-4">
              {event.name}
            </div>

            <h2 className="font-bold font-Poppins text-lg mb-2">EVENT DETAILS:</h2>
            <p className="font-Poppins text-justify text-sm text-gray-300 mb-4">
              {event.details}
            </p>

            <p className="text-sm mb-2 font-Poppins">
              <strong>Location:</strong> {event.venue}
            </p>
            <p className="text-sm mb-2 font-Poppins">
              <strong>Date:</strong> {event.event_date || "TBA"}
            </p>
            <p className="text-sm mb-2 font-Poppins">
              <strong>Time:</strong> {event.event_time || "TBA"}
            </p>
            <p className="text-sm mb-2 font-Poppins">
              <strong>Tickets:</strong>
            </p>

            {/* Ticket Prices */}
            <div className="bg-[#694C26] p-4 rounded-lg flex flex-wrap text-sm">
              {event.Tickets && event.Tickets.length > 0 ? (
                event.Tickets.map((ticket, index) => (
                  <div
                    key={index}
                    className="flex-1 flex items-center space-x-2 text-left font-Poppins mb-4"
                  >
                    <img src={TigerTicket} alt="Ticket Icon" className="w-6 h-6" />
                    <div>
                      <p className="font-bold">₱{parseFloat(ticket.price).toLocaleString()}</p>
                      <p>{ticket.ticket_type}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No tickets available for this event.</p>
              )}
            </div>

            {/* Reserve Button */}
            <div className="flex justify-end mt-9">
              <button
                className="font-Poppins text-[#F09C32] font-bold py-3 px-7 min-w-[300px] rounded-lg inline-block mb-4 uppercase cursor-pointer transition-all transform hover:scale-105 outline outline-1 outline-[#F09C32]"
                onClick={() => navigate("/reservation")} // Redirects to Reservation
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
