import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Header_SupportStaff from "../../components/SupportStaff/Header_SupportStaff";
import SideBar_SupportStaff from "../../components/SupportStaff/SideBar_SupportStaff";
import axios from "axios";

const SupportStaff_Dashboard = () => {
  const token = sessionStorage.getItem("authToken");
  const [ticketedEvents, setTicketedEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventStatusData, setEventStatusData] = useState([]);

  const fetchTicketedEvents = async () => {
    console.log("Fetching Ticketed Events..."); // Debug log
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/ticketed-events`, // Updated URL
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Ticketed Events Response:", response.data); // Debug log

      if (response.data.success) {
        const events = response.data.data
          .filter((event) => event.Tickets && event.Tickets.length > 0)
          .map((event) => ({
            id: event.id,
            name: event.name,
            ticketCount: event.Tickets ? event.Tickets.length : 0,
          }));
        console.log("Processed Ticketed Events:", events); // Debug log
        setTicketedEvents(events); // Update state
      } else {
        console.error(
          "Failed to fetch ticketed events:",
          response.data.message
        );
      }
    } catch (error) {
      console.error("Error fetching ticketed events:", error);
    }
  };

  const fetchEventClaimingStatus = async (eventId) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/admin/event-claiming-status/${eventId}`, // Updated URL
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        const { claimed, pending } = response.data.data;
        const data = [
          { name: "Claimed", value: claimed, color: "#FFA500" },
          { name: "Pending", value: pending, color: "#FF8C00" },
        ];
        console.log("Event Status Data:", data); // Debug log
        setEventStatusData(data);
      }
    } catch (error) {
      console.error("Error fetching event claiming status:", error);
    }
  };

  useEffect(() => {
    console.log("Ticketed Events:", ticketedEvents); // Debug log
    fetchTicketedEvents();
  }, []);

  useEffect(() => {
    console.log("Updated Ticketed Events State:", ticketedEvents); // Debug log
  }, [ticketedEvents]);

  useEffect(() => {
    console.log("Selected Event ID:", selectedEventId); // Debug log
    if (selectedEventId) {
      fetchEventClaimingStatus(selectedEventId);
    }
  }, [selectedEventId]);

  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    userChange: 0,
    totalReservations: 0,
    reservationChange: 0,
    totalEvents: 0,
    eventChange: 0,
    completedEvents: 0,
    completedEventChange: 0,
    activeEvents: 0, // Added active events
  });

  const [upcomingEvents, setUpcomingEvents] = useState([]); // State for upcoming events
  const [recentReservations, setRecentReservations] = useState([]); // State for recent reservations
  const [loadingEvents, setLoadingEvents] = useState(true); // Loading state for events
  const [loadingReservations, setLoadingReservations] = useState(true); // Loading state for reservations
  const [errorEvents, setErrorEvents] = useState(null); // Error state for events
  const [errorReservations, setErrorReservations] = useState(null); // Error state for reservations

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/dashboard/metrics`, // Updated URL
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setMetrics(response.data.data);
        } else {
          console.error("Failed to fetch metrics:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    const fetchUpcomingEvents = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/upcoming-events`, // Updated URL
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setUpcomingEvents(response.data.data); // Set the upcoming events from the response
        } else {
          console.error(
            "Failed to fetch upcoming events:",
            response.data.message
          );
          setErrorEvents("Failed to fetch upcoming events.");
        }
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
        setErrorEvents("Error fetching upcoming events.");
      } finally {
        setLoadingEvents(false); // Set loading to false after fetching
      }
    };

    const fetchRecentReservations = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/recent-reservations`, // Updated URL
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setRecentReservations(response.data.data); // Set the recent reservations from the response
        } else {
          console.error(
            "Failed to fetch recent reservations:",
            response.data.message
          );
          setErrorReservations("Failed to fetch recent reservations.");
        }
      } catch (error) {
        console.error("Error fetching recent reservations:", error);
        setErrorReservations("Error fetching recent reservations.");
      } finally {
        setLoadingReservations(false); // Set loading to false after fetching
      }
    };

    fetchMetrics();
    fetchUpcomingEvents();
    fetchRecentReservations();
  }, []);

  return (
    <div className="bg-[#272727] main-content font-Poppins">
      {/* Header */}
      <Header_SupportStaff />

      {/* Main Content Wrapper */}
      <div className="flex flex-1 ">
        {/* Sidebar - Fixed Position */}
        <SideBar_SupportStaff />

        {/* Main Content - Adjusted Layout */}
        <div className="flex-1 p-6">
          {/* Top Section: Metrics & Notifications */}
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[
              {
                title: "Total Users",
                value: metrics.totalUsers,
                description: "Total registered users",
              },
              {
                title: "Total Reservations",
                value: metrics.totalReservations,
                description: "Total reservations made",
              },
              {
                title: "Total Events",
                value: metrics.totalEvents,
                description: "Total events created",
              },
              {
                title: "Active Events",
                value: metrics.activeEvents, // Display active events
                description: "Currently open or scheduled events",
              },
            ].map((metric, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-[#FFAB40] to-[#FFCF91] p-4 text-center shadow-lg rounded-xl flex flex-col justify-center h-32 w-full"
              >
                <h3 className="text-lg font-semibold text-black mb-1">
                  {metric.title}
                </h3>
                <span className="text-4xl font-bold text-black">
                  {metric.value}
                </span>
                <p className="text-sm text-black mt-1">{metric.description}</p>
              </div>
            ))}
          </div>
          {/* Middle Section: Upcoming Events & Event Status */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* Upcoming Events */}
            <div className="bg-[#333] p-5 shadow-md rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3">
                Upcoming Events
              </h3>
              {loadingEvents ? (
                <p className="text-white">Loading...</p>
              ) : errorEvents ? (
                <p className="text-red-500">{errorEvents}</p>
              ) : upcomingEvents.length === 0 ? (
                <p className="text-white">No upcoming events found.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-500 bg-[#FFAB40] text-black">
                      <th className="py-2">Event Name</th>
                      <th>Date</th>
                      <th>Venue</th>
                      <th>Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingEvents.map((event, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-600 text-gray-300"
                      >
                        <td className="py-2">{event.name}</td>
                        <td>
                          {new Date(event.event_date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td>{event.venue}</td>
                        <td>{event.status || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Event Status */}
            <div className="bg-[#333] p-5 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-white mb-3">
                TICKET CLAIMING STATUS
              </h3>
              <div className="bg-white rounded-lg px-4 py-2 mb-4">
                <select
                  className="w-full bg-transparent outline-none text-black cursor-pointer"
                  onChange={(e) => {
                    const eventId = e.target.value;
                    console.log("Selected Event ID:", eventId); // Debug log
                    setSelectedEventId(eventId);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    {ticketedEvents.length === 0
                      ? "No ticketed events available"
                      : "Select an Event"}
                  </option>
                  {ticketedEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} ({event.ticketCount} tickets)
                    </option>
                  ))}
                </select>
              </div>
              {eventStatusData.length > 0 &&
              eventStatusData.some((data) => data.value > 0) ? (
                <div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={eventStatusData}
                        dataKey="value"
                        outerRadius={80}
                        innerRadius={50}
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={true}
                        stroke="black"
                        strokeWidth={2}
                      >
                        {eventStatusData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center mt-4 space-x-6">
                    {eventStatusData.map((entry, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className="w-4 h-4 mr-2"
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-white">
                          {entry.name}: {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-white text-center mt-4">
                  No data available for this event.
                </p>
              )}
            </div>
          </div>
          {/* Bottom Section: Recent Reservations */}
          <div className="mt-6">
            <div className="bg-[#333] p-5 shadow-md rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3">
                Recent Reservations
              </h3>
              {loadingReservations ? (
                <p className="text-white">Loading...</p>
              ) : errorReservations ? (
                <p className="text-red-500">{errorReservations}</p>
              ) : recentReservations.length === 0 ? (
                <p className="text-white">No recent reservations found.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-500 bg-[#FFAB40] text-black">
                      <th>Reservation ID</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Event</th>
                      <th>Seat Type</th>
                      <th>Claim Date</th>
                      <th>Time</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReservations.map((res, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-600 text-gray-300"
                      >
                        <td className="py-2">{res.reservation_id || "N/A"}</td>
                        <td>
                          {res.User
                            ? `${res.User.first_name || ""} ${
                                res.User.last_name || ""
                              }`.trim()
                            : "Unknown User"}
                        </td>
                        <td>{res.User?.role || "Unknown Role"}</td>
                        <td>{res.Event?.name || "Unknown Event"}</td>
                        <td>{res.Ticket?.seat_type || "N/A"}</td>
                        <td>
                          {res.ClaimingSlot?.claiming_date
                            ? new Date(
                                res.ClaimingSlot.claiming_date
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </td>
                        <td>
                          {res.ClaimingSlot?.start_time
                            ? new Date(
                                `1970-01-01T${res.ClaimingSlot.start_time}Z`
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "N/A"}{" "}
                          -{" "}
                          {res.ClaimingSlot?.end_time
                            ? new Date(
                                `1970-01-01T${res.ClaimingSlot.end_time}Z`
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "N/A"}
                        </td>
                        <td>{res.Ticket?.price || "N/A"}</td>
                        <td>
                          <span
                            className={`${
                              res.reservation_status === "claimed"
                                ? "text-green-500"
                                : res.status === "pending"
                                ? "text-blue-500"
                                : res.status === "unclaimed"
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            {res.reservation_status || "N/A"}
                          </span>
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

export default SupportStaff_Dashboard;
