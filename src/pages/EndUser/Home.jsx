import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../../components/EventCard";
import Header from "../../components/Header";
import LoginPopup from "./LoginPopup";
import { IoNotifications } from "react-icons/io5";

const images = [
  { src: "src/assets/c1.jpg", title: "UST VS. ADU", description: "Basketball Tournament Round 2" },
  { src: "src/assets/c2.jpg", title: "UST VS. DLSU", description: "Basketball Tournament Round 3" },
  { src: "src/assets/c3.jpg", title: "UST VS. UP", description: "Basketball Tournament Round 4" },
  { src: "src/assets/c4.jpg", title: "UST VS. NU", description: "Basketball Tournament Round 5" }
];

function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const [isSliding, setIsSliding] = useState(false);

  const prevSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    setTimeout(() => setIsSliding(false), 500);
  };

  const nextSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    setTimeout(() => setIsSliding(false), 500);
  };

  return (
    <div className="relative w-full h-[700px] overflow-hidden">
      <div
        className="flex w-full h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="relative w-full flex-shrink-0 h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${image.src}')` }}>
            <div className="absolute inset-0 bg-gradient-to-b from-[#010100] via-[#FFAB40] to-[#000000] opacity-80"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-10">
              <h2 className="font - Poppins text-[99px] font-extrabold">{image.title}</h2>
              <p className="font - Poppins text-[26px] font-semibold mt-2">{image.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute top-1/2 left-0 right-0 flex justify-between px-5 transform -translate-y-1/2">
        <span className="font-Poppins text-4xl text-white cursor-pointer" onClick={prevSlide}>
          &lt;
        </span>
        <span className="font-Poppins text-4xl text-white cursor-pointer" onClick={nextSlide}>
          &gt;
        </span>
      </div>
      <div className="absolute bottom-[60px] right-[100px]">
        <button
          className="font-Poppins bg-[#F09C32] text-black font-bold py-3 px-7 min-w-[300px] rounded-full uppercase cursor-pointer transition-all transform hover:scale-105 hover:bg-yellow-600"
          onClick={() => navigate("/event-ticketed-enduser")}
        >
          RESERVE NOW
        </button>
      </div>
      <div className="absolute bottom-5 flex space-x-2 w-full justify-center">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${index === currentIndex ? "bg-white" : "bg-gray-500"}`}
            onClick={() => setCurrentIndex(index)}
          ></div>
        ))}
      </div>
    </div>
  );
}



function EventSection({ title, description, events }) {
  const [notification, setNotification] = useState(true);

  return (
    <section className="p-5 bg-[#222] text-white font-Poppins text-lg font-semibold">
      <h2 className="text-left pl-[400px] text-[28px]">{title}</h2>
      <h3 className="text-left pl-[420px] text-[16px] text-gray-400 font-light">{description}</h3>

      <div className="relative flex gap-5 overflow-x-auto scrollbar-none py-5 justify-center items-center">
        <div className="text-2xl cursor-pointer font-Poppins text-[32px] font-semibold absolute top-1/2 left-[300px] transform -translate-y-1/2 z-10">
          &lt;
        </div>

        {events.map((event, index) => (
          <div key={index} className="relative">
          <EventCard
            key={index}
            image={event.image}
            name={event.name}
            location={event.location}
            date={event.date}
            time={event.time}
            buttonText={event.buttonText}
            link={event.link} // Now passing just the string
          />
          {/* Notification Button */}
          {notification && (
            <div className="absolute bottom-9 right-7 flex">
              <button 
                className="bg-white p-1 rounded-full transition-transform duration-200 hover:bg-gray-200 hover:scale-105"
                onClick={() => setNotification(false)} // Example toggle
              >
                <IoNotifications className="text-xl text-[#F09C32]" />
              </button>
            </div>
          )}
          </div>
        ))}

        <div className="text-2xl cursor-pointer font-Poppins text-[32px] font-semibold absolute top-1/2 right-[300px] transform -translate-y-1/2 z-10">
          &gt;
        </div>
      </div>
    </section>
  );
}


function Home() {
  const [loginPopup, setLoginPopup] = useState(false);
  const toggleLoginPopup = () => {
    setLoginPopup((prev) => !prev);
  };

  return (
    <div className="bg-[#121212] text-white">
      <Header toggleLoginPopup={toggleLoginPopup} />
      {loginPopup && <LoginPopup loginPopup={loginPopup} toggleLoginPopup={toggleLoginPopup} />}
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
            link: "/event-ticketed-enduser"
          },
          {
            image: "src/assets/event2.jpg",
            name: "UAAP Season 87 Women's Basketball",
            location: "Araneta Coliseum",
            date: "September 15, 2024",
            time: "11:30 AM",
            buttonText: "Reserve Now",
            link: "/event-ticketed-enduser"
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
            link: "/event-free"
          },
        ]}
      />
      <EventSection
        title="EVENTS COMING SOON"
        description="Upcoming events that will require a reservation. Ticket and reservation details are not yet available."
        events={[
          {
            image: "path/to/image1.jpg",
            name: "UAAP Season 87 Men's Basketball",
            location: "SM Mall of Asia Arena",
            date: "September 4, 2024",
            time: "2:00 PM",
            buttonText: "View Details",
            link: "/event-coming-soon"
          },
          {
            image: "path/to/image2.jpg",
            name: "UAAP Season 87 Women's Basketball",
            location: "Araneta Coliseum",
            date: "September 15, 2024",
            time: "11:30 AM",
            buttonText: "View Details",
            link: "/event-coming-soon"
          },
        ]}
      />
    </div>
  );
}

export default Home;