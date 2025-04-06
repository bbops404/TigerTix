import React, { useState, useEffect } from "react";
import TicketDetailsForm from "../Forms/TicketDetailsForm";

const EditTicketDetailsPopup = ({ isOpen, onClose, eventData, onSave }) => {
  const [formData, setFormData] = useState(null);

  // Transform API ticket data format to match the form's expected structure
  useEffect(() => {
    if (eventData && isOpen) {
      // Default structure
      const initialFormData = {
        eventType: eventData.eventType || "ticketed",
        tierType: "freeSeating", // Default
        ticketTiers: {},
        freeSeating: {
          numberOfTickets: "",
          price: "",
          maxPerPerson: "",
        },
      };

      // Check if we have ticket data
      if (eventData.tickets && eventData.tickets.length > 0) {
        // Check if there is only one ticket with "Free Seating" type
        const freeSeatingTicket = eventData.tickets.find(
          (ticket) =>
            ticket.seat_type === "Free Seating" ||
            ticket.seat_type === "General Admission"
        );

        if (freeSeatingTicket || eventData.tickets.length === 1) {
          // This is likely a free seating setup
          const ticket = freeSeatingTicket || eventData.tickets[0];
          initialFormData.tierType = "freeSeating";
          initialFormData.freeSeating = {
            numberOfTickets: ticket.total_quantity.toString(),
            price: ticket.price.toString(),
            maxPerPerson: ticket.max_per_user.toString(),
          };
        } else {
          // This is a tiered seating arrangement
          initialFormData.tierType = "ticketed";
          const ticketTiersObj = {};

          eventData.tickets.forEach((ticket) => {
            ticketTiersObj[ticket.seat_type] = {
              number: ticket.total_quantity.toString(),
              price: ticket.price.toString(),
              maxPerPerson: ticket.max_per_user.toString(),
              checked: true,
              isEditing: false,
            };
          });

          initialFormData.ticketTiers = ticketTiersObj;
        }
      }

      setFormData(initialFormData);
    }
  }, [eventData, isOpen]);

  const handleSave = () => {
    if (formData) {
      // Create payload that combines the original event data with the updated ticket data
      const updatedData = {
        ...eventData,
        // Include ticket-specific data for the save handler to use
        ticketDetails: formData,
        // Flag to indicate these are edited tickets
        isTicketEdit: true,
      };

      onSave(updatedData);
    }
    onClose();
  };

  if (!isOpen || !formData) return null;

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
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-[#FFAB40] text-black px-5 py-2 rounded-full text-sm font-semibold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTicketDetailsPopup;
