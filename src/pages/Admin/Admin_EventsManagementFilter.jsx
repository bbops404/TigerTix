import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const Admin_EventManagementFilter = ({ showFilter, setShowFilter, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    eventCategory: "",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    console.log("Filters applied:", filters);
    onApplyFilters(filters);
    setShowFilter(false);
  };

  const handleReset = () => {
    const resetFilters = {
      eventCategory: "",
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  // If showFilter is false, return null to hide the component
  if (!showFilter) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      {/* Clickable overlay to close the filter panel */}
      <div className="flex-1" onClick={() => setShowFilter(false)}></div>

      {/* Filter Panel */}
      <div className="w-80 h-full bg-white text-black shadow-lg transform transition-transform duration-300">
        <div className="p-6 relative">
          {/* Close Button */}
          <button className="absolute top-4 right-4" onClick={() => setShowFilter(false)}>
            <FaTimes size={20} />
          </button>

          <h2 className="text-lg font-semibold mb-6">FILTER BY</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm ">Event Category</label>
              <select
                name="eventCategory"
                value={filters.eventCategory}
                onChange={handleChange}
                className="w-full p-2 border border-gray-600 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FFAB40]"
              >
                <option value="">All Categories</option>
                <option value="IPEA Event">IPEA Event</option>
                <option value="UAAP">UAAP</option>
              </select>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleUpdate}
              className="w-full bg-[#FFAB40] text-black py-2 rounded-md hover:bg-[#FF9D20] transition font-medium"
            >
              Apply Filters
            </button>
            
            <button
              onClick={handleReset}
              className="w-full bg-transparent border border-gray-500 text-black py-2 rounded-md hover:bg-gray-700 transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin_EventManagementFilter;