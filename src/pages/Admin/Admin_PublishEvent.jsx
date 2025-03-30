import React, { useState, useRef } from "react";
import Sidebar_Admin from "../../components/Admin/SideBar_Admin";
import Header_Admin from "../../components/Admin/Header_Admin";
import {
  PlusIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
  InfoIcon,
} from "lucide-react";

// Modified EventDetails component with updated event types
const EventDetails = ({ onNext }) => {
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventCategory, setEventCategory] = useState("");
  const [eventType, setEventType] = useState("ticketed"); // Changed default to "ticketed"
  const [eventImage, setEventImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventImage(file);

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = () => {
    // Collect event details data without validation
    const eventDetailsData = {
      eventName,
      eventDescription,
      eventDate,
      venue,
      startTime,
      endTime,
      eventCategory,
      eventType,
      eventImage,
      imagePreview, // Added to pass the preview to the summary
    };

    // Pass data to parent
    onNext(eventDetailsData);
  };

  return (
    <div>
      <p className="text-[#FFAB40] text-3xl font-semibold mb-2">Add an Event</p>
      <p className="text-[13px] text-[#B8B8B8] mb-4">
        Create a new event for the reservation system by filling out the
        necessary details. Ensure all information is accurate before saving.
      </p>
      <hr className="border-t border-gray-600 my-4" />

      <div className="grid grid-cols-2 gap-1 items-start">
        <div className="bg-[#FFAB40] w-8/12 h-full rounded-xl flex items-center justify-center relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
          />
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Event"
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <button
              onClick={handleUploadButtonClick}
              className="bg-[#2E2E2E] text-[#FFAB40] text-sm font-semibold py-2 px-4 rounded-full"
            >
              Upload Image
            </button>
          )}
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Event Name:</p>
            <input
              type="text"
              placeholder="Enter Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Event Description:</p>
            <textarea
              placeholder="Enter Event Description"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-2 py-1.5 text-sm h-20 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[#FFAB40] text-sm mb-1">Event Date:</p>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <p className="text-[#FFAB40] text-sm mb-1">Event Venue:</p>
              <input
                type="text"
                placeholder="Venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Time of Event:</p>
            <div className="flex space-x-2 items-center">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-2 py-1.5 text-sm"
              />
              <p className="text-white text-sm">to</p>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Category:</p>
            <select
              value={eventCategory}
              onChange={(e) => setEventCategory(e.target.value)}
              className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-2 py-1.5 text-sm"
            >
              <option value="">Select Category</option>
              <option value="UST IPEA">UST IPEA</option>
              <option value="UAAP">UAAP</option>
            </select>
          </div>
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Event Type:</p>
            <div className="flex space-x-4 flex-wrap justify-evenly">
              <label className="inline-flex items-center mb-2">
                <input
                  type="radio"
                  value="ticketed"
                  checked={eventType === "ticketed"}
                  onChange={() => setEventType("ticketed")}
                  className="form-radio bg-[#1E1E1E] border-[#333333] text-white"
                />
                <span className="ml-2 text-white text-sm">Ticketed Event</span>
              </label>
              <label className="inline-flex items-center mb-2">
                <input
                  type="radio"
                  value="coming_soon"
                  checked={eventType === "coming_soon"}
                  onChange={() => setEventType("coming_soon")}
                  className="form-radio bg-[#1E1E1E] border-[#333333] text-white"
                />
                <span className="ml-2 text-white text-sm">Coming Soon</span>
              </label>
              <label className="inline-flex items-center mb-2">
                <input
                  type="radio"
                  value="free"
                  checked={eventType === "free"}
                  onChange={() => setEventType("free")}
                  className="form-radio bg-[#1E1E1E] border-[#333333] text-white"
                />
                <span className="ml-2 text-white text-sm">
                  Free/Promotional
                </span>
              </label>
            </div>

            {eventType === "coming_soon" && (
              <div className="mt-2 p-2 bg-[#2A2A2A] rounded border border-[#FFAB40] text-xs text-[#B8B8B8]">
                <p className="flex items-center">
                  <InfoIcon className="h-3 w-3 mr-1 text-[#FFAB40]" /> "Coming
                  Soon" events will be displayed with minimal details and a
                  "Coming Soon" tag.
                </p>
              </div>
            )}

            {eventType === "free" && (
              <div className="mt-2 p-2 bg-[#2A2A2A] rounded border border-[#FFAB40] text-xs text-[#B8B8B8]">
                <p className="flex items-center">
                  <InfoIcon className="h-3 w-3 mr-1 text-[#FFAB40]" />{" "}
                  Free/Promotional events are for display only with no ticket
                  cost.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden button for parent component to trigger submit */}
      <button className="hidden event-submit-button" onClick={handleSubmit} />
    </div>
  );
};

// Modify TicketDetails component to handle the updated event types
// Modified TicketDetails component with optional ticket tiers for Coming Soon
const TicketDetails = ({ onBack, onNext, eventType }) => {
  const [totalTickets, setTotalTickets] = useState(0);
  const [tierType, setTierType] = useState("freeSeating");
  const [includeTiers, setIncludeTiers] = useState(false); // New state for Coming Soon option

  // Free seating specific fields - using empty strings
  const [freeSeatingTickets, setFreeSeatingTickets] = useState("");
  const [freeSeatingPrice, setFreeSeatingPrice] = useState("");
  const [freeSeatingMaxPerPerson, setFreeSeatingMaxPerPerson] = useState("");

  const [ticketTiers, setTicketTiers] = useState({
    "General Admission": {
      number: "",
      price: "",
      maxPerPerson: "",
      checked: false,
      isEditing: false,
    },
    "Upper Box": {
      number: "",
      price: "",
      maxPerPerson: "",
      checked: false,
      isEditing: false,
    },
    "Lower Box": {
      number: "",
      price: "",
      maxPerPerson: "",
      checked: false,
      isEditing: false,
    },
    Patron: {
      number: "",
      price: "",
      maxPerPerson: "",
      checked: false,
      isEditing: false,
    },
    VIP: {
      number: "",
      price: "",
      maxPerPerson: "",
      checked: false,
      isEditing: false,
    },
  });
  const [editingTierName, setEditingTierName] = useState("");

  const handleNumberChange = (tier, value) => {
    // Allow only numbers
    if (value === "" || /^\d*$/.test(value)) {
      const updatedTiers = { ...ticketTiers };
      updatedTiers[tier].number = value;
      setTicketTiers(updatedTiers);

      // Recalculate total tickets
      const total = Object.values(updatedTiers).reduce(
        (sum, tier) =>
          sum + (tier.checked && tier.number ? parseInt(tier.number) : 0),
        0
      );
      setTotalTickets(total);
    }
  };

  const handlePriceChange = (tier, value) => {
    // Allow only numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const updatedTiers = { ...ticketTiers };
      updatedTiers[tier].price = value;
      setTicketTiers(updatedTiers);
    }
  };

  // Handler for max tickets per person
  const handleMaxPerPersonChange = (tier, value) => {
    // Allow only numbers
    if (value === "" || /^\d*$/.test(value)) {
      const updatedTiers = { ...ticketTiers };
      updatedTiers[tier].maxPerPerson = value;
      setTicketTiers(updatedTiers);
    }
  };

  const handleCheckboxChange = (tier, isChecked) => {
    const updatedTiers = { ...ticketTiers };
    updatedTiers[tier].checked = isChecked;

    // Reset fields if unchecked
    if (!isChecked) {
      updatedTiers[tier].number = "";
      updatedTiers[tier].price = "";
      updatedTiers[tier].maxPerPerson = "";
    }

    setTicketTiers(updatedTiers);

    // Recalculate total tickets
    const total = Object.values(updatedTiers).reduce(
      (sum, tier) =>
        sum + (tier.checked && tier.number ? parseInt(tier.number) : 0),
      0
    );
    setTotalTickets(total);
  };

  const addNewTier = () => {
    // Generate a unique tier name
    const baseName = "Custom Tier";
    let newTierName = baseName;
    let counter = 1;
    while (ticketTiers[newTierName]) {
      newTierName = `${baseName} ${counter}`;
      counter++;
    }

    // Add new tier to the state
    setTicketTiers((prevTiers) => ({
      ...prevTiers,
      [newTierName]: {
        number: "",
        price: "",
        maxPerPerson: "",
        checked: false,
        isEditing: false,
      },
    }));
  };

  const deleteTier = (tierToDelete) => {
    // Create a new object without the deleted tier
    const { [tierToDelete]: removedTier, ...remainingTiers } = ticketTiers;

    // Update state and recalculate total tickets
    setTicketTiers(remainingTiers);

    // Recalculate total tickets
    const total = Object.values(remainingTiers).reduce(
      (sum, tier) =>
        sum + (tier.checked && tier.number ? parseInt(tier.number) : 0),
      0
    );
    setTotalTickets(total);
  };

  const startEditingTierName = (tier) => {
    const updatedTiers = { ...ticketTiers };
    updatedTiers[tier].isEditing = true;
    setEditingTierName(tier);
    setTicketTiers(updatedTiers);
  };

  const saveNewTierName = () => {
    if (!editingTierName || !editingTierName.trim()) return;

    const oldTierName = Object.keys(ticketTiers).find(
      (key) => ticketTiers[key].isEditing
    );

    if (!oldTierName) return;

    const updatedTiers = { ...ticketTiers };
    const oldTierData = updatedTiers[oldTierName];

    // Remove old tier and add new one with same data
    delete updatedTiers[oldTierName];
    updatedTiers[editingTierName.trim()] = {
      ...oldTierData,
      isEditing: false,
    };

    setTicketTiers(updatedTiers);
    setEditingTierName("");
  };

  const handleTierNameChange = (newName) => {
    setEditingTierName(newName);
  };

  // Handle free seating tickets change
  const handleFreeSeatingTicketsChange = (value) => {
    // Allow only numbers
    if (value === "" || /^\d*$/.test(value)) {
      setFreeSeatingTickets(value);
    }
  };

  // Handle free seating price change
  const handleFreeSeatingPriceChange = (value) => {
    // Allow only numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFreeSeatingPrice(value);
    }
  };

  // Handle free seating max per person change
  const handleFreeSeatingMaxPerPersonChange = (value) => {
    // Allow only numbers
    if (value === "" || /^\d*$/.test(value)) {
      setFreeSeatingMaxPerPerson(value);
    }
  };

  const handleSubmit = () => {
    // For coming soon events - include tier information if selected
    if (eventType === "coming_soon") {
      if (includeTiers) {
        // Include ticket tiers similar to a regular ticketed event
        const parsedTicketTiers = {};

        Object.keys(ticketTiers).forEach((tier) => {
          parsedTicketTiers[tier] = {
            ...ticketTiers[tier],
            number:
              ticketTiers[tier].number === ""
                ? 0
                : parseInt(ticketTiers[tier].number),
            price:
              ticketTiers[tier].price === ""
                ? 0
                : parseFloat(ticketTiers[tier].price),
            maxPerPerson:
              ticketTiers[tier].maxPerPerson === ""
                ? 0
                : parseInt(ticketTiers[tier].maxPerPerson),
          };
        });

        onNext({
          eventType: "coming_soon",
          hasTierInfo: true,
          tierType,
          ticketTiers: parsedTicketTiers,
          totalTickets:
            tierType === "freeSeating"
              ? freeSeatingTickets === ""
                ? 0
                : parseInt(freeSeatingTickets)
              : totalTickets,
          freeSeating: {
            numberOfTickets:
              freeSeatingTickets === "" ? 0 : parseInt(freeSeatingTickets),
            price: freeSeatingPrice === "" ? 0 : parseFloat(freeSeatingPrice),
            maxPerPerson:
              freeSeatingMaxPerPerson === ""
                ? 0
                : parseInt(freeSeatingMaxPerPerson),
          },
        });
      } else {
        // Simple version without ticket details
        onNext({
          eventType: "coming_soon",
          hasTierInfo: false,
        });
      }
      return;
    }

    // For free events, set up free seating with zero price
    if (eventType === "free") {
      onNext({
        eventType: "free",
        tierType: "freeSeating",
        freeSeating: {
          numberOfTickets:
            freeSeatingTickets === "" ? 0 : parseInt(freeSeatingTickets),
          price: 0, // Always zero for free events
          maxPerPerson:
            freeSeatingMaxPerPerson === ""
              ? 0
              : parseInt(freeSeatingMaxPerPerson),
        },
      });
      return;
    }

    // For ticketed events with full ticket details
    const parsedTicketTiers = {};

    Object.keys(ticketTiers).forEach((tier) => {
      parsedTicketTiers[tier] = {
        ...ticketTiers[tier],
        number:
          ticketTiers[tier].number === ""
            ? 0
            : parseInt(ticketTiers[tier].number),
        price:
          ticketTiers[tier].price === ""
            ? 0
            : parseFloat(ticketTiers[tier].price),
        maxPerPerson:
          ticketTiers[tier].maxPerPerson === ""
            ? 0
            : parseInt(ticketTiers[tier].maxPerPerson),
      };
    });

    // Collect ticket information without validation
    const ticketDetailsData = {
      tierType,
      ticketTiers: parsedTicketTiers,
      totalTickets:
        tierType === "freeSeating"
          ? freeSeatingTickets === ""
            ? 0
            : parseInt(freeSeatingTickets)
          : totalTickets,
      freeSeating: {
        numberOfTickets:
          freeSeatingTickets === "" ? 0 : parseInt(freeSeatingTickets),
        price: freeSeatingPrice === "" ? 0 : parseFloat(freeSeatingPrice),
        maxPerPerson:
          freeSeatingMaxPerPerson === ""
            ? 0
            : parseInt(freeSeatingMaxPerPerson),
      },
    };

    // Pass the collected data to the parent component
    onNext(ticketDetailsData);
  };

  // For Coming Soon events - show option to add ticket tiers
  if (eventType === "coming_soon") {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
              Coming Soon Details
            </p>
            <p className="text-[13px] text-[#B8B8B8] mb-4">
              Provide basic information for this "Coming Soon" event. Full
              details can be added later.
            </p>
          </div>
        </div>

        <hr className="border-t border-gray-600 my-4" />

        <div className="bg-[#1E1E1E] p-4 rounded-lg mb-6">
          <div className="flex items-center mb-4">
            <InfoIcon className="h-5 w-5 mr-2 text-[#FFAB40]" />
            <p className="text-white text-sm">
              This event will be published with a "Coming Soon" tag.
              Reservations will not be available until you update it later.
            </p>
          </div>

          <div className="my-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTiers}
                onChange={(e) => setIncludeTiers(e.target.checked)}
                className="form-checkbox h-5 w-5 text-[#FFAB40] bg-[#2C2C2C] border-gray-600 rounded focus:ring-0 focus:outline-none"
              />
              <span className="text-white">
                Include ticket tier information (optional)
              </span>
            </label>
            <p className="text-[#B8B8B8] text-xs mt-1 ml-7">
              This will allow you to set up ticket tiers in advance, but they
              won't be available until the event is fully published.
            </p>
          </div>
        </div>

        {/* Only show ticket configuration if includeTiers is checked */}
        {includeTiers && (
          <div className="mt-6">
            <div className="flex items-center mb-4">
              <div className="mr-4">
                <input
                  type="radio"
                  id="freeSeating"
                  name="tierType"
                  value="freeSeating"
                  checked={tierType === "freeSeating"}
                  onChange={() => setTierType("freeSeating")}
                />
                <label
                  htmlFor="freeSeating"
                  className="ml-2 text-sm text-white"
                >
                  Free Seating
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="ticketed"
                  name="tierType"
                  value="ticketed"
                  checked={tierType === "ticketed"}
                  onChange={() => setTierType("ticketed")}
                />
                <label htmlFor="ticketed" className="ml-2 text-sm text-white">
                  Ticketed
                </label>
              </div>
            </div>

            {/* Display for Free Seating */}
            {tierType === "freeSeating" && (
              <div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">
                      Number of Tickets:
                    </label>
                    <input
                      type="text"
                      value={freeSeatingTickets}
                      onChange={(e) =>
                        handleFreeSeatingTicketsChange(e.target.value)
                      }
                      className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                               border border-gray-600 focus:outline-none focus:border-[#FFAB40]"
                      placeholder="Total available tickets"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">
                      Price (₱):
                    </label>
                    <input
                      type="text"
                      value={freeSeatingPrice}
                      onChange={(e) =>
                        handleFreeSeatingPriceChange(e.target.value)
                      }
                      className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                               border border-gray-600 focus:outline-none focus:border-[#FFAB40]"
                      placeholder="Ticket price"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">
                      Max Tickets Per Person:
                    </label>
                    <input
                      type="text"
                      value={freeSeatingMaxPerPerson}
                      onChange={(e) =>
                        handleFreeSeatingMaxPerPersonChange(e.target.value)
                      }
                      className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                               border border-gray-600 focus:outline-none focus:border-[#FFAB40]"
                      placeholder="Max tickets per person"
                    />
                  </div>
                </div>
                <p className="text-[#B8B8B8] text-xs mt-3">
                  For maximum tickets per person, set between 1-10.
                </p>
              </div>
            )}

            {/* Show ticket tiers for Coming Soon when selected */}
            {tierType === "ticketed" && (
              <>
                <button
                  onClick={addNewTier}
                  className="flex items-center bg-white text-black px-4 py-2 rounded-full hover:bg-[#FFAB40] transition-colors text-sm ml-auto mb-6"
                >
                  <PlusIcon className="mr-2 h-4 w-4" /> Add Tier
                </button>

                <div className="mb-2 grid grid-cols-[auto,200px,1fr,1fr,1fr,auto,auto] gap-4 items-center">
                  <div></div>
                  <p className="text-sm text-[#B8B8B8]">Tier Name</p>
                  <p className="text-sm text-[#B8B8B8]">Number of Tickets</p>
                  <p className="text-sm text-[#B8B8B8]">Price (₱)</p>
                  <p className="text-sm text-[#B8B8B8]">Max Per Person</p>
                  <div></div>
                  <div></div>
                </div>

                <div className="space-y-3">
                  {Object.keys(ticketTiers).map((tier) => (
                    <div
                      key={tier}
                      className="grid grid-cols-[auto,200px,1fr,1fr,1fr,auto,auto] gap-4 items-center"
                    >
                      <input
                        type="checkbox"
                        checked={ticketTiers[tier].checked}
                        onChange={(e) =>
                          handleCheckboxChange(tier, e.target.checked)
                        }
                        className="form-checkbox h-5 w-5 text-[#FFAB40] bg-[#2C2C2C] border-gray-600 rounded focus:ring-0 focus:outline-none"
                      />
                      {ticketTiers[tier].isEditing ? (
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={editingTierName}
                            onChange={(e) =>
                              handleTierNameChange(e.target.value)
                            }
                            className="bg-[#2C2C2C] text-white text-sm px-2 py-1 rounded mr-2"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <p className="text-white text-sm whitespace-nowrap mr-2">
                            {tier}
                          </p>
                        </div>
                      )}
                      <input
                        type="text"
                        placeholder="Number of tickets"
                        disabled={!ticketTiers[tier].checked}
                        value={ticketTiers[tier].number}
                        onChange={(e) =>
                          handleNumberChange(tier, e.target.value)
                        }
                        className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded placeholder-gray-500 
                                   border border-gray-600 focus:outline-none focus:border-[#FFAB40] 
                                   whitespace-nowrap overflow-hidden text-ellipsis"
                      />
                      <input
                        type="text"
                        placeholder="Price"
                        disabled={!ticketTiers[tier].checked}
                        value={ticketTiers[tier].price}
                        onChange={(e) =>
                          handlePriceChange(tier, e.target.value)
                        }
                        className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded placeholder-gray-500 
                                   border border-gray-600 focus:outline-none focus:border-[#FFAB40] 
                                   whitespace-nowrap overflow-hidden text-ellipsis"
                      />
                      <input
                        type="text"
                        placeholder="Max per person"
                        disabled={!ticketTiers[tier].checked}
                        value={ticketTiers[tier].maxPerPerson}
                        onChange={(e) =>
                          handleMaxPerPersonChange(tier, e.target.value)
                        }
                        className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded placeholder-gray-500 
                                   border border-gray-600 focus:outline-none focus:border-[#FFAB40] 
                                   whitespace-nowrap overflow-hidden text-ellipsis"
                      />
                      <button
                        onClick={
                          ticketTiers[tier].isEditing
                            ? saveNewTierName
                            : () => startEditingTierName(tier)
                        }
                        className={
                          ticketTiers[tier].isEditing
                            ? "text-green-500 hover:text-green-700 transition-colors"
                            : "text-[#FFAB40] hover:text-[#FFC661] transition-colors"
                        }
                      >
                        {ticketTiers[tier].isEditing ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          <EditIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteTier(tier)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <hr className="border-t border-gray-600 my-4" />

            <div className="mt-4 flex items-center justify-end">
              <span className="text-white text-sm mr-6">
                Total Number of Tickets:
              </span>
              <span className="text-[#FFAB40] font-semibold">
                {tierType === "freeSeating"
                  ? freeSeatingTickets === ""
                    ? 0
                    : parseInt(freeSeatingTickets)
                  : totalTickets}
              </span>
            </div>
          </div>
        )}

        {/* Hidden button for parent component to trigger submit */}
        <button
          className="hidden ticket-submit-button"
          onClick={handleSubmit}
        />
      </div>
    );
  }

  // For free events
  if (eventType === "free") {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
              Free Event Details
            </p>
            <p className="text-[13px] text-[#B8B8B8] mb-4">
              Set the number of free tickets available for this event.
            </p>
          </div>
        </div>

        <hr className="border-t border-gray-600 my-4" />

        <div className="bg-[#1E1E1E] p-4 rounded-lg mb-4">
          <div className="flex items-center mb-4">
            <InfoIcon className="h-5 w-5 mr-2 text-[#FFAB40]" />
            <p className="text-white text-sm">
              This is a free event. All tickets will be available at no cost.
            </p>
          </div>

          <div className="flex flex-col">
            <label className="text-white text-sm mb-1">
              Number of Free Tickets:
            </label>
            <input
              type="text"
              value={freeSeatingTickets}
              onChange={(e) => handleFreeSeatingTicketsChange(e.target.value)}
              className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                       border border-gray-600 focus:outline-none focus:border-[#FFAB40]"
              placeholder="Total available tickets"
            />
          </div>

          <div className="flex flex-col mt-4">
            <label className="text-white text-sm mb-1">
              Max Tickets Per Person:
            </label>
            <input
              type="text"
              value={freeSeatingMaxPerPerson}
              onChange={(e) =>
                handleFreeSeatingMaxPerPersonChange(e.target.value)
              }
              className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                       border border-gray-600 focus:outline-none focus:border-[#FFAB40]"
              placeholder="Max tickets per person"
            />
            <p className="text-[#B8B8B8] text-xs mt-2">
              For maximum tickets per person, set between 1-10.
            </p>
          </div>
        </div>

        {/* Hidden button for parent component to trigger submit */}
        <button
          className="hidden ticket-submit-button"
          onClick={handleSubmit}
        />
      </div>
    );
  }

  // Regular ticketed event with full ticket details
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
            Ticket Details
          </p>
          <p className="text-[13px] text-[#B8B8B8] mb-4">
            Select ticket types and set the total available tickets, ensuring
            they match venue capacity and event needs.
          </p>
        </div>
      </div>

      <hr className="border-t border-gray-600 my-4" />
      <div className="flex items-center mb-4">
        <div className="mr-4">
          <input
            type="radio"
            id="freeSeating"
            name="tierType"
            value="freeSeating"
            checked={tierType === "freeSeating"}
            onChange={() => setTierType("freeSeating")}
          />
          <label htmlFor="freeSeating" className="ml-2 text-sm text-white">
            Free Seating
          </label>
        </div>
        <div>
          <input
            type="radio"
            id="ticketed"
            name="tierType"
            value="ticketed"
            checked={tierType === "ticketed"}
            onChange={() => setTierType("ticketed")}
          />
          <label htmlFor="ticketed" className="ml-2 text-sm text-white">
            Ticketed
          </label>
        </div>
      </div>

      {/* Display for Free Seating */}
      {tierType === "freeSeating" && (
        <div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-white text-sm mb-1">
                Number of Tickets:
              </label>
              <input
                type="text"
                value={freeSeatingTickets}
                onChange={(e) => handleFreeSeatingTicketsChange(e.target.value)}
                className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                         border border-gray-600 focus:outline-none focus:border-[#FFAB40]"
                placeholder="Total available tickets"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-white text-sm mb-1">Price (₱):</label>
              <input
                type="text"
                value={freeSeatingPrice}
                onChange={(e) => handleFreeSeatingPriceChange(e.target.value)}
                className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                         border border-gray-600 focus:outline-none focus:border-[#FFAB40]"
                placeholder="Ticket price"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-white text-sm mb-1">
                Max Tickets Per Person:
              </label>
              <input
                type="text"
                value={freeSeatingMaxPerPerson}
                onChange={(e) =>
                  handleFreeSeatingMaxPerPersonChange(e.target.value)
                }
                className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                         border border-gray-600 focus:outline-none focus:border-[#FFAB40]"
                placeholder="Max tickets per person"
              />
            </div>
          </div>
          <p className="text-[#B8B8B8] text-xs mt-3">
            For maximum tickets per person, set between 1-10.
          </p>
        </div>
      )}

      {/* Only show ticket tiers and Add Tier button when "Ticketed" is selected */}
      {tierType === "ticketed" && (
        <>
          <button
            onClick={addNewTier}
            className="flex items-center bg-white text-black px-4 py-2 rounded-full hover:bg-[#FFAB40] transition-colors text-sm ml-auto mb-6"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Add Tier
          </button>

          <div className="mb-2 grid grid-cols-[auto,200px,1fr,1fr,1fr,auto,auto] gap-4 items-center">
            <div></div>
            <p className="text-sm text-[#B8B8B8]">Tier Name</p>
            <p className="text-sm text-[#B8B8B8]">Number of Tickets</p>
            <p className="text-sm text-[#B8B8B8]">Price (₱)</p>
            <p className="text-sm text-[#B8B8B8]">Max Per Person</p>
            <div></div>
            <div></div>
          </div>

          <div className="space-y-3">
            {Object.keys(ticketTiers).map((tier) => (
              <div
                key={tier}
                className="grid grid-cols-[auto,200px,1fr,1fr,1fr,auto,auto] gap-4 items-center"
              >
                <input
                  type="checkbox"
                  checked={ticketTiers[tier].checked}
                  onChange={(e) => handleCheckboxChange(tier, e.target.checked)}
                  className="form-checkbox h-5 w-5 text-[#FFAB40] bg-[#2C2C2C] border-gray-600 rounded focus:ring-0 focus:outline-none"
                />
                {ticketTiers[tier].isEditing ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={editingTierName}
                      onChange={(e) => handleTierNameChange(e.target.value)}
                      className="bg-[#2C2C2C] text-white text-sm px-2 py-1 rounded mr-2"
                    />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <p className="text-white text-sm whitespace-nowrap mr-2">
                      {tier}
                    </p>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Number of tickets"
                  disabled={!ticketTiers[tier].checked}
                  value={ticketTiers[tier].number}
                  onChange={(e) => handleNumberChange(tier, e.target.value)}
                  className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded placeholder-gray-500 
                             border border-gray-600 focus:outline-none focus:border-[#FFAB40] 
                             whitespace-nowrap overflow-hidden text-ellipsis"
                />
                <input
                  type="text"
                  placeholder="Price"
                  disabled={!ticketTiers[tier].checked}
                  value={ticketTiers[tier].price}
                  onChange={(e) => handlePriceChange(tier, e.target.value)}
                  className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded placeholder-gray-500 
                             border border-gray-600 focus:outline-none focus:border-[#FFAB40] 
                             whitespace-nowrap overflow-hidden text-ellipsis"
                />
                {/* Input for Max Per Person */}
                <input
                  type="text"
                  placeholder="Max per person"
                  disabled={!ticketTiers[tier].checked}
                  value={ticketTiers[tier].maxPerPerson}
                  onChange={(e) =>
                    handleMaxPerPersonChange(tier, e.target.value)
                  }
                  className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded placeholder-gray-500 
                             border border-gray-600 focus:outline-none focus:border-[#FFAB40] 
                             whitespace-nowrap overflow-hidden text-ellipsis"
                />
                {/* Editing button that changes to a check mark when editing */}
                <button
                  onClick={
                    ticketTiers[tier].isEditing
                      ? saveNewTierName
                      : () => startEditingTierName(tier)
                  }
                  className={
                    ticketTiers[tier].isEditing
                      ? "text-green-500 hover:text-green-700 transition-colors"
                      : "text-[#FFAB40] hover:text-[#FFC661] transition-colors"
                  }
                >
                  {ticketTiers[tier].isEditing ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <EditIcon className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => deleteTier(tier)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <hr className="border-t border-gray-600 my-4" />

      <div className="mt-4 flex items-center justify-end">
        <span className="text-white text-sm mr-6">
          Total Number of Tickets:
        </span>
        <span className="text-[#FFAB40] font-semibold">
          {tierType === "freeSeating"
            ? freeSeatingTickets === ""
              ? 0
              : parseInt(freeSeatingTickets)
            : totalTickets}
        </span>
      </div>

      {/* Hidden button for parent component to trigger submit */}
      <button className="hidden ticket-submit-button" onClick={handleSubmit} />
    </div>
  );
};

// Update ClaimingDetails component to remove contact information sections
const ClaimingDetails = ({ onBack, onNext, eventType }) => {
  const [claimingDate, setClaimingDate] = useState("");
  const [claimingStartTime, setClaimingStartTime] = useState("");
  const [claimingEndTime, setClaimingEndTime] = useState("");
  const [claimingVenue, setClaimingVenue] = useState("");
  const [maxReservations, setMaxReservations] = useState("");
  const [dateList, setDateList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [claimingSummaries, setClaimingSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Sync dates from summaries to datelist
  const syncDateListWithSummaries = (summaries) => {
    const uniqueDates = [...new Set(summaries.map((summary) => summary.date))];
    setDateList(uniqueDates);
    if (selectedDate && !uniqueDates.includes(selectedDate))
      setSelectedDate(null);
  };

  // Add date to the list
  const addDate = () => {
    if (claimingDate && !dateList.includes(claimingDate)) {
      setDateList([...dateList, claimingDate]);
      setSelectedDate(claimingDate);
      setClaimingDate("");
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle max reservations change - only allow positive numbers
  const handleMaxReservationsChange = (value) => {
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) > 0)) {
      setMaxReservations(value);
    }
  };

  // Handle summary selection from the table
  const handleSelectSummary = (summary) => {
    setSelectedSummary(summary);
    setIsEditing(true);
    setClaimingDate(summary.date);
    setClaimingStartTime(summary.startTime);
    setClaimingEndTime(summary.endTime);
    setClaimingVenue(summary.venue);
    setMaxReservations(summary.maxReservations.toString());
  };

  // Clear all form fields
  const clearForm = () => {
    setClaimingDate("");
    setClaimingStartTime("");
    setClaimingEndTime("");
    setClaimingVenue("");
    setMaxReservations("");
    setSelectedDate(null);
    setSelectedSummary(null);
    setIsEditing(false);
  };

  const handleSubmit = () => {
    // For free or promotional events - simplified structure without contact info
    if (eventType === "free") {
      onNext({
        eventType: "free",
        claimingSummaries: claimingSummaries,
        availableDates: dateList,
      });
      return;
    }

    // For coming soon events - skip this step
    if (eventType === "coming_soon") {
      onNext({
        eventType: "coming_soon",
        claimingSummaries: [],
        availableDates: [],
      });
      return;
    }

    // For regular events with claiming details
    syncDateListWithSummaries(claimingSummaries);

    // Check if there's unsaved data
    if (
      (claimingDate || selectedDate) &&
      claimingStartTime &&
      claimingEndTime &&
      claimingVenue &&
      !isEditing
    ) {
      const confirmAdd = window.confirm(
        "You have unsaved claiming details. Would you like to add them to the schedule before continuing?"
      );

      if (confirmAdd) {
        const summaryData = {
          id: Date.now(),
          date: selectedDate || claimingDate,
          venue: claimingVenue,
          startTime: claimingStartTime,
          endTime: claimingEndTime,
          maxReservations:
            maxReservations === "" ? 0 : parseInt(maxReservations),
        };

        const updatedSummaries = [...claimingSummaries, summaryData];
        setClaimingSummaries(updatedSummaries);
        syncDateListWithSummaries(updatedSummaries);

        setTimeout(() => {
          onNext({
            claimingSummaries: updatedSummaries,
            availableDates: dateList,
          });
        }, 100);
        return;
      }
    }

    onNext({
      claimingSummaries: claimingSummaries,
      availableDates: dateList,
    });
  };

  // For free/promotional events, show a simplified form
  if (eventType === "free") {
    return (
      <div className="w-full">
        <div className="mb-4">
          <p className="text-[#FFAB40] text-2xl font-semibold mb-1">
            Claiming Details - Free Event
          </p>
          <p className="text-xs text-[#B8B8B8]">
            Set up claiming details for your free event tickets.
          </p>
        </div>

        <hr className="border-t border-gray-600 my-3" />

        <div className="flex flex-col space-y-3">
          {!isEditing && (
            <div className="flex items-center">
              <p className="text-[#FFAB40] text-sm mr-2">Available Date:</p>
              <input
                type="date"
                value={claimingDate}
                onChange={(e) => setClaimingDate(e.target.value)}
                className="w-auto max-w-xs bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
              />
              <button
                onClick={addDate}
                className="ml-2 bg-[#FFAB40] text-black px-3 py-1 rounded-full text-xs font-semibold"
              >
                Add to List
              </button>
            </div>
          )}

          {/* Rest of the claiming form same as for regular events */}
          {/* ... */}
        </div>

        <button
          className="hidden claiming-submit-button"
          onClick={handleSubmit}
        />
      </div>
    );
  }

  // For coming soon events, show a simplified message
  if (eventType === "coming_soon") {
    return (
      <div className="w-full">
        <div className="mb-4">
          <p className="text-[#FFAB40] text-2xl font-semibold mb-1">
            Coming Soon - Claiming Details
          </p>
          <p className="text-xs text-[#B8B8B8]">
            This is a "Coming Soon" event. Claiming details will be added later
            when the event is fully published.
          </p>
        </div>

        <hr className="border-t border-gray-600 my-3" />

        <div className="bg-[#1E1E1E] rounded-lg p-4 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="mb-4 flex justify-center">
              <InfoIcon className="h-12 w-12 text-[#FFAB40]" />
            </div>
            <p className="text-white text-lg mb-2">
              Claiming Details Not Required Yet
            </p>
            <p className="text-[#B8B8B8] text-sm">
              Since this is a "Coming Soon" event, you can skip this step. You
              can return later to add claiming details before the event goes
              live.
            </p>
          </div>
        </div>

        <button
          className="hidden claiming-submit-button"
          onClick={handleSubmit}
        />
      </div>
    );
  }

  // For ticketed events - regular form
  return (
    <div className="w-full mt-6">
      <div className="mb-4">
        <p className="text-[#FFAB40] text-2xl font-semibold mb-1">
          Claiming Details
        </p>
        <p className="text-xs text-[#B8B8B8]">
          Provide time, date, and location for claiming tickets. Ensure these
          details are clear for a smooth claiming process.
        </p>
      </div>

      <hr className="border-t border-gray-600 my-3" />

      <div className="flex flex-col space-y-3">
        {!isEditing && (
          <div className="flex items-center">
            <p className="text-[#FFAB40] text-sm mr-2">Available Date:</p>
            <input
              type="date"
              value={claimingDate}
              onChange={(e) => setClaimingDate(e.target.value)}
              className="w-auto max-w-xs bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
            />
            <button
              onClick={addDate}
              className="ml-2 bg-[#FFAB40] text-black px-3 py-1 rounded-full text-xs font-semibold"
            >
              Add to List
            </button>
          </div>
        )}

        <div className="flex space-x-4">
          {/* Left side: Date section */}
          <div className="w-1/2">
            {isEditing ? (
              <div className="flex flex-col">
                <p className="text-[#FFAB40] text-sm mb-1">Claiming Date:</p>
                <input
                  type="date"
                  value={claimingDate}
                  onChange={(e) => setClaimingDate(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
                />
                <p className="text-[#B8B8B8] text-xs mt-1">
                  Edit date directly when updating a schedule.
                </p>
              </div>
            ) : (
              <>
                <p className="text-[#FFAB40] text-sm mb-1">
                  Available Claiming Dates:
                </p>
                {dateList.length > 0 ? (
                  <table className="w-full bg-[#1E1E1E] rounded overflow-hidden">
                    <thead className="bg-[#FFAB40]">
                      <tr>
                        <th className="py-1 px-3 text-left text-sm text-black font-semibold">
                          Date
                        </th>
                        <th className="py-1 px-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dateList.map((date, index) => (
                        <tr
                          key={index}
                          className={`border-t border-[#333333] cursor-pointer ${
                            selectedDate === date
                              ? "bg-[#FFAB40]/70"
                              : "hover:bg-[#2A2A2A]"
                          }`}
                          onClick={() => {
                            setSelectedDate(date);
                            setClaimingDate(date);

                            const relatedSummary = claimingSummaries.find(
                              (summary) => summary.date === date
                            );

                            if (relatedSummary) {
                              setClaimingStartTime(relatedSummary.startTime);
                              setClaimingEndTime(relatedSummary.endTime);
                              setClaimingVenue(relatedSummary.venue);
                              setMaxReservations(
                                relatedSummary.maxReservations.toString()
                              );
                              setSelectedSummary(relatedSummary);
                              setIsEditing(true);
                            } else {
                              setClaimingStartTime("");
                              setClaimingEndTime("");
                              setClaimingVenue("");
                              setMaxReservations("");
                              setSelectedSummary(null);
                              setIsEditing(false);
                            }
                          }}
                        >
                          <td
                            className={`py-1 px-3 text-sm ${
                              selectedDate === date
                                ? "text-black"
                                : "text-white"
                            }`}
                          >
                            {formatDate(date)}
                          </td>
                          <td className="py-1 px-2 text-right w-8">
                            {selectedDate === date && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDateList(
                                    dateList.filter((d) => d !== date)
                                  );
                                  setSelectedDate(null);
                                }}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="w-full bg-[#1E1E1E] rounded p-3 h-24 flex items-center justify-center">
                    <p className="text-sm text-gray-400 italic">
                      No dates added yet.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="w-1/2 space-y-3">
            <div className="flex flex-col">
              <p className="text-[#FFAB40] text-sm mb-1">Claiming Time:</p>
              <div className="flex space-x-2 items-center">
                <input
                  type="time"
                  value={claimingStartTime}
                  onChange={(e) => setClaimingStartTime(e.target.value)}
                  className="bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
                />
                <p className="text-white text-sm">to</p>
                <input
                  type="time"
                  value={claimingEndTime}
                  onChange={(e) => setClaimingEndTime(e.target.value)}
                  className="bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <p className="text-[#FFAB40] text-sm mb-1">Claiming Venue:</p>
              <input
                type="text"
                placeholder="Enter venue for ticket claiming"
                value={claimingVenue}
                onChange={(e) => setClaimingVenue(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
              />
            </div>

            <div className="flex flex-col">
              <p className="text-[#FFAB40] text-sm mb-1">Max Reservations:</p>
              <input
                type="text"
                placeholder="Enter max number of reservations"
                value={maxReservations}
                onChange={(e) => handleMaxReservationsChange(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
              />
              <p className="text-[#B8B8B8] text-xs mt-1">
                Maximum allowed for this claiming date.
              </p>
            </div>

            {/* Add/Update Button */}
            <div className="flex justify-between mt-1">
              {isEditing && (
                <button
                  onClick={clearForm}
                  className="flex items-center bg-gray-700 text-white px-3 py-1 rounded-full hover:bg-gray-600 text-sm font-semibold"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={() => {
                  if (isEditing) {
                    if (
                      claimingDate &&
                      claimingVenue &&
                      claimingStartTime &&
                      claimingEndTime
                    ) {
                      const summaryData = {
                        id: selectedSummary.id,
                        date: claimingDate,
                        venue: claimingVenue,
                        startTime: claimingStartTime,
                        endTime: claimingEndTime,
                        maxReservations:
                          maxReservations === ""
                            ? 0
                            : parseInt(maxReservations),
                      };

                      const updatedSummaries = claimingSummaries.map((s) =>
                        s.id === selectedSummary.id ? summaryData : s
                      );
                      setClaimingSummaries(updatedSummaries);
                      syncDateListWithSummaries(updatedSummaries);
                      clearForm();
                    } else {
                      alert(
                        "Please provide all required information (date, venue, and time)"
                      );
                    }
                  } else {
                    const dateToUse = claimingDate || selectedDate;

                    if (
                      dateToUse &&
                      claimingVenue &&
                      claimingStartTime &&
                      claimingEndTime
                    ) {
                      if (claimingDate && !dateList.includes(claimingDate)) {
                        setDateList([...dateList, claimingDate]);
                      }

                      const summaryData = {
                        id: Date.now(),
                        date: dateToUse,
                        venue: claimingVenue,
                        startTime: claimingStartTime,
                        endTime: claimingEndTime,
                        maxReservations:
                          maxReservations === ""
                            ? 0
                            : parseInt(maxReservations),
                      };

                      const updatedSummaries = [
                        ...claimingSummaries,
                        summaryData,
                      ];
                      setClaimingSummaries(updatedSummaries);
                      syncDateListWithSummaries(updatedSummaries);
                      clearForm();
                    } else {
                      alert(
                        "Please provide all required information (date, venue, and time)"
                      );
                    }
                  }
                }}
                className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ml-auto ${
                  isEditing
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-white hover:bg-[#FFAB40] text-black"
                }`}
                disabled={!isEditing && !selectedDate && !claimingDate}
              >
                {isEditing ? (
                  <>
                    <CheckIcon className="mr-1 h-4 w-4" /> Save Changes
                  </>
                ) : (
                  <>
                    <PlusIcon className="mr-1 h-4 w-4" /> Add Schedule
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Claiming Schedule Summary Table */}
        <div className="mt-4">
          <p className="text-[#FFAB40] text-sm mb-1">
            Claiming Schedule Summary:
            <span className="text-[#B8B8B8] text-xs ml-2">
              (Click a row to edit)
            </span>
          </p>

          {claimingSummaries.length > 0 ? (
            <table className="w-full bg-[#1E1E1E] rounded overflow-hidden">
              <thead className="bg-[#FFAB40]">
                <tr>
                  <th className="py-1 px-3 text-left text-sm text-black font-semibold">
                    Date
                  </th>
                  <th className="py-1 px-3 text-left text-sm text-black font-semibold">
                    Time
                  </th>
                  <th className="py-1 px-3 text-left text-sm text-black font-semibold">
                    Venue
                  </th>
                  <th className="py-1 px-3 text-left text-sm text-black font-semibold">
                    Max
                  </th>
                  <th className="py-1 px-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {claimingSummaries.map((summary) => (
                  <tr
                    key={summary.id}
                    className={`border-t border-[#333333] cursor-pointer ${
                      selectedSummary?.id === summary.id
                        ? "bg-[#FFAB40]/70"
                        : "hover:bg-[#2A2A2A]"
                    }`}
                    onClick={() => handleSelectSummary(summary)}
                  >
                    <td
                      className={`py-1 px-3 text-sm ${
                        selectedSummary?.id === summary.id
                          ? "text-black"
                          : "text-white"
                      }`}
                    >
                      {formatDate(summary.date)}
                    </td>
                    <td
                      className={`py-1 px-3 text-sm ${
                        selectedSummary?.id === summary.id
                          ? "text-black"
                          : "text-white"
                      }`}
                    >
                      {summary.startTime} to {summary.endTime}
                    </td>
                    <td
                      className={`py-1 px-3 text-sm ${
                        selectedSummary?.id === summary.id
                          ? "text-black"
                          : "text-white"
                      }`}
                    >
                      {summary.venue}
                    </td>
                    <td
                      className={`py-1 px-3 text-sm ${
                        selectedSummary?.id === summary.id
                          ? "text-black"
                          : "text-white"
                      }`}
                    >
                      {summary.maxReservations}
                    </td>
                    <td className="py-1 px-2 text-right">
                      {selectedSummary?.id === summary.id && (
                        <div className="flex space-x-1 justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const updatedSummaries = claimingSummaries.filter(
                                (s) => s.id !== summary.id
                              );
                              setClaimingSummaries(updatedSummaries);
                              syncDateListWithSummaries(updatedSummaries);
                              clearForm();
                            }}
                            className="text-red-500 hover:text-red-700 bg-black rounded-full p-1"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="w-full bg-[#1E1E1E] rounded p-3 h-16 flex items-center justify-center">
              <p className="text-sm text-gray-400 italic">
                No claiming schedules added yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden button for parent component to trigger submit */}
      <button
        className="hidden claiming-submit-button"
        onClick={handleSubmit}
      />
    </div>
  );
};

// Modified AvailabilityDetails component
const AvailabilityDetails = ({ onBack, onNext, eventType }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = () => {
    // For all event types, use simplified data structure
    const availabilityData = {
      eventType,
      period: {
        startDate: startDate || new Date().toISOString().split("T")[0], // default to today
        endDate:
          endDate ||
          new Date(new Date().setMonth(new Date().getMonth() + 1))
            .toISOString()
            .split("T")[0], // default to a month from now
        startTime: startTime || "08:00",
        endTime: endTime || "20:00",
      },
    };

    // Pass the data to the parent component
    onNext(availabilityData);
  };

  // For free events, show a modified form
  if (eventType === "free") {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
              Free Event Display Period
            </p>
            <p className="text-[13px] text-[#B8B8B8] mb-4">
              Set when this free event should appear on the platform
            </p>
          </div>
        </div>

        <hr className="border-t border-gray-600 my-4" />

        <div className="flex gap-6">
          <div className="w-1/3">
            <p className="text-[#FFAB40] text-sm mb-2">Event Preview</p>
            <div className="w-full aspect-square bg-[#1E1E1E] border-2 border-dashed border-[#FFAB40] rounded-lg flex items-center justify-center overflow-hidden">
              <div className="text-center p-4">
                <span className="bg-[#FFAB40] text-black px-2 py-1 rounded text-xs font-medium mb-2 inline-block">
                  FREE
                </span>
                <div className="text-[#B8B8B8] text-sm mt-2">
                  Event Image Preview
                </div>
              </div>
            </div>
          </div>

          <div className="w-2/3 space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-[#FFAB40] text-sm mb-1">Start Date:</p>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <p className="text-[#FFAB40] text-sm mb-1">End Date:</p>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <p className="text-[#FFAB40] text-sm mb-1">
                  Daily Opening Time:
                </p>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
                />
                <p className="text-[#B8B8B8] text-xs mt-1">
                  Time when reservations open each day
                </p>
              </div>

              <div>
                <p className="text-[#FFAB40] text-sm mb-1">
                  Daily Closing Time:
                </p>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
                />
                <p className="text-[#B8B8B8] text-xs mt-1">
                  Time when reservations close each day
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[#B8B8B8] text-xs mt-4 border-t border-gray-600 pt-4">
          Note: This is a free event. All tickets will be available at no cost.
        </p>

        {/* Hidden button for parent component to trigger submit */}
        <button
          className="hidden availability-submit-button"
          onClick={handleSubmit}
        />
      </div>
    );
  }

  // For coming soon events, also show a modified form
  if (eventType === "coming_soon") {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
              "Coming Soon" Display Period
            </p>
            <p className="text-[13px] text-[#B8B8B8] mb-4">
              Set when this "Coming Soon" event should appear on the platform
            </p>
          </div>
        </div>

        <hr className="border-t border-gray-600 my-4" />

        <div className="flex gap-6">
          <div className="w-1/3">
            <p className="text-[#FFAB40] text-sm mb-2">Event Preview</p>
            <div className="w-full aspect-square bg-[#1E1E1E] border-2 border-dashed border-[#FFAB40] rounded-lg flex items-center justify-center overflow-hidden">
              <div className="text-center p-4">
                <span className="bg-[#FFAB40] text-black px-2 py-1 rounded text-xs font-medium mb-2 inline-block">
                  COMING SOON
                </span>
                <div className="text-[#B8B8B8] text-sm mt-2">
                  Event Image Preview
                </div>
              </div>
            </div>
          </div>

          <div className="w-2/3 space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-[#FFAB40] text-sm mb-1">Start Date:</p>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
                />
                <p className="text-xs text-[#B8B8B8] mt-1">
                  When should this "Coming Soon" event start appearing?
                </p>
              </div>

              <div>
                <p className="text-[#FFAB40] text-sm mb-1">End Date:</p>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
                />
                <p className="text-xs text-[#B8B8B8] mt-1">
                  When should the "Coming Soon" notice be removed if not
                  updated?
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[#B8B8B8] text-xs mt-4 border-t border-gray-600 pt-4">
          Note: This event will be displayed with a "COMING SOON" label until
          you update it with complete information.
        </p>

        {/* Hidden button for parent component to trigger submit */}
        <button
          className="hidden availability-submit-button"
          onClick={handleSubmit}
        />
      </div>
    );
  }

  // For ticketed events - full form
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
            Event Availability Period
          </p>
          <p className="text-[13px] text-[#B8B8B8] mb-4">
            Set when the event should appear on the platform and be available
            for reservations
          </p>
        </div>
      </div>

      <hr className="border-t border-gray-600 my-4" />

      <div className="flex gap-6">
        {/* Event Picture Preview */}
        <div className="w-1/3">
          <p className="text-[#FFAB40] text-sm mb-2">Event Preview</p>
          <div className="w-full aspect-square bg-[#1E1E1E] border-2 border-dashed border-[#FFAB40] rounded-lg flex items-center justify-center overflow-hidden">
            <div className="text-[#B8B8B8] text-sm">Event Image Preview</div>
          </div>
        </div>

        {/* Availability Period Inputs */}
        <div className="w-2/3 space-y-4">
          <div className="space-y-3">
            <div>
              <p className="text-[#FFAB40] text-sm mb-1">Start Date:</p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="text-[#FFAB40] text-sm mb-1">End Date:</p>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="text-[#FFAB40] text-sm mb-1">Daily Opening Time:</p>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
              />
              <p className="text-[#B8B8B8] text-xs mt-1">
                Time when reservations open each day
              </p>
            </div>

            <div>
              <p className="text-[#FFAB40] text-sm mb-1">Daily Closing Time:</p>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
              />
              <p className="text-[#B8B8B8] text-xs mt-1">
                Time when reservations close each day
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden button for parent component to trigger submit */}
      <button
        className="hidden availability-submit-button"
        onClick={handleSubmit}
      />
    </div>
  );
};

const SummaryDetails = ({
  eventDetails,
  ticketDetails,
  claimingDetails,
  availabilityDetails,
  onBack,
  onNext,
}) => {
  // Get event type
  const eventType = eventDetails?.eventType || "ticketed";

  // Calculate total tickets
  const getTotalTickets = () => {
    if (eventType === "free") {
      return ticketDetails?.freeSeating?.numberOfTickets || 0;
    }

    if (eventType === "coming_soon" && ticketDetails?.hasTierInfo) {
      if (ticketDetails.tierType === "freeSeating") {
        return ticketDetails?.freeSeating?.numberOfTickets || 0;
      } else {
        let total = 0;
        if (ticketDetails?.ticketTiers) {
          Object.entries(ticketDetails.ticketTiers)
            .filter(([_, tierData]) => tierData.checked)
            .forEach(([_, tierData]) => {
              total += tierData.number || 0;
            });
        }
        return total;
      }
    }

    if (ticketDetails?.tierType === "freeSeating") {
      return ticketDetails?.freeSeating?.numberOfTickets || 0;
    } else {
      let total = 0;
      if (ticketDetails?.ticketTiers) {
        Object.entries(ticketDetails.ticketTiers)
          .filter(([_, tierData]) => tierData.checked)
          .forEach(([_, tierData]) => {
            total += tierData.number || 0;
          });
      }
      return total;
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
            Summary Details
          </p>
          <p className="text-[13px] text-[#B8B8B8] mb-4">
            Review and confirm the details of your event
          </p>
        </div>
      </div>

      <hr className="border-t border-gray-600 my-4" />

      <div className="space-y-6">
        {/* Event Details Summary */}
        <div>
          <h3 className="text-[#FFAB40] text-xl font-semibold mb-2">
            Event Information
          </h3>
          <div className="bg-[#1E1E1E] rounded-lg p-4">
            <div className="flex gap-4">
              <div className="w-1/3">
                {eventDetails?.imagePreview ? (
                  <div className="relative">
                    <img
                      src={eventDetails.imagePreview}
                      alt="Event"
                      className="w-full aspect-video object-cover rounded-lg"
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
                <div>
                  <p className="text-[#B8B8B8] text-xs">Event Name</p>
                  <p className="text-white">
                    {eventDetails?.eventName || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-[#B8B8B8] text-xs">Event Date</p>
                  <p className="text-white">
                    {eventDetails?.eventDate || "N/A"}
                    {eventType === "coming_soon" && (
                      <span className="text-[#FFAB40] ml-2 text-xs">
                        (Tentative)
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[#B8B8B8] text-xs">Venue</p>
                  <p className="text-white">
                    {eventDetails?.venue || "N/A"}
                    {eventType === "coming_soon" && (
                      <span className="text-[#FFAB40] ml-2 text-xs">
                        (Tentative)
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[#B8B8B8] text-xs">Time</p>
                  <p className="text-white">
                    {eventDetails?.startTime && eventDetails?.endTime
                      ? `${eventDetails.startTime} to ${eventDetails.endTime}`
                      : "N/A"}
                    {eventType === "coming_soon" && (
                      <span className="text-[#FFAB40] ml-2 text-xs">
                        (Tentative)
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[#B8B8B8] text-xs">Category</p>
                  <p className="text-white">
                    {eventDetails?.eventCategory || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-[#B8B8B8] text-xs">Event Type</p>
                  <p className="text-white">
                    {eventType === "ticketed" && "Ticketed Event"}
                    {eventType === "coming_soon" && "Coming Soon Event"}
                    {eventType === "free" && "Free Event"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-[#B8B8B8] text-xs">Description</p>
              <p className="text-white text-sm">
                {eventDetails?.eventDescription || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Details Summary */}
        <div>
          <h3 className="text-[#FFAB40] text-xl font-semibold mb-2">TICKETS</h3>
          <div className="bg-[#1E1E1E] rounded-lg p-4">
            {eventType === "free" && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="mr-3 text-[#FFAB40]">
                    <InfoIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <span className="text-white font-semibold">Free Event</span>
                    <p className="text-gray-400 text-sm">
                      This is a free event. All tickets are available at no
                      cost.
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Total tickets:{" "}
                      {ticketDetails?.freeSeating?.numberOfTickets || 0}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Max per person:{" "}
                      {ticketDetails?.freeSeating?.maxPerPerson || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Coming Soon with NO ticket info */}
            {eventType === "coming_soon" && !ticketDetails?.hasTierInfo && (
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
                      Ticket details will be available when this event is fully
                      published.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Coming Soon WITH ticket tiers */}
            {eventType === "coming_soon" && ticketDetails?.hasTierInfo && (
              <div>
                <div className="flex items-center mb-3">
                  <div className="mr-3 text-[#FFAB40]">
                    <InfoIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      Coming Soon - Preliminary Ticket Structure
                    </p>
                    <p className="text-gray-400 text-sm">
                      These ticket details are planned but not yet available for
                      reservations.
                    </p>
                  </div>
                </div>

                {ticketDetails.tierType === "freeSeating" ? (
                  <div className="flex items-center mt-4 mb-3 bg-[#272727] p-3 rounded-lg">
                    <div className="mr-3">
                      <span className="inline-flex items-center">
                        <svg
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-400"
                        >
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                          <line x1="7" y1="7" x2="7.01" y2="7"></line>
                        </svg>
                      </span>
                    </div>
                    <div>
                      <span className="text-white text-xl font-bold">
                        ₱{ticketDetails.freeSeating.price}
                      </span>
                      <p className="text-gray-400 text-sm">
                        1 ticket, Free Seating
                      </p>
                      <p className="text-gray-400 text-xs">
                        Max per person: {ticketDetails.freeSeating.maxPerPerson}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4 mt-4 mb-3">
                    {ticketDetails?.ticketTiers &&
                      Object.entries(ticketDetails.ticketTiers)
                        .filter(([_, tierData]) => tierData.checked)
                        .map(([tierName, tierData]) => (
                          <div
                            key={tierName}
                            className="bg-[#272727] p-3 rounded-lg flex items-center"
                          >
                            <div className="mr-3">
                              <span className="inline-flex items-center">
                                <svg
                                  viewBox="0 0 24 24"
                                  width="24"
                                  height="24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-gray-400"
                                >
                                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                </svg>
                              </span>
                            </div>
                            <div>
                              <span className="text-white text-xl font-bold">
                                ₱{tierData.price}
                              </span>
                              <p className="text-gray-400 text-sm">
                                1 ticket, {tierName}
                              </p>
                              <p className="text-gray-400 text-xs">
                                Max per person: {tierData.maxPerPerson}
                              </p>
                            </div>
                          </div>
                        ))}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-700">
                  <p className="text-gray-400 text-sm font-semibold">
                    Planned capacity:{" "}
                    <span className="text-[#FFAB40]">
                      {getTotalTickets()} tickets
                    </span>
                  </p>
                  <p className="text-gray-400 text-xs mt-1 italic">
                    Final ticket details may change when the event is fully
                    published.
                  </p>
                </div>
              </div>
            )}

            {eventType === "ticketed" &&
              ticketDetails?.tierType === "freeSeating" && (
                <div className="flex items-center mb-4">
                  <div className="bg-[#272727] p-3 rounded-lg flex items-center">
                    <div className="mr-3">
                      <span className="inline-flex items-center">
                        <svg
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-400"
                        >
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                          <line x1="7" y1="7" x2="7.01" y2="7"></line>
                        </svg>
                      </span>
                    </div>
                    <div>
                      <span className="text-white text-xl font-bold">
                        ₱{ticketDetails.freeSeating.price}
                      </span>
                      <p className="text-gray-400 text-sm">
                        1 ticket, Free Seating
                      </p>
                      <p className="text-gray-400 text-xs">
                        Max per person: {ticketDetails.freeSeating.maxPerPerson}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            {eventType === "ticketed" &&
              ticketDetails?.tierType === "ticketed" && (
                <div className="flex flex-wrap gap-4 mb-4">
                  {ticketDetails?.ticketTiers &&
                    Object.entries(ticketDetails.ticketTiers)
                      .filter(([_, tierData]) => tierData.checked)
                      .map(([tierName, tierData]) => (
                        <div
                          key={tierName}
                          className="bg-[#272727] p-3 rounded-lg flex items-center"
                        >
                          <div className="mr-3">
                            <span className="inline-flex items-center">
                              <svg
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-gray-400"
                              >
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                <line x1="7" y1="7" x2="7.01" y2="7"></line>
                              </svg>
                            </span>
                          </div>
                          <div>
                            <span className="text-white text-xl font-bold">
                              ₱{tierData.price}
                            </span>
                            <p className="text-gray-400 text-sm">
                              1 ticket, {tierName}
                            </p>
                            <p className="text-gray-400 text-xs">
                              Max per person: {tierData.maxPerPerson}
                            </p>
                          </div>
                        </div>
                      ))}
                </div>
              )}

            {(eventType === "ticketed" ||
              eventType === "free" ||
              (eventType === "coming_soon" && ticketDetails?.hasTierInfo)) && (
              <div className="mt-4 border-t border-gray-700 pt-4">
                <p className="uppercase text-white font-medium">
                  TOTAL NUMBER OF TICKETS:{" "}
                  <span className="text-[#FFAB40]">
                    {getTotalTickets()}{" "}
                    {eventType === "coming_soon" ? "Planned" : "Available"}{" "}
                    Tickets
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rest of the component with claiming details and availability details */}
        {/* ... */}
      </div>
    </div>
  );
};
// Modified Admin_PublishEvent component
// Modified Admin_PublishEvent component with Save as Draft button
const Admin_PublishEvent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventDetails, setEventDetails] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [claimingDetails, setClaimingDetails] = useState(null);
  const [availabilityDetails, setAvailabilityDetails] = useState(null);

  const handleEventDetailsNext = (details) => {
    setEventDetails(details);
    setCurrentStep(2);
  };

  const handleTicketDetailsNext = (details) => {
    setTicketDetails(details);
    setCurrentStep(3);
  };

  const handleClaimingDetailsNext = (details) => {
    setClaimingDetails(details);
    setCurrentStep(4);
  };

  const handleAvailabilityDetailsNext = (details) => {
    setAvailabilityDetails(details);
    setCurrentStep(5);
  };

  const handleSummaryNext = () => {
    console.log("Full Event Details:", {
      eventDetails,
      ticketDetails,
      claimingDetails,
      availabilityDetails,
    });

    const eventType = eventDetails?.eventType || "ticketed";
    let successMessage = "";

    if (eventType === "ticketed") {
      successMessage =
        "Ticketed event successfully created and ready for reservations!";
    } else if (eventType === "coming_soon") {
      successMessage =
        "Coming Soon event successfully created! You can update it with full details later.";
    } else if (eventType === "free") {
      successMessage =
        "Free event successfully created! Users can reserve tickets at no cost.";
    }

    alert(successMessage);
  };

  const handleSaveAsDraft = () => {
    // Collect current data regardless of which step the user is on
    const draftData = {
      eventDetails,
      ticketDetails,
      claimingDetails,
      availabilityDetails,
      currentStep,
      savedAt: new Date().toISOString(),
      isDraft: true,
    };

    console.log("Saving draft:", draftData);
    // Here you would typically send this to your API or store it locally

    alert("Event saved as draft. You can continue editing later.");
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  // Get the event type from current eventDetails or default to "ticketed"
  const eventType = eventDetails?.eventType || "ticketed";

  return (
    <div className="flex-col font-Poppins">
      <Header_Admin />
      <div className="flex">
        <Sidebar_Admin />

        <div className="bg-[#272727] flex items-center justify-center w-full p-6">
          <div className="w-full max-w-4xl">
            {currentStep === 1 && (
              <EventDetails onNext={handleEventDetailsNext} />
            )}
            {currentStep === 2 && (
              <TicketDetails
                eventType={eventType}
                onBack={handleBack}
                onNext={handleTicketDetailsNext}
              />
            )}
            {currentStep === 3 && (
              <ClaimingDetails
                eventType={eventType}
                onBack={handleBack}
                onNext={handleClaimingDetailsNext}
              />
            )}
            {currentStep === 4 && (
              <AvailabilityDetails
                eventType={eventType}
                onBack={handleBack}
                onNext={handleAvailabilityDetailsNext}
              />
            )}
            {currentStep === 5 && (
              <SummaryDetails
                eventDetails={eventDetails}
                ticketDetails={ticketDetails}
                claimingDetails={claimingDetails}
                availabilityDetails={availabilityDetails}
                onBack={handleBack}
                onNext={handleSummaryNext}
              />
            )}

            <hr className="border-t border-gray-600 my-4" />

            <div className="flex justify-between space-x-4">
              {/* Left side - Save as Draft button */}
              <button
                onClick={handleSaveAsDraft}
                className="bg-neutral-700 text-white px-9 py-2 rounded-full text-xs font-semibold hover:bg-gray-600 transition-colors"
              >
                Save as Draft
              </button>

              {/* Right side - Navigation buttons */}
              <div className="flex space-x-4">
                {currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    className="bg-neutral-900 text-white px-9 py-2 rounded-full text-xs font-semibold"
                  >
                    Back
                  </button>
                )}

                {currentStep === 1 && (
                  <button
                    onClick={() => {
                      document.querySelector(".event-submit-button").click();
                    }}
                    className="bg-white text-black px-9 py-2 rounded-full text-xs font-semibold"
                  >
                    Next
                  </button>
                )}

                {currentStep === 2 && (
                  <button
                    onClick={() => {
                      document.querySelector(".ticket-submit-button").click();
                    }}
                    className="bg-white text-black px-9 py-2 rounded-full text-xs font-semibold"
                  >
                    Next
                  </button>
                )}

                {currentStep === 3 && (
                  <button
                    onClick={() => {
                      document.querySelector(".claiming-submit-button").click();
                    }}
                    className="bg-white text-black px-9 py-2 rounded-full text-xs font-semibold"
                  >
                    Next
                  </button>
                )}

                {currentStep === 4 && (
                  <button
                    onClick={() => {
                      document
                        .querySelector(".availability-submit-button")
                        .click();
                    }}
                    className="bg-white text-black px-9 py-2 rounded-full text-xs font-semibold"
                  >
                    Next
                  </button>
                )}

                {currentStep === 5 && (
                  <button
                    onClick={handleSummaryNext}
                    className="bg-[#FFAB40] text-black px-9 py-2 rounded-full text-xs font-semibold"
                  >
                    {eventType === "coming_soon"
                      ? "Save as Coming Soon"
                      : eventType === "free"
                      ? "Publish Free Event"
                      : "Publish Ticketed Event"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin_PublishEvent;
