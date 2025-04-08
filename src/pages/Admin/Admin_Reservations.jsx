import React, { useState, useEffect, useMemo } from "react";
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
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

const Admin_Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // Add loading state for actions
  const [error, setError] = useState("");
  const [selectedReservations, setSelectedReservations] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [users, setUsers] = useState([]);
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

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
      columnHelper.accessor("ticket_tier", {
        header: ({ column }) => (
          <div
            className="cursor-pointer select-none flex items-center justify-center gap-1"
            onClick={() => handleSort("ticket_tier")}
          >
            Ticket Tier
            {renderSortIcon("ticket_tier")}
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

  // Handle reinstate action - UPDATED with real backend calls
  const handleReinstate = async () => {
    if (!hasUnclaimedSelected || actionLoading) return;

    try {
      setActionLoading(true);
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
    }
  };

  // Handle restore unclaimed action - UPDATED with real backend calls
  const handleRestoreUnclaimed = async () => {
    if (!hasUnclaimedSelected || actionLoading) return;

    try {
      setActionLoading(true);
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

      // Call the real backend endpoint to restore unclaimed tickets
      const response =
        await adminReservationService.restoreUnclaimedReservations(
          unclaimedIds
        );

      if (response.success) {
        toast.success(
          `Successfully restored ${response.restored.length} reservation(s).`
        );
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
    }
  };

  // Handle mark as claimed action - UPDATED with real backend calls
  const handleMarkAsClaimed = async () => {
    if (!hasPendingSelected || actionLoading) return;

    try {
      setActionLoading(true);
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

      // Call the service to mark all selected pending reservations as claimed
      const results = await adminReservationService.markMultipleAsClaimed(
        pendingIds
      );

      // Count successful operations
      const successCount = results.filter((r) => r.success).length;

      if (successCount > 0) {
        toast.success(
          `Successfully marked ${successCount} reservation(s) as claimed.`
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
            <div className="flex gap-2">
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
        />
      )}
    </div>
  );
};

export default Admin_Reservations;
