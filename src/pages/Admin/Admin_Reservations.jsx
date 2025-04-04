import React, { useState } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";

import Header_Admin from "../../components/Admin/Header_Admin";
import Sidebar_Admin from "../../components/Admin/SideBar_Admin";

import Admin_ReservationScanQRPopUp from "./Admin_ReservationScanQRPopUp.jsx";
import Admin_ReservationsFilter from "./Admin_ReservationsFilter";

const Admin_Reservations = () => {
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white">
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
            {/* Extended Search Bar with spacing */}
            <div className="relative flex-grow mr-4">
              <FaSearch className="absolute left-4 top-3 text-white" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-12 pr-4 py-2 rounded-full bg-gray-500 text-white outline-none"
              />
            </div>

            {/* Buttons */}
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
            <Admin_ReservationsFilter
              showFilter={showFilter}
              setShowFilter={setShowFilter}
            />
          )}

          {/* Reservations Table */}
          <div className="overflow-x-auto rounded-md shadow-md max-h-[400px] overflow-y-auto">
            <table className="w-full text-black border-collapse border border-[#D6D3D3] bg-white rounded-md overflow-hidden">
              <thead className="sticky top-0 bg-[#F09C32] text-[#333333] text-center z-1">
                <tr>
                  {[
                    "Reservation ID",
                    "Name",
                    "Role",
                    "Event Name",
                    "Ticket Tier",
                    "Claiming Date",
                    "Claiming Time",
                    "Amount",
                    "Claiming Status",
                  ].map((header, index) => (
                    <th
                      key={index}
                      className="px-4 py-2 border border-[#D6D3D3] text-center "
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    id: 1,
                    name: "Clive",
                    role: "Student",
                    event: "UAAP CDC",
                    tier: "PATRON",
                    date: "Nov 30, 2024",
                    time: "7:00 - 8:00 AM",
                    amount: 350,
                    status: "PENDING",
                  },
                  {
                    id: 2,
                    name: "Anna",
                    role: "Faculty",
                    event: "UST Mens Volleyball",
                    tier: "VIP",
                    date: "Dec 15, 2024",
                    time: "6:00 - 7:00 PM",
                    amount: 500,
                    status: "CLAIMED",
                  },
                  {
                    id: 3,
                    name: "Jake",
                    role: "Alumni",
                    event: "UST Homecoming",
                    tier: "GEN AD",
                    date: "Jan 10, 2025",
                    time: "3:00 - 4:00 PM",
                    amount: 200,
                    status: "UNCLAIMED",
                  },
                  {
                    id: 4,
                    name: "Liam",
                    role: "Student",
                    event: "Tigers Championship",
                    tier: "PATRON",
                    date: "Feb 20, 2025",
                    time: "5:00 - 6:00 PM",
                    amount: 450,
                    status: "PENDING",
                  },
                  {
                    id: 5,
                    name: "Sophia",
                    role: "Student",
                    event: "UST Womens Volleyball",
                    tier: "VIP",
                    date: "Mar 8, 2025",
                    time: "2:00 - 3:00 PM",
                    amount: 600,
                    status: "CLAIMED",
                  },
                  {
                    id: 6,
                    name: "Nathan",
                    role: "Student",
                    event: "UST Mens Basketball",
                    tier: "GEN AD",
                    date: "Apr 22, 2025",
                    time: "1:00 - 2:00 PM",
                    amount: 150,
                    status: "UNCLAIMED",
                  },
                  {
                    id: 7,
                    name: "Elijah",
                    role: "Alumni",
                    event: "UST Grand Alumni Night",
                    tier: "VIP",
                    date: "May 15, 2025",
                    time: "7:30 - 8:30 PM",
                    amount: 700,
                    status: "PENDING",
                  },
                  {
                    id: 8,
                    name: "Mia",
                    role: "Faculty",
                    event: "UST Research Symposium",
                    tier: "GEN AD",
                    date: "Jun 5, 2025",
                    time: "10:00 - 11:00 AM",
                    amount: 250,
                    status: "CLAIMED",
                  },
                  {
                    id: 9,
                    name: "Daniel",
                    role: "Student",
                    event: "UST Intramurals",
                    tier: "PATRON",
                    date: "Jul 12, 2025",
                    time: "9:00 - 10:00 AM",
                    amount: 300,
                    status: "UNCLAIMED",
                  },
                  {
                    id: 10,
                    name: "Lucas",
                    role: "Student",
                    event: "Tomasino Fest",
                    tier: "VIP",
                    date: "Aug 20, 2025",
                    time: "4:00 - 5:00 PM",
                    amount: 550,
                    status: "CLAIMED",
                  },
                  {
                    id: 11,
                    name: "Elijah",
                    role: "Alumni",
                    event: "UST Grand Alumni Night",
                    tier: "VIP",
                    date: "May 15, 2025",
                    time: "7:30 - 8:30 PM",
                    amount: 700,
                    status: "PENDING",
                  },
                  {
                    id: 12,
                    name: "Mia",
                    role: "Faculty",
                    event: "UST Research Symposium",
                    tier: "GEN AD",
                    date: "Jun 5, 2025",
                    time: "10:00 - 11:00 AM",
                    amount: 250,
                    status: "CLAIMED",
                  },
                  {
                    id: 13,
                    name: "Daniel",
                    role: "Student",
                    event: "UST Intramurals",
                    tier: "PATRON",
                    date: "Jul 12, 2025",
                    time: "9:00 - 10:00 AM",
                    amount: 300,
                    status: "UNCLAIMED",
                  },
                  {
                    id: 14,
                    name: "Lucas",
                    role: "Student",
                    event: "Tomasino Fest",
                    tier: "VIP",
                    date: "Aug 20, 2025",
                    time: "4:00 - 5:00 PM",
                    amount: 550,
                    status: "CLAIMED",
                  },
                  {
                    id: 15,
                    name: "Jake",
                    role: "Alumni",
                    event: "UST Homecoming",
                    tier: "GEN AD",
                    date: "Jan 10, 2025",
                    time: "3:00 - 4:00 PM",
                    amount: 200,
                    status: "UNCLAIMED",
                  },
                ].map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="border border-[#D6D3D3] text-center"
                  >
                    <td className="px-4 py-2 border border-[#D6D3D3] flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="flex-1 text-center">
                        {reservation.id}
                      </span>
                    </td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">
                      {reservation.name}
                    </td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">
                      {reservation.role}
                    </td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">
                      {reservation.event}
                    </td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">
                      {reservation.tier}
                    </td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">
                      {reservation.date}
                    </td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">
                      {reservation.time}
                    </td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">
                      {reservation.amount}
                    </td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">
                      {reservation.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              className="px-6 py-2 bg-[#F09C32] text-black rounded-md hover:text-white hover:bg-[#CD8428] hover:scale-105 duration-100"
              onClick={() => setShowQRPopup(true)}
            >
              Scan QR Code
            </button>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#C15454] text-white rounded-md hover:bg-[#B83333] hover:scale-105 duration-100">
                Reinstate
              </button>
              <button className="px-4 py-2 bg-[#C15454] text-white rounded-md hover:bg-[#B83333] hover:scale-105 duration-100">
                Restore Unclaimed
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* QR Code Popup */}
      {showQRPopup && (
        <Admin_ReservationScanQRPopUp
          showPopup={showQRPopup}
          togglePopup={() => setShowQRPopup(false)}
        />
      )}
    </div>
  );
};

export default Admin_Reservations;
