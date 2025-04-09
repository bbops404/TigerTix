import React, { useState, useEffect } from "react";
import TicketDetailsForm from "../Forms/TicketDetailsForm";
import eventService from "../../../pages/Services/eventService"; // Import your eventService

const EditTicketDetailsPopup = ({ isOpen, onClose, eventData, onSave }) => {
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch tickets directly when the popup opens
  useEffect(() => {
    if (eventData && isOpen) {
      setIsLoading(true);
      setError(null);

      const fetchTickets = async () => {
        try {
          console.log(`Fetching tickets for event ID: ${eventData.id}`);

          // Use your eventService that already has authentication configured
          const response = await eventService.tickets.getByEventId(
            eventData.id
          );

          console.log("Tickets API response:", response);

          if (response && response.data) {
            console.log("Tickets fetched successfully:", response.data);

            // Create a copy of event data with the fetched tickets
            const updatedEventData = {
              ...eventData,
              tickets: response.data || [],
            };

            // Now process the tickets
            processEventData(updatedEventData);
          } else {
            console.error("Error in ticket response format:", response);
            setError("Failed to load tickets. Unexpected response format.");

            // Still try to process with whatever data we have
            processEventData(eventData);
          }
        } catch (err) {
          console.error("Error fetching tickets:", err);
          setError(`Failed to load tickets: ${err.message}`);

          // If we can't fetch tickets, still try to use what we have
          processEventData(eventData);
        }
      };

      // Process the event data to set up the form
      const processEventData = (data) => {
        try {
          console.log("Processing event data with tickets:", data);

          // Default structure
          const initialFormData = {
            eventType: data.eventType || "ticketed",
            tierType: "freeSeating", // Default
            ticketTiers: {},
            freeSeating: {
              numberOfTickets: "",
              price: "",
              maxPerPerson: "",
            },
          };

          // Check if we have ticket data
          if (
            data.tickets &&
            Array.isArray(data.tickets) &&
            data.tickets.length > 0
          ) {
            console.log(`Found ${data.tickets.length} tickets:`, data.tickets);

            // Check if there is only one ticket with "Free Seating" type
            const freeSeatingTicket = data.tickets.find(
              (ticket) =>
                ticket.seat_type === "Free Seating" ||
                ticket.seat_type === "General Admission" ||
                data.tickets.length === 1
            );

            if (freeSeatingTicket || data.tickets.length === 1) {
              // This is likely a free seating setup
              const ticket = freeSeatingTicket || data.tickets[0];
              console.log("Using free seating ticket:", ticket);

              initialFormData.tierType = "freeSeating";
              initialFormData.freeSeating = {
                numberOfTickets: String(ticket.total_quantity || 0),
                price: String(ticket.price || 0),
                maxPerPerson: String(ticket.max_per_user || 1),
              };
            } else {
              // This is a tiered seating arrangement
              console.log("Setting up multiple ticket tiers");
              initialFormData.tierType = "ticketed";
              const ticketTiersObj = {};

              data.tickets.forEach((ticket) => {
                ticketTiersObj[
                  ticket.seat_type ||
                    `Tier ${Math.random().toString(36).substring(7)}`
                ] = {
                  number: String(ticket.total_quantity || 0),
                  price: String(ticket.price || 0),
                  maxPerPerson: String(ticket.max_per_user || 1),
                  checked: true,
                  isEditing: false,
                };
              });

              initialFormData.ticketTiers = ticketTiersObj;
            }
          } else if (data.eventType === "free") {
            // For free events, create default free ticket settings
            initialFormData.tierType = "freeSeating";
            initialFormData.freeSeating = {
              numberOfTickets: "100", // Default value
              price: "0", // Always 0 for free events
              maxPerPerson: "2", // Default value
            };
          } else {
            console.log("No tickets found, using default empty structure");

            // For ticketed events with no tickets yet, provide some defaults
            if (data.eventType === "ticketed") {
              initialFormData.freeSeating = {
                numberOfTickets: "100", // Default value
                price: "100", // Default value
                maxPerPerson: "2", // Default value
              };
            }
          }

          console.log("Final form data:", initialFormData);
          setFormData(initialFormData);
        } catch (err) {
          console.error("Error processing event data:", err);
          setError(`Error processing ticket data: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      };

      // Start the fetch process
      fetchTickets();
    }
  }, [eventData, isOpen]);

  // Helper function to prepare tickets directly for the API
  const prepareTicketsForAPI = (ticketDetails, eventType) => {
    let tickets = [];

    if (eventType === "free") {
      // Free event - single free ticket tier
      tickets.push({
        seat_type: "Free Seating",
        ticket_type: "General Admission",
        price: 0, // Always 0 for free events
        total_quantity: parseInt(ticketDetails.freeSeating.numberOfTickets),
        max_per_user: parseInt(ticketDetails.freeSeating.maxPerPerson) || 1,
      });
    } else if (ticketDetails.tierType === "freeSeating") {
      // Free seating
      tickets.push({
        seat_type: "Free Seating",
        ticket_type: "General Admission",
        price: parseFloat(ticketDetails.freeSeating.price) || 0,
        total_quantity: parseInt(ticketDetails.freeSeating.numberOfTickets),
        max_per_user: parseInt(ticketDetails.freeSeating.maxPerPerson) || 1,
      });
    } else {
      // Ticketed with multiple tiers
      Object.entries(ticketDetails.ticketTiers)
        .filter(([_, tierData]) => tierData.checked)
        .forEach(([tierName, tierData]) => {
          tickets.push({
            seat_type: tierName,
            ticket_type: "Reserved Seating",
            price: parseFloat(tierData.price) || 0,
            total_quantity: parseInt(tierData.number) || 0,
            max_per_user: parseInt(tierData.maxPerPerson) || 1,
          });
        });
    }

    return tickets;
  };

  const handleSave = async () => {
    if (!formData || isSaving) return;

    // Set saving state to prevent multiple form submissions
    setIsSaving(true);
    setError(null);

    console.log("Saving ticket details:", formData);

    // Validate the ticket data before saving
    if (formData.tierType === "freeSeating") {
      if (!formData.freeSeating.numberOfTickets) {
        alert("Please enter the number of tickets");
        setIsSaving(false);
        return;
      }
      if (formData.eventType !== "free" && !formData.freeSeating.price) {
        alert("Please enter a price");
        setIsSaving(false);
        return;
      }
      if (!formData.freeSeating.maxPerPerson) {
        alert("Please enter the maximum tickets per person");
        setIsSaving(false);
        return;
      }
    } else {
      // Check if any tier is selected
      const anyTierChecked = Object.values(formData.ticketTiers).some(
        (tier) => tier.checked
      );
      if (!anyTierChecked) {
        alert("Please select at least one ticket tier");
        setIsSaving(false);
        return;
      }
    }

    try {
      // First clear existing tickets
      if (eventData.tickets && eventData.tickets.length > 0) {
        console.log(`Removing ${eventData.tickets.length} existing tickets`);

        // Delete the existing tickets first
        for (const ticket of eventData.tickets) {
          try {
            await eventService.tickets.delete(ticket.id);
            console.log(`Deleted ticket ${ticket.id}`);
          } catch (err) {
            console.error(`Error deleting ticket ${ticket.id}:`, err);
            // Continue with next ticket even if this one failed
          }
        }
      }

      // Prepare tickets directly for the API to avoid any conversion issues
      const ticketsToCreate = prepareTicketsForAPI(
        formData,
        formData.eventType
      );
      console.log("Creating tickets with data:", ticketsToCreate);

      // Now create the new tickets directly using the bulk endpoint
      const ticketResponse = await eventService.tickets.createBulk(
        eventData.id,
        ticketsToCreate
      );

      console.log("Ticket creation response:", ticketResponse);

      // Create payload that combines the original event data with the updated ticket data
      const updatedData = {
        ...eventData,
        // Include ticket-specific data for the save handler to use
        ticketDetails: formData,
        // Include the new tickets
        tickets: ticketResponse.data || [],
        // Flag to indicate these are edited tickets
        isTicketEdit: true,
      };

      // Pass the edit type as 'ticket' to ensure the correct saving logic is used
      onSave(updatedData, "ticket");

      // Close the modal after successful save
      onClose();
    } catch (error) {
      console.error("Error saving tickets:", error);
      setError(`Failed to save tickets: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#272727] border border-[#FFAB40] rounded-3xl p-6 w-[90%] max-w-5xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#FFAB40] text-2xl font-semibold">
              Edit Ticket Details
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-[#FFAB40]"
            >
              ✕
            </button>
          </div>
          <hr className="border-t border-gray-600 my-4" />

          <div className="flex flex-col justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFAB40] mb-4"></div>
            <span className="text-white">Loading ticket details...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#272727] border border-[#FFAB40] rounded-3xl p-6 w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#FFAB40] text-2xl font-semibold">
            Edit Ticket Details
          </h2>
          <button onClick={onClose} className="text-white hover:text-[#FFAB40]">
            ✕
          </button>
        </div>
        <hr className="border-t border-gray-600 my-4" />

        <div className="mb-4">
          <p className="text-[13px] text-[#B8B8B8]">
            Modify ticket types and set the total available tickets, ensuring
            they match venue capacity and event needs.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
            <p className="text-red-400 text-sm mt-1">
              The form will still allow you to create or modify tickets.
            </p>
          </div>
        )}

        <hr className="border-t border-gray-600 my-4" />

        <TicketDetailsForm
          data={formData}
          onChange={setFormData}
          onSubmit={null}
          submitButtonText={null}
        />
        <hr className="border-t border-gray-600 my-4" />

        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-700 text-white px-5 py-2 rounded-full text-sm font-semibold"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-[#FFAB40] text-black px-5 py-2 rounded-full text-sm font-semibold"
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-black rounded-full mr-2"></span>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTicketDetailsPopup;
