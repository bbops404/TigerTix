import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; // For API calls
import { handleApiError } from "../../utils/apiErrorHandler";
import { useNavigate } from "react-router-dom";
import EventCard from "../../components/EventCard";
import Header from "../../components/Header";
import LoginPopup from "./LoginPopup";
import { IoChevronForward, IoChevronBack } from "react-icons/io5";

// Empty state illustration component for when no events are available
const EmptyStateIllustration = ({ message = "No events available" }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <p className="text-gray-400 text-center text-lg font-medium">{message}</p>
    <p className="text-gray-500 text-center mt-2 max-w-md">
      Check back soon for upcoming events. New events are added regularly.
    </p>
  </div>
);

function Carousel({ scrollToSection, ticketedRef, comingSoonRef, freeEventsRef }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ticketedEvents, setTicketedEvents] = useState([]);
  const navigate = useNavigate();
  const [isSliding, setIsSliding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTicketedEvents = async () => {
      try {
        setIsLoading(true);
        const API_BASE_URL = `${import.meta.env.VITE_API_URL}`; // Updated to use environment variable
        const response = await axios.get(
          `${API_BASE_URL}/api/events/published-ticketed`,
          {
            params: { limit: 4 }, // Fetch up to 4 events
          }
        );

        if (response.data.success) {
          setTicketedEvents(response.data.data);
        } else {
          console.error("Failed to fetch ticketed events.");
        }
      } catch (error) {
        if (!handleApiError(error, navigate)) {
          console.error("Error fetching ticketed events:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketedEvents();
  }, [navigate]);

  const prevSlide = () => {
    if (isSliding || ticketedEvents.length <= 1) return;
    setIsSliding(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? ticketedEvents.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsSliding(false), 500);
  };

  const nextSlide = () => {
    if (isSliding || ticketedEvents.length <= 1) return;
    setIsSliding(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === ticketedEvents.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsSliding(false), 500);
  };

  const handleReserveNow = (eventId) => {
    navigate(`/event-ticketed/${eventId}`); // Navigate to the dynamic event page
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative w-full h-[700px] flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading featured events...</div>
      </div>
    );
  }

  // If no ticketed events, show a placeholder carousel slide
  if (ticketedEvents.length === 0) {
    return (
      <div className="relative w-full h-[700px] overflow-hidden">
        <div className="flex w-full h-full">
          <div
            className="relative w-full flex-shrink-0 h-full bg-cover bg-center"
            style={{ backgroundImage: 'url("src/assets/c1.jpg")' }} // Use a default background
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#010100] via-[#633904] to-[#000000] opacity-80"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-10">
              <h2 className="font-Poppins text-6xl md:text-7xl lg:text-[80px] font-extrabold drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                Welcome to TigerTix
              </h2>
              <p className="font-Poppins text-xl md:text-2xl font-semibold mt-4 max-w-3xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)]">
                Your gateway to exclusive events at UST. Check back soon for
                upcoming featured events.
              </p>
            </div>
          </div>
        </div>
        <button className="absolute bottom-10 right-10 font-Poppins bg-gray-700 text-gray-300 font-bold py-3 px-7 rounded-full uppercase cursor-not-allowed opacity-70 z-10">
          NO EVENTS AVAILABLE
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[700px] overflow-hidden">
      {/* Event Links */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-10 flex flex-wrap gap-6 md:gap-10 items-center justify-center w-[95vw] max-w-3xl px-2">
        <span
          className="text-base md:text-lg font-semibold text-[#F09C32] hover:text-white transition-colors duration-200 cursor-pointer underline-offset-4 hover:underline whitespace-nowrap"
          onClick={() => scrollToSection(ticketedRef)}
          tabIndex={0}
          role="link"
        >
          Ticketed Events
        </span>
        <span
          className="text-base md:text-lg font-semibold text-[#F09C32] hover:text-white transition-colors duration-200 cursor-pointer underline-offset-4 hover:underline whitespace-nowrap"
          onClick={() => scrollToSection(comingSoonRef)}
          tabIndex={0}
          role="link"
        >
          Coming Soon Events
        </span>
        <span
          className="text-base md:text-lg font-semibold text-[#F09C32] hover:text-white transition-colors duration-200 cursor-pointer underline-offset-4 hover:underline whitespace-nowrap"
          onClick={() => scrollToSection(freeEventsRef)}
          tabIndex={0}
          role="link"
        >
          Free Events
        </span>
      </div>

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
              <h2 className="font-Poppins text-6xl md:text-7xl lg:text-[80px] font-extrabold drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                {event.name}
              </h2>
              <p className="font-Poppins text-xl md:text-2xl font-semibold mt-4 max-w-3xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)]">
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

      {/* Navigation arrows - only show if more than one event */}
      {ticketedEvents.length > 1 && (
        <div className="absolute top-1/2 left-0 right-0 flex justify-between px-5 transform -translate-y-1/2">
          <button
            className="w-12 h-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 flex items-center justify-center text-white cursor-pointer transition-all"
            onClick={prevSlide}
          >
            <IoChevronBack className="text-2xl" />
          </button>
          <button
            className="w-12 h-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 flex items-center justify-center text-white cursor-pointer transition-all"
            onClick={nextSlide}
          >
            <IoChevronForward className="text-2xl" />
          </button>
        </div>
      )}

      {/* Carousel indicators */}
      {ticketedEvents.length > 1 && (
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
      )}
    </div>
  );
}

const EventSection = React.forwardRef(
  ({ title, description, events, loading = false }, ref ) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    // Set right arrow visibility based on event count
    setShowRightArrow(events.length > 3);

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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Determine if we should center the events (when there are few)
  const shouldCenterEvents = events.length <= 3;

  return (
    <section className="py-12 bg-[#222] text-white font-Poppins">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-6">
          <h2 className="text-[28px] font-semibold">{title}</h2>
          <h3 className="text-[16px] text-gray-400 font-light mt-1">
            {description}
          </h3>
        </div>

        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="text-gray-400">Loading events...</div>
          </div>
        ) : events.length === 0 ? (
          <EmptyStateIllustration
            message={`No ${title.toLowerCase()} available at this time`}
          />
        ) : (
          <div className="relative min-h-[300px]">
            {/* Left scroll button - only show if not centered */}
            {!shouldCenterEvents && showLeftArrow && (
              <button
                onClick={scrollLeft}
                className="absolute -left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-70 rounded-full p-2"
              >
                <IoChevronBack className="text-white text-2xl" />
              </button>
            )}

            {/* Right scroll button - only show if not centered */}
            {!shouldCenterEvents && showRightArrow && (
              <button
                onClick={scrollRight}
                className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-70 rounded-full p-2"
              >
                <IoChevronForward className="text-white text-2xl" />
              </button>
            )}

            <div
              ref={scrollContainerRef}
              className={`flex gap-6 overflow-x-auto py-4 px-2 scrollbar-hide min-h-[300px] ${
                shouldCenterEvents
                  ? "justify-center" // Center content when there are few events
                  : "justify-start" // Left-align when there are many events
              }`}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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
);

function LandingPage() {

  // 🔹 State for login popup
  const [loginPopup, setLoginPopup] = useState(false);

  // State for events
  const [ticketedEvents, setTicketedEvents] = useState([]);
  const [freeEvents, setFreeEvents] = useState([]);
  const [comingSoonEvents, setComingSoonEvents] = useState([]);

  // State for loading and error handling
  const [loading, setLoading] = useState({
    ticketed: true,
    free: true,
    comingSoon: true,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // For auto scrolling the event section
  const ticketedRef = useRef(null);
  const comingSoonRef = useRef(null);
  const freeEventsRef = useRef(null);

  const scrollToSection = (ref) => {
    console.log("Scrolling to section:", ref); // Debugging log
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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

  // Check if login popup should be shown on load
  useEffect(() => {
    const shouldShowLogin = localStorage.getItem("showLoginPopup");
    if (shouldShowLogin === "true") {
      setLoginPopup(true);
      localStorage.removeItem("showLoginPopup");
    }
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const API_BASE_URL = `${import.meta.env.VITE_API_URL}`; // Updated to use environment variable
      const timestamp = new Date().getTime(); // Prevent caching

      // Helper function to fetch events with loading state management
      const fetchEventCategory = async (category, setter, loadingKey) => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/events/${category}`,
            { params: { page: 1, limit: 5, timestamp } }
          );

          if (response.data.success) {
            setter(response.data.data);
          }
        } catch (err) {
          if (!handleApiError(err, navigate)) {
            console.error(`Error fetching ${category} events:`, err);
            setError(
              (prev) =>
                prev || "Failed to load some events. Please try again later."
            );
          }
        } finally {
          setLoading((prev) => ({ ...prev, [loadingKey]: false }));
        }
      };

      // Fetch all event types concurrently
      await Promise.all([
        fetchEventCategory("ticketed", setTicketedEvents, "ticketed"),
        fetchEventCategory("free-events", setFreeEvents, "free"),
        fetchEventCategory("coming-soon", setComingSoonEvents, "comingSoon"),
      ]);
    };

    fetchEvents();
  }, [navigate]);

  // Map event data for event sections
  const mapEventData = (events, buttonText, linkPrefix) => {
    return events.map((event) => ({
      image: event.image || "src/assets/tigertix_logo.png", // Use default image if none provided
      name: event.name || "Event Name",
      location: event.venue || "TBA",
      date: event.event_date || "TBA",
      time: event.event_time || "TBA",
      buttonText,
      link: `${linkPrefix}/${event.id}`,
    }));
  };

  return (
    <div className="bg-[#121212] text-white min-h-screen">
      <Header toggleLoginPopup={toggleLoginPopup} />

      {loginPopup && (
        <LoginPopup
          loginPopup={loginPopup}
          toggleLoginPopup={toggleLoginPopup}
        />
      )}

      {/* Pass scrollToSection to Carousel */}
      <Carousel 
          scrollToSection={scrollToSection}
          ticketedRef={ticketedRef}
          comingSoonRef={comingSoonRef}
          freeEventsRef={freeEventsRef}
       />

      <div ref={ticketedRef}>
  <EventSection
    title="TICKETED EVENTS"
    description="Events where tickets must be reserved in advance. Ensure your spot by booking a ticket."
    events={mapEventData(ticketedEvents, "Reserve Now", "/event-ticketed")}
    loading={loading.ticketed}
  />
</div>

<div ref={comingSoonRef}>
  <EventSection
    title="COMING SOON EVENTS"
    description="Upcoming events that will require a reservation. Ticket and reservation details are not yet available."
    events={mapEventData(
      comingSoonEvents,
      "View Details",
      "/event-coming-soon"
    )}
    loading={loading.comingSoon}
  />
</div>

<div ref={freeEventsRef}>
  <EventSection
    title="FREE EVENTS"
    description="UAAP or other IPEA Events that are open to all without the need for a reservation or ticket. Simply show up!"
    events={mapEventData(freeEvents, "View Details", "/event-free")}
    loading={loading.free}
  />
</div>

      {/* Error message display if needed */}
      {error && (
        <div className="bg-red-900 bg-opacity-25 text-red-200 p-4 max-w-6xl mx-auto my-4 rounded-lg">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-white underline"
          >
            Refresh page
          </button>
        </div>
      )}
    </div>
  );
}

export default LandingPage;

// Add CSS to hide scrollbars but maintain scroll functionality
const scrollbarStyles = `
  /* Hide scrollbar for Chrome, Safari and Opera */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

// You can add this to your CSS or include it as a style tag in your HTML
// <style>{scrollbarStyles}</style>
