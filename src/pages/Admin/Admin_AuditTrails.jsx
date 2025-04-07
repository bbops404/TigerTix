import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";

import Admin_AuditTrailsFilter from "./Admin_AuditTrailsFilter";

import Header_Admin from "../../components/Admin/Header_Admin";
import Sidebar_Admin from "../../components/Admin/SideBar_Admin";

import axios from 'axios';

const AuditTrails = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [auditTrails, setAuditTrails] = useState([]);

  useEffect(() => {
    const fetchAuditTrails = async () => {
      try {
        const response = await axios.get("http://localhost:5003/auditTrails"); 
        setAuditTrails(response.data);
      } catch (error) {
        console.error("Error fetching Audit Trails:", error);
      }
    };
    fetchAuditTrails();
  }, []);

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white font-Poppins">
      <Header_Admin />

      <div className="flex">
        <Sidebar_Admin />

        <div className="flex-1 px-10 py-10">
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

          {showFilter && <Admin_AuditTrailsFilter showFilter={showFilter} setShowFilter={setShowFilter} />}

          <div className="overflow-x-auto rounded-md shadow-md">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full border-collapse border border-[#D6D3D3] bg-[#333333] rounded-md overflow-hidden">
                <thead className="sticky top-0 bg-[#F09C32] text-[#333333] text-center">
                  <tr>
                    {["ID", "Timestamp", "User ID", "Username", "User Role", "Action", "Message", "Status"].map((header, index) => (
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
                  {auditTrails.map((auditTrail, index) => (
                    <tr
                      key={auditTrail.id || index}
                      className="border border-[#D6D3D3] text-center"
                    >
                      <td className="px-4 py-2 border border-[#D6D3D3] text-center">{auditTrail.id}</td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">{auditTrail.timestamp}</td>
                      <td className="px-4 py-2 border border-[#D6D3D3] text-center">{auditTrail.userId}</td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">{auditTrail.username}</td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">{auditTrail.role}</td>
                      <td className="px-4 py-2 border border-[#D6D3D3] text-center">{auditTrail.action}</td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">{auditTrail.message}</td>
                      <td className="px-4 py-2 border border-[#D6D3D3] text-center">{auditTrail.status}</td>
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
