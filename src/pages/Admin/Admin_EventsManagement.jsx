import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaArchive } from "react-icons/fa";
import Admin_EventManagementFilter from "./Admin_EventsManagementFilter";
import Header_Admin from "../../components/Admin/Header_Admin";
import Sidebar_Admin from "../../components/Admin/SideBar_Admin";
import EventCard from "../../components/Admin/Admin_EventCard";

// Import popup components
import EditEventDetailsPopup from "../../components/Admin/Popups/EditEventDetailsPopup";
import EditTicketDetailsPopup from "../../components/Admin/Popups/EditTicketDetailsPopup";
import EditClaimingDetailsPopup from "../../components/Admin/Popups/EditClaimingDetailsPopup";
import EditAvailabilityDetailsPopup from "../../components/Admin/Popups/EditAvailabilityDetailsPopup";
import DeleteConfirmationPopup from "../../components/Admin/Popups/DeleteConfirmationPopup";
import UnpublishConfirmationPopup from "../../components/Admin/Popups/UnpublishConfirmationPopup";
import { FaClock } from "react-icons/fa";

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
  error,
  onAddEvent,
  onEditEvent,
  onSaveEvent,
  onDeleteEvent,
  onUnpublishEvent,
  onPublishNow, // New prop
  findEventById,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("published");
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
          "OPEN FOR RESERVATION": events.OPEN || [],
          SCHEDULED:
            events.SCHEDULED.filter(
              (event) => event.visibility === "published"
            ) || [],
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
          CANCELLED: events.CANCELLED || [],
        };
      default:
        return events;
    }
  };

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

  const handleViewEventDetails = (eventId) => {
    navigate(`/events/detail/${eventId}`);
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

  const handleConfirmUnpublish = async (eventId) => {
    console.log(`Unpublishing event with ID: ${eventId}`);
    const success = await onUnpublishEvent(eventId);
    if (success) {
      handleClosePopup();
    }
  };
  const handleCancelEvent = async (eventId) => {
    console.log(`Cancel event ${eventId}`);
    try {
      const event = findEventById(eventId);
      if (event) {
        // You'll need to implement a proper cancel event function in your container component
        // For now, we'll just alert since the handler isn't fully implemented
        alert("Event cancellation feature is not fully implemented yet.");

        // If you have a cancel function in your props, you could use it like this:
        // const success = await onCancelEvent(eventId);
        // if (success) {
        //   // Handle successful cancellation
        // }
      }
    } catch (error) {
      console.error("Error cancelling event:", error);
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

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    // Reset any other filters here
  };

  // Get and filter events for display
  const filteredEvents = filterEventsBySearchTerm(getEventsByTab());

  if (loading) {
    return (
      <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white font-Poppins">
        <Header_Admin />
        <div className="flex">
          <Sidebar_Admin />
          <div className="flex-1 px-10 py-10 flex justify-center items-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFAB40] mx-auto mb-4"></div>
              <p className="text-lg">Loading events...</p>
            </div>
          </div>
        </div>
      </div>
    );
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
        <div className="flex-1 px-10 py-10">
          {/* Tab Navigation */}

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-6 gap-4">
            {/* Search Dropdown with Arrow Fix */}
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
                className="px-4 py-2 bg-white text-black rounded-md hover:bg-[#FFAB40] hover:text-black transition duration-300"
                onClick={() => setShowFilter(!showFilter)}
              >
                Sort/Filter by
              </button>
            </div>
          </div>
          <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {shouldShowAddEvent() && <AddEventButton onAddEvent={onAddEvent} />}

          {/* Event Sections for the active tab */}
          {Object.keys(filteredEvents).map((category) => (
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
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {filteredEvents[category].map((event) => (
                    <div key={event.id}>
                      <EventCard
                        key={event.id}
                        event={event}
                        cardStyle={event.status.toLowerCase()}
                        onEdit={handleEditEvent}
                        onDelete={handleDeleteEvent}
                        onUnpublish={handleUnpublishEvent}
                        onPublishNow={handlePublishNow} // Pass the handler
                        onViewDetails={handleViewEventDetails}
                        onCancel={handleCancelEvent}
                      />

                      {/* Add display time indicator for future scheduled events */}
                      {isFutureScheduledEvent(event) && (
                        <div className="mt-2 bg-yellow-900/30 border border-yellow-600 rounded-md p-2 text-xs">
                          <div className="flex items-center text-yellow-400">
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="min-h-[100px] text-gray-400 flex items-center justify-center">
                  No events available
                </div>
              )}
            </div>
          ))}

          {/* Render Popups */}
          {renderPopup()}
        </div>
      </div>
    </div>
  );
};

export default Admin_EventsManagement;
