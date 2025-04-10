import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import Header_SupportStaff from "../../components/SupportStaff/Header_SupportStaff";
import SideBar_SupportStaff from "../../components/SupportStaff/SideBar_SupportStaff";
import EventCard from "../../components/Admin/Admin_EventCard";

const SupportStaff_EventsManagement = ({
  events,
  loading,
  initialized,
  error,
  onRefreshEvents,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("published");
  const [searchTerm, setSearchTerm] = useState("");

  // Validate events prop
  const defaultEvents = {
    OPEN: [],
    SCHEDULED: [],
    "COMING SOON": [],
    COMPLETED: [],
    DRAFT: [],
    UNPUBLISHED: [],
    ARCHIVED: [],
  };

  const currentEvents = events || defaultEvents;

  // Filter events by search term
  const filterEventsBySearchTerm = (eventsObject) => {
    if (!searchTerm) return eventsObject;

    const result = {};

    Object.keys(eventsObject).forEach((category) => {
      result[category] = eventsObject[category].filter(
        (event) =>
          event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.venue &&
            event.venue.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (event.eventCategory &&
            event.eventCategory
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    });

    return result;
  };

  // Get events for the active tab
  const getEventsByTab = () => {
    switch (activeTab) {
      case "published":
        return {
          OPEN: currentEvents.OPEN || [],
          SCHEDULED: currentEvents.SCHEDULED || [],
          "COMING SOON": currentEvents["COMING SOON"] || [],
          COMPLETED: currentEvents.COMPLETED || [],
        };
      case "unpublished":
        return {
          DRAFT: currentEvents.DRAFT || [],
          UNPUBLISHED: currentEvents.UNPUBLISHED || [],
        };
      case "archived":
        return {
          ARCHIVED: currentEvents.ARCHIVED || [],
        };
      default:
        return currentEvents;
    }
  };

  // Filtered events
  const filteredEvents = filterEventsBySearchTerm(getEventsByTab());

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // View event details
  const handleViewEventDetails = (eventId) => {
    navigate(`/support-staff-events/detail/${eventId}`);
  };

  if (loading && !initialized) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white font-Poppins">
      {/* Header */}
      <Header_SupportStaff />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <SideBar_SupportStaff />

        {/* Main Content Wrapper */}
        <div className="flex-1 px-10 py-10 w-screen overflow-hidden">
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-6 gap-4">
            {/* Search Box */}
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-3 text-black" />
              <input
                type="text"
                placeholder="Search events"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-12 py-2 w-full rounded-full bg-white text-black outline-none"
              />
            </div>

            {/* Refresh Button */}
            <button
              className="px-4 py-2 bg-[#FFAB40] text-black rounded-md hover:bg-[#FFC661] transition duration-300 flex items-center"
              onClick={onRefreshEvents}
              title="Refresh event statuses"
              disabled={loading}
            >
              <FaSyncAlt
                className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Event Tabs */}
          <div className="flex border-b border-gray-600 mb-6">
            {["published", "unpublished"].map((tab) => (
              <button
                key={tab}
                className={`py-3 px-6 font-semibold transition-colors ${
                  activeTab === tab
                    ? "text-[#FFAB40] border-b-2 border-[#FFAB40]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Event Sections for the active tab */}
          {Object.keys(filteredEvents).map((category) => (
            <div key={category} className="mb-10">
              <h3 className="text-lg font-bold border-b border-gray-600 pb-2 mb-4">
                {category}
              </h3>

              {filteredEvents[category].length > 0 ? (
                <div className="relative group overflow-hidden">
                  <div
                    id={`event-container-${category}`}
                    className="flex gap-6 overflow-x-auto pb-6 pt-2 px-2"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      scrollBehavior: "smooth",
                      WebkitOverflowScrolling: "touch",
                      maxWidth: "100%",
                    }}
                  >
                    {filteredEvents[category].map((event) => (
                      <div key={event.id} className="flex-shrink-0">
                        <div className="flex flex-col">
                          <EventCard
                            key={event.id}
                            event={event}
                            onViewDetails={handleViewEventDetails}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="min-h-[100px] text-gray-400 flex items-center justify-center">
                  No events available
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportStaff_EventsManagement;
