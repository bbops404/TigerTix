import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaArrowLeft,
  FaExclamationTriangle,
} from "react-icons/fa";
import Header_Admin from "../../components/Admin/Header_Admin";
import Sidebar_Admin from "../../components/Admin/SideBar_Admin";
import Admin_ReservationScanQRPopUp from "./Admin_ReservationScanQRPopUp.jsx";
import Admin_ReservationsFilter from "./Admin_ReservationsFilter";
import adminReservationService from "../Services/adminReservationService.js";
import { toast } from "react-toastify"; // Add toast notifications for better UX
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

// Info Popup Component
const InfoPopup = ({ isVisible, content, position }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="absolute z-50 bg-white text-black p-3 rounded-lg shadow-lg border border-gray-300 w-64"
      style={{
        bottom: `calc(100% + 10px)`,
        left: '50%',
        transform: 'translateX(-50%)'
      }}
    >
      <div className="text-sm">
        <h4 className="font-semibold text-[#F09C32] mb-2">{content.title}</h4>
        <p className="mb-2">{content.description}</p>
        <div className="text-xs text-gray-600">
          <p><strong>Requirements:</strong> {content.requirements}</p>
          <p><strong>Action:</strong> {content.action}</p>
        </div>
      </div>
      {/* Arrow pointing up */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white"></div>
    </div>
  );
};

// Info Button Component
const InfoButton = ({ content }) => {
  const [showPopup, setShowPopup] = useState(false);
  const buttonRef = useRef(null);

  const handleMouseEnter = () => {
    setShowPopup(true);
  };

  const handleMouseLeave = () => {
    setShowPopup(false);
  };

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        className="w-5 h-5 rounded-full bg-[#F09C32] text-[#1E1E1E] text-sm flex items-center justify-center hover:bg-[#CD8428] transition-colors duration-200"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        i
      </button>
      <InfoPopup 
        isVisible={showPopup} 
        content={content} 
      />
    </div>
  );
};

// Confirmation Modal for Reinstating reservations
const ConfirmReinstateModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl w-[500px] h-[200px] shadow-lg">
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-[#C15454] text-xl" />
          <h2 className="text-2xl text-black font-bold">
            Reinstate Reservations
          </h2>
        </div>
        <p className="text-black mt-2">
          Are you sure you want to reinstate the selected reservations? This
          action cannot be undone.
        </p>
        <p className="text-gray-600 text-sm">Please confirm your action.</p>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-8 py-1 bg-gray-700 text-white rounded-2xl hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-1 bg-[#C15454] text-white rounded-2xl hover:scale-105"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Reinstate Modal to display selected reservations
const ReinstateModal = ({ reservations, onClose, onConfirm }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleReinstate = () => {
    setShowConfirmModal(true); // Show the confirmation modal
  };

  const handleConfirmReinstate = () => {
    setShowConfirmModal(false);
    onConfirm(); // Call the parent's onConfirm to handle the API call
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-[#EFF3F0] rounded-xl p-6 w-[900px] max-w-full shadow-lg relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-[#F09C32] text-2xl hover:text-[#CD8428] transition duration-300"
          >
            <FaArrowLeft />
          </button>
          <h2 className="text-xl font-semibold text-[#3B3B3B] mb-2 text-left mt-8">
            Reinstate Reservations
          </h2>
          <p className="text-sm text-gray-600 mb-4 text-left">
            Below are the details of the reservations that will be reinstated:
          </p>
          <div className="overflow-y-auto max-h-[300px] border border-[#D6D3D3] rounded-md">
            <table className="w-full text-sm bg-white">
              <thead className="bg-[#F09C32] text-[#333333]">
                <tr>
                  {[
                    "Reservation ID",
                    "Name",
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
                      className="py-2 px-3 border border-[#D6D3D3]"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr
                    key={reservation.reservation_id}
                    className="text-center text-black"
                  >
                    <td className="py-2 px-3 border border-[#D6D3D3]">
                      {reservation.reservation_id}
                    </td>
                    <td className="py-2 px-3 border border-[#D6D3D3]">
                      {reservation.name || "N/A"}
                    </td>
                    <td className="py-2 px-3 border border-[#D6D3D3]">
                      {reservation.event_name || "N/A"}
                    </td>
                    <td className="py-2 px-3 border border-[#D6D3D3]">
                      {reservation.seat_type || "N/A"}
                    </td>
                    <td className="py-2 px-3 border border-[#D6D3D3]">
                      {reservation.ticket_tier || "N/A"}
                    </td>
                    <td className="py-2 px-3 border border-[#D6D3D3]">
                      {reservation.claiming_date || "N/A"}
                    </td>
                    <td className="py-2 px-3 border border-[#D6D3D3]">
                      {reservation.claiming_time || "N/A"}
                    </td>
                    <td className="py-2 px-3 border border-[#D6D3D3]">
                      {reservation.amount || "N/A"}
                    </td>
                    <td className="py-2 px-3 border border-[#D6D3D3]">
                      <span className="text-red-500 font-medium">
                        {reservation.claiming_status || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={handleReinstate}
              className="bg-[#C15454] hover:bg-[#B83333] text-white px-6 py-2 rounded-md"
            >
              Confirm Reinstate
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmReinstateModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmReinstate}
      />
    </>
  );
};

// Adding the ConfirmRestoreUnclaimedModal component
const ConfirmRestoreUnclaimedModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-xl p-6 w-[400px] max-w-full shadow-lg">
        <h2 className="text-xl font-semibold text-[#3B3B3B] mb-4 text-center">
          Confirm Restore
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Are you sure you want to restore these unclaimed reservations?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-[#C15454] hover:bg-[#B83333] text-white px-6 py-2 rounded-md"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Adding the RestoreUnclaimedModal component
const RestoreUnclaimedModal = ({ reservations, onClose, onConfirm }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleRestoreUnclaimed = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmRestoreUnclaimed = () => {
    // Call the parent's onConfirm handler to actually perform the API call
    onConfirm();

    // Toast will be shown from the parent component after the API call
    setShowConfirmModal(false);
    onClose(); // Close the RestoreUnclaimedModal
  };

  return (
    <>
      {!showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-[#EFF3F0] rounded-xl p-6 w-[900px] max-w-full shadow-lg relative">
            <button
              onClick={onClose}
              className="absolute top-4 left-4 text-[#F09C32] text-2xl hover:text-[#CD8428] transition duration-300"
            >
              <FaArrowLeft />
            </button>
            <h2 className="text-xl font-semibold text-[#3B3B3B] mb-2 text-left mt-8">
              Restore Unclaimed Reservations
            </h2>
            <p className="text-sm text-gray-600 mb-4 text-left">
              Below are the details of the reservations that will be restored:
            </p>
            <div className="overflow-y-auto max-h-[300px] border border-[#D6D3D3] rounded-md">
              <table className="w-full text-sm bg-white">
                <thead className="bg-[#F09C32] text-[#333333]">
                  <tr>
                    {[
                      "Reservation ID",
                      "Name",
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
                        className="py-2 px-3 border border-[#D6D3D3]"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => (
                    <tr
                      key={reservation.reservation_id}
                      className="text-center text-black"
                    >
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.reservation_id}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.name || "N/A"}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.event_name || "N/A"}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.seat_type || "N/A"}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.ticket_tier || "N/A"}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.claiming_date || "N/A"}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.claiming_time || "N/A"}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.amount || "N/A"}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        <span className="text-red-500 font-medium">
                          {reservation.claiming_status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleRestoreUnclaimed}
                className="bg-[#C15454] hover:bg-[#B83333] text-white px-6 py-2 rounded-md"
              >
                Confirm Restore
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmModal && (
        <ConfirmRestoreUnclaimedModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmRestoreUnclaimed}
        />
      )}
    </>
  );
};

const ConfirmMarkAsClaimedModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl w-[500px] h-[200px] shadow-lg">
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-green-600 text-xl" />
          <h2 className="text-2xl text-black font-bold">Mark as Claimed</h2>
        </div>
        <p className="text-black mt-2">
          Are you sure you want to mark the selected reservations as claimed?
          This action cannot be undone.
        </p>
        <p className="text-gray-600 text-sm">Please confirm your action.</p>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-8 py-1 bg-gray-700 text-white rounded-2xl hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-1 bg-green-600 text-white rounded-2xl hover:scale-105"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Admin_ClaimedReservationModal component
const Admin_ClaimedReservationModal = ({
  reservations,
  onClose,
  onConfirm,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleMarkAsClaimed = () => {
    // Open the confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmMarkAsClaimed = () => {
    onConfirm(); // Execute the parent's confirm function to handle API call
    setShowConfirmModal(false);
  };

  return (
    <>
      {/* Only render the parent modal if the confirmation modal is not open */}
      {!showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-[#EFF3F0] rounded-xl p-6 w-[900px] max-w-full shadow-lg relative">
            {/* Back Icon */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 text-[#F09C32] text-2xl hover:text-[#CD8428] transition duration-300"
            >
              <FaArrowLeft />
            </button>

            {/* Title */}
            <h2 className="text-xl font-semibold text-[#3B3B3B] mb-2 text-left mt-8">
              ✅ Reservations to be Marked as Claimed
            </h2>

            {/* Subtitle */}
            <p className="text-sm text-gray-600 mb-4 text-left">
              Below are the details of the reservations that will be marked as
              claimed:
            </p>

            {/* Scrollable Table */}
            <div className="overflow-y-auto max-h-[300px] border border-[#D6D3D3] rounded-md">
              <table className="w-full text-sm bg-white">
                <thead className="bg-[#F09C32] text-[#333333]">
                  <tr>
                    {[
                      "Reservation ID",
                      "Name",
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
                        className="py-2 px-3 border border-[#D6D3D3]"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => (
                    <tr
                      key={reservation.reservation_id}
                      className="text-center text-black"
                    >
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.reservation_id}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.name || "N/A"}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.event_name || "N/A"}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.seat_type || "N/A"}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.ticket_tier || "N/A"}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.claiming_date || "N/A"}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.claiming_time || "N/A"}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        {reservation.amount || "N/A"}
                      </td>
                      <td className="py-2 px-3 border border-[#D6D3D3]">
                        <span className="text-blue-500 font-medium">
                          {reservation.claiming_status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleMarkAsClaimed}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
              >
                Mark as Claimed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmMarkAsClaimedModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmMarkAsClaimed}
        />
      )}
    </>
  );
};

const Admin_Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedReservations, setSelectedReservations] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [users, setUsers] = useState([]);
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  // State for Restore Unclaimed Modal
  const [showRestoreUnclaimedModal, setShowRestoreUnclaimedModal] =
    useState(false);
  const [selectedReservationsData, setSelectedReservationsData] = useState([]);
  // Add state for Reinstate Modal
  const [showReinstateModal, setShowReinstateModal] = useState(false);
  const [selectedReinstateData, setSelectedReinstateData] = useState([]);
  // Add state for Claim Modal
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedClaimData, setSelectedClaimData] = useState([]);

  // Info content for each button
  const infoContent = {
    reinstate: {
      title: "Reinstate Button",
      description: "Reinstates unclaimed reservations back to pending status, allowing users to claim them again.",
      requirements: "Select one or more reservations with 'Unclaimed' status",
      action: "Changes status from 'Unclaimed' to 'Pending'"
    },
    restore: {
      title: "Restore Unclaimed Button", 
      description: "Restores unclaimed reservations to the available ticket pool for other users to reserve.",
      requirements: "Select one or more reservations with 'Unclaimed' status",
      action: "Removes reservation and makes tickets available for new reservations"
    },
    markClaimed: {
      title: "Mark as Claimed Button",
      description: "Manually marks pending reservations as claimed when tickets are collected in person.",
      requirements: "Select one or more reservations with 'Pending' status", 
      action: "Changes status from 'Pending' to 'Claimed'"
    }
  };

  // Function to fetch all reservations
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await adminReservationService.getAllReservations();

      if (response.success) {
        setReservations(response.data);
        // Clear any selected reservations when refreshing data
        setSelectedReservations([]);
      } else {
        setError("Failed to fetch reservations.");
        toast.error("Failed to fetch reservations.");
      }
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setError("An error occurred while fetching reservations.");
      toast.error("Error loading reservations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load reservations on component mount
  useEffect(() => {
    fetchReservations();
  }, []);

  // Manual sorting implementation
  const sortedData = useMemo(() => {
    if (sorting.length === 0) return reservations;

    const sortColumn = sorting[0].id;
    const sortDirection = sorting[0].desc ? "desc" : "asc";

    return [...reservations].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      // Handle null or undefined values
      if (aValue == null) return sortDirection === "asc" ? -1 : 1;
      if (bValue == null) return sortDirection === "asc" ? 1 : -1;

      // Case insensitive string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Numeric comparison
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [reservations, sorting]);

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: () => null,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={selectedReservations.includes(
                row.original.reservation_id
              )}
              onChange={(e) =>
                handleCheckboxChange(
                  row.original.reservation_id,
                  e.target.checked
                )
              }
            />
          </div>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("reservation_id", {
        header: ({ column }) => (
          <div
            className="cursor-pointer select-none flex items-center justify-center gap-1"
            onClick={() => handleSort("reservation_id")}
          >
            Reservation ID
            {renderSortIcon("reservation_id")}
          </div>
        ),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <div
            className="cursor-pointer select-none flex items-center justify-center gap-1"
            onClick={() => handleSort("name")}
          >
            Full Name
            {renderSortIcon("name")}
          </div>
        ),
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("event_name", {
        header: ({ column }) => (
          <div
            className="cursor-pointer select-none flex items-center justify-center gap-1"
            onClick={() => handleSort("event_name")}
          >
            Event Name
            {renderSortIcon("event_name")}
          </div>
        ),
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("seat_type", {
        header: ({ column }) => (
          <div
            className="cursor-pointer select-none flex items-center justify-center gap-1"
            onClick={() => handleSort("seat_type")}
          >
            Seat Type
            {renderSortIcon("seat_type")}
          </div>
        ),
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("claiming_date", {
        header: ({ column }) => (
          <div
            className="cursor-pointer select-none flex items-center justify-center gap-1"
            onClick={() => handleSort("claiming_date")}
          >
            Claiming Date
            {renderSortIcon("claiming_date")}
          </div>
        ),
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("claiming_time", {
        header: ({ column }) => (
          <div
            className="cursor-pointer select-none flex items-center justify-center gap-1"
            onClick={() => handleSort("claiming_time")}
          >
            Claiming Time
            {renderSortIcon("claiming_time")}
          </div>
        ),
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("amount", {
        header: ({ column }) => (
          <div
            className="cursor-pointer select-none flex items-center justify-center gap-1"
            onClick={() => handleSort("amount")}
          >
            Amount
            {renderSortIcon("amount")}
          </div>
        ),
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("claiming_status", {
        header: ({ column }) => (
          <div
            className="cursor-pointer select-none flex items-center justify-center gap-1"
            onClick={() => handleSort("claiming_status")}
          >
            Claiming Status
            {renderSortIcon("claiming_status")}
          </div>
        ),
        cell: (info) => {
          const status = info.getValue() || "N/A";
          // Add colors based on status
          let statusClass = "";
          switch (status.toLowerCase()) {
            case "claimed":
              statusClass = "text-green-600 font-medium";
              break;
            case "pending":
              statusClass = "text-blue-500 font-medium";
              break;
            case "unclaimed":
              statusClass = "text-red-500 font-medium";
              break;
            case "cancelled":
              statusClass = "text-gray-500 font-medium";
              break;
            default:
              statusClass = "";
          }
          return <span className={statusClass}>{status}</span>;
        },
      }),
    ],
    [selectedReservations, sorting]
  );

  // Custom sort handler
  const handleSort = (columnId) => {
    setSorting((prevSorting) => {
      // If we're already sorting by this column
      if (prevSorting.length > 0 && prevSorting[0].id === columnId) {
        // If it's ascending, switch to descending
        if (!prevSorting[0].desc) {
          return [{ id: columnId, desc: true }];
        }
        // If it's already descending, remove sorting
        return [];
      }
      // Set new sort on this column (ascending)
      return [{ id: columnId, desc: false }];
    });
  };

  // Helper to render sort icon
  const renderSortIcon = (columnId) => {
    if (sorting.length === 0 || sorting[0].id !== columnId) {
      return <FaSort className="text-gray-400 ml-1" />;
    }
    return sorting[0].desc ? (
      <FaSortDown className="text-white ml-1" />
    ) : (
      <FaSortUp className="text-white ml-1" />
    );
  };

  const table = useReactTable({
    data: sortedData,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    manualSorting: true,
    enableSorting: true,
  });

  const handleSearch = (e) => {
    const term = e.target.value;
    setGlobalFilter(term);
  };

  const handleReset = () => {
    setGlobalFilter("");
    setSorting([]);
  };

  const handleCheckboxChange = (reservationId, isChecked) => {
    setSelectedReservations((prevSelected) =>
      isChecked
        ? [...prevSelected, reservationId]
        : prevSelected.filter((id) => id !== reservationId)
    );
  };

  // Check if any selected reservations have unclaimed status
  const hasUnclaimedSelected = useMemo(() => {
    if (selectedReservations.length === 0) return false;

    return selectedReservations.some((id) => {
      const reservation = reservations.find((r) => r.reservation_id === id);
      return (
        reservation && reservation.claiming_status.toLowerCase() === "unclaimed"
      );
    });
  }, [selectedReservations, reservations]);

  // Check if any selected reservations have pending status
  const hasPendingSelected = useMemo(() => {
    if (selectedReservations.length === 0) return false;

    return selectedReservations.some((id) => {
      const reservation = reservations.find((r) => r.reservation_id === id);
      return (
        reservation && reservation.claiming_status.toLowerCase() === "pending"
      );
    });
  }, [selectedReservations, reservations]);

  // Handler for successful QR code claiming - refreshes the reservations list
  const handleSuccessfulClaim = () => {
    // Refresh the reservations data after successful QR code claim
    fetchReservations();
  };

  // Updated handleReinstate function to show the modal
  const handleReinstate = async () => {
    if (!hasUnclaimedSelected || actionLoading) return;

    try {
      // Filter only the unclaimed reservations
      const unclaimedIds = selectedReservations.filter((id) => {
        const reservation = reservations.find((r) => r.reservation_id === id);
        return (
          reservation &&
          reservation.claiming_status.toLowerCase() === "unclaimed"
        );
      });

      if (unclaimedIds.length === 0) {
        toast.info("No unclaimed reservations selected.");
        return;
      }

      // Get the full reservation data for selected unclaimed reservations
      const selectedReinstateFullData = unclaimedIds.map((id) =>
        reservations.find((r) => r.reservation_id === id)
      );

      // Set the data for the modal
      setSelectedReinstateData(selectedReinstateFullData);

      // Show the modal
      setShowReinstateModal(true);
    } catch (err) {
      console.error("Error preparing reinstate:", err);
      toast.error(
        "An error occurred while preparing to reinstate reservations."
      );
    }
  };

  // Function to actually reinstate reservations after confirmation
  const performReinstate = async () => {
    try {
      setActionLoading(true);
      // Filter only the unclaimed reservations
      const unclaimedIds = selectedReinstateData.map((r) => r.reservation_id);

      if (unclaimedIds.length === 0) {
        toast.info("No unclaimed reservations selected.");
        return;
      }

      // Call the service to reinstate all selected unclaimed reservations
      const results =
        await adminReservationService.reinstateMultipleReservations(
          unclaimedIds
        );

      // Count successful operations
      const successCount = results.filter((r) => r.success).length;

      if (successCount > 0) {
        toast.success(
          `Successfully reinstated ${successCount} reservation(s).`
        );
        // Refresh data after successful action
        await fetchReservations();
      } else {
        toast.error("Failed to reinstate any reservations.");
      }

      // Show warnings for any failures
      const failures = results.filter((r) => !r.success);
      if (failures.length > 0) {
        toast.warn(
          `${failures.length} reservation(s) could not be reinstated.`
        );
      }
    } catch (err) {
      console.error("Error reinstating reservations:", err);
      setError("An error occurred while reinstating reservations.");
      toast.error("Failed to reinstate reservations. Please try again.");
    } finally {
      setActionLoading(false);
      setShowReinstateModal(false);
    }
  };

  // Updated handleRestoreUnclaimed function to show modal
  const handleRestoreUnclaimed = async () => {
    if (!hasUnclaimedSelected || actionLoading) return;

    try {
      // Filter only the unclaimed reservations
      const unclaimedIds = selectedReservations.filter((id) => {
        const reservation = reservations.find((r) => r.reservation_id === id);
        return (
          reservation &&
          reservation.claiming_status.toLowerCase() === "unclaimed"
        );
      });

      if (unclaimedIds.length === 0) {
        toast.info("No unclaimed reservations selected.");
        return;
      }

      // Get the full reservation data for selected unclaimed reservations
      const selectedReservationsFullData = unclaimedIds.map((id) =>
        reservations.find((r) => r.reservation_id === id)
      );

      // Set the data for the modal
      setSelectedReservationsData(selectedReservationsFullData);

      // Show the modal
      setShowRestoreUnclaimedModal(true);
    } catch (err) {
      console.error("Error preparing restore unclaimed:", err);
      toast.error(
        "An error occurred while preparing to restore unclaimed reservations."
      );
    }
  };

  // Function to actually restore unclaimed reservations after confirmation
  const performRestoreUnclaimed = async () => {
    try {
      setActionLoading(true);
      const unclaimedIds = selectedReservationsData.map(
        (r) => r.reservation_id
      );

      // Call the real backend endpoint to restore unclaimed tickets
      const response =
        await adminReservationService.restoreUnclaimedReservations(
          unclaimedIds
        );

      if (response.success) {
        toast.success("Selected reservations restored successfully!", {
          style: {
            backgroundColor: "#FFFFFF",
            color: "#000",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: "10px",
            marginTop: "70px",
          },
          autoClose: 2000,
        });
        // Refresh data after successful action
        await fetchReservations();
      } else {
        toast.error("Failed to restore unclaimed reservations.");
      }

      // Show information about any errors
      if (response.errors && response.errors.length > 0) {
        toast.warn(
          `${response.errors.length} reservation(s) could not be restored.`
        );
      }
    } catch (err) {
      console.error("Error restoring unclaimed reservations:", err);
      setError("An error occurred while restoring unclaimed reservations.");
      toast.error(
        "Failed to restore unclaimed reservations. Please try again."
      );
    } finally {
      setActionLoading(false);
      setShowRestoreUnclaimedModal(false);
    }
  };

  // Updated handleMarkAsClaimed to show the claim modal
  const handleMarkAsClaimed = async () => {
    if (!hasPendingSelected || actionLoading) return;

    try {
      // Filter only the pending reservations
      const pendingIds = selectedReservations.filter((id) => {
        const reservation = reservations.find((r) => r.reservation_id === id);
        return (
          reservation && reservation.claiming_status.toLowerCase() === "pending"
        );
      });

      if (pendingIds.length === 0) {
        toast.info("No pending reservations selected.");
        return;
      }

      // Get the full reservation data for selected pending reservations
      const selectedPendingFullData = pendingIds.map((id) =>
        reservations.find((r) => r.reservation_id === id)
      );

      // Set the data for the modal
      setSelectedClaimData(selectedPendingFullData);

      // Show the modal
      setShowClaimModal(true);
    } catch (err) {
      console.error("Error preparing mark as claimed:", err);
      toast.error(
        "An error occurred while preparing to mark reservations as claimed."
      );
    }
  };

  // Function to actually mark reservations as claimed after confirmation
  const performMarkAsClaimed = async () => {
    try {
      setActionLoading(true);
      // Get the IDs of the selected pending reservations
      const pendingIds = selectedClaimData.map((r) => r.reservation_id);

      if (pendingIds.length === 0) {
        toast.info("No pending reservations selected.");
        return;
      }

      // Call the service to mark all selected pending reservations as claimed
      const results = await adminReservationService.markMultipleAsClaimed(
        pendingIds
      );

      // Count successful operations
      const successCount = results.filter((r) => r.success).length;

      if (successCount > 0) {
        toast.success(
          `Successfully marked ${successCount} reservation(s) as claimed.`,
          {
            style: {
              backgroundColor: "#FFFFFF",
              color: "#000",
              fontWeight: "bold",
              borderRadius: "8px",
              padding: "10px",
              marginTop: "70px",
            },
            autoClose: 2000,
          }
        );
        // Refresh data after successful action
        await fetchReservations();
      } else {
        toast.error("Failed to mark any reservations as claimed.");
      }

      // Show warnings for any failures
      const failures = results.filter((r) => !r.success);
      if (failures.length > 0) {
        toast.warn(
          `${failures.length} reservation(s) could not be marked as claimed.`
        );
      }
    } catch (err) {
      console.error("Error marking reservations as claimed:", err);
      setError("An error occurred while marking reservations as claimed.");
      toast.error("Failed to mark reservations as claimed. Please try again.");
    } finally {
      setActionLoading(false);
      setShowClaimModal(false);
    }
  };

  // Add a new function to manually check and update pending reservations
  const handleCheckPendingReservations = async () => {
    if (actionLoading) return;

    try {
      setActionLoading(true);
      const response =
        await adminReservationService.checkAndUpdatePendingReservations();

      if (response.success) {
        toast.success(
          `Updated ${response.data.updated} pending reservations to unclaimed`
        );
        // Refresh the data to show updated statuses
        await fetchReservations();
      } else {
        toast.error("Failed to update pending reservations");
      }
    } catch (error) {
      console.error("Error checking pending reservations:", error);
      toast.error("Error updating pending reservations. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-[#1E1E1E] text-white">
        <p className="text-xl">Loading reservations...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-[#1E1E1E] text-white">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );

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
                value={globalFilter || ""}
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
                className="px-4 py-2 bg-white text-black rounded-md hover:bg-[#FFAB40] hover:text-black transition duration-300"
                onClick={handleCheckPendingReservations}
                disabled={actionLoading}
              >
                Check Unclaimed
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

          {/* Reservations Table using TanStack Table */}
          <div className="overflow-x-auto rounded-md shadow-md max-h-[400px] overflow-y-auto">
            <table className="w-full text-black border-collapse border border-[#D6D3D3] bg-white rounded-md overflow-hidden">
              <thead className="sticky top-0 bg-[#F09C32] text-[#333333] text-center z-1">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-2 border border-[#D6D3D3] text-center"
                      >
                        {header.isPlaceholder ? null : (
                          <div>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-4">
                      No reservations found.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border border-[#D6D3D3] text-center"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-2 border border-[#D6D3D3]"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 bg-gray-700 text-white rounded"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                {"<<"}
              </button>
              <button
                className="px-2 py-1 bg-gray-700 text-white rounded"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {"<"}
              </button>
              <button
                className="px-2 py-1 bg-gray-700 text-white rounded"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {">"}
              </button>
              <button
                className="px-2 py-1 bg-gray-700 text-white rounded"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                {">>"}
              </button>
            </div>
            <span className="text-sm text-white">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="px-2 py-1 bg-gray-700 text-white rounded"
            >
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>

          {/* Bottom Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              className="px-6 py-2 bg-[#F09C32] text-black rounded-md hover:text-white hover:bg-[#CD8428] hover:scale-105 duration-100"
              onClick={() => setShowQRPopup(true)}
            >
              Scan QR Code
            </button>
            <div className="flex gap-2 items-center">
              <InfoButton content={infoContent.reinstate} />
              <button
                className={`px-4 py-2 bg-[#C15454] text-white rounded-md ${
                  hasUnclaimedSelected && !actionLoading
                    ? "hover:bg-[#B83333] hover:scale-105 duration-100"
                    : "opacity-50 cursor-not-allowed"
                }`}
                onClick={handleReinstate}
                disabled={!hasUnclaimedSelected || actionLoading}
              >
                {actionLoading ? "Processing..." : "Reinstate"}
              </button>
              <InfoButton content={infoContent.restore} />
              <button
                className={`px-4 py-2 bg-[#C15454] text-white rounded-md ${
                  hasUnclaimedSelected && !actionLoading
                    ? "hover:bg-[#B83333] hover:scale-105 duration-100"
                    : "opacity-50 cursor-not-allowed"
                }`}
                onClick={handleRestoreUnclaimed}
                disabled={!hasUnclaimedSelected || actionLoading}
              >
                {actionLoading ? "Processing..." : "Restore Unclaimed"}
              </button>
              <InfoButton content={infoContent.markClaimed} />
              <button
                className={`px-4 py-2 bg-[#59A051] text-white rounded-md ${
                  hasPendingSelected && !actionLoading
                    ? "hover:bg-[#3C6F37] hover:scale-105 duration-100"
                    : "opacity-50 cursor-not-allowed"
                }`}
                onClick={handleMarkAsClaimed}
                disabled={!hasPendingSelected || actionLoading}
              >
                {actionLoading ? "Processing..." : "Mark as Claimed"}
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
          onSuccessfulClaim={handleSuccessfulClaim}
        />
      )}

      {/* Reinstate Modal */}
      {showReinstateModal && (
        <ReinstateModal
          reservations={selectedReinstateData}
          onClose={() => {
            setShowReinstateModal(false);
          }}
          onConfirm={performReinstate}
        />
      )}

      {/* RestoreUnclaimedModal */}
      {showRestoreUnclaimedModal && (
        <RestoreUnclaimedModal
          reservations={selectedReservationsData}
          onClose={() => {
            setShowRestoreUnclaimedModal(false);
          }}
          onConfirm={performRestoreUnclaimed}
        />
      )}

      {/* ClaimedReservationModal */}
      {showClaimModal && (
        <Admin_ClaimedReservationModal
          reservations={selectedClaimData}
          onClose={() => {
            setShowClaimModal(false);
          }}
          onConfirm={performMarkAsClaimed}
        />
      )}
    </div>
  );
};

export default Admin_Reservations;
