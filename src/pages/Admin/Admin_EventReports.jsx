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
import Header_Admin from "../../components/Admin/Header_Admin";
import Sidebar_Admin from "../../components/Admin/SideBar_Admin";
import eventPlaceholder from "../../assets/event_placeholder.jpg";
import Admin_EventReportGenerateReport from "./Admin_EventReportGenerateReport";
import Admin_EventReportsFilter from "./Admin_EventReportsFilter";
import Admin_EventReportGenerateSummary from "./Admin_EventReportGenerateSummaryPopUp";
import { formatImageUrl, handleImageError } from "../../utils/imageUtils";

const Admin_EventReports = () => {
  const [showGenerateSummaryPopup, setShowGenerateSummaryPopup] =
    useState(false);
  const openGenerateSummaryPopup = () => setShowGenerateSummaryPopup(true);
  const closeGenerateSummaryPopup = () => setShowGenerateSummaryPopup(false);

  const [showGenerateReport, setShowGenerateReport] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const openGenerateReport = (eventId) => {
    setSelectedEventId(eventId);
    setShowGenerateReport(true);
  };
  const closeGenerateReport = () => setShowGenerateReport(false);

  const [showFilter, setShowFilter] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleEvents = 5;

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const nextSlide = () => {
    if (currentIndex + visibleEvents < ticketedEvents.length) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  // Ticketed Events for Carousel
  const [ticketedEvents, setTicketedEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");
  const [eventSearchQuery, setEventSearchQuery] = useState("");

  // Event Summary Table Logic
  const [eventSummaryData, setEventSummaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch ticketed events for the carousel
  useEffect(() => {
    const fetchTicketedEvents = async () => {
      try {
        setEventsLoading(true);
        // Updated to the correct endpoint
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/ticketed-events`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && response.data.data) {
          setTicketedEvents(response.data.data);
        } else {
          console.error("Unexpected response structure:", response.data);
          setEventsError(
            "Unexpected response structure. Please contact support."
          );
        }
      } catch (err) {
        console.error(
          "Error fetching ticketed events:",
          err.response || err.message || err
        );
        setEventsError(
          "Failed to fetch ticketed events. Please try again later."
        );
      } finally {
        setEventsLoading(false);
      }
    };

    fetchTicketedEvents();
  }, []);

  // Fetch event summary data for the table
  useEffect(() => {
    const fetchEventSummaryData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/events-summary`,
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

  // Filter ticketed events based on search query
  const filteredTicketedEvents = useMemo(() => {
    if (!eventSearchQuery) return ticketedEvents;
    return ticketedEvents.filter((event) =>
      event.name.toLowerCase().includes(eventSearchQuery.toLowerCase())
    );
  }, [ticketedEvents, eventSearchQuery]);

  // Reset search and filters
  const resetSearchAndFilters = () => {
    setEventSearchQuery("");
    setGlobalFilter("");
    // Any other filter states you might add in the future
  };

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
        cell: (info) => `₱${parseFloat(info.getValue() || 0).toLocaleString()}`,
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
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Render the events carousel section
  const renderEventsSection = () => {
    if (eventsLoading) {
      return <div className="text-center py-10">Loading events...</div>;
    }

    if (eventsError) {
      return (
        <div className="text-center py-10 text-red-500">{eventsError}</div>
      );
    }

    if (filteredTicketedEvents.length === 0) {
      return (
        <div className="text-center py-10">No ticketed events available</div>
      );
    }

    // Calculate visible events - handle case where filtered events changes
    const maxIndex = Math.max(0, filteredTicketedEvents.length - visibleEvents);
    const safeCurrentIndex = Math.min(currentIndex, maxIndex);

    const visibleTicketedEvents = filteredTicketedEvents.slice(
      safeCurrentIndex,
      safeCurrentIndex + visibleEvents
    );

    return (
      <div className="relative flex items-center justify-center mb-10">
        <button
          onClick={prevSlide}
          className="absolute left-0 bg-black/50 p-2 rounded-full"
          disabled={safeCurrentIndex === 0}
        >
          <FaChevronLeft size={20} />
        </button>

        <div className="w-full flex justify-center overflow-hidden space-x-2">
          {visibleTicketedEvents.map((event) => {
            const eventImage = event.image ? formatImageUrl(event.image) : null;
            return (
              <div
                key={event.id}
                className="transition-opacity duration-1000 opacity-100 transform hover:scale-105"
              >
                <div className="p-2 rounded-lg">
                  {eventImage ? (
                    <img
                      src={eventImage}
                      alt={event.name}
                      className="w-[200px] h-[250px] object-cover rounded-lg mx-auto"
                      onError={(e) => {
                        console.error("Image failed to load:", e.target.src);
                        e.target.style.display = "none";
                        const container = e.target.parentNode;
                        if (!container.querySelector(".image-placeholder")) {
                          const placeholder = document.createElement("div");
                          placeholder.className = "text-sm w-[200px] h-[250px] bg-gray-700 rounded-lg flex items-center justify-center mx-auto shadow-md image-placeholder font-Poppins";
                          placeholder.innerHTML = `<span class="text-white text-sm text-center px-2">${event.name}</span>`;
                          container.appendChild(placeholder);
                        }
                      }}
                    />
                  ) : (
                    <div className="text-sm w-[200px] h-[250px] bg-gray-700 rounded-lg flex items-center justify-center mx-auto shadow-md font-Poppins">
                      <span className="text-white text-sm text-center px-2">
                        {event.name}
                      </span>
                    </div>
                  )}
                  <p className="text-center mt-2 font-semibold">{event.name}</p>
                  <button
                    className="mt-2 w-full px-4 py-2 text-[#1E1E1E] font-bold rounded-full bg-[#FFAB40] hover:bg-[#E09933] transition-colors"
                    onClick={() => openGenerateReport(event.id)}
                  >
                    Generate Report
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={nextSlide}
          className="absolute right-0 bg-black/50 p-2 rounded-full"
          disabled={
            safeCurrentIndex + visibleEvents >= filteredTicketedEvents.length
          }
        >
          <FaChevronRight size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white font-Poppins">
      <Header_Admin />

      <div className="flex">
        <Sidebar_Admin />

        <div className="flex-1 px-10 py-10">
          {/* Events List */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">List of Ticketed Events</h2>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-grow mr-4">
                <FaSearch className="absolute left-4 top-3 text-white" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 rounded-full bg-gray-500 text-white outline-none"
                />
              </div>

              <button
                className="px-4 py-2 bg-white text-black rounded-md hover:bg-[#FFAB40] hover:text-black transition duration-300"
                onClick={resetSearchAndFilters}
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

          {/* Prompt for Admin */}
          <div className="mb-4">
            <p className="text-sm text-gray-400">
              Generate a reservation report for each ticketed event by clicking
              the "Generate Report" button.
            </p>
          </div>

          {/* Filter Component */}
          {showFilter && (
            <Admin_EventReportsFilter
              showFilter={showFilter}
              setShowFilter={setShowFilter}
            />
          )}

          {/* Render Ticketed Events Carousel */}
          {renderEventsSection()}

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
                className="px-6 py-2 bg-[#FFAB40] text-[#1E1E1E] font-bold rounded-full hover:bg-[#E09933] transition-colors"
                onClick={openGenerateSummaryPopup}
              >
                Generate Summary Report
              </button>
            </div>
          </div>

          {/* Modals */}
          {showGenerateReport && (
            <Admin_EventReportGenerateReport
              isOpen={showGenerateReport}
              onClose={closeGenerateReport}
              selectedEventId={selectedEventId}
            />
          )}

          {showGenerateSummaryPopup && (
            <Admin_EventReportGenerateSummary
              isOpen={showGenerateSummaryPopup}
              onClose={closeGenerateSummaryPopup}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin_EventReports;
