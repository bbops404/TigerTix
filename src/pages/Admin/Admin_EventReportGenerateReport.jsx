import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

import axios from "axios";
import adminReservationService from ".././Services/adminReservationService";

const Admin_EventReportGenerateReport = ({
  isOpen,
  onClose,
  selectedEventId,
}) => {
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
          `http://localhost:5002/api/events/${selectedEventId}`,
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
          `http://localhost:5002/api/reservations/${selectedEventId}`,
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
  const generatePDF = () => {
    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });
    const stream = doc.pipe(blobStream());

    // PDF Header
    doc.fontSize(16).text("Event Reservations Report", { align: "center" });
    doc.moveDown();

    // Event Details
    if (eventDetails) {
      doc
        .fontSize(12)
        .text(`Event: ${eventDetails.name}`, { align: "left" })
        .text(`Date: ${eventDetails.event_date || "TBD"}`, { align: "left" })
        .text(`Venue: ${eventDetails.venue || "N/A"}`, { align: "left" })
        .moveDown();
    }

    // Table Header
    const tableHeaders = Object.keys(selectedColumns)
      .filter((col) => selectedColumns[col])
      .map((col) => columnOptions[col]);

    // Draw table headers
    doc.fontSize(10);
    tableHeaders.forEach((header, i) => {
      doc.text(header, 50 + i * 100, doc.y, { width: 100, align: "left" });
    });
    doc.moveDown();

    // Draw table rows
    reservations.forEach((reservation) => {
      const rowData = tableHeaders.map((header) => {
        switch (header) {
          case "Reservation ID":
            return reservation.reservation_id;
          case "Name":
            return `${reservation.first_name} ${reservation.last_name}`;
          case "Ticket Tier":
            return reservation.ticket_type;
          case "Claiming Date":
            return reservation.claiming_date;
          case "Claiming Time":
            return `${reservation.start_time} - ${reservation.end_time}`;
          case "Amount":
            return `₱${parseFloat(reservation.amount || 0).toLocaleString()}`;
          case "Claiming Status":
            return reservation.reservation_status;
          default:
            return "N/A";
        }
      });

      rowData.forEach((cell, i) => {
        doc.text(cell, 50 + i * 100, doc.y, { width: 100, align: "left" });
      });
      doc.moveDown();
    });

    // Finalize PDF
    doc.end();

    // Handle the generated PDF
    stream.on("finish", function () {
      const blob = stream.toBlob("application/pdf");
      const url = URL.createObjectURL(blob);

      // Create a link element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `Event_Reservations_${
        eventDetails?.name || "Report"
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Generate Event Reservations Summary
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* Event Details */}
        {eventDetails && (
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-lg mb-2">{eventDetails.name}</h3>
            <p className="text-sm text-gray-600">
              Date: {eventDetails.event_date || "TBD"}
            </p>
            <p className="text-sm text-gray-600">
              Venue: {eventDetails.venue || "N/A"}
            </p>
          </div>
        )}

        {/* Column Selection */}
        <div className="space-y-2 mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">
            Select Columns to Include
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(columnOptions).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center space-x-2 text-gray-700"
              >
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
        </div>

        {/* Reservation Count */}
        <div className="text-center mb-4 text-gray-600">
          Total Reservations: {reservations.length}
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePDF}
          disabled={reservations.length === 0}
          className="mt-4 w-full py-2 font-bold rounded-full text-white bg-gradient-to-r from-[#FFAB40] to-[#CD6905] transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate PDF Report
        </button>
      </div>
    </div>
  );
};

export default Admin_EventReportGenerateReport;
