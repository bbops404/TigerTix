import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
  AlertCircleIcon,
  InfoIcon,
} from "lucide-react";

const TicketDetailsForm = ({
  data,
  onChange,
  onSubmit,
  submitButtonText = "Save",
}) => {
  const [errors, setErrors] = useState({});

  const {
    eventType = "ticketed",
    hasTierInfo = false,
    tierType = "freeSeating",
    ticketTiers = {},
    totalTickets = 0,
    freeSeating = {
      numberOfTickets: "",
      price: "",
      maxPerPerson: "",
    },
    editingTierName = "",
  } = data || {};

  // Initialize default ticket tiers if none exist or if data changes
  useEffect(() => {
    // Reset errors when data changes
    setErrors({});

    if (
      data &&
      (!data.ticketTiers || Object.keys(data.ticketTiers).length === 0)
    ) {
      // Only initialize default tiers if there are none in the current data
      const defaultTiers = {
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
      };

      onChange({
        ...data,
        ticketTiers: defaultTiers,
      });
    }
  }, [data]);

  // Handle checkbox change for "Coming Soon" events
  const handleIncludeTiersChange = (checked) => {
    onChange({
      ...data,
      hasTierInfo: checked,
    });
  };

  // Handle tier type change
  const handleTierTypeChange = (type) => {
    onChange({
      ...data,
      tierType: type,
    });
  };

  // Handle free seating ticket details
  const handleFreeSeatingInputChange = (field, value) => {
    // Validation functions
    const isValidTicketNumber = (val) => val === "" || /^\d*$/.test(val);
    const isValidPrice = (val) => val === "" || /^\d*\.?\d*$/.test(val);
    const isValidMaxPerPerson = (val) => val === "" || /^\d*$/.test(val);

    // Apply appropriate validation based on field
    if (
      (field === "numberOfTickets" && !isValidTicketNumber(value)) ||
      (field === "price" && !isValidPrice(value)) ||
      (field === "maxPerPerson" && !isValidMaxPerPerson(value))
    ) {
      return; // Invalid input, don't update state
    }

    onChange({
      ...data,
      freeSeating: {
        ...freeSeating,
        [field]: value,
      },
    });
  };

  // Ticket tiers functions
  const handleNumberChange = (tier, value) => {
    // Allow only numbers
    if (value === "" || /^\d*$/.test(value)) {
      const updatedTiers = { ...ticketTiers };
      updatedTiers[tier].number = value;

      // Recalculate total tickets
      const total = Object.values(updatedTiers).reduce(
        (sum, tier) =>
          sum + (tier.checked && tier.number ? parseInt(tier.number) : 0),
        0
      );

      onChange({
        ...data,
        ticketTiers: updatedTiers,
        totalTickets: total,
      });
    }
  };

  const handlePriceChange = (tier, value) => {
    // Allow only numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const updatedTiers = { ...ticketTiers };
      updatedTiers[tier].price = value;

      onChange({
        ...data,
        ticketTiers: updatedTiers,
      });
    }
  };

  const handleMaxPerPersonChange = (tier, value) => {
    // Allow only numbers
    if (value === "" || /^\d*$/.test(value)) {
      const updatedTiers = { ...ticketTiers };
      updatedTiers[tier].maxPerPerson = value;

      onChange({
        ...data,
        ticketTiers: updatedTiers,
      });
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

    // Recalculate total tickets
    const total = Object.values(updatedTiers).reduce(
      (sum, tier) =>
        sum + (tier.checked && tier.number ? parseInt(tier.number) : 0),
      0
    );

    onChange({
      ...data,
      ticketTiers: updatedTiers,
      totalTickets: total,
    });
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

    onChange({
      ...data,
      ticketTiers: {
        ...ticketTiers,
        [newTierName]: {
          number: "",
          price: "",
          maxPerPerson: "",
          checked: false,
          isEditing: false,
        },
      },
    });
  };

  const deleteTier = (tierToDelete) => {
    const { [tierToDelete]: removedTier, ...remainingTiers } = ticketTiers;

    // Recalculate total tickets
    const total = Object.values(remainingTiers).reduce(
      (sum, tier) =>
        sum + (tier.checked && tier.number ? parseInt(tier.number) : 0),
      0
    );

    onChange({
      ...data,
      ticketTiers: remainingTiers,
      totalTickets: total,
    });
  };

  const startEditingTierName = (tier) => {
    const updatedTiers = { ...ticketTiers };
    updatedTiers[tier].isEditing = true;

    onChange({
      ...data,
      ticketTiers: updatedTiers,
      editingTierName: tier,
    });
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

    onChange({
      ...data,
      ticketTiers: updatedTiers,
      editingTierName: "",
    });
  };

  const handleTierNameChange = (newName) => {
    onChange({
      ...data,
      editingTierName: newName,
    });
  };

  // Calculate displayed total tickets
  const displayedTotalTickets = () => {
    if (tierType === "freeSeating") {
      return freeSeating.numberOfTickets === ""
        ? 0
        : parseInt(freeSeating.numberOfTickets);
    } else {
      return totalTickets;
    }
  };

  // Validate the form
  const validate = () => {
    const newErrors = {};

    if (eventType === "coming_soon" && !hasTierInfo) {
      // No validation needed if coming soon with no tiers
      return true;
    }

    if (tierType === "freeSeating") {
      if (!freeSeating.numberOfTickets)
        newErrors.freeSeatingTickets = "Number of tickets is required";
      if (eventType !== "free" && !freeSeating.price)
        newErrors.freeSeatingPrice = "Price is required";
      if (!freeSeating.maxPerPerson)
        newErrors.freeSeatingMaxPerPerson =
          "Max tickets per person is required";
    } else {
      // Check if at least one tier is selected
      const anyTierChecked = Object.values(ticketTiers).some(
        (tier) => tier.checked
      );
      if (!anyTierChecked) {
        newErrors.tiers = "At least one ticket tier must be selected";
      } else {
        // Check if all selected tiers have required fields
        let tierErrors = false;
        Object.entries(ticketTiers).forEach(([tierName, tier]) => {
          if (tier.checked) {
            if (!tier.number) tierErrors = true;
            if (eventType !== "free" && !tier.price) tierErrors = true;
            if (!tier.maxPerPerson) tierErrors = true;
          }
        });

        if (tierErrors) {
          newErrors.tierDetails =
            "All selected tiers must have number, price, and max per person values";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate() && onSubmit) {
      onSubmit(data);
    } else {
      // Scroll to the top to show errors
      window.scrollTo(0, 0);
    }
  };

  // For Coming Soon events - show option to add ticket tiers
  if (eventType === "coming_soon") {
    return (
      <div className="w-full">
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4">
            <div className="flex items-center text-red-500 mb-2">
              <AlertCircleIcon className="h-5 w-5 mr-2" />
              <p className="font-semibold">Please fix the following errors:</p>
            </div>
            <ul className="list-disc pl-10 text-sm text-red-400">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

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
                checked={hasTierInfo}
                onChange={(e) => handleIncludeTiersChange(e.target.checked)}
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
        {hasTierInfo && (
          <div className="mt-6">
            <div className="flex items-center mb-4">
              <div className="mr-4">
                <input
                  type="radio"
                  id="freeSeating"
                  name="tierType"
                  value="freeSeating"
                  checked={tierType === "freeSeating"}
                  onChange={() => handleTierTypeChange("freeSeating")}
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
                  onChange={() => handleTierTypeChange("ticketed")}
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
                      value={freeSeating.numberOfTickets}
                      onChange={(e) =>
                        handleFreeSeatingInputChange(
                          "numberOfTickets",
                          e.target.value
                        )
                      }
                      className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                               border ${
                                 errors.freeSeatingTickets
                                   ? "border-red-500"
                                   : "border-gray-600"
                               } focus:outline-none focus:border-[#FFAB40]`}
                      placeholder="Total available tickets"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">
                      Price (₱):
                    </label>
                    <input
                      type="text"
                      value={freeSeating.price}
                      onChange={(e) =>
                        handleFreeSeatingInputChange("price", e.target.value)
                      }
                      className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                               border ${
                                 errors.freeSeatingPrice
                                   ? "border-red-500"
                                   : "border-gray-600"
                               } focus:outline-none focus:border-[#FFAB40]`}
                      placeholder="Ticket price"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-white text-sm mb-1">
                      Max Tickets Per Person:
                    </label>
                    <input
                      type="text"
                      value={freeSeating.maxPerPerson}
                      onChange={(e) =>
                        handleFreeSeatingInputChange(
                          "maxPerPerson",
                          e.target.value
                        )
                      }
                      className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                               border ${
                                 errors.freeSeatingMaxPerPerson
                                   ? "border-red-500"
                                   : "border-gray-600"
                               } focus:outline-none focus:border-[#FFAB40]`}
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
                {errors.tiers && (
                  <div className="bg-red-900/20 border border-red-500 rounded-md p-2 mb-4">
                    <p className="text-red-400 text-sm flex items-center">
                      <AlertCircleIcon className="h-4 w-4 mr-1" />
                      {errors.tiers}
                    </p>
                  </div>
                )}

                {errors.tierDetails && (
                  <div className="bg-red-900/20 border border-red-500 rounded-md p-2 mb-4">
                    <p className="text-red-400 text-sm flex items-center">
                      <AlertCircleIcon className="h-4 w-4 mr-1" />
                      {errors.tierDetails}
                    </p>
                  </div>
                )}

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
                  ? freeSeating.numberOfTickets === ""
                    ? 0
                    : parseInt(freeSeating.numberOfTickets)
                  : totalTickets}
              </span>
            </div>
          </div>
        )}

        {/* Submit button (visible only if requested) */}
        {submitButtonText && (
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmit}
              className="bg-[#FFAB40] text-black px-5 py-2 rounded-full text-sm font-semibold"
            >
              {submitButtonText}
            </button>
          </div>
        )}
      </div>
    );
  }

  // For free events
  if (eventType === "free") {
    return (
      <div className="w-full">
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4">
            <div className="flex items-center text-red-500 mb-2">
              <AlertCircleIcon className="h-5 w-5 mr-2" />
              <p className="font-semibold">Please fix the following errors:</p>
            </div>
            <ul className="list-disc pl-10 text-sm text-red-400">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

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
              value={freeSeating.numberOfTickets}
              onChange={(e) =>
                handleFreeSeatingInputChange("numberOfTickets", e.target.value)
              }
              className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                       border ${
                         errors.freeSeatingTickets
                           ? "border-red-500"
                           : "border-gray-600"
                       } focus:outline-none focus:border-[#FFAB40]`}
              placeholder="Total available tickets"
            />
          </div>

          <div className="flex flex-col mt-4">
            <label className="text-white text-sm mb-1">
              Max Tickets Per Person:
            </label>
            <input
              type="text"
              value={freeSeating.maxPerPerson}
              onChange={(e) =>
                handleFreeSeatingInputChange("maxPerPerson", e.target.value)
              }
              className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                       border ${
                         errors.freeSeatingMaxPerPerson
                           ? "border-red-500"
                           : "border-gray-600"
                       } focus:outline-none focus:border-[#FFAB40]`}
              placeholder="Max tickets per person"
            />
            <p className="text-[#B8B8B8] text-xs mt-2">
              For maximum tickets per person, set between 1-10.
            </p>
          </div>
        </div>

        {/* Submit button (visible only if requested) */}
        {submitButtonText && (
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmit}
              className="bg-[#FFAB40] text-black px-5 py-2 rounded-full text-sm font-semibold"
            >
              {submitButtonText}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Regular ticketed event with full ticket details
  return (
    <div className="w-full">
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4">
          <div className="flex items-center text-red-500 mb-2">
            <AlertCircleIcon className="h-5 w-5 mr-2" />
            <p className="font-semibold">Please fix the following errors:</p>
          </div>
          <ul className="list-disc pl-10 text-sm text-red-400">
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center mb-4">
        <div className="mr-4">
          <input
            type="radio"
            id="freeSeating"
            name="tierType"
            value="freeSeating"
            checked={tierType === "freeSeating"}
            onChange={() => handleTierTypeChange("freeSeating")}
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
            onChange={() => handleTierTypeChange("ticketed")}
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
                value={freeSeating.numberOfTickets}
                onChange={(e) =>
                  handleFreeSeatingInputChange(
                    "numberOfTickets",
                    e.target.value
                  )
                }
                className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                         border ${
                           errors.freeSeatingTickets
                             ? "border-red-500"
                             : "border-gray-600"
                         } focus:outline-none focus:border-[#FFAB40]`}
                placeholder="Total available tickets"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-white text-sm mb-1">Price (₱):</label>
              <input
                type="text"
                value={freeSeating.price}
                onChange={(e) =>
                  handleFreeSeatingInputChange("price", e.target.value)
                }
                className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                         border ${
                           errors.freeSeatingPrice
                             ? "border-red-500"
                             : "border-gray-600"
                         } focus:outline-none focus:border-[#FFAB40]`}
                placeholder="Ticket price"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-white text-sm mb-1">
                Max Tickets Per Person:
              </label>
              <input
                type="text"
                value={freeSeating.maxPerPerson}
                onChange={(e) =>
                  handleFreeSeatingInputChange("maxPerPerson", e.target.value)
                }
                className={`bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                         border ${
                           errors.freeSeatingMaxPerPerson
                             ? "border-red-500"
                             : "border-gray-600"
                         } focus:outline-none focus:border-[#FFAB40]`}
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
          {errors.tiers && (
            <div className="bg-red-900/20 border border-red-500 rounded-md p-2 mb-4">
              <p className="text-red-400 text-sm flex items-center">
                <AlertCircleIcon className="h-4 w-4 mr-1" />
                {errors.tiers}
              </p>
            </div>
          )}

          {errors.tierDetails && (
            <div className="bg-red-900/20 border border-red-500 rounded-md p-2 mb-4">
              <p className="text-red-400 text-sm flex items-center">
                <AlertCircleIcon className="h-4 w-4 mr-1" />
                {errors.tierDetails}
              </p>
            </div>
          )}

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
          {displayedTotalTickets()}
        </span>
      </div>

      {/* Submit button (visible only if requested) */}
      {submitButtonText && (
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            className="bg-[#FFAB40] text-black px-5 py-2 rounded-full text-sm font-semibold"
          >
            {submitButtonText}
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketDetailsForm;
