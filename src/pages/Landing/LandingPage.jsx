import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../../components/EventCard";
import Header from "../../components/Header";
import LoginPopup from "./LoginPopup";
import { IoChevronBackOutline } from "react-icons/io5";
import axios from "axios"; // For API calls

function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ticketedEvents, setTicketedEvents] = useState([]); // State to store ticketed events
  const navigate = useNavigate();
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    const fetchTicketedEvents = async () => {
      try {
        const API_BASE_URL = "http://localhost:5002"; // Replace with your backend URL
        const response = await axios.get(`${API_BASE_URL}/api/events/published-ticketed`, {
          params: { limit: 4 }, // Fetch up to 4 events
        });

        if (response.data.success) {
          console.log("Fetched Events:", response.data.data); // Log the fetched events
          setTicketedEvents(response.data.data);
        } else {
          console.error("Failed to fetch ticketed events.");
        }
      } catch (error) {
        console.error("Error fetching ticketed events:", error);
      }
    };

    fetchTicketedEvents();
  }, []);

  const prevSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? ticketedEvents.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsSliding(false), 500);
  };

  const nextSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === ticketedEvents.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsSliding(false), 500);
  };

  const handleReserveNow = (eventId) => {
    navigate(`/event-ticketed/${eventId}`); // Navigate to the dynamic event page
  };

  return (
    <div className="relative w-full h-[700px] overflow-hidden">
      <div
        className="flex w-full h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {ticketedEvents.map((event, index) => (
          <div
            key={index}
            className="relative w-full flex-shrink-0 h-full bg-cover bg-center"
            style={{ backgroundImage: `url('src/assets/c${index + 1}.jpg')` }} // Static images
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#010100] via-[#633904] to-[#000000] opacity-80"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-10">
              <h2 className="font-Poppins text-[99px] font-extrabold drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                {event.name}
              </h2>
              <p className="font-Poppins text-[26px] font-semibold mt-2 drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)]">
                {event.details}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Reserve Now Button */}
      <button
        className="absolute bottom-10 right-10 font-Poppins bg-[#F09C32] text-black font-bold py-3 px-7 rounded-full uppercase cursor-pointer transition-all transform hover:scale-105 hover:bg-yellow-600 z-10"
        onClick={() => handleReserveNow(ticketedEvents[currentIndex]?.id)} // Navigate to the current event page
      >
        RESERVE NOW
      </button>
      <div className="absolute top-1/2 left-0 right-0 flex justify-between px-5 transform -translate-y-1/2">
        <span
          className="font-Poppins text-4xl text-white cursor-pointer"
          onClick={prevSlide}
        >
          &lt;
        </span>
        <span
          className="font-Poppins text-4xl text-white cursor-pointer"
          onClick={nextSlide}
        >
          &gt;
        </span>
      </div>
      <div className="absolute bottom-5 flex space-x-2 w-full justify-center">
        {ticketedEvents.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
              index === currentIndex ? "bg-white" : "bg-gray-500"
            }`}
            onClick={() => setCurrentIndex(index)}
          ></div>
        ))}
      </div>
    </div>
  );
}

function EventSection({ title, description, events }) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(events.length > 3);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const handleScroll = () => {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      };

      scrollContainer.addEventListener("scroll", handleScroll);
      handleScroll(); // Initialize arrow visibility
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [events]);

  return (
    <section className="p-5 bg-[#222] text-white font-Poppins">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-left text-[28px] font-semibold mt-[30px]">
          {title}
        </h2>
        <h3 className="text-left text-[16px] text-gray-400 font-light">
          {description}
        </h3>

        {events.length === 0 ? (
          <p className="text-center text-gray-400">No events available.</p>
        ) : (
          <div className="relative py-5">
            <div
              ref={scrollContainerRef}
              className={`flex gap-5 overflow-x-auto scrollbar-none py-2 px-10 ${
                events.length <= 2 ? "justify-center" : "justify-start"
              }`}
            >
              {events.map((event, index) => (
                <EventCard
                  key={index}
                  image={event.image}
                  name={event.name}
                  location={event.location}
                  date={event.date}
                  time={event.time}
                  buttonText={event.buttonText}
                  link={event.link} // Pass the link to EventCard
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function LandingPage() {
  // 🔹 State for login popup
  const [loginPopup, setLoginPopup] = useState(false);

  // State for events
  const [ticketedEvents, setTicketedEvents] = useState([]);
  const [freeEvents, setFreeEvents] = useState([]);
  const [comingSoonEvents, setComingSoonEvents] = useState([]);

  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Create a fixed-size wrapper to prevent layout shifts
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "auto";
    document.body.style.height = "100vh";

    // Add a padding-right to body to account for scrollbar width
    // This prevents content from shifting when scrollbar appears/disappears
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      // Cleanup when component unmounts
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  const toggleLoginPopup = () => {
    setLoginPopup((prev) => !prev);
  };

  // 🔹 Check if login popup should be shown on load
  useEffect(() => {
    const shouldShowLogin = localStorage.getItem("showLoginPopup");
    if (shouldShowLogin === "true") {
      setLoginPopup(true);
      localStorage.removeItem("showLoginPopup");
    }
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        const API_BASE_URL = "http://localhost:5002"; // Replace with your backend URL

        // Fetch ticketed events
        const ticketedResponse = await axios.get(
          `${API_BASE_URL}/api/events/ticketed`,
          {
            params: { page: 1, limit: 5, timestamp: new Date().getTime() }, // Add timestamp to prevent caching
          }
        );
        if (ticketedResponse.data.success) {
          setTicketedEvents(ticketedResponse.data.data);
        }

        // Fetch free events
        const freeResponse = await axios.get(
          `${API_BASE_URL}/api/events/free-events`,
          {
            params: { page: 1, limit: 5, timestamp: new Date().getTime() }, // Add timestamp to prevent caching
          }
        );
        if (freeResponse.data.success) {
          setFreeEvents(freeResponse.data.data);
        }

        // Fetch coming soon events
        const comingSoonResponse = await axios.get(
          `${API_BASE_URL}/api/events/coming-soon`,
          {
            params: { page: 1, limit: 5, timestamp: new Date().getTime() }, // Add timestamp to prevent caching
          }
        );
        console.log("Coming Soon Events Response:", comingSoonResponse.data); // Log the response
        if (comingSoonResponse.data.success) {
          setComingSoonEvents(comingSoonResponse.data.data);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  console.log(
    ticketedEvents.map((event) => ({
      link: `/event-ticketed/${event.id}`,
    }))
  );

  return (
    <div className="bg-[#121212] text-white min-h-screen">
      <Header toggleLoginPopup={toggleLoginPopup} />

      {loginPopup && (
        <LoginPopup
          loginPopup={loginPopup}
          toggleLoginPopup={toggleLoginPopup}
        />
      )}

      <Carousel />
      {/* Ticketed Events Section */}
      <EventSection
        title="TICKETED EVENTS"
        description="Events where tickets must be reserved in advance. Ensure your spot by booking a ticket."
        events={ticketedEvents.map((event) => ({
          image: event.image || "TigerTix/src/assets/tigertix_logo.png", // Use default image if none provided
          name: event.name,
          location: event.venue,
          date: event.event_date,
          time: event.event_time,
          buttonText: "Reserve Now",
          link: `/event-ticketed/${event.id}`, // Dynamic link to the event
        }))}
      />

       {/* Coming Soon Events Section */}
       <EventSection
        title="EVENTS COMING SOON"
        description="Upcoming events that will require a reservation. Ticket and reservation details are not yet available."
        events={comingSoonEvents.map((event) => ({
          image: event.image || "src/assets/default-coming-soon.jpg", // Use default image if none provided
          name: event.name,
          location: event.venue,
          date: event.event_date,
          time: event.event_time,
          buttonText: "View Details",
          link: `/event-coming-soon/${event.id}`, // Dynamic link to the event
        }))}
      />

      {/* Free Events Section */}
      <EventSection
        title="FREE EVENTS"
        description="UAAP or other IPEA Events that are open to all without the need for a reservation or ticket. Simply show up!"
        events={freeEvents.map((event) => ({
          image: event.image || "TigerTix/src/assets/tigertix_logo.png", // Use default image if none provided
          name: event.name,
          location: event.venue,
          date: event.event_date,
          time: event.event_time,
          buttonText: "View Details",
          link: `/event-free/${event.id}`
          , // Dynamic link to the event
        }))}

        
      />


     
    </div>
  );
}

export default LandingPage;
