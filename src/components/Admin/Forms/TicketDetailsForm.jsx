// TicketDetailsForm.jsx
import React from "react";
import { PlusIcon, TrashIcon, EditIcon, CheckIcon } from "lucide-react";

const TicketDetailsForm = ({
  data,
  onChange,
  onSubmit,
  submitButtonText = "Save",
}) => {
  const { tierType, freeSeating, ticketTiers, totalTickets } = data;

  const handleTierTypeChange = (type) => {
    onChange({
      ...data,
      tierType: type,
    });
  };

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
    if (!data.editingTierName || !data.editingTierName.trim()) return;

    const oldTierName = Object.keys(ticketTiers).find(
      (key) => ticketTiers[key].isEditing
    );

    if (!oldTierName) return;

    const updatedTiers = { ...ticketTiers };
    const oldTierData = updatedTiers[oldTierName];

    // Remove old tier and add new one with same data
    delete updatedTiers[oldTierName];
    updatedTiers[data.editingTierName.trim()] = {
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

  return (
    <div className="w-full">
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
                className="bg-[#2C2C2C] text-white text-sm px-3 py-2 rounded 
                         border border-gray-600 focus:outline-none focus:border-[#FFAB40]"
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
                value={freeSeating.maxPerPerson}
                onChange={(e) =>
                  handleFreeSeatingInputChange("maxPerPerson", e.target.value)
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
                      value={data.editingTierName || tier}
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

      <div className="mt-4 flex items-center justify-between">
        <span className="text-white text-sm">Total Number of Tickets:</span>
        <span className="text-[#FFAB40] font-semibold">
          {displayedTotalTickets()}
        </span>

        {/* Submit button (visible only if requested) */}
        {submitButtonText && (
          <button
            onClick={onSubmit}
            className="bg-[#FFAB40] text-black px-5 py-2 rounded-full text-sm font-semibold ml-4"
          >
            {submitButtonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default TicketDetailsForm;
