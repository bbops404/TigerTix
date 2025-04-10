import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const SupportStaff_ReservationsFilter = ({ showFilter, setShowFilter }) => {
  const [filters, setFilters] = useState({
    eventName: "",
    role: "",
    date: "",
    claimingTime: "",
    ticketTier: "",
    claimingStatus: "",
    sortOrder: "",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSort = (order) => {
    setFilters({ ...filters, sortOrder: order });
  };

  const handleUpdate = () => {
    console.log("Filters applied:", filters);
  };

  if (!showFilter) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      {/* Clickable overlay to close the filter panel */}
      <div className="flex-1" onClick={() => setShowFilter(false)}></div>

      {/* Filter Panel */}
      <div className="w-80 h-full bg-white shadow-lg transform transition-transform duration-300">
        <div className="p-6 text-black relative">
          {/* Close Button */}
          <button className="absolute top-4 right-4" onClick={() => setShowFilter(false)}>
            <FaTimes size={20} />
          </button>

          <h2 className="text-lg font-semibold mb-4">FILTER BY</h2>
          <div className="space-y-3">
            {["Event Name", "Role", "Date", "Claiming Time", "Ticket Tier", "Claiming Status"].map((field) => (
              <select
                key={field}
                name={field}
                onChange={handleChange}
                className="w-full p-2 border rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">{field.replace(/([A-Z])/g, " $1").trim()}</option>
              </select>
            ))}
          </div>

          <h2 className="text-lg font-semibold mt-4 mb-2">SORT BY</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleSort("ascending")}
              className={`px-4 py-2 rounded-md ${filters.sortOrder === "ascending" ? "bg-black text-white" : "bg-gray-300"}`}
            >
              Ascending
            </button>
            <button
              onClick={() => handleSort("descending")}
              className={`px-4 py-2 rounded-md ${filters.sortOrder === "descending" ? "bg-black text-white" : "bg-gray-300"}`}
            >
              Descending
            </button>
          </div>
          <button
            onClick={handleUpdate}
            className="mt-4 w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportStaff_ReservationsFilter;
