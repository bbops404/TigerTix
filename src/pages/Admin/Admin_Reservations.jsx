import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import Header_Admin from "../../components/Admin/Header_Admin";
import Sidebar_Admin from "../../components/Admin/SideBar_Admin";
import Admin_ReservationScanQRPopUp from "./Admin_ReservationScanQRPopUp.jsx";
import Admin_ReservationsFilter from "./Admin_ReservationsFilter";
import axios from 'axios';

const Admin_Reservations = () => {
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  

  useEffect(() => {
    // Fetching reservations data from the API
    const fetchReservations = async () => {
      try {
        const response = await axios.get('http://localhost:5003/reservations');
        setReservations(response.data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    };
    fetchReservations();
    
  }, []); //

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
                {reservations.map((reservation, index) => (
                  <tr
                    key={reservation.id || index}
                    className="border border-[#D6D3D3] text-center"
                  >
                    <td className="px-4 py-2 border border-[#D6D3D3] text-left">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span>{reservation.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">{reservation.name}</td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">{reservation.role}</td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">{reservation.event}</td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">{reservation.tier}</td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">{reservation.date}</td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">{reservation.time}</td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">{reservation.amount}</td>
                    <td className="px-4 py-2 border border-[#D6D3D3]">{reservation.status}</td>
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
