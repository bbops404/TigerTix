import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaFilter } from "react-icons/fa";

import Admin_AuditTrailsFilter from "./Admin_AuditTrailsFilter";

import Header_Admin from "../../components/Admin/Header_Admin";
import Sidebar_Admin from "../../components/Admin/SideBar_Admin";

const AuditTrails = () => {
  const [showFilter, setShowFilter] = useState(false); // State for filter visibility
  const [logs, setLogs] = useState([]); // State for audit trail logs
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling

  // Fetch audit trails from the backend
  useEffect(() => {
    const fetchAuditTrails = async () => {
      try {
        const token = sessionStorage.getItem("authToken"); // Get the token from session storage
        setLoading(true); // Set loading to true before fetching
        const response = await axios.get(
          "http://localhost:5002/api/audit-trails",
          {
            withCredentials: true, // Ensures cookies are sent (if applicable)
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setLogs(response.data.data); // Set logs from the response
        setLoading(false); // Set loading to false after fetching
      } catch (err) {
        console.error("Error fetching audit trails:", err);
        setError("Failed to fetch audit trails. Please try again later.");
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchAuditTrails();
  }, []); // Empty dependency array to fetch data on component mount

  // Function to format the audit ID
  const formatAuditId = (auditId) => {
    return auditId ? auditId.slice(0, 8).toUpperCase() : "N/A"; // Show the first 8 characters in uppercase
  };

  // Function to format the user ID
  const formatUserId = (userId) => {
    return userId ? userId.slice(0, 8).toUpperCase() : "N/A"; // Show the first 8 characters in uppercase
  };

  // Function to format the timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white font-Poppins">
      {/* Header */}
      <Header_Admin />

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
          {showFilter && (
            <Admin_AuditTrailsFilter
              showFilter={showFilter}
              setShowFilter={setShowFilter}
            />
          )}

          {/* Audit Trails Table */}
          <div className="overflow-x-auto rounded-md shadow-md">
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <p className="text-center text-white">Loading...</p>
              ) : error ? (
                <p className="text-center text-red-500">{error}</p>
              ) : logs.length === 0 ? (
                <p className="text-center text-white">No audit trails found.</p>
              ) : (
                <table className="w-full border-collapse border border-[#D6D3D3] bg-[#333333] rounded-md overflow-hidden">
                  <thead className="sticky top-0 bg-[#F09C32] text-[#333333] text-center">
                    <tr>
                      {[
                        "Audit ID",
                        "Timestamp",
                        "User ID",
                        "Username",
                        "User Role",
                        "Action",
                        "Affected Entity",
                        "Message",
                        "Status",
                      ].map((header, index) => (
                        <th
                          key={index}
                          className="px-4 py-2 border border-[#D6D3D3] text-center"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.audit_id}
                        className="border border-[#D6D3D3] text-center text-white"
                      >
                        <td className="px-4 py-2 border border-[#D6D3D3]">
                          {formatAuditId(log.audit_id)}
                        </td>
                        <td className="px-4 py-2 border border-[#D6D3D3]">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-4 py-2 border border-[#D6D3D3]">
                          {formatUserId(log.user_id)}
                        </td>
                        <td className="px-4 py-2 border border-[#D6D3D3]">
                          {log.username}
                        </td>
                        <td className="px-4 py-2 border border-[#D6D3D3]">
                          {log.role}
                        </td>
                        <td className="px-4 py-2 border border-[#D6D3D3]">
                          {log.action}
                        </td>
                        <td className="px-4 py-2 border border-[#D6D3D3]">
                          {log.affectedEntity}
                        </td>
                        <td className="px-4 py-2 border border-[#D6D3D3]">
                          {log.message}
                        </td>
                        <td className="px-4 py-2 border border-[#D6D3D3]">
                          {log.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrails;
