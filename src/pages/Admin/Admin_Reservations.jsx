import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import Header_Admin from "../../components/Admin/Header_Admin";
import Sidebar_Admin from "../../components/Admin/SideBar_Admin";
import Admin_ReservationScanQRPopUp from "./Admin_ReservationScanQRPopUp.jsx";
import Admin_ReservationsFilter from "./Admin_ReservationsFilter";
import axios from 'axios';

const Admin_Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReservations, setSelectedReservations] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [users, setUsers] = useState([]);
  const [showQRPopup, setShowQRPopup] = useState(false);
  const API_BASE_URL = "http://localhost:5002"; // Replace with your backend URL
 
    // ✅ Add this state for search
    const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        const response = await axios.get(`${API_BASE_URL}/api/reservations`, {
          withCredentials: true, // Ensures cookies are sent (if applicable)
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data.success) {
          setReservations(response.data.data); // Use the backend response directly
          setFilteredReservations(response.data.data); // Initialize filtered reservations
        } else {
          setError("Failed to fetch reservations.");
        }
      } catch (err) {
        console.error("Error fetching reservations:", err);
        setError("An error occurred while fetching reservations.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
  
    const filtered = reservations.filter(
      (reservation) =>
        reservation.reservation_id.toString().includes(term) || // Match reservation ID
        reservation.name.toLowerCase().includes(term) || // Match user name
        reservation.event_name.toLowerCase().includes(term) || // Match event name
        reservation.ticket_tier.toLowerCase().includes(term) || // Match ticket tier
        reservation.claiming_status.toLowerCase().includes(term) // Match claiming status
    );
  
    setFilteredReservations(filtered);
  };

  
  const handleReset = () => {
    setSearchTerm("");
    setFilteredReservations(reservations);
  };

  const handleCheckboxChange = (reservationId, isChecked) => {
    setSelectedReservations((prevSelected) =>
      isChecked
        ? [...prevSelected, reservationId]
        : prevSelected.filter((id) => id !== reservationId)
    );
  };

  if (loading) return <p>Loading reservations...</p>;
  if (error) return <p>{error}</p>;


  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white font-Poppins">
      {/* Header */}
      <Header_Admin />

      {/* Main Layout */}
      <div className="flex">
        <Sidebar_Admin />
        <div className="flex-1 px-10 py-10">
          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-grow mr-4">
              <FaSearch className="absolute left-4 top-3 text-white" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-12 pr-4 py-2 rounded-full bg-gray-500 text-white outline-none"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
            <button
  className="px-4 py-2 bg-white text-black rounded-md hover:bg-[#FFAB40] hover:text-black transition duration-300"
  onClick={handleReset}
>
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
                    "Full Name",
                    "Event Name",
                    "Seat Type",
                    "Ticket Tier",
                    "Claiming Date",
                    "Claiming Time",
                    "Amount",
                    "Claiming Status",
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
              {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      No reservations found.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation, index) => (
                    <tr
                      key={reservation.reservation_id || index}
                      className="border border-[#D6D3D3] text-center"
                    >
                      <td className="px-4 py-2 border border-[#D6D3D3] flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          onChange={(e) =>
                            handleCheckboxChange(reservation.reservation_id, e.target.checked)
                          }
                        />{" "}
                        <span className="flex-1 text-center">
                          {reservation.reservation_id}
                        </span>
                      </td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">
                        {reservation.name || "N/A"}
                      </td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">
                        {reservation.event_name || "N/A"}
                      </td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">
                        {reservation.seat_type|| "N/A"}
                      </td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">
                        {reservation.ticket_tier || "N/A"}
                      </td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">
                        {reservation.claiming_date || "N/A"}
                      </td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">
                        {reservation.claiming_time || "N/A"}
                      </td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">
                        {reservation.amount || "N/A"}
                      </td>
                      <td className="px-4 py-2 border border-[#D6D3D3]">
                        {reservation.claiming_status || "N/A"}
                      </td>
                    </tr>
                  ))
                )}
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
              <button className="px-4 py-2 bg-[#59A051] text-white rounded-md hover:bg-[#3C6F37] hover:scale-105 duration-100">
                Mark as Claimed
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
