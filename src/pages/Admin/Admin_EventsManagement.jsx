import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaClock } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Admin_EventManagementFilter from "./Admin_EventsManagementFilter";
import Header_Admin from "../../components/Admin/Header_Admin";
import Sidebar_Admin from "../../components/Admin/SideBar_Admin";
import EventCard from "../../components/Admin/Admin_EventCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Import popup components
import EditEventDetailsPopup from "../../components/Admin/Popups/EditEventDetailsPopup";
import EditTicketDetailsPopup from "../../components/Admin/Popups/EditTicketDetailsPopup";
import EditClaimingDetailsPopup from "../../components/Admin/Popups/EditClaimingDetailsPopup";
import EditAvailabilityDetailsPopup from "../../components/Admin/Popups/EditAvailabilityDetailsPopup";
import DeleteConfirmationPopup from "../../components/Admin/Popups/DeleteConfirmationPopup";
import UnpublishConfirmationPopup from "../../components/Admin/Popups/UnpublishConfirmationPopup";

const LoadingStateDisplay = () => {
  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white font-Poppins">
      <Header_Admin />
      <div className="flex">
        <Sidebar_Admin />
        <div className="flex-1 px-10 py-10">
          {/* Loading indicator */}
          <div className="flex justify-between items-center mb-6 gap-4">
            {/* Placeholder for search box */}
            <div className="relative flex-grow h-10 bg-gray-800 animate-pulse rounded-full"></div>

            {/* Placeholder for buttons */}
            <div className="flex gap-2">
              <div className="w-24 h-10 bg-gray-800 animate-pulse rounded-md"></div>
              <div className="w-28 h-10 bg-gray-800 animate-pulse rounded-md"></div>
            </div>
          </div>

          {/* Placeholder for tabs */}
          <div className="flex border-b border-gray-600 mb-6 gap-4">
            <div className="w-32 h-10 bg-gray-800 animate-pulse rounded-md"></div>
            <div className="w-32 h-10 bg-gray-800 animate-pulse rounded-md"></div>
            <div className="w-32 h-10 bg-gray-800 animate-pulse rounded-md"></div>
          </div>

          {/* Placeholder for add event button */}
          <div className="mb-10">
            <div className="h-6 w-32 bg-gray-800 animate-pulse rounded mb-4"></div>
            <div className="w-[173px] h-[205px] bg-gray-800 animate-pulse rounded-lg"></div>
          </div>

          {/* Placeholder for event sections */}
          {[1, 2, 3].map((section) => (
            <div key={section} className="mb-10">
              <div className="h-6 w-48 bg-gray-800 animate-pulse rounded mb-4"></div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[1, 2, 3, 4].map((card) => (
                  <div
                    key={card}
                    className="w-[173px] h-[205px] bg-gray-800 animate-pulse rounded-lg"
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const isRecentlyUpdated = (event) => {
  if (!event.statusUpdatedAt) return false;

  const updatedAt = new Date(event.statusUpdatedAt);
  const now = new Date();
  const diffMs = now - updatedAt;
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes <= 30; // Within last 30 minutes
};

// Format a time as "X minutes/hours ago"
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  }
};

// Function to check if an event has a future display date
const isFutureScheduledEvent = (event) => {
  if (
    event.status === "scheduled" &&
    event.visibility === "unpublished" &&
    event.display_start_date &&
    event.display_start_time
  ) {
    const now = new Date();
    const displayStartDate = new Date(
      `${event.display_start_date}T${event.display_start_time}`
    );
    return displayStartDate > now;
  }
  return false;
};

// Function to format the display date in a readable way
const formatDisplayDate = (event) => {
  if (event.display_start_date && event.display_start_time) {
    const displayStartDate = new Date(
      `${event.display_start_date}T${event.display_start_time}`
    );
    return displayStartDate.toLocaleString();
  }
  return "Unknown";
};

// Function to calculate time remaining until display
const calculateTimeUntilDisplay = (event) => {
  if (event.display_start_date && event.display_start_time) {
    const displayStartDate = new Date(
      `${event.display_start_date}T${event.display_start_time}`
    );
    const now = new Date();
    const diffMs = displayStartDate - now;

    if (diffMs <= 0) return "Now";

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    } else {
      return `${diffHours}h`;
    }
  }
  return "Unknown";
};

const AddEventButton = ({ onAddEvent }) => {
  return (
    <div className="mb-10">
      <h3 className="text-lg font-bold mb-4">ADD EVENT</h3>
      <div>
        <button
          onClick={onAddEvent}
          className="w-[173px] h-[205px] flex flex-col items-center justify-center bg-[#FFA500] text-black rounded-lg shadow-md hover:bg-[#F59E00] transition-colors"
        >
          <span className="text-4xl text-white">+</span>
        </button>
      </div>
    </div>
  );
};

const EventTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "published", label: "PUBLISHED" },
    { id: "unpublished", label: "UNPUBLISHED" },
    { id: "archived", label: "ARCHIVED" },
  ];

  return (
    <div className="flex border-b border-gray-600 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`py-3 px-6 font-semibold transition-colors ${
            activeTab === tab.id
              ? "text-[#FFAB40] border-b-2 border-[#FFAB40]"
              : "text-gray-400 hover:text-gray-200"
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

const Admin_EventsManagement = ({
  events,
  loading,
  initialized,
  error,
  onAddEvent,
  onEditEvent,
  onSaveEvent,
  onDeleteEvent,
  onUnpublishEvent,
  onPublishNow,
  onOpenReservation,
  onCloseReservation,
  findEventById,
  onNavigateToEdit,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("published");
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    eventCategory: "",
  });

  // State to control which popup is visible
  const [activePopup, setActivePopup] = useState(null);
  // State to track the ID of the selected event
  const [selectedEventId, setSelectedEventId] = useState(null);
  // State to track which type of edit is being performed
  const [editType, setEditType] = useState(null);
  // State to store the selected event data
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handlePublishNow = async (eventId) => {
    console.log(`Publishing event ${eventId} immediately`);
    const success = await onPublishNow(eventId);
    if (success) {
      // Optional: Show success message or notification
      alert("Event has been published successfully!");
    }
  };

  // Function to get events based on active tab
  const getEventsByTab = () => {
    switch (activeTab) {
      case "published":
        return {
          PUBLISHED: events.OPEN || [],
          SCHEDULED: events.SCHEDULED || [],
          "COMING SOON": events["COMING SOON"] || [],
          COMPLETED:
            events.COMPLETED.filter(
              (event) => event.visibility === "published"
            ) || [],
        };
      case "unpublished":
        return {
          DRAFT: events.DRAFT || [],
          UNPUBLISHED: events.UNPUBLISHED || [],
          COMPLETED:
            events.COMPLETED.filter(
              (event) => event.visibility === "unpublished"
            ) || [],
        };
      case "archived":
        return {
          ARCHIVED: events.ARCHIVED || [],
        };
      default:
        return events;
    }
  };

  // Extract all events from the current tab into a flat array
  const getAllEventsFromCurrentTab = () => {
    const tabEvents = getEventsByTab();
    let allEvents = [];
    
    Object.keys(tabEvents).forEach(category => {
      allEvents = [...allEvents, ...tabEvents[category]];
    });
    
    return allEvents;
  };

  // Apply filters to events
  const applyFilters = (events, filters) => {
    return events.filter(event => {
      // Filter by category
      if (filters.eventCategory && event.eventCategory !== filters.eventCategory) {
        return false;
      }
      return true;
    });
  };

  // Filter events by search term and any active filters
  const filterEventsBySearchAndFilters = (eventsObject) => {
    if (!searchTerm && !activeFilters.eventCategory) return eventsObject;

    const result = {};

    Object.keys(eventsObject).forEach((category) => {
      // First filter by search term
      let filteredEvents = eventsObject[category].filter(
        (event) =>
          !searchTerm ||
          event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.venue &&
            event.venue.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (event.eventCategory &&
            event.eventCategory
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
      
      // Then apply category filters
      filteredEvents = applyFilters(filteredEvents, activeFilters);
      
      result[category] = filteredEvents;
    });

    return result;
  };

  // Get all events that match the search term and filters across all categories
  const getSearchResults = () => {
    const allEvents = getAllEventsFromCurrentTab();
    
    if (!searchTerm && !activeFilters.eventCategory) return [];
    
    // First filter by search term
    let filtered = allEvents;
    
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.venue &&
            event.venue.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (event.eventCategory &&
            event.eventCategory
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }
    
    // Then apply additional filters
    return applyFilters(filtered, activeFilters);
  };

  // Handler for applying filters
  const handleApplyFilters = (filters) => {
    console.log("Applying filters:", filters);
    setActiveFilters(filters);
  };

  // Handler for edit actions
  const handleEditEvent = async (eventId, type) => {
    console.log(`Edit event ${eventId} with type ${type}`);
    try {
      const event =
        findEventById(eventId) || (await onEditEvent(eventId, type));

      if (event) {
        setSelectedEventId(eventId);
        setSelectedEvent(event);
        setEditType(type);
        setActivePopup("edit");
      }
    } catch (error) {
      console.error("Error preparing edit:", error);
    }
  };

  // Handler for delete action
  const handleDeleteEvent = (eventId) => {
    console.log(`Delete event ${eventId}`);
    const event = findEventById(eventId);
    if (event) {
      setSelectedEventId(eventId);
      setSelectedEvent(event);
      setActivePopup("delete");
    }
  };

  // Handler for unpublish action
  const handleUnpublishEvent = (eventId) => {
    console.log(`Unpublish event ${eventId}`);
    const event = findEventById(eventId);
    if (event) {
      setSelectedEventId(eventId);
      setSelectedEvent(event);
      setActivePopup("unpublish");
    }
  };

  // Close any popup
  const handleClosePopup = () => {
    setActivePopup(null);
    setSelectedEventId(null);
    setEditType(null);
    setSelectedEvent(null);
  };

  // Save handlers for each edit type
  const handleSaveEventChanges = async (updatedEvent) => {
    console.log("Saving event changes:", updatedEvent);
    const success = await onSaveEvent(updatedEvent, "event");
    if (success) {
      handleClosePopup();
    }
  };

  const handleSaveTicketChanges = async (updatedTicket) => {
    console.log("Saving ticket changes:", updatedTicket);
    const success = await onSaveEvent(updatedTicket, "ticket");
    if (success) {
      handleClosePopup();
    }
  };

  const handleSaveClaimingChanges = async (updatedClaiming) => {
    console.log("Saving claiming changes:", updatedClaiming);
    const success = await onSaveEvent(updatedClaiming, "claiming");
    if (success) {
      handleClosePopup();
    }
  };

  const handleSaveAvailabilityChanges = async (updatedAvailability) => {
    console.log("Saving availability changes:", updatedAvailability);
    const success = await onSaveEvent(updatedAvailability, "availability");
    if (success) {
      handleClosePopup();
    }
  };

  const handleConfirmDelete = async (eventId) => {
    console.log(`Deleting event with ID: ${eventId}`);
    const success = await onDeleteEvent(eventId);
    if (success) {
      handleClosePopup();
    }
  };

  const handleOpenReservation = async (eventId) => {
    console.log(`Open reservation for event ${eventId}`);
    // Call the actual handler from the container
    return await onOpenReservation(eventId);
  };

  // Handler for closing reservations
  const handleCloseReservation = async (eventId) => {
    console.log(`Close reservation for event ${eventId}`);
    // Call the actual handler from the container
    return await onCloseReservation(eventId);
  };

  const handleViewEventDetails = (eventId) => {
    navigate(`/events/detail/${eventId}`);
  };
  
  const handleConfirmUnpublish = async (eventId) => {
    console.log(`Unpublishing event with ID: ${eventId}`);
    const success = await onUnpublishEvent(eventId);
    if (success) {
      handleClosePopup();
    }
  };

  // Render the appropriate popup based on active state
  const renderPopup = () => {
    if (!activePopup) return null;

    if (activePopup === "edit" && selectedEvent) {
      switch (editType) {
        case "event":
          return (
            <EditEventDetailsPopup
              isOpen={true}
              eventData={selectedEvent}
              onClose={handleClosePopup}
              onSave={handleSaveEventChanges}
            />
          );
        case "ticket":
          return (
            <EditTicketDetailsPopup
              isOpen={true}
              eventData={selectedEvent}
              onClose={handleClosePopup}
              onSave={handleSaveTicketChanges}
            />
          );
        case "claiming":
          return (
            <EditClaimingDetailsPopup
              isOpen={true}
              eventData={selectedEvent}
              onClose={handleClosePopup}
              onSave={handleSaveClaimingChanges}
            />
          );
        case "availability":
          return (
            <EditAvailabilityDetailsPopup
              isOpen={true}
              eventData={selectedEvent}
              onClose={handleClosePopup}
              onSave={handleSaveAvailabilityChanges}
            />
          );
        default:
          return null;
      }
    } else if (activePopup === "delete" && selectedEvent) {
      return (
        <DeleteConfirmationPopup
          isOpen={true}
          eventId={selectedEventId}
          eventName={selectedEvent.eventName}
          onClose={handleClosePopup}
          onConfirm={handleConfirmDelete}
        />
      );
    } else if (activePopup === "unpublish" && selectedEvent) {
      return (
        <UnpublishConfirmationPopup
          isOpen={true}
          eventId={selectedEventId}
          eventName={selectedEvent.eventName}
          onClose={handleClosePopup}
          onConfirm={handleConfirmUnpublish}
        />
      );
    }

    return null;
  };

  // Determine if a section should show the Add Event button
  const shouldShowAddEvent = () => {
    return ["published", "unpublished"].includes(activeTab);
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Updated scroll functions for smoother scrolling
  const scrollLeft = (containerId) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = (containerId) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setActiveFilters({
      eventCategory: "",
    });
  };

  // Get and filter events for display
  const filteredEvents = filterEventsBySearchAndFilters(getEventsByTab());
  const searchResults = getSearchResults();
  const isSearchOrFilterActive = searchTerm.trim() !== "" || activeFilters.eventCategory !== "";

  // Show active filter indicator
  const getActiveFilterIndicator = () => {
    if (activeFilters.eventCategory) {
      return (
        <div className="inline-flex items-center px-3 py-1 bg-[#FFAB40]/20 border border-[#FFAB40] rounded-full text-sm mr-2 mb-2">
          <span className="mr-2">Category: {activeFilters.eventCategory}</span>
          <button 
            onClick={() => setActiveFilters({...activeFilters, eventCategory: ""})}
            className="text-sm hover:text-[#FFAB40]"
          >
            ✕
          </button>
        </div>
      );
    }
    return null;
  };

  // Render event card with status indicators
  const renderEventCard = (event) => (
    <div key={event.id} className="flex-shrink-0 mb-6">
      <div className="flex flex-col">
        <EventCard
          key={event.id}
          event={event}
          cardStyle={event.status.toLowerCase()}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onUnpublish={handleUnpublishEvent}
          onPublishNow={handlePublishNow}
          onOpenReservation={handleOpenReservation}
          onCloseReservation={handleCloseReservation}
          onViewDetails={handleViewEventDetails}
          onNavigateToEdit={onNavigateToEdit}
        />
        {isFutureScheduledEvent(event) && (
          <div className="mt-2 bg-yellow-900/30 border border-yellow-600 rounded-md p-2 text-xs">
            <div className="flex items-center text-gray-300">
              <FaClock className="mr-1" />
              <span>
                Display scheduled in:{" "}
                {calculateTimeUntilDisplay(event)}
              </span>
            </div>
            <div className="text-gray-300 mt-1">
              Will display on: {formatDisplayDate(event)}
            </div>
          </div>
        )}

        {/* Status indicator for recently updated events */}
        {event.statusUpdatedAt &&
          isRecentlyUpdated(event) && (
            <div className="mt-2 bg-blue-900/30 border border-blue-600 rounded-md p-2 text-xs">
              <div className="flex items-center text-blue-400">
                <span>
                  Status updated:{" "}
                  {formatTimeAgo(event.statusUpdatedAt)}
                </span>
              </div>
            </div>
          )}
      </div>
    </div>
  );

  // Render search results in a grid (4 per row)
  const renderSearchResults = () => {
    if (!isSearchOrFilterActive) return null;
    
    if (searchResults.length === 0) {
      return (
        <div className="mb-10">
          <h3 className="text-lg font-bold border-b border-gray-600 pb-2 mb-4">
            Results
          </h3>
          <div className="min-h-[100px] text-gray-400 flex items-center justify-center">
            No events found matching your criteria
          </div>
        </div>
      );
    }
    
    return (
      <div className="mb-10">
        <h3 className="text-lg font-bold border-b border-gray-600 pb-2 mb-4">
          Results ({searchResults.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {searchResults.map(event => renderEventCard(event))}
        </div>
      </div>
    );
  };

  // Render standard event categories in carousels
  const renderEventCategories = () => {
    if (isSearchOrFilterActive) return null;
    
    return Object.keys(filteredEvents).map((category) => (
      <div key={category} className="mb-10">
        <h3 className="text-lg font-bold border-b border-gray-600 pb-2 mb-4">
          {category}
          {category === "UNPUBLISHED" &&
            filteredEvents[category].some(isFutureScheduledEvent) && (
              <span className="ml-2 text-xs font-normal text-gray-400">
                (Contains events scheduled for future display)
              </span>
            )}
        </h3>

        {filteredEvents[category].length > 0 ? (
          <div className="relative group overflow-hidden">
            {/* Left scroll button */}
            <button
              onClick={() => scrollLeft(`event-container-${category}`)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black text-white rounded-full p-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Scroll left"
            >
              <FaChevronLeft />
            </button>

            {/* Right scroll button */}
            <button
              onClick={() => scrollRight(`event-container-${category}`)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black text-white rounded-full p-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Scroll right"
            >
              <FaChevronRight />
            </button>

            {/* Scroll indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#1E1E1E] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#1E1E1E] to-transparent z-10 pointer-events-none"></div>

            {/* Scrollable container - with updated styling */}
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
              {filteredEvents[category].map(event => renderEventCard(event))}
            </div>
          </div>
        ) : (
          <div className="min-h-[100px] text-gray-400 flex items-center justify-center">
            No events available
          </div>
        )}
      </div>
    ));
  };

  if (loading && !initialized) {
    return <LoadingStateDisplay />;
  }

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white font-Poppins">
      {/* Header */}
      <Header_Admin />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar_Admin />

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

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-white text-black rounded-md hover:bg-[#FFAB40] hover:text-black transition duration-300"
                onClick={handleResetFilters}
              >
                Reset
              </button>
              <button
                className={`px-4 py-2 rounded-md transition duration-300 ${
                  showFilter || activeFilters.eventCategory 
                    ? "bg-[#FFAB40] text-black" 
                    : "bg-white text-black hover:bg-[#FFAB40] hover:text-black"
                }`}
                onClick={() => setShowFilter(!showFilter)}
              >
                Sort/Filter by
              </button>
            </div>
          </div>

          {/* Active filters display */}
          {activeFilters.eventCategory && (
            <div className="mb-4">
              <div className="flex flex-wrap">{getActiveFilterIndicator()}</div>
            </div>
          )}

          <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {shouldShowAddEvent() && !isSearchOrFilterActive && <AddEventButton onAddEvent={onAddEvent} />}

          {/* Render search results or normal event categories */}
          {renderSearchResults()}
          {renderEventCategories()}

          {/* Loading overlay only shown during initial loading */}
          {loading && initialized && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-lg flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFAB40] mb-4"></div>
                <p className="text-white">Loading events...</p>
              </div>
            </div>
          )}
          {renderPopup()}
        </div>
      </div>

      {/* Filter component */}
      <Admin_EventManagementFilter 
        showFilter={showFilter} 
        setShowFilter={setShowFilter} 
        onApplyFilters={handleApplyFilters}
      />
      
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default Admin_EventsManagement;