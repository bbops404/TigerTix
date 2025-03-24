import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header_User from "../../components/Header_User";
import { IoNotifications } from "react-icons/io5";
import EventCard from "../../components/EventCardEndUser";

const images = [
  {
    src: "src/assets/c1.jpg",
    title: "UST VS. ADU",
    description: "Basketball Tournament Round 2",
  },
  {
    src: "src/assets/c2.jpg",
    title: "UST VS. DLSU",
    description: "Basketball Tournament Round 3",
  },
  {
    src: "src/assets/c3.jpg",
    title: "UST VS. UP",
    description: "Basketball Tournament Round 4",
  },
  {
    src: "src/assets/c4.jpg",
    title: "UST VS. NU",
    description: "Basketball Tournament Round 5",
  },
];

function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const [isSliding, setIsSliding] = useState(false);

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

  // Prevent default behavior for navigation to avoid page shifts
  const handleReserveNow = (e) => {
    e.preventDefault();
    // Optional: smooth transition before navigation
    setTimeout(() => {
      navigate("/event-ticketed-enduser");
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
              <p className="font-Poppins text-[26px] font-semibold mt-2 drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)]">
                {image.description}
              </p>
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

  // Custom navigation function to prevent scrollbar jumps
  const handleNavigation = (path, e) => {
    if (e) e.preventDefault();

    // Use a slight delay to ensure smooth transition
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  // Scroll handlers for the navigation buttons
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

  // Monitor scroll position to show/hide navigation arrows
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
      // Initialize arrow visibility
      handleScroll();
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [events]);

  // Determine if content needs to be centered (1-2 events)
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
          {/* Left navigation button - only show when not at the beginning and when there are more than 2 events */}
          {!centerContent && showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-[32px] font-semibold cursor-pointer z-10 bg-[#222] bg-opacity-70 px-2 rounded-l transition-opacity duration-300"
              aria-label="Previous events"
            >
              &lt;
            </button>
          )}

          {/* Event cards container with proper overflow and centering when needed */}
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
                onClick={(e) => handleNavigation(event.link, e)}
              />
            ))}
          </div>

          {/* Right navigation button - only show when not at the end and when there are more than 2 events */}
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

function Home() {
  return (
    <div className="bg-[#121212] text-white">
      <Header_User />
      <Carousel />
      <EventSection
        title="TICKETED EVENTS"
        description="Events where tickets must be reserved in advance. Ensure your spot by booking a ticket."
        events={[
          {
            image: "src/assets/event1.jpg",
            name: "UAAP Season 87 Men's Basketball",
            location: "SM Mall of Asia Arena",
            date: "September 4, 2024",
            time: "2:00 PM",
            buttonText: "Reserve Now",
            link: "/event-ticketed-enduser",
          },
          {
            image: "src/assets/event2.jpg",
            name: "UAAP Season 87 Women's Basketball",
            location: "Araneta Coliseum",
            date: "September 15, 2024",
            time: "11:30 AM",
            buttonText: "Reserve Now",
            link: "/event-ticketed-enduser",
          },
        ]}
      />
      <EventSection
        title="FREE EVENTS"
        description="UAAP or other IPEA Events that are open to all without the need for a reservation or ticket. Simply show up!"
        events={[
          {
            image: "src/assets/event3.jpg",
            name: "UAAP Season 87 Men's Basketball",
            location: "SM Mall of Asia Arena",
            date: "September 4, 2024",
            time: "2:00 PM",
            buttonText: "View Details",
            link: "/event-free",
          },
        ]}
      />
      <EventSection
        title="EVENTS COMING SOON"
        description="Upcoming events that will require a reservation. Ticket and reservation details are not yet available."
        events={[
          {
            image: "src/assets/event4.jpg",
            name: "UAAP Season 87 Men's Basketball",
            location: "SM Mall of Asia Arena",
            date: "September 4, 2024",
            time: "2:00 PM",
            buttonText: "View Details",
            link: "/event-coming-soon",
          },
          {
            image: "src/assets/event5.jpg",
            name: "UAAP Season 87 Women's Basketball",
            location: "Araneta Coliseum",
            date: "September 15, 2024",
            time: "11:30 AM",
            buttonText: "View Details",
            link: "/event-coming-soon",
          },
        ]}
      />
    </div>
  );
}

export default Home;
