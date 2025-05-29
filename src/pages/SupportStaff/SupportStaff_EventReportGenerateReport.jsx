import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const SupportStaff_EventReportGenerateReport = ({ isOpen, onClose, selectedEventId }) => {
  const [selectedColumns, setSelectedColumns] = useState({
    reservation_id: true,
    name: true,
    ticket_tier: true,
    claiming_date: true,
    claiming_time: true,
    amount: true,
    claiming_status: true,
  });

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);

  // Columns with their display names
  const columnOptions = {
    reservation_id: "Reservation ID",
    name: "Name",
    ticket_tier: "Ticket Tier",
    claiming_date: "Claiming Date",
    claiming_time: "Claiming Time",
    amount: "Amount",
    claiming_status: "Claiming Status",
  };

  // Fetch event details and reservations when component mounts
  useEffect(() => {
    const fetchEventAndReservations = async () => {
      if (!selectedEventId) return;

      setLoading(true);
      try {
        // Fetch event details
        const eventResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/events/${selectedEventId}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Fetch reservations for this event
        const reservationsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/reservations/${selectedEventId}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        setEventDetails(eventResponse.data.data);
        setReservations(reservationsResponse.data.data);
      } catch (err) {
        console.error("Error fetching event details or reservations:", err);
        setError("Failed to fetch event details or reservations");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && selectedEventId) {
      fetchEventAndReservations();
    }
  }, [isOpen, selectedEventId]);

  // Toggle column selection
  const toggleColumnSelection = (column) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // Generate PDF
  const generatePDF = async () => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(16);
      doc.text("Event Reservations Report", 14, 15);

      // Add event details
      if (eventDetails) {
        doc.setFontSize(12);
        doc.text(`Event: ${eventDetails.name}`, 14, 25);
        doc.text(`Date: ${eventDetails.event_date || "TBD"}`, 14, 32);
        doc.text(`Venue: ${eventDetails.venue || "N/A"}`, 14, 39);
      }

      // Prepare table data
      const tableColumn = Object.keys(selectedColumns)
        .filter((col) => selectedColumns[col])
        .map((col) => columnOptions[col]);

      const tableRows = reservations.map((reservation) => {
        return Object.keys(selectedColumns)
          .filter((col) => selectedColumns[col])
          .map((col) => {
            let value = reservation[col];
            if (col === "amount") {
              value = `₱${parseFloat(value || 0).toLocaleString()}`;
            }
            return value || "";
          });
      });

      // Add the table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [255, 171, 64],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
      });

      // Save the PDF
      doc.save(`event-report-${eventDetails?.name || "report"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF report");
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-80 text-center">
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-80 text-center text-red-500">
          <p>{error}</p>
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 rounded-full bg-[#434141] text-white font-bold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-80 text-center">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg text-[25px] font-bold text-gray-800">GENERATE EVENT RESERVATIONS SUMMARY</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        {/* Event Details */}
        {eventDetails && (
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-lg mb-2">{eventDetails.name}</h3>
            <p className="text-sm text-gray-600">Date: {eventDetails.event_date || "TBD"}</p>
            <p className="text-sm text-gray-600">Venue: {eventDetails.venue || "N/A"}</p>
          </div>
        )}

        <div className="text-left space-y-2">
          {Object.entries(columnOptions).map(([key, label]) => (
            <label key={key} className="flex items-center space-x-2 text-orange-500">
              <input
                type="checkbox"
                checked={selectedColumns[key]}
                onChange={() => toggleColumnSelection(key)}
                className="accent-orange-500"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <button
          className="mt-4 w-full py-2 font-bold rounded-full text-white bg-gradient-to-r from-[#FFAB40] to-[#CD6905] transition-transform transform hover:scale-105"
          onClick={generatePDF}
        >
          GENERATE
        </button>
        <button 
          className="mt-2 w-full py-2 rounded-full bg-[#434141] text-white font-bold shadow-md hover:scale-105"
          onClick={onClose}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default SupportStaff_EventReportGenerateReport;