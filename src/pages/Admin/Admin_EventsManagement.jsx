import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { FaSearch, FaArchive } from "react-icons/fa";
import Header from "../../components/Header";
import Sidebar_Admin from "../../components/SideBar_Admin";
import Admin_EventManagementFilter from "./Admin_EventsManagementFilter";

const Admin_EventsManagement = () => {
  const navigate = useNavigate();

  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white">
      {/* Header */}
      <Header showSearch={false} showAuthButtons={false} />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar_Admin />

        {/* Main Content Wrapper */}
        <div className="flex-1 px-10 py-10">
          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-6 gap-4">
            {/* Search Dropdown with Arrow Fix */}
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-3 text-black" />
              <select
                className="pl-10 pr-12 py-2 w-full rounded-full bg-white text-black outline-none cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="black"><path d="M5 7l5 5 5-5H5z"/></svg>')`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                  backgroundSize: "14px",
                }}
              >
                <option value="" disabled selected>
                  Search events
                </option>
                <option value="event1">Event 1</option>
                <option value="event2">Event 2</option>
                <option value="event3">Event 3</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white text-black rounded-md hover:bg-[#FFAB40] hover:text-black transition duration-300">
                Reset
              </button>
              <button className="px-4 py-2 bg-white text-black rounded-md hover:bg-[#FFAB40] hover:text-black transition duration-300"
              onClick={() => setShowFilter(!showFilter)}>
                Sort/Filter by
              </button>
              <button className="px-4 py-2 bg-white text-black rounded-md flex items-center gap-2 hover:bg-[#FFAB40] hover:text-black transition duration-300"
               onClick={() => navigate("/archive")}>
                <FaArchive />
              </button>
            </div>
          </div>

          {/* Filter Component */}
          {showFilter && <Admin_EventManagementFilter showFilter={showFilter} setShowFilter={setShowFilter} />}

          {/* Add Event Section */}
          <div className="mb-10">
            <h3 className="text-lg font-bold mb-4">ADD EVENT</h3>
            <button className="w-[173px] h-[205px] flex flex-col items-center justify-center bg-[#FFA500] text-black rounded-lg shadow-md">
              <span className="text-4xl">+</span>
            </button>
          </div>

          {/* Event Sections */}
          {["PUBLISHED", "SCHEDULED", "FINISHED"].map((category, index) => (
            <div key={index} className="mb-10">
              <h3 className="text-lg font-bold border-b border-gray-600 pb-2 mb-4">
                {category}
              </h3>
              <div className="min-h-[100px] text-gray-400">No events available</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin_EventsManagement;
