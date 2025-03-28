import React, { useState } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import Header from "../../components/Header";
import Sidebar_Admin from "../../components/SideBar_Admin";
import Admin_AuditTrailsFilter from "./Admin_AuditTrailsFilter";

const AuditTrails = () => {
  const [showFilter, setShowFilter] = useState(false); // Correct state declaration

  const logs = [
    {
      id: 10,
      timestamp: "2024-12-14 14:25:10",
      userId: "05",
      username: "Mark Reyes",
      role: "Admin",
      action: "Delete Event",
      message: "Deleted event 'Christmas Party'",
      status: "Successful",
    },
    {
      id: 9,
      timestamp: "2024-12-14 13:10:45",
      userId: "06",
      username: "Mia",
      role: "Support Staff",
      action: "Update User",
      message: "Updated user permissions",
      status: "Successful",
    },
    {
      id: 8,
      timestamp: "2024-12-13 16:45:30",
      userId: "07",
      username: "Daniel Cruz",
      role: "Support Staff",
      action: "Add User",
      message: "Added a user 'user567'",
      status: "Successful",
    },
    {
      id: 7,
      timestamp: "2024-12-13 12:30:20",
      userId: "02",
      username: "Hannah",
      role: "Support Staff",
      action: "Scan QR Code",
      message: "Scanned ticket QR for event 'UAAP Finals'",
      status: "Successful",
    },
    {
      id: 6,
      timestamp: "2024-12-12 18:10:05",
      userId: "03",
      username: "Georgina",
      role: "Support Staff",
      action: "Manage User",
      message: "Updated profile details",
      status: "Successful",
    },
    {
      id: 5,
      timestamp: "2024-12-12 11:00:15",
      userId: "01",
      username: "Olivia Dimatulac",
      role: "Admin",
      action: "Add Event",
      message: "Event 'UAAP Quarterfinals' added",
      status: "Successful",
    },
    {
      id: 4,
      timestamp: "2024-12-12 10:30:45",
      userId: "02",
      username: "Hannah",
      role: "Support Staff",
      action: "Scan QR Code",
      message: "Scanned ticket QR for event 'UAAP Semifinals'",
      status: "Failed (Invalid)",
    },
    {
      id: 3,
      timestamp: "2024-12-12 09:15:30",
      userId: "02",
      username: "Hannah",
      role: "Support Staff",
      action: "Manage User",
      message: "Reset password",
      status: "Successful",
    },
    {
      id: 2,
      timestamp: "2024-12-11 09:02:30",
      userId: "03",
      username: "Georgina",
      role: "Support Staff",
      action: "Add User",
      message: "Added a user 'user789'",
      status: "Successful",
    },
    {
      id: 1,
      timestamp: "2024-12-10 08:54:32",
      userId: "04",
      username: "Larry",
      role: "Support Staff",
      action: "Generated a Report",
      message: "Generated a Report about 'Event Summary'",
      status: "Successful",
    },
  ];

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white">
      {/* Header */}
      <Header showSearch={false} showAuthButtons={false} />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar_Admin />

        {/* Content Wrapper */}
        <div className="flex-1 px-10 py-10">
          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-grow mr-4">
              <FaSearch className="absolute left-4 top-3 text-white" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-12 pr-4 py-2 rounded-full bg-gray-500 text-white outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white text-black rounded-md hover:bg-[#FFAB40] hover:text-black transition duration-300">
                Reset
              </button>
              <button
                className="px-4 py-2 bg-white text-black rounded-md flex items-center gap-2 hover:bg-[#FFAB40] hover:text-black transition duration-300"
                onClick={() => setShowFilter(!showFilter)}
              >
                <FaFilter /> Sort/Filter by
              </button>
            </div>
          </div>

          {/* Filter Component */}
          {showFilter && <Admin_AuditTrailsFilter showFilter={showFilter} setShowFilter={setShowFilter} />}

          {/* Audit Trails Table */}
          <div className="overflow-x-auto rounded-md shadow-md">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full border-collapse border border-[#D6D3D3] bg-[#333333] rounded-md overflow-hidden">
                <thead className="sticky top-0 bg-[#F09C32] text-[#333333] text-center">
                  <tr>
                    {["ID", "Timestamp", "User ID", "Username", "User Role", "Action", "Message", "Status"].map((header, index) => (
                      <th key={index} className="px-4 py-2 border border-[#D6D3D3] text-center">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 10).map((log) => (
                    <tr key={log.id} className="border border-[#D6D3D3] text-center text-white">
                      {Object.values(log).map((value, index) => (
                        <td key={index} className="px-4 py-2 border border-[#D6D3D3]">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrails;
