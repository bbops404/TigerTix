import Sidebar_Admin from "../../components/Admin/SideBar_Admin";
import Header_Admin from "../../components/Admin/Header_Admin";
import {
  PlusIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
  InfoIcon,
} from "lucide-react";
import eventService from "../Services/eventService.js";
import React, { useState, useRef, useEffect } from "react";

const EventDetails = ({ onNext, setFormValid, initialData }) => {
  const [eventName, setEventName] = useState(initialData?.eventName || "");
  const [eventDescription, setEventDescription] = useState(
    initialData?.eventDescription || ""
  );

  // Separate date and time fields for start
  const [eventDate, setEventDate] = useState(initialData?.eventDate || "");
  const [startTime, setStartTime] = useState(initialData?.startTime || "");
  const [endTime, setEndTime] = useState(initialData?.endTime || ""); // Optional

  const [venue, setVenue] = useState(initialData?.venue || "");
  const [eventCategory, setEventCategory] = useState(
    initialData?.eventCategory || ""
  );
  const [eventType, setEventType] = useState(
    initialData?.eventType || "ticketed"
  );
  const [eventImage, setEventImage] = useState(initialData?.eventImage || null);
  const [imagePreview, setImagePreview] = useState(
    initialData?.imagePreview || null
  );
  const [formErrors, setFormErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const fileInputRef = useRef(null);

  // Function to extract date and time parts from datetime-local value
  const splitDateTime = (dateTimeValue) => {
    if (!dateTimeValue) return { date: "", time: "" };
    const [datePart, timePart] = dateTimeValue.split("T");
    return { date: datePart, time: timePart };
  };

  // For backward compatibility with the previous combined datetime format
  const getCombinedDateTime = (date, time) => {
    if (!date) return "";
    return time ? `${date}T${time}` : date;
  };

  // Check if all required fields are filled
  useEffect(() => {
    const requiredFields = {
      eventName,
      eventDescription,
      eventDate,
      startTime,
      venue,
      eventCategory,
      eventType,
      eventImage,
    };

    const isValid = Object.entries(requiredFields).every(([key, value]) => {
      // End time is optional
      return value !== "" && value !== null && value !== undefined;
    });

    // Pass validity status to parent component for Save as Draft button
    if (setFormValid) {
      setFormValid(isValid);
    }
  }, [
    eventName,
    eventDescription,
    eventDate,
    startTime,
    venue,
    eventCategory,
    eventType,
    eventImage,
    setFormValid,
  ]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormErrors((prev) => ({ ...prev, eventImage: null }));

      // Create a local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      try {
        // Upload to server
        const result = await eventService.uploadEventImage(file);

        // Store the file path returned from the server for database storage
        setEventImage(result.imageUrl);

        console.log("Image uploaded successfully:", result.imageUrl);
      } catch (error) {
        console.error("Upload failed:", error);
        // Show error message to user
        alert("Image upload failed: " + (error.message || "Unknown error"));
      }
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!eventName.trim()) {
      errors.eventName = "Event name is required";
      isValid = false;
    }

    if (!eventDescription.trim()) {
      errors.eventDescription = "Event description is required";
      isValid = false;
    }

    if (!eventDate) {
      errors.eventDate = "Event date is required";
      isValid = false;
    }

    if (!startTime) {
      errors.startTime = "Start time is required";
      isValid = false;
    }

    if (!venue.trim()) {
      errors.venue = "Venue is required";
      isValid = false;
    }

    if (!eventCategory) {
      errors.eventCategory = "Event category is required";
      isValid = false;
    }

    if (!eventType) {
      errors.eventType = "Event type is required";
      isValid = false;
    }

    if (!eventImage) {
      errors.eventImage = "Event image is required";
      isValid = false;
    }

    // Validate that event end time is after event start time if both are provided
    if (startTime && endTime && endTime <= startTime) {
      errors.endTime = "End time must be after start time";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // In your EventDetails component's handleSubmit function:
  // Update the EventDetails component's handleSubmit function
  const handleSubmit = () => {
    setShowErrors(true);
    const isValid = validateForm();

    if (!isValid) {
      console.error("Form validation failed");
      window.scrollTo(0, 0);
      return;
    }

    let eventStart = null;
    let eventEnd = null;

    if (eventDate && startTime) {
      eventStart = new Date(`${eventDate}T${startTime}`);
    }

    if (eventDate && endTime) {
      eventEnd = new Date(`${eventDate}T${endTime}`);
    }

    // Collect event details data
    const eventDetailsData = {
      eventName: eventName,
      eventDescription: eventDescription,
      eventDate: eventDate,
      venue: venue,
      startTime: startTime,
      endTime: endTime,
      eventStart: eventStart,
      eventEnd: eventEnd,
      eventCategory: eventCategory,
      eventType: eventType,
      eventImage: eventImage,
      imagePreview: imagePreview,
    };

    console.log("Submitting event details with eventType:", eventType);
    onNext(eventDetailsData);
  };
  return (
    <div>
      <p className="text-[#FFAB40] text-3xl font-semibold mb-2">Add an Event</p>
      <p className="text-[13px] text-[#B8B8B8] mb-4">
        Create a new event for the reservation system by filling out the
        necessary details. All fields are required except for end time.
      </p>
      <hr className="border-t border-gray-600 my-4" />

      {showErrors && Object.keys(formErrors).length > 0 && (
        <div className="bg-red-900 text-white p-3 rounded-md mb-4">
          <p className="font-semibold">
            Please fix the fields highlighted with red borders to continue.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-1 items-start">
        <div className="bg-[#FFAB40] w-8/12 h-[450px] rounded-xl flex items-center justify-center relative overflow-hidden">
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
              className="w-full h-full object-cover absolute top-0 left-0"
            />
          ) : (
            <button
              onClick={handleUploadButtonClick}
              className={`bg-[#2E2E2E] text-[#FFAB40] text-sm font-semibold py-2 px-4 rounded-full ${
                showErrors && formErrors.eventImage
                  ? "border-2 border-red-500"
                  : ""
              }`}
            >
              Upload Image*
            </button>
          )}
          {showErrors && formErrors.eventImage && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-red-900 text-white text-xs py-1 px-3 rounded-full">
              {formErrors.eventImage}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Event Name:*</p>
            <input
              type="text"
              placeholder="Enter Event Name"
              value={eventName}
              onChange={(e) => {
                setEventName(e.target.value);
                setFormErrors({ ...formErrors, eventName: null });
              }}
              className={`w-full bg-[#1E1E1E] border ${
                formErrors.eventName ? "border-red-500" : "border-[#333333]"
              } text-white rounded px-2 py-1.5 text-sm`}
            />
          </div>
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Event Description:*</p>
            <textarea
              placeholder="Enter Event Description"
              value={eventDescription}
              onChange={(e) => {
                setEventDescription(e.target.value);
                setFormErrors({ ...formErrors, eventDescription: null });
              }}
              className={`w-full bg-[#1E1E1E] border ${
                formErrors.eventDescription
                  ? "border-red-500"
                  : "border-[#333333]"
              } text-white rounded px-2 py-1.5 text-sm h-20 resize-none`}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[#FFAB40] text-sm mb-1">Event Date:*</p>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => {
                  setEventDate(e.target.value);
                  setFormErrors({ ...formErrors, eventDate: null });
                }}
                className={`w-full bg-[#1E1E1E] border ${
                  formErrors.eventDate ? "border-red-500" : "border-[#333333]"
                } text-white rounded px-2 py-1.5 text-sm`}
              />
            </div>
            <div>
              <p className="text-[#FFAB40] text-sm mb-1">Event Venue:*</p>
              <input
                type="text"
                placeholder="Venue"
                value={venue}
                onChange={(e) => {
                  setVenue(e.target.value);
                  setFormErrors({ ...formErrors, venue: null });
                }}
                className={`w-full bg-[#1E1E1E] border ${
                  formErrors.venue ? "border-red-500" : "border-[#333333]"
                } text-white rounded px-2 py-1.5 text-sm`}
              />
            </div>
          </div>

          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Event Time:*</p>
            <div className="flex space-x-2 items-center">
              <div className="flex-1">
                <p className="text-[#FFAB40] text-xs mb-1">Start* :</p>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setFormErrors({ ...formErrors, startTime: null });
                  }}
                  className={`w-full bg-[#1E1E1E] border ${
                    formErrors.startTime ? "border-red-500" : "border-[#333333]"
                  } text-white rounded px-2 py-1.5 text-sm`}
                />
              </div>

              <p className="text-white text-sm mt-5">to</p>
              <div className="flex-1">
                <p className="text-[#FFAB40] text-xs mb-1">End (Optional):</p>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    setFormErrors({ ...formErrors, endTime: null });
                  }}
                  className={`w-full bg-[#1E1E1E] border ${
                    formErrors.endTime ? "border-red-500" : "border-[#333333]"
                  } text-white rounded px-2 py-1.5 text-sm`}
                />
                {showErrors && formErrors.endTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.endTime}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Event Category:*</p>
            <select
              value={eventCategory}
              onChange={(e) => {
                setEventCategory(e.target.value);
                setFormErrors({ ...formErrors, eventCategory: null });
              }}
              className={`w-full bg-[#1E1E1E] border ${
                formErrors.eventCategory ? "border-red-500" : "border-[#333333]"
              } text-white rounded px-2 py-1.5 text-sm`}
            >
              <option value="">Select Category of Event</option>
              <option value="IPEA Event">IPEA Event</option>
              <option value="UAAP Event">UAAP Event</option>
            </select>
          </div>
          <div>
            <p className="text-[#FFAB40] text-sm mb-1">Event Type:*</p>
            <div
              className={`flex space-x-4 flex-wrap justify-evenly ${
                formErrors.eventType ? "p-2 border border-red-500 rounded" : ""
              }`}
            >
              <label className="inline-flex items-center mb-2">
                <input
                  type="radio"
                  value="ticketed"
                  checked={eventType === "ticketed"}
                  onChange={() => {
                    console.log("Setting event type to: ticketed");
                    setEventType("ticketed");
                    setFormErrors({ ...formErrors, eventType: null });
                  }}
                  className="form-radio bg-[#1E1E1E] border-[#333333] text-white"
                />
                <span className="ml-2 text-white text-sm">Ticketed Event</span>
              </label>
              <label className="inline-flex items-center mb-2">
                <input
                  type="radio"
                  value="coming_soon"
                  checked={eventType === "coming_soon"}
                  onChange={() => {
                    setEventType("coming_soon");
                    setFormErrors({ ...formErrors, eventType: null });
                  }}
                  className="form-radio bg-[#1E1E1E] border-[#333333] text-white"
                />
                <span className="ml-2 text-white text-sm">Coming Soon</span>
              </label>
              <label className="inline-flex items-center mb-2">
                <input
                  type="radio"
                  value="free"
                  checked={eventType === "free"}
                  onChange={() => {
                    setEventType("free");
                    setFormErrors({ ...formErrors, eventType: null });
                  }}
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

      <p className="text-xs text-[#B8B8B8] mt-4 italic">* Required fields</p>

      {/* Hidden button for parent component to trigger submit */}
      <button className="hidden event-submit-button" onClick={handleSubmit} />
    </div>
  );
};

const TicketDetails = ({ onBack, onNext, eventType, initialData }) => {
  const [totalTickets, setTotalTickets] = useState(0);
  const [tierType, setTierType] = useState(
    initialData?.tierType || "freeSeating"
  );
  const [includeTiers, setIncludeTiers] = useState(
    initialData?.hasTierInfo || false
  );

  // Free seating specific fields
  const [freeSeatingTickets, setFreeSeatingTickets] = useState(
    initialData?.freeSeating?.numberOfTickets || ""
  );
  const [freeSeatingPrice, setFreeSeatingPrice] = useState(
    initialData?.freeSeating?.price || ""
  );
  const [freeSeatingMaxPerPerson, setFreeSeatingMaxPerPerson] = useState(
    initialData?.freeSeating?.maxPerPerson || ""
  );

  // For validation
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  // Initialize ticket tiers from initialData if available
  const [ticketTiers, setTicketTiers] = useState(
    initialData?.ticketTiers || {
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
    }
  );
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
  const validateForm = () => {
    const newErrors = {};

    if (eventType === "coming_soon") {
      // For coming soon events, only validate if includeTiers is true
      if (includeTiers) {
        if (tierType === "freeSeating") {
          if (!freeSeatingTickets) {
            newErrors.freeSeatingTickets = "Number of tickets is required";
          }
          if (!freeSeatingPrice) {
            newErrors.freeSeatingPrice = "Price is required";
          }
          if (!freeSeatingMaxPerPerson) {
            newErrors.freeSeatingMaxPerPerson =
              "Max tickets per person is required";
          }
        } else {
          // Check if at least one tier is selected
          const anyTierChecked = Object.values(ticketTiers).some(
            (tier) => tier.checked
          );
          if (!anyTierChecked) {
            newErrors.tiers = "At least one ticket tier must be selected";
          } else {
            // Check if selected tiers have all required fields
            Object.entries(ticketTiers).forEach(([tierName, tierData]) => {
              if (tierData.checked) {
                if (!tierData.number) {
                  newErrors[`${tierName}_number`] = "Required";
                }
                if (!tierData.price) {
                  newErrors[`${tierName}_price`] = "Required";
                }
                if (!tierData.maxPerPerson) {
                  newErrors[`${tierName}_maxPerPerson`] = "Required";
                }
              }
            });
          }
        }
      }
      // No validation needed if includeTiers is false
    } else if (eventType === "free") {
      // For free events, validate only tickets and max per person
      if (!freeSeatingTickets) {
        newErrors.freeSeatingTickets = "Number of tickets is required";
      }
      if (!freeSeatingMaxPerPerson) {
        newErrors.freeSeatingMaxPerPerson =
          "Max tickets per person is required";
      }
    } else {
      // For regular ticketed events
      if (tierType === "freeSeating") {
        if (!freeSeatingTickets) {
          newErrors.freeSeatingTickets = "Number of tickets is required";
        }
        if (!freeSeatingPrice) {
          newErrors.freeSeatingPrice = "Price is required";
        }
        if (!freeSeatingMaxPerPerson) {
          newErrors.freeSeatingMaxPerPerson =
            "Max tickets per person is required";
        }
      } else {
        // Check if at least one tier is selected
        const anyTierChecked = Object.values(ticketTiers).some(
          (tier) => tier.checked
        );
        if (!anyTierChecked) {
          newErrors.tiers = "At least one ticket tier must be selected";
        } else {
          // Check if selected tiers have all required fields
          Object.entries(ticketTiers).forEach(([tierName, tierData]) => {
            if (tierData.checked) {
              if (!tierData.number) {
                newErrors[`${tierName}_number`] = "Required";
              }
              if (!tierData.price) {
                newErrors[`${tierName}_price`] = "Required";
              }
              if (!tierData.maxPerPerson) {
                newErrors[`${tierName}_maxPerPerson`] = "Required";
              }
            }
          });
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setShowErrors(true);
    const isValid = validateForm();

    if (!isValid) {
      // Scroll to top if errors to make them visible
      window.scrollTo(0, 0);
      return;
    }

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
  const renderFreeSeatingForm = () => (
    <div>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="text-white text-sm mb-1">Number of Tickets:*</label>
          <input
            type="text"
            value={freeSeatingTickets}
            onChange={(e) => {
              handleFreeSeatingTicketsChange(e.target.value);
              if (showErrors)
                setErrors({ ...errors, freeSeatingTickets: null });
            }}
            className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                     border ${
                       errors.freeSeatingTickets
                         ? "border-red-500"
                         : "border-gray-600"
                     } 
                     focus:outline-none focus:border-[#FFAB40]`}
            placeholder="Total available tickets"
          />
          {showErrors && errors.freeSeatingTickets && (
            <p className="text-red-500 text-xs mt-1">
              {errors.freeSeatingTickets}
            </p>
          )}
        </div>

        {eventType !== "free" && (
          <div className="flex flex-col">
            <label className="text-white text-sm mb-1">Price (₱):*</label>
            <input
              type="text"
              value={freeSeatingPrice}
              onChange={(e) => {
                handleFreeSeatingPriceChange(e.target.value);
                if (showErrors)
                  setErrors({ ...errors, freeSeatingPrice: null });
              }}
              className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                       border ${
                         errors.freeSeatingPrice
                           ? "border-red-500"
                           : "border-gray-600"
                       } 
                       focus:outline-none focus:border-[#FFAB40]`}
              placeholder="Ticket price"
            />
            {showErrors && errors.freeSeatingPrice && (
              <p className="text-red-500 text-xs mt-1">
                {errors.freeSeatingPrice}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col">
          <label className="text-white text-sm mb-1">
            Max Tickets Per Person:*
          </label>
          <input
            type="text"
            value={freeSeatingMaxPerPerson}
            onChange={(e) => {
              handleFreeSeatingMaxPerPersonChange(e.target.value);
              if (showErrors)
                setErrors({ ...errors, freeSeatingMaxPerPerson: null });
            }}
            className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                     border ${
                       errors.freeSeatingMaxPerPerson
                         ? "border-red-500"
                         : "border-gray-600"
                     } 
                     focus:outline-none focus:border-[#FFAB40]`}
            placeholder="Max tickets per person"
          />
          {showErrors && errors.freeSeatingMaxPerPerson && (
            <p className="text-red-500 text-xs mt-1">
              {errors.freeSeatingMaxPerPerson}
            </p>
          )}
        </div>
      </div>
      <p className="text-[#B8B8B8] text-xs mt-3">
        For maximum tickets per person, set between 1-10.
      </p>
    </div>
  );

  // For Coming Soon events - show option to add ticket tiers
  if (eventType === "coming_soon") {
    return (
      <div className="w-full">
        {/* Display error summary if validation fails */}
        {showErrors && Object.keys(errors).length > 0 && (
          <div className="bg-red-900 text-white p-3 rounded-md mb-4">
            <p className="font-semibold">
              Please fill in all required fields marked with an asterisk (*).
            </p>
          </div>
        )}
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
        {/* Display error summary if validation fails */}
        {showErrors && Object.keys(errors).length > 0 && (
          <div className="bg-red-900 text-white p-3 rounded-md mb-4">
            <p className="font-semibold">
              Please fill in all required fields marked with an asterisk (*).
            </p>
          </div>
        )}
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
      {showErrors && Object.keys(errors).length > 0 && (
        <div className="bg-red-900 text-white p-3 rounded-md mb-4">
          <p className="font-semibold">
            Please fill in all required fields marked with an asterisk (*).
          </p>
        </div>
      )}
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
// Enhanced ClaimingDetails component with improved Coming Soon handling
const ClaimingDetails = ({
  onBack,
  onNext,
  eventType,
  initialData,
  ticketDetails,
}) => {
  const [claimingDate, setClaimingDate] = useState("");
  const [claimingStartTime, setClaimingStartTime] = useState("");
  const [claimingEndTime, setClaimingEndTime] = useState("");
  const [claimingVenue, setClaimingVenue] = useState("");
  const [maxReservations, setMaxReservations] = useState("");
  const [dateList, setDateList] = useState(initialData?.availableDates || []);
  const [selectedDate, setSelectedDate] = useState(null);
  const [claimingSummaries, setClaimingSummaries] = useState(
    initialData?.claimingSummaries || []
  );
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  // For Coming Soon events: Whether to include preliminary claiming info
  const [includeClaimingInfo, setIncludeClaimingInfo] = useState(
    initialData?.includeClaimingInfo || false
  );

  // Reset state when component receives new props
  useEffect(() => {
    if (initialData) {
      setClaimingSummaries(initialData.claimingSummaries || []);
      setDateList(initialData.availableDates || []);
      setIncludeClaimingInfo(initialData.includeClaimingInfo || false);
    } else {
      setClaimingSummaries([]);
      setDateList([]);
      setIncludeClaimingInfo(false);
    }
    setClaimingDate("");
    setClaimingStartTime("");
    setClaimingEndTime("");
    setClaimingVenue("");
    setMaxReservations("");
    setSelectedDate(null);
    setSelectedSummary(null);
    setIsEditing(false);
    setError("");
  }, [initialData]);

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
    setError("");
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
    setError("");
  };

  // Check if we have any ticket information for Coming Soon events
  const hasTicketInfo =
    eventType === "coming_soon" && ticketDetails?.hasTierInfo;

  const handleSubmit = () => {
    // For coming soon events - handle based on included info
    if (eventType === "coming_soon") {
      if (!hasTicketInfo) {
        // If no ticket info, claiming details cannot be added
        onNext({
          eventType: "coming_soon",
          claimingSummaries: [],
          availableDates: [],
          includeClaimingInfo: false,
        });
        return;
      }

      // If there are tickets, check if claiming info is included
      if (includeClaimingInfo) {
        // Check if there's at least one claiming summary
        if (claimingSummaries.length === 0) {
          setError(
            "Please add at least one claiming schedule before proceeding."
          );
          return;
        }

        onNext({
          eventType: "coming_soon",
          claimingSummaries: claimingSummaries,
          availableDates: dateList,
          includeClaimingInfo: true,
        });
      } else {
        // No claiming info included
        onNext({
          eventType: "coming_soon",
          claimingSummaries: [],
          availableDates: [],
          includeClaimingInfo: false,
        });
      }
      return;
    }

    // For free or promotional events - simplified structure without contact info
    if (eventType === "free") {
      // Check if there's at least one claiming summary
      if (claimingSummaries.length === 0) {
        setError(
          "Please add at least one claiming schedule before proceeding."
        );
        return;
      }

      onNext({
        eventType: "free",
        claimingSummaries: claimingSummaries,
        availableDates: dateList,
      });
      return;
    }

    // For regular ticketed events
    // Check if there's at least one claiming summary
    if (claimingSummaries.length === 0) {
      setError("Please add at least one claiming schedule before proceeding.");
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

  // For Coming Soon events with no ticket info
  if (eventType === "coming_soon" && !hasTicketInfo) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <p className="text-[#FFAB40] text-2xl font-semibold mb-1">
            Coming Soon - Claiming Details
          </p>
          <p className="text-xs text-[#B8B8B8]">
            This is a "Coming Soon" event without ticket information.
          </p>
        </div>

        <hr className="border-t border-gray-600 my-3" />

        <div className="bg-[#1E1E1E] rounded-lg p-6 flex items-center justify-center">
          <div className="text-center p-6 max-w-lg">
            <div className="mb-6 flex justify-center">
              <InfoIcon className="h-12 w-12 text-[#FFAB40]" />
            </div>
            <p className="text-white text-lg mb-4 font-semibold">
              Claiming Details Cannot Be Added Yet
            </p>
            <p className="text-[#B8B8B8] text-sm mb-5">
              Since this is a "Coming Soon" event without ticket information,
              claiming details cannot be added at this time.
            </p>
            <p className="text-[#B8B8B8] text-sm">
              To add claiming details, you need to first include preliminary
              ticket information in the previous step, or you can add this
              information later when you fully publish the event.
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

  // For Coming Soon events with ticket info
  // Update the ClaimingDetails component for Coming Soon events to clearly mark as admin-only

  // For Coming Soon events with ticket info
  if (eventType === "coming_soon" && hasTicketInfo) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <p className="text-[#FFAB40] text-2xl font-semibold mb-1">
            Coming Soon - Claiming Details
          </p>
          <p className="text-xs text-[#B8B8B8]">
            Set up preliminary claiming details for your "Coming Soon" event.
          </p>
        </div>

        <hr className="border-t border-gray-600 my-3" />

        <div className="bg-[#1E1E1E] p-6 rounded-lg mb-6">
          <div className="flex items-start mb-6">
            <InfoIcon className="h-8 w-8 mr-4 text-[#FFAB40] mt-1" />
            <div>
              <h3 className="text-[#FFAB40] text-xl font-semibold mb-3 flex items-center">
                Claiming Schedule
              </h3>
              <p className="text-white text-sm mb-4">
                Since you've added ticket information, you can also set up
                preliminary claiming details.
              </p>

              <div className="bg-[#272727] p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="includeClaimingInfo"
                    checked={includeClaimingInfo}
                    onChange={(e) => setIncludeClaimingInfo(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-[#FFAB40] bg-[#2C2C2C] border-gray-600 rounded focus:ring-0 focus:outline-none mr-3"
                  />
                  <label
                    htmlFor="includeClaimingInfo"
                    className="text-white font-medium cursor-pointer"
                  >
                    Include admin-only claiming information
                  </label>
                </div>
                <p className="text-[#B8B8B8] text-sm ml-8 mb-2">
                  These claiming details are for internal planning and will NOT
                  be visible to end users.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Only show claiming configuration if includeClaimingInfo is checked */}
        {includeClaimingInfo && (
          <div className="mt-6 border-t border-gray-700 pt-6">
            <h3 className="text-[#FFAB40] text-xl font-semibold mb-3 flex items-center">
              Preliminary Claiming Schedule
              <span className="text-xs text-white bg-gray-700 px-2 py-1 rounded ml-2">
                Admin Only
              </span>
            </h3>

            <div className="flex flex-col space-y-3">
              {!isEditing && (
                <div className="flex items-center">
                  <p className="text-[#FFAB40] text-sm mr-2">Available Date:</p>
                  <input
                    type="date"
                    value={claimingDate}
                    onChange={(e) => setClaimingDate(e.target.value)}
                    className="w-full max-w-xs bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
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
                      <p className="text-[#FFAB40] text-sm mb-1">
                        Claiming Date:
                      </p>
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
                                    setClaimingStartTime(
                                      relatedSummary.startTime
                                    );
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
                    <p className="text-[#FFAB40] text-sm mb-1">
                      Claiming Time:
                    </p>
                    <div className="flex space-x-2 items-center">
                      <input
                        type="time"
                        value={claimingStartTime}
                        onChange={(e) => {
                          setClaimingStartTime(e.target.value);
                          setError("");
                        }}
                        className="bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
                      />
                      <p className="text-white text-sm">to</p>
                      <input
                        type="time"
                        value={claimingEndTime}
                        onChange={(e) => {
                          setClaimingEndTime(e.target.value);
                          setError("");
                        }}
                        className="bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <p className="text-[#FFAB40] text-sm mb-1">
                      Claiming Venue:
                    </p>
                    <input
                      type="text"
                      placeholder="Enter venue for ticket claiming"
                      value={claimingVenue}
                      onChange={(e) => {
                        setClaimingVenue(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
                    />
                  </div>

                  <div className="flex flex-col">
                    <p className="text-[#FFAB40] text-sm mb-1">
                      Max Reservations:
                    </p>
                    <input
                      type="text"
                      placeholder="Enter max number of reservations"
                      value={maxReservations}
                      onChange={(e) => {
                        handleMaxReservationsChange(e.target.value);
                        setError("");
                      }}
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
                            claimingEndTime &&
                            maxReservations
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

                            const updatedSummaries = claimingSummaries.map(
                              (s) =>
                                s.id === selectedSummary.id ? summaryData : s
                            );
                            setClaimingSummaries(updatedSummaries);
                            syncDateListWithSummaries(updatedSummaries);
                            clearForm();
                          } else {
                            setError(
                              "Please provide all required information (date, venue, time, and max reservations)"
                            );
                          }
                        } else {
                          const dateToUse = claimingDate || selectedDate;

                          if (
                            dateToUse &&
                            claimingVenue &&
                            claimingStartTime &&
                            claimingEndTime &&
                            maxReservations
                          ) {
                            if (
                              claimingDate &&
                              !dateList.includes(claimingDate)
                            ) {
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
                            setError(
                              "Please provide all required information (date, venue, time, and max reservations)"
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
                  Planned Claiming Schedule:
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
                                    const updatedSummaries =
                                      claimingSummaries.filter(
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

              {error && (
                <div className="mt-3 text-red-500 text-sm bg-red-500/10 p-2 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        <button
          className="hidden claiming-submit-button"
          onClick={handleSubmit}
        />
      </div>
    );
  }
};
// Modified AvailabilityDetails component
const AvailabilityDetails = ({ onBack, onNext, eventType, initialData }) => {
  // Display period (when the event is visible)
  const [displayStartDate, setDisplayStartDate] = useState(
    initialData?.displayPeriod?.startDate || ""
  );
  const [displayEndDate, setDisplayEndDate] = useState(
    initialData?.displayPeriod?.endDate || ""
  );

  // Reservation period (when users can book)
  const [reservationStartDate, setReservationStartDate] = useState(
    initialData?.reservationPeriod?.startDate || ""
  );
  const [reservationEndDate, setReservationEndDate] = useState(
    initialData?.reservationPeriod?.endDate || ""
  );
  const [reservationStartTime, setReservationStartTime] = useState(
    initialData?.reservationPeriod?.startTime || ""
  );
  const [reservationEndTime, setReservationEndTime] = useState(
    initialData?.reservationPeriod?.endTime || ""
  );

  // Error state
  const [errors, setErrors] = useState({});

  // Get event image from initialData
  const imagePreview = initialData?.imagePreview || null;

  // Update state when initialData changes
  useEffect(() => {
    if (initialData) {
      setDisplayStartDate(initialData.displayPeriod?.startDate || "");
      setDisplayEndDate(initialData.displayPeriod?.endDate || "");
      setReservationStartDate(initialData.reservationPeriod?.startDate || "");
      setReservationEndDate(initialData.reservationPeriod?.endDate || "");
      setReservationStartTime(initialData.reservationPeriod?.startTime || "");
      setReservationEndTime(initialData.reservationPeriod?.endTime || "");
    }
  }, [initialData]);

  // Validation function
  const validatePeriods = () => {
    const newErrors = {};

    // For all event types, validate display period
    if (!displayStartDate || !displayEndDate) {
      newErrors.displayPeriod = "Both start and end dates are required";
    } else {
      const displayStart = new Date(displayStartDate);
      const displayEnd = new Date(displayEndDate);

      // Validate that display start date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (displayStart < today) {
        newErrors.displayPeriod = "Display start date cannot be in the past";
      }

      // Validate that end date is after start date
      if (displayEnd <= displayStart) {
        newErrors.displayPeriod = "Display end date must be after start date";
      }
    }

    // For free events and coming soon events, we only need to validate display period
    if (eventType === "free" || eventType === "coming_soon") {
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    // For ticketed events, also validate reservation period
    if (
      !reservationStartDate ||
      !reservationEndDate ||
      !reservationStartTime ||
      !reservationEndTime
    ) {
      newErrors.reservationPeriod =
        "Reservation period dates and times are required";
    } else {
      const reservationStart = new Date(
        `${reservationStartDate}T${reservationStartTime}`
      );
      const reservationEnd = new Date(
        `${reservationEndDate}T${reservationEndTime}`
      );
      const displayStart = new Date(displayStartDate);
      const displayEnd = new Date(displayEndDate);

      // Check reservation period is within display period
      if (reservationStart < displayStart) {
        newErrors.reservationPeriod =
          "Reservation start must be within display period";
      }
      if (reservationEnd > displayEnd) {
        newErrors.reservationPeriod =
          "Reservation end must be within display period";
      }
      if (reservationEnd <= reservationStart) {
        newErrors.reservationPeriod =
          "Reservation end must be after reservation start";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validatePeriods()) {
      return;
    }

    // Make sure reservationPeriod is provided for ticketed events
    // and optional for other event types
    const availabilityData = {
      displayPeriod: {
        startDate: displayStartDate,
        endDate: displayEndDate,
      },
      reservationPeriod:
        eventType === "ticketed"
          ? {
              startDate: reservationStartDate,
              endDate: reservationEndDate,
              startTime: reservationStartTime,
              endTime: reservationEndTime,
            }
          : null,
    };

    // Pass the data to the parent component
    onNext(availabilityData);
  };

  // Different UI for coming soon events
  if (eventType === "coming_soon") {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
              Coming Soon - Display Period
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
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Event Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-[#B8B8B8] text-sm">
                  Event Image Preview
                </div>
              )}
            </div>
          </div>

          <div className="w-2/3">
            <div>
              <h3 className="text-[#FFAB40] font-semibold mb-3">
                Promotional Period
              </h3>
              <p className="text-xs text-[#B8B8B8] mb-3">
                Set the timeframe when this "Coming Soon" announcement will be
                visible to users
              </p>

              <div className="space-y-3">
                <div>
                  <p className="text-white text-sm mb-1">Start Showing:</p>
                  <input
                    type="date"
                    value={displayStartDate}
                    onChange={(e) => {
                      setDisplayStartDate(e.target.value);
                      setErrors({ ...errors, displayPeriod: null });
                    }}
                    className={`w-full bg-[#1E1E1E] border ${
                      errors.displayPeriod
                        ? "border-red-500"
                        : "border-[#333333]"
                    } text-white rounded px-3 py-2 text-sm`}
                  />
                  {errors.displayPeriod && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.displayPeriod}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-white text-sm mb-1">End Showing:</p>
                  <input
                    type="date"
                    value={displayEndDate}
                    onChange={(e) => {
                      setDisplayEndDate(e.target.value);
                      setErrors({ ...errors, displayPeriod: null });
                    }}
                    className={`w-full bg-[#1E1E1E] border ${
                      errors.displayPeriod
                        ? "border-red-500"
                        : "border-[#333333]"
                    } text-white rounded px-3 py-2 text-sm`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#1E1E1E] rounded-lg border border-[#333333]">
              <div className="flex items-center">
                <InfoIcon className="h-5 w-5 mr-2 text-[#FFAB40]" />
                <p className="text-white text-sm font-medium">
                  Reservation Settings
                </p>
              </div>
              <p className="text-[#B8B8B8] text-xs mt-2 ml-7">
                Reservations will not be available for this "Coming Soon" event.
                You can edit the event later to enable reservations when you're
                ready to fully publish it.
              </p>
            </div>
          </div>
        </div>

        {errors.displayPeriod && (
          <div className="mt-4 text-red-500 text-sm bg-red-500/10 p-3 rounded">
            {errors.displayPeriod}
          </div>
        )}

        <p className="text-[#B8B8B8] text-xs mt-6 border-t border-gray-600 pt-4">
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

  // Original UI for regular events
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-[#FFAB40] text-3xl font-semibold mb-2">
            Event Visibility Period
          </p>
          <p className="text-[13px] text-[#B8B8B8] mb-4">
            Set when the event appears on the platform
          </p>
        </div>
      </div>

      <hr className="border-t border-gray-600 my-4" />

      <div className="flex gap-6">
        {/* Event Picture Preview */}
        <div className="w-1/3">
          <p className="text-[#FFAB40] text-sm mb-2">Event Preview</p>
          <div className="w-full h-[300px] bg-[#1E1E1E] border-2 border-dashed border-[#FFAB40] rounded-lg flex items-center justify-center overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Event Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-[#B8B8B8] text-sm">Event Image Preview</div>
            )}
          </div>
        </div>

        {/* Event Display Period */}
        <div className="w-2/3 space-y-6">
          <div>
            <h3 className="text-[#FFAB40] font-semibold mb-3">
              Display Period
            </h3>
            <p className="text-xs text-[#B8B8B8] mb-2">
              When the event will be visible to users
            </p>

            <div className="space-y-3">
              <div>
                <p className="text-white text-sm mb-1">Start Showing:</p>
                <input
                  type="date"
                  value={displayStartDate}
                  onChange={(e) => {
                    setDisplayStartDate(e.target.value);
                    setErrors({ ...errors, displayPeriod: null });
                  }}
                  className={`w-full bg-[#1E1E1E] border ${
                    errors.displayPeriod ? "border-red-500" : "border-[#333333]"
                  } text-white rounded px-3 py-2 text-sm`}
                />
                {errors.displayPeriod && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.displayPeriod}
                  </p>
                )}
              </div>

              <div>
                <p className="text-white text-sm mb-1">End Showing:</p>
                <input
                  type="date"
                  value={displayEndDate}
                  onChange={(e) => {
                    setDisplayEndDate(e.target.value);
                    setErrors({ ...errors, displayPeriod: null });
                  }}
                  className={`w-full bg-[#1E1E1E] border ${
                    errors.displayPeriod ? "border-red-500" : "border-[#333333]"
                  } text-white rounded px-3 py-2 text-sm`}
                />
              </div>
            </div>
          </div>

          {/* Only show reservation period for non-free events */}
          {eventType !== "free" && (
            <div>
              <h3 className="text-[#FFAB40] font-semibold mb-3">
                Reservation Period
              </h3>
              <p className="text-xs text-[#B8B8B8] mb-2">
                When users can make reservations
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-white text-sm mb-1">
                      Start Reservations:
                    </p>
                    <input
                      type="date"
                      value={reservationStartDate}
                      onChange={(e) => {
                        setReservationStartDate(e.target.value);
                        setErrors({ ...errors, reservationPeriod: null });
                      }}
                      className={`w-full bg-[#1E1E1E] border ${
                        errors.reservationPeriod
                          ? "border-red-500"
                          : "border-[#333333]"
                      } text-white rounded px-3 py-2 text-sm`}
                    />
                  </div>
                  <div>
                    <p className="text-white text-sm mb-1">Time:</p>
                    <input
                      type="time"
                      value={reservationStartTime}
                      onChange={(e) => {
                        setReservationStartTime(e.target.value);
                        setErrors({ ...errors, reservationPeriod: null });
                      }}
                      className={`w-full bg-[#1E1E1E] border ${
                        errors.reservationPeriod
                          ? "border-red-500"
                          : "border-[#333333]"
                      } text-white rounded px-3 py-2 text-sm`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-white text-sm mb-1">End Reservations:</p>
                    <input
                      type="date"
                      value={reservationEndDate}
                      onChange={(e) => {
                        setReservationEndDate(e.target.value);
                        setErrors({ ...errors, reservationPeriod: null });
                      }}
                      className={`w-full bg-[#1E1E1E] border ${
                        errors.reservationPeriod
                          ? "border-red-500"
                          : "border-[#333333]"
                      } text-white rounded px-3 py-2 text-sm`}
                    />
                  </div>
                  <div>
                    <p className="text-white text-sm mb-1">Time:</p>
                    <input
                      type="time"
                      value={reservationEndTime}
                      onChange={(e) => {
                        setReservationEndTime(e.target.value);
                        setErrors({ ...errors, reservationPeriod: null });
                      }}
                      className={`w-full bg-[#1E1E1E] border ${
                        errors.reservationPeriod
                          ? "border-red-500"
                          : "border-[#333333]"
                      } text-white rounded px-3 py-2 text-sm`}
                    />
                  </div>
                </div>

                {errors.reservationPeriod && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.reservationPeriod}
                  </p>
                )}
              </div>
            </div>
          )}
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

// Complete SummaryDetails component that shows claiming info based on ticket availability
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

  // Check if coming soon event has tickets
  const hasTicketInfo =
    eventType === "coming_soon" && ticketDetails?.hasTierInfo;

  // Check if coming soon event has claiming details
  const hasClaimingInfo =
    eventType === "coming_soon" && claimingDetails?.includeClaimingInfo;

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "Not set";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format datetime for display
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "Not set";
    const date = new Date(dateTimeStr);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  // Function to determine initial event state based on type and timing
  const determineEventState = () => {
    // Get current date for comparisons
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get reservation dates if available
    let reservationStart = null;
    let reservationEnd = null;
    if (availabilityDetails?.reservationPeriod?.startDate) {
      reservationStart = new Date(
        `${availabilityDetails.reservationPeriod.startDate}T${
          availabilityDetails.reservationPeriod.startTime || "00:00:00"
        }`
      );
    }
    if (availabilityDetails?.reservationPeriod?.endDate) {
      reservationEnd = new Date(
        `${availabilityDetails.reservationPeriod.endDate}T${
          availabilityDetails.reservationPeriod.endTime || "23:59:59"
        }`
      );
    }

    // Get display dates
    let displayStart = null;
    let displayEnd = null;
    if (availabilityDetails?.displayPeriod?.startDate) {
      displayStart = new Date(availabilityDetails.displayPeriod.startDate);
    }
    if (availabilityDetails?.displayPeriod?.endDate) {
      displayEnd = new Date(availabilityDetails.displayPeriod.endDate);
    }

    let status = "";
    let visibility = "";
    let statusDescription = "";

    switch (eventType) {
      case "coming_soon":
        // Coming Soon events start as Published but with Closed status
        status = "scheduled";
        visibility = "published";
        statusDescription = "Event will be published as Coming Soon";
        break;

      case "free":
        // Free events are always published but with Closed status (no reservation)
        status = "closed";
        visibility = "published";
        statusDescription =
          "Event will be published as Free with no reservation";
        break;

      case "ticketed":
        // Determine if the event should be scheduled or open based on reservation period
        if (reservationStart && reservationEnd) {
          if (today < reservationStart) {
            status = "scheduled";
            visibility = "published";
            statusDescription =
              "Event will be published with future reservation period";
          } else if (today >= reservationStart && today <= reservationEnd) {
            status = "open";
            visibility = "published";
            statusDescription =
              "Event will be published with active reservation";
          } else {
            status = "closed";
            visibility = "published";
            statusDescription =
              "Event will be published with closed reservation";
          }
        } else {
          // Default if reservation period not set
          status = "scheduled";
          visibility = "published";
          statusDescription =
            "Event will be published but reservation period needs to be set";
        }
        break;

      default:
        status = "draft";
        visibility = "unpublished";
        statusDescription = "Event will be saved as draft";
    }

    return { status, visibility, statusDescription };
  };

  // Get the computed event state
  const eventState = determineEventState();

  // Function to generate a printable version of the summary
  const generateExportSummary = () => {
    const summaryData = {
      eventDetails: {
        name: eventDetails?.eventName || "N/A",
        type: eventType,
        startDateTime: eventDetails?.eventStart || "N/A",
        endDateTime: eventDetails?.eventEnd || "N/A",
        venue: eventDetails?.venue || "N/A",
        category: eventDetails?.eventCategory || "N/A",
        description: eventDetails?.eventDescription || "N/A",
      },
      ticketDetails:
        eventType === "coming_soon" && !hasTicketInfo
          ? "To be determined"
          : {
              totalTickets: getTotalTickets(),
              ticketType: ticketDetails?.tierType || "N/A",
              freeSeating: ticketDetails?.freeSeating,
              tiers: ticketDetails?.ticketTiers,
            },
      claimingDetails:
        eventType === "coming_soon" && !hasTicketInfo
          ? "Not applicable - no ticket information"
          : eventType === "coming_soon" && !hasClaimingInfo
          ? "To be determined"
          : {
              schedules: claimingDetails?.claimingSummaries || [],
            },
      availabilityDetails: {
        displayPeriod: availabilityDetails?.displayPeriod || {
          startDate: "N/A",
          endDate: "N/A",
        },
        reservationPeriod: availabilityDetails?.reservationPeriod || {
          startDate: "N/A",
          endDate: "N/A",
          startTime: "N/A",
          endTime: "N/A",
        },
      },
      eventState: {
        status: eventState.status,
        visibility: eventState.visibility,
      },
    };

    return JSON.stringify(summaryData, null, 2);
  };

  // Function to export the summary as a text file
  const handleExportSummary = () => {
    const summaryText = generateExportSummary();
    const blob = new Blob([summaryText], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventDetails?.eventName || "event"}_summary.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

        <button
          onClick={handleExportSummary}
          className="bg-[#333] text-white px-4 py-2 rounded-md hover:bg-[#444] transition-colors text-sm"
        >
          Export Summary
        </button>
      </div>

      <hr className="border-t border-gray-600 my-4" />

      {/* Event Status Display */}
      <div className="bg-[#2A2A2A] p-4 rounded-lg mb-6">
        <h3 className="text-[#FFAB40] text-lg font-semibold mb-2">
          Event Publishing Status
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <p className="text-white text-sm">
              Status:{" "}
              <span className="font-semibold">
                {eventState.status.toUpperCase()}
              </span>
            </p>
            <p className="text-white text-sm">
              Visibility:{" "}
              <span className="font-semibold">
                {eventState.visibility.toUpperCase()}
              </span>
            </p>
          </div>
          <div className="flex-1">
            <p className="text-[#B8B8B8] text-sm">
              {eventState.statusDescription}
            </p>
          </div>
        </div>
      </div>

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
                      className="w-full h-[300px] object-cover rounded-lg"
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
                  <p className="text-[#B8B8B8] text-xs">Event Start</p>
                  <p className="text-white">
                    {formatDateTime(eventDetails?.eventStart) || "N/A"}
                    {eventType === "coming_soon" && (
                      <span className="text-[#FFAB40] ml-2 text-xs">
                        (Tentative)
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[#B8B8B8] text-xs">Event End</p>
                  <p className="text-white">
                    {formatDateTime(eventDetails?.eventEnd) || "Not specified"}
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

        {/* Display Period Section - Added for all event types */}
        <div>
          <h3 className="text-[#FFAB40] text-xl font-semibold mb-2">
            Display Period
          </h3>
          <div className="bg-[#1E1E1E] rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[#B8B8B8] text-xs mb-1">Start Showing</p>
                <p className="text-white">
                  {formatDate(availabilityDetails?.displayPeriod?.startDate)}
                </p>
              </div>
              <div>
                <p className="text-[#B8B8B8] text-xs mb-1">End Showing</p>
                <p className="text-white">
                  {formatDate(availabilityDetails?.displayPeriod?.endDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Only show reservation period for non-free, non-coming-soon events */}
        {eventType !== "free" && eventType !== "coming_soon" && (
          <div>
            <h3 className="text-[#FFAB40] text-xl font-semibold mb-2">
              Reservation Period
            </h3>
            <div className="bg-[#1E1E1E] rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#B8B8B8] text-xs mb-1">
                    Start Reservations
                  </p>
                  <p className="text-white">
                    {formatDate(
                      availabilityDetails?.reservationPeriod?.startDate
                    )}{" "}
                    {availabilityDetails?.reservationPeriod?.startTime &&
                      `at ${availabilityDetails.reservationPeriod.startTime}`}
                  </p>
                </div>
                <div>
                  <p className="text-[#B8B8B8] text-xs mb-1">
                    End Reservations
                  </p>
                  <p className="text-white">
                    {formatDate(
                      availabilityDetails?.reservationPeriod?.endDate
                    )}{" "}
                    {availabilityDetails?.reservationPeriod?.endTime &&
                      `at ${availabilityDetails.reservationPeriod.endTime}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Details Summary */}
        <div>
          <h3 className="text-[#FFAB40] text-xl font-semibold mb-2">Tickets</h3>
          <div className="bg-[#1E1E1E] rounded-lg p-4">
            {eventType === "free" && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="mr-3 text-[#FFAB40]">
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
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
            {eventType === "coming_soon" && !hasTicketInfo && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="mr-3 text-[#FFAB40]">
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
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
            {eventType === "coming_soon" && hasTicketInfo && (
              <div>
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
                                1 ticket, {tierName} (admin only view)
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
                    Available Tickets:{" "}
                    <span className="text-[#FFAB40]">
                      {getTotalTickets()} tickets
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Admin_PublishEvent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventDetails, setEventDetails] = useState({
    eventName: "",
    eventDescription: "",
    eventDate: "",
    venue: "",
    startTime: "",
    endTime: "",
    eventCategory: "",
    eventType: "ticketed",
    eventImage: null,
    imagePreview: null,
  });
  const [ticketDetails, setTicketDetails] = useState({
    tierType: "freeSeating",
    hasTierInfo: false, // For coming soon events
    freeSeating: {
      numberOfTickets: "",
      price: "",
      maxPerPerson: "",
    },
    ticketTiers: {
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
    },
  });
  const [claimingDetails, setClaimingDetails] = useState({
    claimingSummaries: [],
    availableDates: [],
    includeClaimingInfo: false, // For coming soon events
  });
  const [availabilityDetails, setAvailabilityDetails] = useState({
    displayPeriod: {
      startDate: "",
      endDate: "",
    },
    reservationPeriod: {
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formValid, setFormValid] = useState(false);

  // Get the event type from current eventDetails or default to "ticketed"
  const eventType = eventDetails?.eventType || "ticketed";

  console.log("Current step:", currentStep);
  console.log("Current event type:", eventType);

  useEffect(() => {
    console.log("Step changed to:", currentStep);
    console.log("Event details updated:", eventDetails);
  }, [currentStep, eventDetails]);

  const handleEventDetailsNext = (details) => {
    console.log("Event Details Received:", details);

    // Make sure eventType is explicitly captured from the incoming details
    const eventType = details.eventType || "ticketed";
    console.log("Event Type:", eventType);

    // Set the entire event details object at once
    setEventDetails(details);

    // For free events, we still need to go through ticket details
    // before jumping to claiming details
    setCurrentStep(2);
  };
  const handleTicketDetailsNext = (details) => {
    console.log("Ticket Details Received:", details);

    // Keep the eventType consistent from eventDetails
    const eventType = eventDetails?.eventType || "ticketed";

    // Make sure to merge new details with existing state
    setTicketDetails((prev) => ({ ...prev, ...details }));

    // Always proceed to claiming details (step 3)
    setCurrentStep(3);
  };

  const handleClaimingDetailsNext = (details) => {
    // Merge new details with existing state
    setClaimingDetails((prev) => ({ ...prev, ...details }));
    setCurrentStep(4);
  };

  const handleAvailabilityDetailsNext = (details) => {
    // Merge new details with existing state
    setAvailabilityDetails((prev) => ({ ...prev, ...details }));
    setCurrentStep(5);
  };

  const handleBack = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  // Function to determine the event status and visibility based on type and dates
  const determineEventState = () => {
    // Get current date for comparisons
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get reservation dates if available
    let reservationStart = null;
    let reservationEnd = null;
    if (availabilityDetails?.reservationPeriod?.startDate) {
      reservationStart = new Date(
        `${availabilityDetails.reservationPeriod.startDate}T${
          availabilityDetails.reservationPeriod.startTime || "00:00:00"
        }`
      );
    }
    if (availabilityDetails?.reservationPeriod?.endDate) {
      reservationEnd = new Date(
        `${availabilityDetails.reservationPeriod.endDate}T${
          availabilityDetails.reservationPeriod.endTime || "23:59:59"
        }`
      );
    }

    let status = "";
    let visibility = "";

    switch (eventType) {
      case "coming_soon":
        // Coming Soon events start as Published but with Scheduled status
        status = "scheduled";
        visibility = "published";
        break;

      case "free":
        // Free events are always published but with Closed status (no reservation)
        status = "closed";
        visibility = "published";
        break;

      case "ticketed":
        // Determine if the event should be scheduled or open based on reservation period
        if (reservationStart && reservationEnd) {
          if (today < reservationStart) {
            status = "scheduled";
            visibility = "published";
          } else if (today >= reservationStart && today <= reservationEnd) {
            status = "open";
            visibility = "published";
          } else {
            status = "closed";
            visibility = "published";
          }
        } else {
          // Default if reservation period not set
          status = "scheduled";
          visibility = "published";
        }
        break;

      default:
        status = "draft";
        visibility = "unpublished";
    }

    return { status, visibility };
  };

  // Helper functions for preparing data
  const prepareEventTicketData = (eventType, ticketDetails) => {
    const tickets = [];

    // Free events always have a single free ticket type
    if (eventType === "free") {
      tickets.push({
        seat_type: "Free",
        ticket_type: "Free Admission",
        price: 0,
        total_quantity: ticketDetails.freeSeating.numberOfTickets,
        max_per_user: ticketDetails.freeSeating.maxPerPerson,
      });
      return tickets;
    }

    // Coming Soon events with tier info
    if (eventType === "coming_soon" && ticketDetails.hasTierInfo) {
      if (ticketDetails.tierType === "freeSeating") {
        tickets.push({
          seat_type: "Free Seating",
          ticket_type: "Coming Soon",
          price: ticketDetails.freeSeating.price || 0,
          total_quantity: ticketDetails.freeSeating.numberOfTickets,
          max_per_user: ticketDetails.freeSeating.maxPerPerson,
        });
      } else {
        // Ticketed tiers for Coming Soon
        Object.entries(ticketDetails.ticketTiers)
          .filter(([_, tierData]) => tierData.checked)
          .forEach(([tierName, tierData]) => {
            tickets.push({
              seat_type: "Ticketed",
              ticket_type: tierName,
              price: tierData.price,
              total_quantity: tierData.number,
              max_per_user: tierData.maxPerPerson,
            });
          });
      }
      return tickets;
    }

    // Regular ticketed events
    if (ticketDetails.tierType === "freeSeating") {
      tickets.push({
        seat_type: "Free Seating",
        ticket_type: "General Admission",
        price: ticketDetails.freeSeating.price,
        total_quantity: ticketDetails.freeSeating.numberOfTickets,
        max_per_user: ticketDetails.freeSeating.maxPerPerson,
      });
    } else {
      Object.entries(ticketDetails.ticketTiers)
        .filter(([_, tierData]) => tierData.checked)
        .forEach(([tierName, tierData]) => {
          tickets.push({
            seat_type: "Ticketed",
            ticket_type: tierName,
            price: tierData.price,
            total_quantity: tierData.number,
            max_per_user: tierData.maxPerPerson,
          });
        });
    }

    return tickets;
  };

  const prepareClaimingSlotData = () => {
    return claimingDetails.claimingSummaries.map((slot) => ({
      claiming_date: slot.date,
      start_time: slot.startTime,
      end_time: slot.endTime,
      venue: slot.venue,
      max_claimers: slot.maxReservations,
    }));
  };

  const handleSummaryNext = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Determine appropriate status and visibility based on event type and timing
      const eventState = determineEventState();

      // Prepare base event data
      const eventData = {
        name: eventDetails.eventName,
        event_date: eventDetails.eventDate,
        details: eventDetails.eventDescription,
        event_time: eventDetails.startTime
          ? eventDetails.endTime
            ? `${eventDetails.startTime} - ${eventDetails.endTime}`
            : eventDetails.startTime
          : null,
        category: eventDetails.eventCategory,
        venue: eventDetails.venue,
        event_type: eventType,
        status: eventState.status,
        visibility: eventState.visibility,
      };

      // Handle image upload - Don't reupload if we already have a URL
      if (
        eventDetails.eventImage &&
        !eventDetails.eventImage.startsWith("http")
      ) {
        try {
          const uploadResult = await eventService.uploadEventImage(
            eventDetails.eventImage
          );
          eventData.image = uploadResult.imageUrl;
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          setError("Failed to upload image. Please try again.");
          setIsLoading(false);
          return;
        }
      } else if (eventDetails.eventImage) {
        // If it's already a URL, just use it
        eventData.image = eventDetails.eventImage;
      }

      // Create the event
      const eventResult = await eventService.createEvent(eventData);
      const eventId = eventResult.data.event_id;

      // Handle ticket creation logic based on event type
      const shouldCreateTickets =
        eventType === "ticketed" ||
        (eventType === "coming_soon" && ticketDetails?.hasTierInfo) ||
        eventType === "free";

      if (shouldCreateTickets) {
        const ticketsToCreate = prepareEventTicketData(
          eventType,
          ticketDetails
        );

        if (ticketsToCreate.length > 0) {
          await eventService.createTicketsBulk(eventId, ticketsToCreate);
        }
      }

      // Handle claiming slots
      const shouldCreateClaimingSlots =
        eventType === "ticketed" ||
        eventType === "free" ||
        (eventType === "coming_soon" && claimingDetails.includeClaimingInfo);

      if (
        shouldCreateClaimingSlots &&
        claimingDetails?.claimingSummaries?.length > 0
      ) {
        const claimingSlotsToCreate = prepareClaimingSlotData();

        if (claimingSlotsToCreate.length > 0) {
          await eventService.createClaimingSlotsBulk(
            eventId,
            claimingSlotsToCreate
          );
        }
      }

      // Update availability details for all event types
      const updateData = {
        display_start_date: availabilityDetails.displayPeriod.startDate,
        display_end_date: availabilityDetails.displayPeriod.endDate,
      };

      // Add reservation period for ticketed events only if it exists
      if (eventType === "ticketed" && availabilityDetails.reservationPeriod) {
        updateData.reservation_start = new Date(
          `${availabilityDetails.reservationPeriod.startDate}T${availabilityDetails.reservationPeriod.startTime}`
        ).toISOString();
        updateData.reservation_end = new Date(
          `${availabilityDetails.reservationPeriod.endDate}T${availabilityDetails.reservationPeriod.endTime}`
        ).toISOString();
      }

      await eventService.updateEvent(eventId, updateData);

      // Determine success message based on event type
      let successMessage = "";
      switch (eventType) {
        case "ticketed":
          successMessage = "Ticketed event successfully created and published!";
          break;
        case "coming_soon":
          successMessage =
            "Coming Soon event successfully created and published!";
          break;
        case "free":
          successMessage = "Free event successfully created and published!";
          break;
      }

      // Show success message
      alert(successMessage);

      // Reset state to allow creating another event
      setCurrentStep(1);
      setEventDetails({
        eventName: "",
        eventDescription: "",
        eventDate: "",
        venue: "",
        startTime: "",
        endTime: "",
        eventCategory: "",
        eventType: "ticketed",
        eventImage: null,
        imagePreview: null,
      });
      setTicketDetails({
        tierType: "freeSeating",
        hasTierInfo: false,
        freeSeating: {
          numberOfTickets: "",
          price: "",
          maxPerPerson: "",
        },
        ticketTiers: {
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
        },
      });
      setClaimingDetails({
        claimingSummaries: [],
        availableDates: [],
        includeClaimingInfo: false,
      });
      setAvailabilityDetails({
        displayPeriod: {
          startDate: "",
          endDate: "",
        },
        reservationPeriod: {
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
        },
      });
    } catch (error) {
      console.error("Event creation error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to create event. Please check your details and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle saving event as draft
  const handleSaveAsDraft = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the event state
      const eventState = determineEventState();

      // Prepare draft data with all collected information
      const eventData = {
        name: eventDetails.eventName,
        event_date: eventDetails.eventDate,
        details: eventDetails.eventDescription,
        event_time: eventDetails.startTime
          ? eventDetails.endTime
            ? `${eventDetails.startTime} - ${eventDetails.endTime}`
            : eventDetails.startTime
          : null,
        category: eventDetails.eventCategory,
        venue: eventDetails.venue,
        event_type: eventType,
        status: "draft", // Always set as draft
        visibility: "unpublished", // Always unpublished for drafts
      };

      // Handle image upload if we have an image
      if (eventDetails.eventImage) {
        try {
          const uploadResult = await eventService.uploadEventImage(
            eventDetails.eventImage
          );
          eventData.image = uploadResult.imageUrl;
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
        }
      }

      console.log("Draft data being sent:", eventData);

      // Use the createDraftEvent function
      const eventResult = await eventService.createDraftEvent(eventData);

      // Show success message
      alert("Event successfully saved as draft!");
    } catch (error) {
      console.error("Draft creation error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setError(
        error.response?.data?.message ||
          "Failed to save draft. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-col font-Poppins">
      <Header_Admin />
      <div className="flex">
        <Sidebar_Admin />

        <div className="bg-[#272727] flex items-center justify-center w-full p-6">
          {isLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-[#333] p-4 rounded-lg text-white">
                Loading...
              </div>
            </div>
          )}

          {error && (
            <div className="fixed top-4 right-4 bg-red-500 text-white p-3 rounded-lg z-50">
              {error}
              <button onClick={() => setError(null)} className="ml-2 font-bold">
                ×
              </button>
            </div>
          )}

          <div className="w-full max-w-4xl">
            {currentStep === 1 ? (
              <EventDetails
                initialData={eventDetails}
                onNext={handleEventDetailsNext}
                setFormValid={setFormValid}
              />
            ) : currentStep === 2 ? (
              <TicketDetails
                initialData={ticketDetails}
                eventType={eventDetails.eventType}
                onBack={handleBack}
                onNext={handleTicketDetailsNext}
              />
            ) : currentStep === 3 ? (
              <ClaimingDetails
                initialData={claimingDetails}
                eventType={eventDetails.eventType}
                ticketDetails={ticketDetails}
                onBack={handleBack}
                onNext={handleClaimingDetailsNext}
              />
            ) : currentStep === 4 ? (
              <AvailabilityDetails
                initialData={{
                  ...availabilityDetails,
                  imagePreview: eventDetails.imagePreview,
                }}
                eventType={eventDetails.eventType}
                onBack={handleBack}
                onNext={handleAvailabilityDetailsNext}
              />
            ) : (
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
                disabled={currentStep === 1 && !formValid}
                className={`px-9 py-2 rounded-full text-xs font-semibold ${
                  currentStep === 1 && !formValid
                    ? "bg-neutral-500 text-neutral-300 cursor-not-allowed"
                    : "bg-neutral-700 text-white hover:bg-gray-600 transition-colors"
                }`}
                title={
                  currentStep === 1 && !formValid
                    ? "Fill all required fields to save as draft"
                    : "Save as draft"
                }
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

                {currentStep < 5 && (
                  <button
                    onClick={() => {
                      let submitButtonSelector = "";

                      switch (currentStep) {
                        case 1:
                          submitButtonSelector = ".event-submit-button";
                          break;
                        case 2:
                          submitButtonSelector = ".ticket-submit-button";
                          break;
                        case 3:
                          submitButtonSelector = ".claiming-submit-button";
                          break;
                        case 4:
                          submitButtonSelector = ".availability-submit-button";
                          break;
                      }

                      const submitButton =
                        document.querySelector(submitButtonSelector);
                      if (submitButton) {
                        submitButton.click();
                      } else {
                        console.error(`Could not find ${submitButtonSelector}`);
                      }
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
