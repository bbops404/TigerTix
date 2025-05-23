import React, { useState, useEffect, useMemo } from "react";
import { handleApiError } from "../utils/apiErrorHandler";
import { useParams, useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  FaArrowLeft,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import eventService from "../pages/Services/eventService";
import adminReservationService from "../pages/Services/adminReservationService"; // Import the adminReservationService
import Header_SupportStaff from "../components/SupportStaff/Header_SupportStaff";
import SideBar_SupportStaff from "../components/SupportStaff/SideBar_SupportStaff";

import { InfoIcon } from "lucide-react";
import { formatImageUrl } from "../utils/imageUtils";

const SupportStaffEventDetailContainer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [claimingSlots, setClaimingSlots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Handle local image error for robust image loading
  const handleLocalImageError = (e) => {
    console.error("Image failed to load:", e.currentTarget.src);

    // Try with a modified URL if it contains '/api/uploads/'
    const originalSrc = e.currentTarget.src;
    if (originalSrc.includes("/api/uploads/")) {
      console.log("Attempting to fix image URL...");
      const fixedSrc = originalSrc.replace("/api/uploads/", "/uploads/");
      console.log("Modified URL:", fixedSrc);

      // Only change the src if it's different
      if (fixedSrc !== originalSrc) {
        e.currentTarget.src = fixedSrc;
        return; // Exit early to let the new src attempt to load
      }
    }

    // If we get here, either the URL didn't need fixing or fixing didn't help
    // Hide the broken image and show a placeholder
    e.currentTarget.style.display = "none";

    const container = e.currentTarget.parentNode;
    if (!container.querySelector(".image-placeholder")) {
      const placeholder = document.createElement("div");
      placeholder.className =
        "w-full h-full bg-[#333333] flex items-center justify-center text-white image-placeholder";
      placeholder.innerHTML = `<span class="text-center">${
        event?.eventName || "Image not available"
      }</span>`;
      container.appendChild(placeholder);
    }
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);

        // Fetch event details
        const eventResponse = await eventService.events.getById(id);

        if (eventResponse && eventResponse.data) {
          // Store original image path for debugging
          const originalImagePath = eventResponse.data.image;

          // Format the image URL correctly
          const formattedImageUrl = formatImageUrl(originalImagePath);

          // Transform event data for UI compatibility
          const eventData = {
            id: eventResponse.data.id,
            eventName: eventResponse.data.name,
            eventDescription: eventResponse.data.details,
            eventDate: eventResponse.data.event_date,
            startTime: eventResponse.data.event_time,
            endTime: eventResponse.data.event_end_time,
            venue: eventResponse.data.venue,
            eventType: eventResponse.data.event_type,
            eventCategory: eventResponse.data.category,
            imagePreview: formattedImageUrl,
            status: eventResponse.data.status,
            visibility: eventResponse.data.visibility,

            // Add availability-related fields
            display_start_date: eventResponse.data.display_start_date,
            display_end_date: eventResponse.data.display_end_date,
            display_start_time: eventResponse.data.display_start_time,
            display_end_time: eventResponse.data.display_end_time,
            reservation_start_date: eventResponse.data.reservation_start_date,
            reservation_end_date: eventResponse.data.reservation_end_date,
            reservation_start_time: eventResponse.data.reservation_start_time,
            reservation_end_time: eventResponse.data.reservation_end_time,

            // Add timestamp fields correctly
            created_at: new Date(eventResponse.data.createdAt).toLocaleString(),
            updated_at: new Date(eventResponse.data.updatedAt).toLocaleString(),
          };

          setEvent(eventData);

          // Set tickets from the API response - improved handling
          if (
            eventResponse.data.tickets &&
            Array.isArray(eventResponse.data.tickets)
          ) {
            console.log("Tickets from API:", eventResponse.data.tickets);
            setTickets(eventResponse.data.tickets);
          } else {
            console.log(
              "No tickets array found in API response. Fetching tickets separately."
            );
            // Fetch tickets separately if not included in the event response
            try {
              const ticketsResponse = await eventService.tickets.getByEventId(
                id
              );
              if (ticketsResponse && Array.isArray(ticketsResponse.data)) {
                console.log(
                  "Tickets fetched separately:",
                  ticketsResponse.data
                );
                setTickets(ticketsResponse.data);
              }
            } catch (ticketErr) {
              if (!handleApiError(ticketErr, navigate)) {
                console.error("Error fetching tickets separately:", ticketErr);
              }
            }
          }

          // Fetch claiming slots if it's a ticketed event
          if (eventResponse.data.event_type === "ticketed") {
            try {
              const claimingSlotsResponse =
                await eventService.claimingSlots.getByEventId(id);
              if (
                claimingSlotsResponse &&
                Array.isArray(claimingSlotsResponse.data)
              ) {
                setClaimingSlots(claimingSlotsResponse.data);
              }
            } catch (claimingErr) {
              if (!handleApiError(claimingErr, navigate)) {
                console.error("Error fetching claiming slots:", claimingErr);
              }
            }
          }

          // Fetch reservations using adminReservationService
          // Fetch reservations using adminReservationService
          try {
            const eventReservations =
              await adminReservationService.getReservationsByEventId(id);

            if (eventReservations.length > 0) {
              const formattedReservations = eventReservations.map(
                (reservation) => ({
                  id: reservation.reservation_id,
                  user: reservation.name || "Anonymous",
                  email: reservation.email || "N/A",
                  ticket_type:
                    reservation.seat_type ||
                    reservation.ticket_tier ||
                    "General Admission",
                  quantity: reservation.quantity || 1,
                  total_price: reservation.amount
                    ? `₱${parseFloat(reservation.amount).toFixed(2)}`
                    : "₱0.00",
                  claiming_date:
                    reservation.claiming_date || new Date().toISOString(),
                  status: reservation.claiming_status || "pending",
                  created_at: new Date(
                    reservation.created_at || Date.now()
                  ).toLocaleString(),
                })
              );

              setReservations(formattedReservations);
            } else {
              setReservations([]);
            }
          } catch (error) {
            if (!handleApiError(error, navigate)) {
              console.error("Error fetching reservations:", error);
              setReservations([]);
            }
          }
        }
      } catch (err) {
        if (!handleApiError(err, navigate)) {
          console.error("Error fetching event details:", err);
          setError("Failed to load event details. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }
  }, [id, navigate]);

  const getTicketDetails = () => {
    if (!tickets || tickets.length === 0) {
      return {
        hasTierInfo: false,
        totalTickets: 0,
      };
    }

    const totalTickets = tickets.reduce(
      (sum, ticket) => sum + ticket.total_quantity,
      0
    );

    return {
      hasTierInfo: true,
      totalTickets,
      ticketTiers: tickets.map((ticket) => ({
        seat_type: ticket.seat_type,
        ticket_type: ticket.ticket_type,
        price: ticket.price,
        total_quantity: ticket.total_quantity,
        remaining_quantity: ticket.remaining_quantity,
        max_per_user: ticket.max_per_user,
      })),
    };
  };

  // Format availability details from event data
  const getAvailabilityDetails = () => {
    if (!event) return null;

    const details = {
      displayPeriod: {
        startDate: event.display_start_date,
        endDate: event.display_end_date,
        startTime: event.display_start_time,
        endTime: event.display_end_time,
      },
    };

    if (event.eventType === "ticketed") {
      details.reservationPeriod = {
        startDate: event.reservation_start_date,
        endDate: event.reservation_end_date,
        startTime: event.reservation_start_time,
        endTime: event.reservation_end_time,
      };
    }

    return details;
  };

  // React Table configuration for reservations
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Reservation ID",
      },
      {
        accessorKey: "user",
        header: "User",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "ticket_type",
        header: "Ticket Type",
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: (info) => info.getValue().toString(),
      },
      {
        accessorKey: "total_price",
        header: "Total",
      },
      {
        accessorKey: "claiming_date",
        header: "Claiming Date",
        cell: (info) => {
          try {
            return new Date(info.getValue()).toLocaleDateString();
          } catch (err) {
            return "N/A";
          }
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold
            ${
              info.getValue() === "confirmed"
                ? "bg-green-900/30 text-green-400"
                : info.getValue() === "pending"
                ? "bg-yellow-900/30 text-yellow-400"
                : "bg-red-900/30 text-red-400"
            }`}
          >
            {info.getValue().charAt(0).toUpperCase() + info.getValue().slice(1)}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created At",
      },
    ],
    []
  );

  const table = useReactTable({
    data: reservations,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) {
    return (
      <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white font-Poppins">
        <Header_SupportStaff/>
        <div className="flex">
          <SideBar_SupportStaff />
          <div className="flex-1 px-10 py-10 flex justify-center items-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFAB40] mx-auto mb-4"></div>
              <p className="text-lg">Loading event details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white font-Poppins">
        <Header_SupportStaff/>
        <div className="flex">
          <SideBar_SupportStaff />
          <div className="flex-1 px-10 py-10">
            <button
              onClick={() => navigate("/events")}
              className="flex items-center text-[#FFAB40] mb-6"
            >
              <FaArrowLeft className="mr-2" /> Back to Events
            </button>
            <div className="bg-red-900/30 border border-red-500 rounded-md p-6 text-center">
              <p className="text-red-400 text-lg">
                {error || "Event not found"}
              </p>
              <button
                onClick={() => navigate("/events")}
                className="mt-4 bg-[#FFAB40] text-black px-4 py-2 rounded-md"
              >
                Return to Events
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate event type and ticket details
  const eventType = event.eventType || "ticketed";
  const ticketInfo = getTicketDetails();
  const availabilityDetails = getAvailabilityDetails();

  // Debug logs
  console.log("Event Type:", eventType);
  console.log("Tickets:", tickets);
  console.log("Ticket Info:", ticketInfo);
  console.log("Reservations:", reservations);

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white font-Poppins">
      <Header_SupportStaff />
      <div className="flex">
        <Sidebar_Admin />
        <div className="flex-1 px-10 py-8 overflow-y-auto">
          {/* Back button and actions */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate("/events")}
              className="flex items-center text-[#FFAB40]"
            >
              <FaArrowLeft className="mr-2" /> Back to Events
            </button>
          </div>

          {/* Event Details Section */}
          <div className="space-y-6 mb-10">
            <div className="flex justify-end items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold 
                  ${
                    event.status === "open"
                      ? "bg-green-900/30 text-green-400"
                      : event.status === "scheduled"
                      ? "bg-yellow-900/30 text-yellow-400"
                      : event.status === "draft"
                      ? "bg-blue-900/30 text-blue-400"
                      : "bg-gray-900/30 text-gray-400"
                  }`}
              >
                {event.status.toUpperCase()}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold 
                  ${
                    event.visibility === "published"
                      ? "bg-green-900/30 text-green-400"
                      : "bg-gray-900/30 text-gray-400"
                  }`}
              >
                {event.visibility.toUpperCase()}
              </span>
            </div>

            <hr className="border-t border-gray-600" />

            {/* Event Information */}
            <div>
              <div className="bg-[#1E1E1E] rounded-lg p-4 border border-gray-800">
                <div className="flex gap-4">
                  <div className="w-1/3">
                    {event.imagePreview ? (
                      <div className="relative">
                        <img
                          src={event.imagePreview}
                          alt={event.eventName}
                          className="w-full aspect-video object-cover rounded-lg"
                          onError={handleLocalImageError}
                        />
                        {eventType === "coming_soon" && (
                          <div className="absolute top-2 left-2 bg-[#FFAB40] text-black px-2 py-1 rounded-md text-xs font-semibold">
                            COMING SOON
                          </div>
                        )}
                        {eventType === "free" && (
                          <div className="absolute top-2 left-2 bg-[#FFAB40] text-black px-2 py-1 rounded-md text-xs font-semibold">
                            FREE
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full aspect-video bg-[#333333] rounded-lg flex items-center justify-center relative">
                        <span className="text-gray-500 text-sm">No Image</span>
                        {eventType === "coming_soon" && (
                          <div className="absolute top-2 left-2 bg-[#FFAB40] text-black px-2 py-1 rounded-md text-xs font-semibold">
                            COMING SOON
                          </div>
                        )}
                        {eventType === "free" && (
                          <div className="absolute top-2 left-2 bg-[#FFAB40] text-black px-2 py-1 rounded-md text-xs font-semibold">
                            FREE
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="w-2/3 space-y-2">
                    <div className="bg-custom_yellow rounded-full p-1 pl-3 pr-3 w-fit mb-5">
                      <p className="text-custom_black text-lg font-bold">
                        {event.eventName || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-white text-sm font-semibold">
                        EVENT DETAILS:
                      </p>
                      <p className="text-white text-sm font-light line-clamp-2 mb-4">
                        {event.eventDescription || "No description provided."}
                      </p>
                    </div>
                    <hr className="border-t border-gray-600" />

                    <div className="flex">
                      <p className="text-white text-sm font-semibold">Venue:</p>
                      <p className="text-white text-sm font-light ml-2">
                        {event.venue || "N/A"}
                        {eventType === "coming_soon" && (
                          <span className="text-[#FFAB40] ml-2 text-xs">
                            (Tentative)
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex">
                      <p className="text-white text-sm font-semibold">
                        Date & Time:
                      </p>
                      <p className="text-white text-sm font-light ml-2">
                        {event.eventDate
                          ? new Date(event.eventDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                        {event.startTime &&
                          ` at ${new Date(
                            `1970-01-01T${event.startTime}`
                          ).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}${
                            event.endTime
                              ? ` to ${new Date(
                                  `1970-01-01T${event.endTime}`
                                ).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}`
                              : ""
                          }`}
                        {eventType === "coming_soon" && (
                          <span className="text-[#FFAB40] ml-2 text-xs">
                            (Tentative)
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex">
                      <p className="text-white text-sm font-semibold">
                        Category:
                      </p>
                      <p className="text-white text-sm font-light ml-2">
                        {event.eventCategory || "N/A"}
                      </p>
                    </div>

                    <div className="flex">
                      <p className="text-white text-sm font-semibold">
                        Event Type:
                      </p>
                      <p className="text-white text-sm font-light ml-2">
                        {eventType === "ticketed" && "Ticketed Event"}
                        {eventType === "coming_soon" && "Coming Soon Event"}
                        {eventType === "free" && "Free Event"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            {(eventType === "ticketed" ||
              eventType === "free" ||
              (eventType === "coming_soon" && ticketInfo.hasTierInfo)) && (
              <div>
                <h3 className="text-white text-base font-semibold mb-2">
                  TICKETS
                </h3>
                <div className="bg-[#1E1E1E] rounded-lg p-4 border border-gray-800">
                  {eventType === "free" && (
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="mr-3 text-[#FFAB40]">
                          <InfoIcon className="h-8 w-8" />
                        </div>
                        <div>
                          <span className="text-white font-semibold">
                            Free Event
                          </span>
                          <p className="text-gray-400 text-sm">
                            This is a free event. All tickets are available at
                            no cost.
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Total tickets: {ticketInfo.totalTickets}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {eventType === "coming_soon" && !ticketInfo.hasTierInfo && (
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="mr-3 text-[#FFAB40]">
                          <InfoIcon className="h-8 w-8" />
                        </div>
                        <div>
                          <span className="text-white font-semibold">
                            Coming Soon
                          </span>
                          <p className="text-gray-400 text-sm">
                            Ticket details will be available when this event is
                            fully published.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Display ticket tiers */}
                  {ticketInfo.hasTierInfo && (
                    <div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[#FFAB40] text-custom_black">
                            <tr>
                              <th className="py-2 px-3 text-left text-sm ">
                                Tier
                              </th>
                              <th className="py-2 px-3 text-left text-sm ">
                                Type
                              </th>
                              <th className="py-2 px-3 text-left text-sm ">
                                Price
                              </th>
                              <th className="py-2 px-3 text-left text-sm ">
                                Total
                              </th>
                              <th className="py-2 px-3 text-left text-sm ">
                                Available
                              </th>
                              <th className="py-2 px-3 text-left text-sm ">
                                Max Per User
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {tickets.length > 0 ? (
                              tickets.map((ticket, index) => (
                                <tr
                                  key={index}
                                  className="border-t border-[#333333]"
                                >
                                  <td className="py-2 px-3 text-sm text-white">
                                    {ticket.seat_type || "Standard"}
                                  </td>
                                  <td className="py-2 px-3 text-sm text-white">
                                    {ticket.ticket_type || "General"}
                                  </td>
                                  <td className="py-2 px-3 text-sm text-white">
                                    ₱{parseFloat(ticket.price || 0).toFixed(2)}
                                  </td>
                                  <td className="py-2 px-3 text-sm text-white">
                                    {ticket.total_quantity || 0}
                                  </td>
                                  <td className="py-2 px-3 text-sm text-white">
                                    {ticket.remaining_quantity || 0}
                                  </td>
                                  <td className="py-2 px-3 text-sm text-white">
                                    {ticket.max_per_user || 1}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr className="border-t border-[#333333]">
                                <td
                                  colSpan="6"
                                  className="py-4 text-center text-gray-400"
                                >
                                  No ticket information available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 border-t border-gray-700 pt-4">
                        <p className="uppercase text-white font-medium">
                          TOTAL NUMBER OF TICKETS:{" "}
                          <span className="text-[#FFAB40]">
                            {ticketInfo.totalTickets}{" "}
                            {eventType === "coming_soon"
                              ? "Planned"
                              : "Available"}{" "}
                            Tickets
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Claiming Details - only for ticketed events */}
            {eventType === "ticketed" &&
              claimingSlots &&
              claimingSlots.length > 0 && (
                <div>
                  <h3 className="text-white text-base font-semibold mb-2">
                    SUMMARY OF CLAIMING DETAILS
                  </h3>
                  <div className=" rounded-lg p-4 border border-gray-800">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#FFAB40]">
                          <tr>
                            <th className="py-2 px-3 text-left text-sm text-custom_black">
                              Date
                            </th>
                            <th className="py-2 px-3 text-left text-sm text-custom_black">
                              Time
                            </th>
                            <th className="py-2 px-3 text-left text-sm text-custom_black">
                              Venue
                            </th>
                            <th className="py-2 px-3 text-left text-sm text-custom_black">
                              Max Claimers
                            </th>
                            <th className="py-2 px-3 text-left text-sm text-custom_black">
                              Current Claimers
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {claimingSlots.map((slot, index) => (
                            <tr
                              key={index}
                              className="border-t border-[#333333]"
                            >
                              <td className="py-2 px-3 text-sm text-white">
                                {new Date(
                                  slot.claiming_date
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </td>
                              <td className="py-2 px-3 text-sm text-white">
                                {new Date(
                                  `1970-01-01T${slot.start_time}`
                                ).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}{" "}
                                to{" "}
                                {new Date(
                                  `1970-01-01T${slot.end_time}`
                                ).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td className="py-2 px-3 text-sm text-white">
                                {slot.venue}
                              </td>
                              <td className="py-2 px-3 text-sm text-white">
                                {slot.max_claimers}
                              </td>
                              <td className="py-2 px-3 text-sm text-white">
                                {slot.current_claimers || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            {/* Availability Details */}
            {availabilityDetails && (
              <div>
                <h3 className="text-[#FFAB40] text-xl font-semibold mb-2">
                  AVAILABILITY PERIOD
                </h3>
                <div className="bg-[#1E1E1E] rounded-lg p-4 border border-gray-800">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[#FFAB40] font-medium mb-2">
                        Display Period:
                      </h4>
                      <div className="text-white space-y-1">
                        <p>
                          <span className="text-[#B8B8B8] text-sm">
                            Start Date:
                          </span>{" "}
                          {availabilityDetails.displayPeriod?.startDate
                            ? new Date(
                                availabilityDetails.displayPeriod.startDate
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Not set"}
                        </p>
                        <p>
                          <span className="text-[#B8B8B8] text-sm">
                            Start Time:
                          </span>{" "}
                          {availabilityDetails.displayPeriod?.startTime
                            ? new Date(
                                `1970-01-01T${availabilityDetails.displayPeriod.startTime}`
                              ).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })
                            : "Not set"}
                        </p>
                        <p>
                          <span className="text-[#B8B8B8] text-sm">
                            End Date:
                          </span>{" "}
                          {availabilityDetails.displayPeriod?.endDate
                            ? new Date(
                                availabilityDetails.displayPeriod.endDate
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Not set"}
                        </p>
                        <p>
                          <span className="text-[#B8B8B8] text-sm">
                            End Time:
                          </span>{" "}
                          {availabilityDetails.displayPeriod?.endTime
                            ? new Date(
                                `1970-01-01T${availabilityDetails.displayPeriod.endTime}`
                              ).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })
                            : "Not set"}
                        </p>
                      </div>
                    </div>

                    {eventType === "ticketed" &&
                      availabilityDetails.reservationPeriod && (
                        <div>
                          <h4 className="text-[#FFAB40] font-medium mb-2">
                            Reservation Period:
                          </h4>
                          <div className="text-white space-y-1">
                            <p>
                              <span className="text-[#B8B8B8] text-sm">
                                Start Date:
                              </span>{" "}
                              {availabilityDetails.reservationPeriod?.startDate
                                ? new Date(
                                    availabilityDetails.reservationPeriod.startDate
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : "Not set"}
                            </p>
                            <p>
                              <span className="text-[#B8B8B8] text-sm">
                                Start Time:
                              </span>{" "}
                              {availabilityDetails.reservationPeriod?.startTime
                                ? new Date(
                                    `1970-01-01T${availabilityDetails.reservationPeriod.startTime}`
                                  ).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })
                                : "Not set"}
                            </p>
                            <p>
                              <span className="text-[#B8B8B8] text-sm">
                                End Date:
                              </span>{" "}
                              {availabilityDetails.reservationPeriod?.endDate
                                ? new Date(
                                    availabilityDetails.reservationPeriod.endDate
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : "Not set"}
                            </p>
                            <p>
                              <span className="text-[#B8B8B8] text-sm">
                                End Time:
                              </span>{" "}
                              {availabilityDetails.reservationPeriod?.endTime
                                ? new Date(
                                    `1970-01-01T${availabilityDetails.reservationPeriod.endTime}`
                                  ).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })
                                : "Not set"}
                            </p>
                          </div>
                        </div>
                      )}

                    {eventType === "free" && (
                      <div>
                        <h4 className="text-[#FFAB40] font-medium mb-2">
                          Reservation Period:
                        </h4>
                        <div className="text-[#B8B8B8] italic">
                          <p>No reservation period for free events</p>
                          <p className="mt-2 text-sm">
                            Free events don't require users to make
                            reservations.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {eventType === "coming_soon" && (
                    <div className="mt-4 pt-3 border-t border-gray-600 text-[#B8B8B8] text-sm">
                      <p>
                        Note: Reservation period will be set when this "Coming
                        Soon" event is fully published.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Event Status */}
            <div>
              <h3 className="text-[#FFAB40] text-xl font-semibold mb-2">
                EVENT STATUS
              </h3>
              <div className="bg-[#1E1E1E] rounded-lg p-4 border border-gray-800">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full 
                    ${
                      event.status === "open"
                        ? "bg-green-500"
                        : event.status === "scheduled"
                        ? "bg-yellow-500"
                        : event.status === "cancelled"
                        ? "bg-red-500"
                        : event.status === "draft"
                        ? "bg-blue-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  <span className="text-white">
                    {event.status.toUpperCase()}
                  </span>
                </div>
                <div className="mt-4 text-sm">
                  <p className="text-white">
                    <span className="text-[#B8B8B8]">Visibility:</span>{" "}
                    {event.visibility}
                  </p>
                  <p className="text-white">
                    <span className="text-[#B8B8B8]">Type:</span>{" "}
                    {event.eventType}
                  </p>
                  <p className="text-white">
                    <span className="text-[#B8B8B8]">Created:</span>{" "}
                    {event.created_at
                      ? `${new Date(event.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                          }
                        )} at ${new Date(event.created_at).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}`
                      : "N/A"}
                  </p>
                  <p className="text-white">
                    <span className="text-[#B8B8B8]">Last Updated:</span>{" "}
                    {event.updated_at
                      ? `${new Date(event.updated_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                          }
                        )} at ${new Date(event.updated_at).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Reservations Section */}
            <div>
              <h3 className="text-[#FFAB40] text-xl font-semibold mb-2">
                RESERVATIONS
              </h3>

              {/* Search and Filter */}
              <div className="flex justify-between items-center mb-2">
                <div className="relative w-1/4">
                  <FaSearch className="absolute left-3 top-2 text-gray-400" />
                  <input
                    value={globalFilter || ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Search"
                    className="pl-8 pr-2 py-1 w-full rounded-full bg-neutral-300 text-custom_black outline-none border border-gray-700"
                  />
                </div>
                <div>
                  <select
                    className="px-4 py-2 rounded bg-[#2C2C2C] text-white outline-none border border-gray-700"
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                      table.setPageSize(Number(e.target.value));
                    }}
                  >
                    {[5, 10, 20, 30, 50].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        Show {pageSize}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-[#1E1E1E] rounded-lg p-4 border border-gray-800 overflow-x-auto">
                {reservations.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-custom_yellow text-custom_black">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              colSpan={header.colSpan}
                              className="py-3 px-4 text-left text-sm font-semibold border-b border-gray-700"
                            >
                              {header.isPlaceholder ? null : (
                                <div
                                  {...{
                                    className: header.column.getCanSort()
                                      ? "cursor-pointer select-none flex items-center"
                                      : "",
                                    onClick:
                                      header.column.getToggleSortingHandler(),
                                  }}
                                >
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                  <span className="ml-1">
                                    {{
                                      asc: <FaSortUp className="inline" />,
                                      desc: <FaSortDown className="inline" />,
                                    }[header.column.getIsSorted()] ??
                                      (header.column.getCanSort() ? (
                                        <FaSort className="inline opacity-30" />
                                      ) : null)}
                                  </span>
                                </div>
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
                          className="border-b border-gray-800 hover:bg-[#2A2A2A]"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="py-3 px-4 text-sm">
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
                ) : (
                  <div className="text-center py-8 text-[#B8B8B8]">
                    <p className="text-lg mb-2">No reservations found</p>
                    <p className="text-sm">
                      {eventType === "ticketed"
                        ? "No one has reserved tickets for this event yet."
                        : eventType === "free"
                        ? "Free events don't require reservations."
                        : "Reservations will be available when this event is published."}
                    </p>
                  </div>
                )}

                {/* Pagination - Only show if there are reservations */}
                {reservations.length > 0 && (
                  <div className="pagination flex items-center justify-between mt-4 text-sm">
                    <div>
                      Showing {table.getRowModel().rows.length} of{" "}
                      {reservations.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        className={`px-3 py-1 rounded ${
                          !table.getCanPreviousPage()
                            ? "bg-gray-700 text-gray-500"
                            : "bg-[#2C2C2C] text-white hover:bg-[#FFAB40] hover:text-black"
                        }`}
                      >
                        {"<<"}
                      </button>
                      <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className={`px-3 py-1 rounded ${
                          !table.getCanPreviousPage()
                            ? "bg-gray-700 text-gray-500"
                            : "bg-[#2C2C2C] text-white hover:bg-[#FFAB40] hover:text-black"
                        }`}
                      >
                        {"<"}
                      </button>
                      <span>
                        Page{" "}
                        <strong>
                          {table.getState().pagination.pageIndex + 1} of{" "}
                          {table.getPageCount()}
                        </strong>
                      </span>
                      <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className={`px-3 py-1 rounded ${
                          !table.getCanNextPage()
                            ? "bg-gray-700 text-gray-500"
                            : "bg-[#2C2C2C] text-white hover:bg-[#FFAB40] hover:text-black"
                        }`}
                      >
                        {">"}
                      </button>
                      <button
                        onClick={() =>
                          table.setPageIndex(table.getPageCount() - 1)
                        }
                        disabled={!table.getCanNextPage()}
                        className={`px-3 py-1 rounded ${
                          !table.getCanNextPage()
                            ? "bg-gray-700 text-gray-500"
                            : "bg-[#2C2C2C] text-white hover:bg-[#FFAB40] hover:text-black"
                        }`}
                      >
                        {">>"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportStaffEventDetailContainer;

