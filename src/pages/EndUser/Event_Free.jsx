import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // For back navigation and dynamic ID
import Header_User from "../../components/Header_User";
import { IoChevronBackOutline, IoNotifications } from "react-icons/io5";
import axios from "axios";

const EventFree = () => {
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
        const response = await axios.get(`${API_BASE_URL}/api/user/events/free-events/${id}`, {
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
        <div className="text-white p-6 flex flex-col md:flex-row max-w-7xl w-full rounded-lg">
          {/* Left Image */}
          <div className="min-w-[300px] max-w-[300px] min-h-[450px] max-h-[450px] rounded-lg mx-auto md:ml-[50px] mb-6 md:mb-0 overflow-hidden bg-gray-800">
            {event.image ? (
              <img
                src={
                  event.image.startsWith("http")
                    ? event.image
                    : `http://localhost:5002${
                        event.image.startsWith("/") ? "" : "/"
                      }${event.image}`
                }
                alt={event.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Image failed to load:", e.target.src);
                  e.target.style.display = "none";
                  const container = e.target.parentNode;
                  if (!container.querySelector(".image-fallback")) {
                    const fallback = document.createElement("div");
                    fallback.className =
                      "w-full h-full flex items-center justify-center image-fallback";
                    fallback.innerHTML = `<span class="text-white text-center p-4">${
                      event.name || "Event image unavailable"
                    }</span>`;
                    container.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-center p-4">
                  {event.name || "No image available"}
                </span>
              </div>
            )}
          </div>
          
          {/* Right Content */}
          <div className="w-2/3 pl-6">
            <div className="bg-[#F09C32] text-black font-Poppins font-bold px-4 py-2 rounded-full inline-block mb-4">
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
              <strong>Event Category:</strong> {event.category || "N/A"}
            </p>

            {/* Be Notified Button */}
            <div className="flex justify-center mt-9">
              <button
                className="font-Poppins bg-black text-[#F09C32] font-bold py-3 px-7 min-w-[300px] 
                rounded-lg inline-block mb-4 uppercase cursor-pointer transition-all transform 
                hover:scale-105 hover:bg-black-600 items-center justify-center"
                onClick={() => alert("You will be notified about this event!")} // Placeholder action
              >
                Be notified!
                <IoNotifications className="text-2xl ml-2 bg-white p-1 rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventFree;
