import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import {
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import Header_SupportStaff from "../../components/SupportStaff/Header_SupportStaff";
import SideBar_SupportStaff from "../../components/SupportStaff/SideBar_SupportStaff";

import eventPlaceholder from "../../assets/event_placeholder.jpg";
import SupportStaff_EventReportGenerateReport from "./SupportStaff_EventReportGenerateReport";
import SupportStaff_EventReportsFilter from "./SupportStaff_EventReportsFilter";
import SupportStaff_EventReportGenerateSummary from "./SupportStaff_EventReportGenerateSummaryPopUp";

const eventData = [
  { id: 1, image: eventPlaceholder, name: "UAAP CDC" },
  { id: 2, image: eventPlaceholder, name: "UST Homecoming" },
  { id: 3, image: eventPlaceholder, name: "Tigers Championship" },
  { id: 4, image: eventPlaceholder, name: "UST Men's Volleyball" },
  { id: 5, image: eventPlaceholder, name: "Paskuhan 2024" },
  { id: 6, image: eventPlaceholder, name: "Freshmen Welcome Walk" },
  { id: 7, image: eventPlaceholder, name: "Thomasian Gala Night" },
  { id: 8, image: eventPlaceholder, name: "Intramurals 2024" },
];

const SupportStaff_EventReports = () => {
  const [showGenerateSummaryPopup, setShowGenerateSummaryPopup] =
    useState(false);
  const openGenerateSummaryPopup = () => setShowGenerateSummaryPopup(true);
  const closeGenerateSummaryPopup = () => setShowGenerateSummaryPopup(false);

  const [showGenerateReport, setShowGenerateReport] = useState(false);
  const openGenerateReport = () => setShowGenerateReport(true);
  const closeGenerateReport = () => setShowGenerateReport(false);

  const [showFilter, setShowFilter] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleEvents = 5;

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const nextSlide = () => {
    if (currentIndex + visibleEvents < eventData.length) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  // Event Summary Table Logic
  const [eventSummaryData, setEventSummaryData] = useState([]); // Event data from the backend
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [globalFilter, setGlobalFilter] = useState(""); // Global search filter

  useEffect(() => {
    const fetchEventSummaryData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/events-summary`, // Updated URL
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (
          response.data &&
          response.data.success &&
          Array.isArray(response.data.data)
        ) {
          const formattedData = response.data.data.map((event) => ({
            ...event,
            event_date: event.event_date || "TBD",
            remaining_tickets:
              event.remaining_tickets === null ||
              event.remaining_tickets === "FREE"
                ? "N/A"
                : event.remaining_tickets,
          }));
          setEventSummaryData(formattedData);
        } else {
          console.error("Unexpected response structure:", response.data);
          setError("Unexpected response structure. Please contact support.");
        }
      } catch (err) {
        console.error(
          "Error fetching event data:",
          err.response || err.message || err
        );
        setError("Failed to fetch event data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventSummaryData();
  }, []);

  const columnHelper = createColumnHelper();
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Event Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("event_date", {
        header: "Event Date",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("venue", {
        header: "Event Venue",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("category", {
        header: "Event Category",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("event_type", {
        header: "Event Type",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("status", {
        header: "Event Status",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("total_reservations", {
        header: "Total Reservations",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("revenue", {
        header: "Revenue",
        cell: (info) => `₱${parseFloat(info.getValue()).toLocaleString()}`,
      }),
      columnHelper.accessor("remaining_tickets", {
        header: "Remaining Tickets",
        cell: (info) => info.getValue(),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: eventSummaryData,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white font-Poppins">
      <Header_SupportStaff />

      <div className="flex">
        <SideBar_SupportStaff />

        <div className="flex-1 px-10 py-10">
          {/* Events List */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold"> List of Events</h2>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-grow mr-4">
                <FaSearch className="absolute left-4 top-3 text-white" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-full pl-12 pr-4 py-2 rounded-full bg-gray-500 text-white outline-none"
                />
              </div>

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

          {/* Prompt for Admin */}
          <div className="mb-4">
            <p className="text-sm text-gray-400">
              Generate a reservation report for each event by clicking the
              "Generate Report" button.
            </p>
          </div>

          {/* Filter Component */}
          {showFilter && (
            <SupportStaff_EventReportsFilter
              showFilter={showFilter}
              setShowFilter={setShowFilter}
            />
          )}

          {/* Events */}
          <div className="relative flex items-center justify-center mb-10">
            <button
              onClick={prevSlide}
              className="absolute left-0 bg-black/50 p-2 rounded-full"
              disabled={currentIndex === 0}
            >
              <FaChevronLeft size={20} />
            </button>

            <div className="w-full flex justify-center overflow-hidden space-x-2">
              {eventData
                .slice(currentIndex, currentIndex + visibleEvents)
                .map((event) => (
                  <div
                    key={event.id}
                    className="transition-opacity duration-1000 opacity-100 transform hover:scale-105"
                  >
                    <div className="p-2 rounded-lg">
                      <img
                        src={event.image}
                        alt={event.name}
                        className="w-[200px] h-[250px] object-cover rounded-lg mx-auto"
                      />
                      <p className="text-center mt-2 font-semibold">
                        {event.name}
                      </p>
                      <button
                        className="mt-2 w-full px-4 py-2 text-white font-bold rounded-full bg-gradient-to-r from-[#FFAB40] to-[#CD6905] transition-transform transform hover:scale-105"
                        onClick={openGenerateReport}
                      >
                        Generate Report
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <button
              onClick={nextSlide}
              className="absolute right-0 bg-black/50 p-2 rounded-full"
              disabled={currentIndex + visibleEvents >= eventData.length}
            >
              <FaChevronRight size={20} />
            </button>
          </div>

          {/* Event Summary Table */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Event Summary</h2>
            {/* Prompt for Admin */}
            <div className="mb-4">
              <p className="text-sm text-gray-400">
                Generate a summary of events report by clicking the "Generate
                Summary Report" button.
              </p>
            </div>
            <div className="flex items-center mb-4">
              <FaSearch className="mr-2 text-white" />
              <input
                type="text"
                placeholder="Search events..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white outline-none"
              />
            </div>
            <div className="overflow-x-auto rounded-md shadow-md max-h-[400px] overflow-y-auto">
              {loading ? (
                <p className="text-center text-white">Loading...</p>
              ) : error ? (
                <p className="text-center text-red-500">{error}</p>
              ) : (
                <table className="w-full text-black border-collapse border border-[#D6D3D3] bg-white rounded-md overflow-hidden">
                  <thead className="sticky top-0 bg-[#F09C32] text-[#333333] text-center z-1">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 py-2 border border-[#D6D3D3] text-center"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
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
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>

            {/* Generate Summary Button */}
            <div className="flex justify-end mt-4">
              <button
                className="px-6 py-2 bg-gradient-to-r from-[#FFAB40] to-[#CD6905] text-white font-bold rounded-full hover:scale-105 transition-transform"
                onClick={openGenerateSummaryPopup}
              >
                Generate Summary Report
              </button>
            </div>
          </div>

          {showGenerateReport && (
            <SupportStaff_EventReportGenerateReport
              isOpen={showGenerateReport}
              onClose={closeGenerateReport}
            />
          )}
          {showGenerateSummaryPopup && (
            <SupportStaff_EventReportGenerateSummary
              isOpen={showGenerateSummaryPopup}
              onClose={closeGenerateSummaryPopup}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportStaff_EventReports;
