import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import EventCard from "../../components/EventCard";
import LoginPopup from "./LoginPopup";
import axios from "axios";

//connect to Mock Database
const images = [
  {
    src: "src/assets/c1.jpg",
    title: "UST VS. ADU",
  },
  {
    src: "src/assets/c2.jpg",
    title: "UST VS. DLSU",
  },
  {
    src: "src/assets/c3.jpg",
    title: "UST VS. UP",
  },
  {
    src: "src/assets/c4.jpg",
    title: "UST VS. NU",
  },
];

function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const navigate = useNavigate();

  const prevSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsSliding(false), 500);
  };

  const nextSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsSliding(false), 500);
  };

  const handleReserveNow = (e) => {
    e.preventDefault();
    setTimeout(() => {
      navigate("/event-ticketed");
    }, 100);
  };

  return (
    <div className="relative w-full h-[700px] overflow-hidden">
      <div
        className="flex w-full h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="relative w-full flex-shrink-0 h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${image.src}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#010100] via-[#633904] to-[#000000] opacity-80"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-10">
              <h2 className="font-Poppins text-[99px] font-extrabold drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                {image.title}
              </h2>
            </div>
          </div>
        ))}
      </div>
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
      <div className="absolute bottom-[60px] right-[100px]">
        <button
          className="font-Poppins bg-[#F09C32] text-black font-bold py-3 px-7 min-w-[300px] rounded-full uppercase cursor-pointer transition-all transform hover:scale-105 hover:bg-yellow-600"
          onClick={handleReserveNow}
        >
          RESERVE NOW
        </button>
      </div>
      <div className="absolute bottom-5 flex space-x-2 w-full justify-center">
        {images.map((_, index) => (
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

  const handleNavigation = (path, eventData, e) => {
    if (e) e.preventDefault();
    navigate(path, { state: { event: eventData } });
  };

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

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [events]);

  const centerContent = events.length <= 2;

  return (
    <section className="p-5 bg-[#222] text-white font-Poppins">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-left text-[28px] font-semibold mt-[30px]">
          {title}
        </h2>
        <h3 className="text-left text-[16px] text-gray-400 font-light">
          {description}
        </h3>

        <div className="relative py-5">
          {!centerContent && showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-[32px] font-semibold cursor-pointer z-10 bg-[#222] bg-opacity-70 px-2 rounded-l transition-opacity duration-300"
              aria-label="Previous events"
            >
              &lt;
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className={`flex gap-5 overflow-x-auto scrollbar-none py-2 px-10 ${
              centerContent ? "justify-center" : "justify-start"
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
              onClick={(e) => handleNavigation(event.link, event, e)} // Use event.link for navigation
            />
            ))}
          </div>

          {!centerContent && showRightArrow && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[32px] font-semibold cursor-pointer z-10 bg-[#222] bg-opacity-70 px-2 rounded-r transition-opacity duration-300"
              aria-label="Next events"
            >
              &gt;
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function LandingPage() {
  const [ticketedEvents, setTicketedEvents] = useState([]);
  const [freeEvents, setFreeEvents] = useState([]);
  const [comingSoonEvents, setComingSoonEvents] = useState([]);
  const [loginPopup, setLoginPopup] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5003/events"); // Use Axios to fetch data
        const data = response.data;

        setTicketedEvents(
          data.filter((event) => event.event_type === "Ticketed")
        );
        setFreeEvents(data.filter((event) => event.event_type === "Free"));
        setComingSoonEvents(
          data.filter((event) => event.event_type === "Coming Soon")
        );
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const toggleLoginPopup = () => {
    setLoginPopup((prev) => !prev);
  };

  useEffect(() => {
    const shouldShowLogin = localStorage.getItem("showLoginPopup");
    if (shouldShowLogin === "true") {
      setLoginPopup(true);
      localStorage.removeItem("showLoginPopup");
    }
  }, []);

  return (
    <div className="bg-[#121212] text-white">
      <Header toggleLoginPopup={toggleLoginPopup} />
      {loginPopup && (
        <LoginPopup
          loginPopup={loginPopup}
          toggleLoginPopup={toggleLoginPopup}
        />
      )}
      <Carousel />
      <EventSection
        title="TICKETED EVENTS"
        description="Events where tickets must be reserved in advance. Ensure your spot by booking a ticket."
        events={ticketedEvents.map((event) => ({
          image: event.image,
          name: event.name,
          details: event.details,
          location: event.venue,
          date: event.event_date,
          time: event.event_time,
          buttonText: "Reserve Now",
          link: "/event-ticketed", // Navigate to Event_Ticketed.jsx
        }))}
      />

      <EventSection
        title="FREE EVENTS"
        description="UAAP or other IPEA Events that are open to all without the need for a reservation or ticket. Simply show up!"
        events={freeEvents.map((event) => ({
          image: event.image,
          name: event.name,
          details: event.details,
          location: event.venue,
          date: event.event_date,
          time: event.event_time,
          buttonText: "View Details",
          link: "/event-free-landing", // Navigate to Event_Free.jsx
        }))}
      />

      <EventSection
        title="EVENTS COMING SOON"
        description="Upcoming events that will require a reservation. Ticket and reservation details are not yet available."
        events={comingSoonEvents.map((event) => ({
          image: event.image,
          name: event.name,
          details: event.details,
          location: event.venue,
          date: event.event_date,
          time: event.event_time,
          buttonText: "View Details",
          link: "/event-coming-soon", // Navigate to Event_ComingSoon.jsx
        }))}
      />
    </div>
  );
}

export default LandingPage;
