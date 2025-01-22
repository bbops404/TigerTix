import React from "react";
import EventCard from "./components/EventCard";
import Header from './components/Header';

function Carousel() {
  return (
    <div className="relative bg-cover bg-center h-[700px] text-white flex items-center justify-center flex-col" style={{ backgroundImage: `url('/path/to/your/image.jpg')` }}>
      <div className="absolute top-1/2 left-0 right-0 flex justify-between px-5 transform -translate-y-1/2">
        <span className="font-Poppins text-4xl text-white cursor-pointer">&lt;</span>
        <span className="font-Poppins text-4xl text-white cursor-pointer">&gt;</span>
      </div>
      <div className="absolute bottom-[60px] right-[100px]">
        <button className="font-Poppins bg-[#F09C32] text-black font-bold py-3 px-7 min-w-[300px] rounded-full uppercase cursor-pointer transition-all transform hover:scale-105 hover:bg-yellow-600">
          RESERVE NOW
        </button>
      </div>
    </div>
  );
}

function EventSection({ title, description, events }) {
  return (
    <section className="p-5 bg-[#222] text-white font-Poppins text-lg font-semibold">
      <h2 className="text-left pl-[200px] text-xl">{title}</h2>
      <h3 className="text-left pl-[220px] text-sm text-gray-400 font-light">
        {description}
      </h3>
      <div className="relative flex gap-2 overflow-x-auto scrollbar-hidden py-5 justify-center items-center">
        {/* Left arrow */}
        <div className="text-2xl cursor-pointer font-Poppins font-semibold absolute top-1/2 left-5 transform -translate-y-1/2 z-10">
          &lt;
        </div>

        {/* Event cards */}
        {events.map((event, index) => (
          <EventCard
            key={index}
            image={event.image}
            name={event.name}
            location={event.location}
            date={event.date}
            time={event.time}
            buttonText={event.buttonText}
          />
        ))}

        {/* Right arrow */}
        <div className="text-2xl cursor-pointer font-Poppins font-semibold absolute top-1/2 right-5 transform -translate-y-1/2 z-10">
          &gt;
        </div>
      </div>
    </section>
  );
}

function App() {
  return (
    <div className="App bg-[#121212] text-white">
      <Header />
      <Carousel />

      {/* TICKETED EVENTS Section */}
      <EventSection
        title="TICKETED EVENTS"
        description="Events where tickets must be reserved in advance. Ensure your spot by booking a ticket."
        events={[
          {
            image: "path/to/image1.jpg",
            name: "UAAP Season 87 Men's Basketball",
            location: "SM Mall of Asia Arena",
            date: "September 4, 2024",
            time: "2:00 PM",
            buttonText: "Reserve Now",
          },
          {
            image: "path/to/image2.jpg",
            name: "UAAP Season 87 Women's Basketball",
            location: "Araneta Coliseum",
            date: "September 15, 2024",
            time: "11:30 AM",
            buttonText: "Reserve Now",
          },
          // Add more events here...
        ]}
      />

      {/* FREE EVENTS Section */}
      <EventSection
        title="FREE EVENTS"
        description="UAAP or other IPEA Events that are open to all without the need for a reservation or ticket. Simply show up!"
        events={[
          {
            image: "path/to/image1.jpg",
            name: "UAAP Season 87 Men's Basketball",
            location: "SM Mall of Asia Arena",
            date: "September 4, 2024",
            time: "2:00 PM",
            buttonText: "View Details",
          },
        ]}
      />

      {/* EVENTS COMING SOON Section */}
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
          },
          {
            image: "path/to/image2.jpg",
            name: "UAAP Season 87 Women's Basketball",
            location: "Araneta Coliseum",
            date: "September 15, 2024",
            time: "11:30 AM",
            buttonText: "View Details",
          },
          // Add more events here...
        ]}
      />
    </div>
  );
}

export default App;
