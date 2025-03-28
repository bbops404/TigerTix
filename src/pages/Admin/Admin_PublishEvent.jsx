import React, { useState, useRef } from "react";
import Sidebar_Admin from "../../components/SideBar_Admin";
import Header_Admin from "../../components/Header_Admin";
import { PlusIcon, TrashIcon, EditIcon, CheckIcon } from "lucide-react";

const EventDetails = ({ onNext }) => {
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventCategory, setEventCategory] = useState("");
  const [eventType, setEventType] = useState("free");
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
    };

    // Pass data to parent
    onNext(eventDetailsData);
  };

  return (
    <div>
      <p className="text-[#FFAB40] text-3xl font-semibold mb-2">Add an Event</p>
      <p className="text-[13px] text-[#B8B8B8] mb-4">
        Create a new event for the reservation system by filling out the
        necessary details. Ensure all information is accurate before saving to
        allow seamless user reservations.
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
              <option value="conference">Conference</option>
              <option value="workshop">Workshop</option>
              <option value="concert">Concert</option>
              <option value="exhibition">Exhibition</option>
            </select>
          </div>
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Type:</p>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="free"
                  checked={eventType === "free"}
                  onChange={() => setEventType("free")}
                  className="form-radio bg-[#1E1E1E] border-[#333333] text-white"
                />
                <span className="ml-2 text-white text-sm">Free Event</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="ticketed"
                  checked={eventType === "ticketed"}
                  onChange={() => setEventType("ticketed")}
                  className="form-radio bg-[#1E1E1E] border-[#333333] text-white"
                />
                <span className="ml-2 text-white text-sm">Ticketed Event</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden button for parent component to trigger submit */}
      <button className="hidden event-submit-button" onClick={handleSubmit} />
    </div>
  );
};

const TicketDetails = ({ onBack, onNext }) => {
  const [totalTickets, setTotalTickets] = useState(0);
  const [tierType, setTierType] = useState("freeSeating");
  const [ticketTiers, setTicketTiers] = useState({
    "General Admission": {
      number: 0,
      price: 0,
      checked: false,
      isEditing: false,
    },
    "Upper Box": { number: 0, price: 0, checked: false, isEditing: false },
    "Lower Box": { number: 0, price: 0, checked: false, isEditing: false },
    Patron: { number: 0, price: 0, checked: false, isEditing: false },
    VIP: { number: 0, price: 0, checked: false, isEditing: false },
  });
  const [editingTierName, setEditingTierName] = useState("");

  const handleNumberChange = (tier, value) => {
    const updatedTiers = { ...ticketTiers };
    updatedTiers[tier].number = parseInt(value) || 0;
    setTicketTiers(updatedTiers);

    // Recalculate total tickets
    const total = Object.values(updatedTiers).reduce(
      (sum, tier) => sum + (tier.checked ? tier.number : 0),
      0
    );
    setTotalTickets(total);
  };

  const handlePriceChange = (tier, value) => {
    const updatedTiers = { ...ticketTiers };
    updatedTiers[tier].price = parseFloat(value) || 0;
    setTicketTiers(updatedTiers);
  };

  const handleCheckboxChange = (tier, isChecked) => {
    const updatedTiers = { ...ticketTiers };
    updatedTiers[tier].checked = isChecked;

    // Reset number and price if unchecked
    if (!isChecked) {
      updatedTiers[tier].number = 0;
      updatedTiers[tier].price = 0;
    }

    setTicketTiers(updatedTiers);

    // Recalculate total tickets
    const total = Object.values(updatedTiers).reduce(
      (sum, tier) => sum + (tier.checked ? tier.number : 0),
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
      [newTierName]: { number: 0, price: 0, checked: false, isEditing: false },
    }));
  };

  const deleteTier = (tierToDelete) => {
    // Create a new object without the deleted tier
    const { [tierToDelete]: removedTier, ...remainingTiers } = ticketTiers;

    // Update state and recalculate total tickets
    setTicketTiers(remainingTiers);

    // Recalculate total tickets
    const total = Object.values(remainingTiers).reduce(
      (sum, tier) => sum + (tier.checked ? tier.number : 0),
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

  const handleSubmit = () => {
    // Collect ticket information without validation
    const ticketDetailsData = {
      tierType,
      ticketTiers,
      totalTickets: tierType === "freeSeating" ? "Unlimited" : totalTickets,
    };

    // Pass the collected data to the parent component
    onNext(ticketDetailsData);
  };

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

      {/* Only show ticket tiers and Add Tier button when "Ticketed" is selected */}
      {tierType === "ticketed" && (
        <>
          <button
            onClick={addNewTier}
            className="flex items-center bg-white text-black px-4 py-2 rounded-full hover:bg-[#FFAB40] transition-colors text-sm ml-auto mb-6"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Add Tier
          </button>

          <div className="space-y-3">
            {Object.keys(ticketTiers).map((tier) => (
              <div
                key={tier}
                className="grid grid-cols-[auto,200px,1fr,1fr,auto,auto] gap-4 items-center"
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
                  value={ticketTiers[tier].number || ""}
                  onChange={(e) => handleNumberChange(tier, e.target.value)}
                  className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded placeholder-gray-500 
                             border border-gray-600 focus:outline-none focus:border-[#FFAB40] 
                             whitespace-nowrap overflow-hidden text-ellipsis"
                />
                <input
                  type="text"
                  placeholder="Price"
                  disabled={!ticketTiers[tier].checked}
                  value={ticketTiers[tier].price || ""}
                  onChange={(e) => handlePriceChange(tier, e.target.value)}
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
          {tierType === "freeSeating" ? "Unlimited" : totalTickets}
        </span>
      </div>

      {/* Hidden button for parent component to trigger submit */}
      <button className="hidden ticket-submit-button" onClick={handleSubmit} />
    </div>
  );
};

const ClaimingDetails = ({ onBack, onNext }) => {
  const [claimingDate, setClaimingDate] = useState("");
  const [claimingStartTime, setClaimingStartTime] = useState("");
  const [claimingEndTime, setClaimingEndTime] = useState("");
  const [claimingVenue, setClaimingVenue] = useState("");

  // State for tracking the list of dates and selected date
  const [dateList, setDateList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // Function to add a date to the list
  const addDate = () => {
    if (claimingDate && !dateList.includes(claimingDate)) {
      setDateList([...dateList, claimingDate]);
      setSelectedDate(claimingDate); // Automatically select the newly added date
      setClaimingDate(""); // Clear the input
    }
  };

  // Function to format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmit = () => {
    // Collect claiming details without validation
    const claimingDetailsData = {
      claimingDate: selectedDate,
      claimingTime: {
        start: claimingStartTime,
        end: claimingEndTime,
      },
      claimingVenue,
      availableDates: dateList,
    };

    // Pass the data to the parent
    onNext(claimingDetailsData);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
            Claiming Details
          </p>
          <p className="text-[13px] text-[#B8B8B8] mb-4">
            Provide the time, date, and location for claiming tickets. Ensure
            these details are clear and accessible to all reserved users for a
            smooth claiming process.
          </p>
        </div>
      </div>

      <hr className="border-t border-gray-600 my-4" />

      <div className="flex flex-col space-y-4">
        <div className="flex items-center">
          <p className="text-[#FFAB40] text-sm mr-2">Claiming Date:</p>
          <input
            type="date"
            value={claimingDate}
            onChange={(e) => setClaimingDate(e.target.value)}
            className="w-auto max-w-xs bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
          />
          <button
            onClick={addDate}
            className="ml-2 bg-[#FFAB40] text-black px-3 py-2 rounded-full text-xs font-semibold"
          >
            Add Date
          </button>
        </div>

        <div className="flex">
          <div className="w-full">
            <p className="text-[#FFAB40] text-sm mb-2">
              Available Claiming Dates:
            </p>
            {dateList.length > 0 ? (
              <table className="w-full bg-[#1E1E1E] rounded overflow-hidden">
                <thead className="bg-[#2E2E2E]">
                  <tr>
                    <th className="py-2 px-3 text-left text-sm text-[#FFAB40]">
                      Date
                    </th>
                    <th className="py-2 px-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {dateList.map((date, index) => (
                    <tr
                      key={index}
                      className={`border-t border-[#333333] cursor-pointer ${
                        selectedDate === date
                          ? "bg-[#FFAB40] text-black"
                          : "hover:bg-[#2A2A2A]"
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <td className="py-2 px-3 text-sm">{formatDate(date)}</td>
                      <td className="py-2 px-3 text-right w-10">
                        {selectedDate === date && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click from triggering
                              setDateList(dateList.filter((d) => d !== date));
                              setSelectedDate(null);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-400 italic">
                No dates added yet. Add a date to see it here.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col mt-4">
          <p className="text-[#FFAB40] text-sm mb-1">Claiming Time:</p>
          <div className="flex space-x-2 items-center">
            <input
              type="time"
              value={claimingStartTime}
              onChange={(e) => setClaimingStartTime(e.target.value)}
              className="bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
            />
            <p className="text-white text-sm">to</p>
            <input
              type="time"
              value={claimingEndTime}
              onChange={(e) => setClaimingEndTime(e.target.value)}
              className="bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
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
            className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-2 text-sm"
          />
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

const Admin_PublishEvent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventDetails, setEventDetails] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [claimingDetails, setClaimingDetails] = useState(null);

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
    // Final submission
    console.log("Full Event Details:", {
      eventDetails,
      ticketDetails,
      claimingDetails: details,
    });
    // Redirect or show success message
    alert("Event successfully created!");
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

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
                onBack={handleBack}
                onNext={handleTicketDetailsNext}
              />
            )}
            {currentStep === 3 && (
              <ClaimingDetails
                onBack={handleBack}
                onNext={handleClaimingDetailsNext}
              />
            )}

            <hr className="border-t border-gray-600 my-4" />

            <div className="flex justify-end space-x-4">
              {/* Back button */}
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="bg-neutral-900 text-white px-9 py-2 rounded-full text-xs font-semibold"
                >
                  Back
                </button>
              )}

              {/* Next button for step 1 */}
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

              {/* Next button for step 2 */}
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

              {/* Save button for step 3 */}
              {currentStep === 3 && (
                <button
                  onClick={() => {
                    document.querySelector(".claiming-submit-button").click();
                  }}
                  className="bg-[#FFAB40] text-black px-9 py-2 rounded-full text-xs font-semibold"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin_PublishEvent;
