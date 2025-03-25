import React, { useState, useEffect } from "react";
import { FaSearch, FaArchive, FaPlus } from "react-icons/fa";
import Sidebar_Admin from "../../components/SideBar_Admin";
import Header_Admin from "../../components/Header_Admin";

const AddEventButton = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  useEffect(() => {
    if (isOverlayVisible) {
      // Prevent scrolling when overlay is active
      document.body.style.overflow = "hidden";
    } else {
      // Restore scrolling when overlay is closed
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scrolling if component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOverlayVisible]);

  const handleMainButtonClick = () => {
    setShowOptions(!showOptions);
    setIsOverlayVisible(!isOverlayVisible);
  };

  const handleCloseOverlay = () => {
    setShowOptions(false);
    setIsOverlayVisible(false);
  };

  return (
    <div className="relative">
      {/* Black Overlay */}
      {isOverlayVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleCloseOverlay}
        />
      )}

      <div className="mb-10">
        <h3 className="text-lg font-bold mb-4">ADD EVENT</h3>
        <div className="relative inline-block">
          <button
            onClick={handleMainButtonClick}
            className="w-[173px] h-[205px] flex flex-col items-center justify-center bg-[#FFA500] text-black rounded-lg shadow-md z-10 relative"
          >
            <span className="text-4xl text-white">+</span>
          </button>

          {showOptions && (
            <div
              className="absolute top-1/2 -translate-y-1/2 left-full ml-1 w-[173px] bg-[#444141] rounded-lg shadow-lg overflow-hidden z-50 font-Poppins text-sm text-custom_yellow"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                //onClick={() => handleOptionClick("add")}
                className="w-full px-4 py-3 text-left hover:bg-[#5A5A5A] transition duration-200 border-b border-custom_yellow"
              >
                Add Event
              </button>
              <button
                //onClick={() => handleOptionClick("schedule")}
                className="w-full px-4 py-3 text-left hover:bg-[#5A5A5A] transition duration-200"
              >
                Schedule Event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Admin_EventsManagement = () => {
  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white font-Poppins">
      {/* Header */}
      <Header_Admin />

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
              <button className="px-4 py-2 bg-white text-black rounded-md">
                Reset
              </button>
              <button className="px-4 py-2 bg-white text-black rounded-md">
                Sort/Filter by
              </button>
              <button className="px-4 py-2 bg-white text-black rounded-md flex items-center gap-2">
                <FaArchive />
              </button>
            </div>
          </div>

          {/* Add Event Section */}
          <AddEventButton />

          {/* Event Sections */}
          {["PUBLISHED", "SCHEDULED", "FINISHED"].map((category, index) => (
            <div key={index} className="mb-10">
              <h3 className="text-lg font-bold border-b border-gray-600 pb-2 mb-4">
                {category}
              </h3>
              <div className="min-h-[100px] text-gray-400">
                No events available
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin_EventsManagement;
