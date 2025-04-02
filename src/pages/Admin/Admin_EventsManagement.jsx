import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { FaSearch, FaArchive } from "react-icons/fa";
import Admin_EventManagementFilter from "./Admin_EventsManagementFilter";

import Header_Admin from "../../components/Admin/Header_Admin";
import Sidebar_Admin from "../../components/Admin/SideBar_Admin";
import EventCard from "../../components/Admin/Admin_EventCard";
import { useNavigate } from "react-router-dom";

// Import popup components
import EditEventDetailsPopup from "../../components/Admin/Popups/EditEventDetailsPopup";
import EditTicketDetailsPopup from "../../components/Admin/Popups/EditTicketDetailsPopup";
import EditClaimingDetailsPopup from "../../components/Admin/Popups/EditClaimingDetailsPopup";
import EditAvailabilityDetailsPopup from "../../components/Admin/Popups/EditAvailabilityDetailsPopup";
import DeleteConfirmationPopup from "../../components/Admin/Popups/DeleteConfirmationPopup";
import UnpublishConfirmationPopup from "../../components/Admin/Popups/UnpublishConfirmationPopup";

const AddEventButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/events/publish");
  };

  return (
    <div className="mb-10">
      <h3 className="text-lg font-bold mb-4">ADD EVENT</h3>
      <div>
        <button
          onClick={handleClick}
          className="w-[173px] h-[205px] flex flex-col items-center justify-center bg-[#FFA500] text-black rounded-lg shadow-md hover:bg-[#F59E00] transition-colors"
        >
          <span className="text-4xl text-white">+</span>
        </button>
      </div>
    </div>
  );
};

<<<<<<< HEAD
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
=======
>>>>>>> 29d5319a3f46a09ea5b2bb374a4ef67cb87715d3

const Admin_EventsManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("published");


  const [showFilter, setShowFilter] = useState(false);

  // State to control which popup is visible
  const [activePopup, setActivePopup] = useState(null);
  // State to track the ID of the selected event
  const [selectedEventId, setSelectedEventId] = useState(null);
  // State to track which type of edit is being performed
  const [editType, setEditType] = useState(null);
  // State to store the selected event data
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Sample data - in a real app, this would come from an API or state management
  const sampleEvents = {
    // Active Events
    OPEN: [
      {
        id: 1,
        eventName: "UAAP Season 88 Opening",
        eventDate: "2023-09-30",
        startTime: "14:00",
        endTime: "17:00",
        venue: "MOA Arena",
        eventType: "ticketed",
        eventCategory: "UAAP",
        status: "open",
        imagePreview: null,
      },
    ],
    SCHEDULED: [
      {
        id: 2,
        eventName: "University Fair 2023",
        eventDate: "2023-10-15",
        startTime: "09:00",
        endTime: "16:00",
        venue: "UST Quadricentennial Pavilion",
        eventType: "free",
        eventCategory: "UST IPEA",
        status: "scheduled",
        imagePreview: null,
      },
    ],
    // Upcoming Events
    DRAFT: [
      {
        id: 3,
        eventName: "Christmas Concert",
        eventDate: "2023-12-15",
        startTime: "18:00",
        endTime: "21:00",
        venue: "UST Field",
        eventType: "coming_soon",
        eventCategory: "UST IPEA",
        status: "draft",
        imagePreview: null,
      },
    ],
    UNPUBLISHED: [
      {
        id: 5,
        eventName: "Engineering Week",
        eventDate: "2023-11-20",
        startTime: "08:00",
        endTime: "18:00",
        venue: "Engineering Building",
        eventType: "ticketed",
        eventCategory: "UST IPEA",
        status: "scheduled",
        imagePreview: null,
      },
    ],
    "COMING SOON": [
      {
        id: 6,
        eventName: "New Year Concert",
        eventDate: "2024-01-05",
        startTime: "19:00",
        endTime: "22:00",
        venue: "UST Open Field",
        eventType: "coming_soon",
        eventCategory: "UST IPEA",
        status: "scheduled",
        imagePreview: null,
      },
    ],
    // Past Events
    COMPLETED: [
      {
        id: 4,
        eventName: "Alumni Homecoming 2023",
        eventDate: "2023-08-05",
        startTime: "17:00",
        endTime: "22:00",
        venue: "UST Plaza Mayor",
        eventType: "ticketed",
        eventCategory: "UST IPEA",
        status: "completed",
        imagePreview: null,
      },
    ],
    CANCELLED: [
      {
        id: 7,
        eventName: "Sports Fest 2023",
        eventDate: "2023-07-10",
        startTime: "08:00",
        endTime: "17:00",
        venue: "UST Gym",
        eventType: "ticketed",
        eventCategory: "UST IPEA",
        status: "cancelled",
        imagePreview: null,
      },
    ],
    ARCHIVED: [
      {
        id: 8,
        eventName: "Summer Festival 2023",
        eventDate: "2023-05-20",
        startTime: "13:00",
        endTime: "20:00",
        venue: "Benavides Garden",
        eventType: "free",
        eventCategory: "UST IPEA",
        status: "completed",
        imagePreview: null,
      },
      {
        id: 8,
        eventName: "Summer Festival 2023",
        eventDate: "2023-05-20",
        startTime: "13:00",
        endTime: "20:00",
        venue: "Benavides Garden",
        eventType: "free",
        eventCategory: "UST IPEA",
        status: "completed",
        imagePreview: null,
      },
    ],
  };

  // Function to get events based on active tab
  // Function to get events based on active tab
  // Function to get events based on active tab
  const getEventsByTab = () => {
    switch (activeTab) {
      case "published":
        return {
          "OPEN FOR RESERVATION": sampleEvents.OPEN || [],
          SCHEDULED:
            sampleEvents.SCHEDULED.filter(
              (event) => event.visibility === "published"
            ) || [],
          "COMING SOON": sampleEvents["COMING SOON"] || [],
          COMPLETED:
            sampleEvents.COMPLETED.filter(
              (event) => event.visibility === "published"
            ) || [],
        };
      case "unpublished":
        return {
          DRAFT: sampleEvents.DRAFT || [],
          UNPUBLISHED: sampleEvents.UNPUBLISHED || [],
          COMPLETED: sampleEvents.COMPLETED || [],
        };
      case "archived":
        return {
          ARCHIVED: sampleEvents.ARCHIVED || [],
          CANCELLED: sampleEvents.CANCELLED || [],
        };
      default:
        return sampleEvents;
    }
  };

  // Function to find event by ID across all categories
  const findEventById = (eventId) => {
    for (const category in sampleEvents) {
      const event = sampleEvents[category].find((e) => e.id === eventId);
      if (event) return event;
    }
    return null;
  };

  // Handler for edit actions
  const handleEditEvent = (eventId, type) => {
    console.log(`Edit event ${eventId} with type ${type}`);
    const event = findEventById(eventId);
    if (event) {
      setSelectedEventId(eventId);
      setSelectedEvent(event);
      setEditType(type);
      setActivePopup("edit");
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
  const handleSaveEventChanges = (updatedEvent) => {
    console.log("Saving event changes:", updatedEvent);
    // Implement your save logic here
    handleClosePopup();
  };

  const handleSaveTicketChanges = (updatedTicket) => {
    console.log("Saving ticket changes:", updatedTicket);
    // Implement your save logic here
    handleClosePopup();
  };

  const handleSaveClaimingChanges = (updatedClaiming) => {
    console.log("Saving claiming changes:", updatedClaiming);
    // Implement your save logic here
    handleClosePopup();
  };

  const handleSaveAvailabilityChanges = (updatedAvailability) => {
    console.log("Saving availability changes:", updatedAvailability);
    // Implement your save logic here
    handleClosePopup();
  };

  const handleConfirmDelete = (eventId) => {
    console.log(`Deleting event with ID: ${eventId}`);
    // Implement your delete logic here
    // Example: remove the event from your state or call an API
    handleClosePopup();
  };

  const handleConfirmUnpublish = (eventId) => {
    console.log(`Unpublishing event with ID: ${eventId}`);
    // Implement your unpublish logic here
    // Example: update the event status in your state or call an API
    handleClosePopup();
  };

  // Render the appropriate popup based on active state
  const renderPopup = () => {
    console.log("Rendering popup:", { activePopup, editType, selectedEvent });

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

<<<<<<< HEAD
  // Determine if a section should show the Add Event button
  const shouldShowAddEvent = () => {
    return ["published", "unpublished"].includes(activeTab);
  };
=======
>>>>>>> 29d5319a3f46a09ea5b2bb374a4ef67cb87715d3

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
          <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-6 gap-4">
            {/* Search Dropdown with Arrow Fix */}
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-3 text-black" />
              <select
                className="pl-10 pr-12 py-2 w-full rounded-full bg-white text-black outline-none cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="black"><path d="M5 7l5 5 5-5H5z"/></svg>')`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                  backgroundSize: "14px",
                }}
              >
                <option value="" disabled selected>
                  Search events
                </option>
                <option value="event1">Event 1</option>
                <option value="event2">Event 2</option>
                <option value="event3">Event 3</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white text-black rounded-md hover:bg-[#FFAB40] hover:text-black transition duration-300">
                Reset
              </button>
              <button className="px-4 py-2 bg-white text-black rounded-md hover:bg-[#FFAB40] hover:text-black transition duration-300"
              onClick={() => setShowFilter(!showFilter)}>
                Sort/Filter by
              </button>
              <button className="px-4 py-2 bg-white text-black rounded-md flex items-center gap-2 hover:bg-[#FFAB40] hover:text-black transition duration-300"
               onClick={() => navigate("/archive")}>
                <FaArchive />
              </button>
            </div>
          </div>

<<<<<<< HEAD
          {shouldShowAddEvent() && <AddEventButton />}
=======
          {/* Filter Component */}
          {showFilter && <Admin_EventManagementFilter showFilter={showFilter} setShowFilter={setShowFilter} />}

          {/* Add Event Section */}
          <AddEventButton />
>>>>>>> 29d5319a3f46a09ea5b2bb374a4ef67cb87715d3

          {/* Event Sections for the active tab */}
          {Object.keys(getEventsByTab()).map((category) => (
            <div key={category} className="mb-10">
              <h3 className="text-lg font-bold border-b border-gray-600 pb-2 mb-4">
                {category}
              </h3>

              {getEventsByTab()[category].length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {" "}
                  {/* Added pb-4 for scrollbar spacing */}
                  {getEventsByTab()[category].map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      cardStyle={event.status.toLowerCase()}
                      onEdit={handleEditEvent}
                      onDelete={handleDeleteEvent}
                      onUnpublish={handleUnpublishEvent}
                      onViewDetails={handleViewEventDetails}
                    />
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
