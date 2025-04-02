const ClaimingDetailsForm = ({
  data,
  onChange,
  onSubmit,
  submitButtonText = "Save",
}) => {
  const {
    claimingDate,
    claimingStartTime,
    claimingEndTime,
    claimingVenue,
    maxReservations,
    dateList,
    selectedDate,
    claimingSummaries,
    selectedSummary,
    isEditing,
  } = data;

  // Sync dates from summaries to datelist
  const syncDateListWithSummaries = (summaries) => {
    const uniqueDates = [...new Set(summaries.map((summary) => summary.date))];

    const newData = {
      ...data,
      dateList: uniqueDates,
    };

    // If the selected date is no longer in the list, clear it
    if (selectedDate && !uniqueDates.includes(selectedDate)) {
      newData.selectedDate = null;
    }

    onChange(newData);
  };

  // Add date to the list
  const addDate = () => {
    if (claimingDate && !dateList.includes(claimingDate)) {
      onChange({
        ...data,
        dateList: [...dateList, claimingDate],
        selectedDate: claimingDate,
        claimingDate: "",
      });
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

  // Handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...data,
      [name]: value,
    });
  };

  // Handle max reservations change - only allow positive numbers
  const handleMaxReservationsChange = (value) => {
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) > 0)) {
      onChange({
        ...data,
        maxReservations: value,
      });
    }
  };

  // Handle date selection from table
  const handleDateSelection = (date) => {
    const newData = {
      ...data,
      selectedDate: date,
      claimingDate: date,
    };

    // Find if this date has an existing summary
    const relatedSummary = claimingSummaries.find(
      (summary) => summary.date === date
    );

    if (relatedSummary) {
      // If found, populate the form with the summary data
      newData.claimingStartTime = relatedSummary.startTime;
      newData.claimingEndTime = relatedSummary.endTime;
      newData.claimingVenue = relatedSummary.venue;
      newData.maxReservations = relatedSummary.maxReservations.toString();
      newData.selectedSummary = relatedSummary;
      newData.isEditing = true;
    } else {
      // Otherwise, clear the form
      newData.claimingStartTime = "";
      newData.claimingEndTime = "";
      newData.claimingVenue = "";
      newData.maxReservations = "";
      newData.selectedSummary = null;
      newData.isEditing = false;
    }

    onChange(newData);
  };

  // Handle summary selection from table
  const handleSelectSummary = (summary) => {
    onChange({
      ...data,
      selectedSummary: summary,
      isEditing: true,
      claimingDate: summary.date,
      claimingStartTime: summary.startTime,
      claimingEndTime: summary.endTime,
      claimingVenue: summary.venue,
      maxReservations: summary.maxReservations.toString(),
    });
  };

  // Clear form fields
  const clearForm = () => {
    onChange({
      ...data,
      claimingDate: "",
      claimingStartTime: "",
      claimingEndTime: "",
      claimingVenue: "",
      maxReservations: "",
      selectedDate: null,
      selectedSummary: null,
      isEditing: false,
    });
  };

  // Add or update a schedule
  const handleAddOrUpdateSchedule = () => {
    if (isEditing) {
      // Editing existing schedule
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
            maxReservations === "" ? 0 : parseInt(maxReservations),
        };

        const updatedSummaries = claimingSummaries.map((s) =>
          s.id === selectedSummary.id ? summaryData : s
        );

        const newData = {
          ...data,
          claimingSummaries: updatedSummaries,
        };

        onChange(newData);
        syncDateListWithSummaries(updatedSummaries);
        clearForm();
      } else {
        alert(
          "Please provide all required information (date, venue, and time)"
        );
      }
    } else {
      // Adding new schedule
      const dateToUse = claimingDate || selectedDate;

      if (dateToUse && claimingVenue && claimingStartTime && claimingEndTime) {
        // Add to date list if not already there
        let updatedDateList = dateList;
        if (claimingDate && !dateList.includes(claimingDate)) {
          updatedDateList = [...dateList, claimingDate];
        }

        const summaryData = {
          id: Date.now(),
          date: dateToUse,
          venue: claimingVenue,
          startTime: claimingStartTime,
          endTime: claimingEndTime,
          maxReservations:
            maxReservations === "" ? 0 : parseInt(maxReservations),
        };

        const updatedSummaries = [...claimingSummaries, summaryData];

        const newData = {
          ...data,
          dateList: updatedDateList,
          claimingSummaries: updatedSummaries,
        };

        onChange(newData);
        syncDateListWithSummaries(updatedSummaries);
        clearForm();
      } else {
        alert(
          "Please provide all required information (date, venue, and time)"
        );
      }
    }
  };

  // Delete a schedule
  const handleDeleteSchedule = (summaryId) => {
    const updatedSummaries = claimingSummaries.filter(
      (s) => s.id !== summaryId
    );
    onChange({
      ...data,
      claimingSummaries: updatedSummaries,
    });
    syncDateListWithSummaries(updatedSummaries);
    clearForm();
  };

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-3">
        {!isEditing && (
          <div className="flex items-center">
            <p className="text-[#FFAB40] text-sm mr-2">Available Date:</p>
            <input
              type="date"
              name="claimingDate"
              value={claimingDate}
              onChange={handleInputChange}
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
                  name="claimingDate"
                  value={claimingDate}
                  onChange={handleInputChange}
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
                          onClick={() => handleDateSelection(date)}
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
                                  onChange({
                                    ...data,
                                    dateList: dateList.filter(
                                      (d) => d !== date
                                    ),
                                    selectedDate: null,
                                  });
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

          {/* Right side: Input Fields */}
          <div className="w-1/2 space-y-3">
            <div className="flex flex-col">
              <p className="text-[#FFAB40] text-sm mb-1">Claiming Time:</p>
              <div className="flex space-x-2 items-center">
                <input
                  type="time"
                  name="claimingStartTime"
                  value={claimingStartTime}
                  onChange={handleInputChange}
                  className="bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
                />
                <p className="text-white text-sm">to</p>
                <input
                  type="time"
                  name="claimingEndTime"
                  value={claimingEndTime}
                  onChange={handleInputChange}
                  className="bg-[#1E1E1E] border border-[#333333] text-white rounded px-3 py-1 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <p className="text-[#FFAB40] text-sm mb-1">Claiming Venue:</p>
              <input
                type="text"
                name="claimingVenue"
                placeholder="Enter venue for ticket claiming"
                value={claimingVenue}
                onChange={handleInputChange}
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
                onClick={handleAddOrUpdateSchedule}
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
                              handleDeleteSchedule(summary.id);
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

      {/* Submit button (visible only if requested) */}
      {submitButtonText && (
        <div className="flex justify-end mt-4">
          <button
            onClick={onSubmit}
            className="bg-[#FFAB40] text-black px-5 py-2 rounded-full text-sm font-semibold"
          >
            {submitButtonText}
          </button>
        </div>
      )}
    </div>
  );
};

export default ClaimingDetailsForm;
