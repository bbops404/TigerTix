import React, { useState } from "react";
import {
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Header_Admin from "../../components/Admin/Header_Admin";
import Sidebar_Admin from "../../components/Admin/SideBar_Admin";
import eventPlaceholder from "../../assets/event_placeholder.jpg";
import Admin_EventReportGenerateReport from "./Admin_EventReportGenerateReport";
import Admin_EventReportsFilter from "./Admin_EventReportsFilter";
import Admin_EventReportGenerateSummary from "./Admin_EventReportGenerateSummaryPopUp";

const eventData = [
  { id: 1, image: eventPlaceholder, name: "UAAP CDC" },
  { id: 2, image: eventPlaceholder, name: "UST Homecoming" },
  { id: 3, image: eventPlaceholder, name: "Tigers Championship" },
  { id: 4, image: eventPlaceholder, name: "UST Men's Volleyball" },
  { id: 5, image: eventPlaceholder, name: "Paskuhan 2024" },
  { id: 6, image: eventPlaceholder, name: "Freshmen Welcome Walk" },
  { id: 7, image: eventPlaceholder, name: "Thomasian Gala Night" },
  { id: 8, image: eventPlaceholder, name: "Intramurals 2024" },
];

const Admin_EventReports = () => {
  const [showGenerateSummaryPopup, setShowGenerateSummaryPopup] = useState(false);
  const openGenerateSummaryPopup = () => setShowGenerateSummaryPopup(true);
  const closeGenerateSummaryPopup = () => setShowGenerateSummaryPopup(false);

  const [showGenerateReport, setShowGenerateReport] = useState(false);
  const openGenerateReport = () => setShowGenerateReport(true);
  const closeGenerateReport = () => setShowGenerateReport(false);

  const [showFilter, setShowFilter] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleEvents = 5;

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const nextSlide = () => {
    if (currentIndex + visibleEvents < eventData.length) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white">
      <Header_Admin />

      <div className="flex">
        <Sidebar_Admin />

        <div className="flex-1 px-10 py-10">
          {/* Events List */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Events List</h2>
            <div className="flex gap-2">
              <div className="relative flex-grow mr-4">
                <FaSearch className="absolute left-4 top-3 text-white" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-full pl-12 pr-4 py-2 rounded-full bg-gray-500 text-white outline-none"
                />
              </div>

              <button className="px-4 py-2 bg-white text-black rounded-md hover:bg-[#FFAB40] hover:text-black transition duration-300">Reset</button>
              <button className="px-4 py-2 bg-white text-black rounded-md flex items-center gap-2 hover:bg-[#FFAB40] hover:text-black transition duration-300"
              onClick={() => setShowFilter(!showFilter)}>

                <FaFilter /> Sort/Filter by
              </button>
            </div>
          </div>

          {/* Filter Component */}
          {showFilter && <Admin_EventReportsFilter showFilter={showFilter} setShowFilter={setShowFilter} />}

          {/* Events */}
          <div className="relative flex items-center justify-center mb-10">
            <button
              onClick={prevSlide}
              className="absolute left-0 bg-black/50 p-2 rounded-full"
              disabled={currentIndex === 0}
            >
              <FaChevronLeft size={20} />
            </button>

            <div className="w-full flex justify-center overflow-hidden space-x-2">

              {eventData.slice(currentIndex, currentIndex + visibleEvents).map((event) => (
                <div
                  key={event.id}
                  className="transition-opacity duration-1000 opacity-100 transform hover:scale-105"
                >
                  <div className="p-2 rounded-lg">
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-[200px] h-[250px] object-cover rounded-lg mx-auto"
                    />
                    <p className="text-center mt-2 font-semibold">{event.name}</p>
                    <button className="mt-2 w-full px-4 py-2 text-white font-bold rounded-full bg-gradient-to-r from-[#FFAB40] to-[#CD6905] transition-transform transform hover:scale-105"
                    onClick={openGenerateReport}>
                      Generate Report
                    </button>

                  </div>
                ))}
            </div>

            <button
              onClick={nextSlide}
              className="absolute right-0 bg-black/50 p-2 rounded-full"
              disabled={currentIndex + visibleEvents >= eventData.length}
            >
              <FaChevronRight size={20} />
            </button>
          </div>

          {/* Event Summary */}
          <div className="mt-10 bg-[#333333] p-6 rounded-md">
            <div className="flex justify-between items-center mb-4 top-0 bg-[#333333] z-10">
              <h2 className="text-lg font-bold">Event Summary</h2>
              <div className="flex gap-2">

                <button className="px-4 py-2 bg-white text-black rounded-md hover:bg-[#FFAB40] hover:text-black transition duration-300">Reset</button>
                <button className="px-4 py-2 bg-white text-black rounded-md flex items-center gap-2 hover:bg-[#FFAB40] hover:text-black transition duration-300"
                onClick={() => setShowFilter(!showFilter)}>

                  <FaFilter /> Sort/Filter by
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto scrollbar-hide">
              <table className="w-full text-black bg-white rounded-md">
                <thead className="sticky text-[14px] top-0 bg-[#F09C32] text-[#333333] text-center">
                  <tr>

                    {["Event Name", "Date", "Venue", "Event Category", "Type", "Availability", "Reservation Count", "Revenue", "Remaining Tickets"].map((header, index) => (
                      <th key={index} className="px-4 py-2 border border-gray-300">

                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="scrollbar-hide">

                  {[
                    {
                      name: "UAAP CDC",
                      date: "Oct 15, 2024",
                      venue: "MOA Arena",
                      category: "Cheerdance",
                      type: "Competition",
                      availability: "Available",
                      count: 250,
                      revenue: 500000,
                      remaining: 50,
                    },
                    {
                      name: "UST Homecoming",
                      date: "Nov 10, 2024",
                      venue: "UST Quadricentennial Pavilion",
                      category: "Reunion",
                      type: "Social Event",
                      availability: "Limited",
                      count: 150,
                      revenue: 300000,
                      remaining: 20,
                    },
                    {
                      name: "Tigers Championship",
                      date: "Dec 05, 2024",
                      venue: "Smart Araneta Coliseum",
                      category: "Sports",
                      type: "Game",
                      availability: "Sold Out",
                      count: 500,
                      revenue: 1000000,
                      remaining: 0,
                    },
                    {
                      name: "UST Men's Volleyball",
                      date: "Jan 20, 2025",
                      venue: "UST Gym",
                      category: "Sports",
                      type: "Game",
                      availability: "Available",
                      count: 200,
                      revenue: 400000,
                      remaining: 75,
                    },
                    {
                      name: "Tigers Championship",
                      date: "Dec 05, 2024",
                      venue: "Smart Araneta Coliseum",
                      category: "Sports",
                      type: "Game",
                      availability: "Sold Out",
                      count: 500,
                      revenue: 1000000,
                      remaining: 0,
                    },
                    {
                      name: "UST Women's Volleyball",
                      date: "Jan 20, 2025",
                      venue: "UST Gym",
                      category: "Sports",
                      type: "Game",
                      availability: "Available",
                      count: 200,
                      revenue: 400000,
                      remaining: 75,
                    },
                  ].map((event, index) => (
                    <tr key={index} className="border border-gray-300 text-center">

                      {Object.values(event).map((value, i) => (
                        <td
                          key={i}
                          className="px-4 py-2 border border-gray-300"
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <button className="w-[220px] h-[40px] mt-4 font-bold rounded-full bg-gradient-to-r from-[#FFAB40] to-[#CD6905] transition-transform transform hover:scale-105" onClick={openGenerateSummaryPopup}>
                Generate Event Summary
              </button>
            </div>
          </div>
          {showGenerateReport && <Admin_EventReportGenerateReport isOpen={showGenerateReport} onClose={closeGenerateReport} />}
          {showGenerateSummaryPopup && <Admin_EventReportGenerateSummary isOpen={showGenerateSummaryPopup} onClose={closeGenerateSummaryPopup} />}
        </div>
      </div>
    </div>
  );
};

export default Admin_EventReports;
