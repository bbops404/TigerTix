import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
        // Fetch event report data
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/admin/generate-event-report`,
          {
            eventId: selectedEventId,
            columns: Object.keys(selectedColumns).filter(col => selectedColumns[col])
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && response.data.success) {
          setEventDetails(response.data.data.event);
          setReservations(response.data.data.reportData);
        } else {
          throw new Error(response.data.message || "Failed to fetch event report data");
        }
      } catch (err) {
        console.error("Error fetching event report data:", err);
        setError("Failed to fetch event report data");
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && selectedEventId) {
      fetchEventAndReservations();
    }
  }, [isOpen, selectedEventId, selectedColumns]);

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

      // Ensure reservations is an array
      const reservationsArray = Array.isArray(reservations) ? reservations : [];
      
      const tableRows = reservationsArray.map((reservation) => {
        return Object.keys(selectedColumns)
          .filter((col) => selectedColumns[col])
          .map((col) => reservation[col] || "");
      });

      // Add the table
      autoTable(doc, {
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Generate Event Report
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
            <h3 className="font-semibold text-lg mb-2 text-gray-800">{eventDetails.name}</h3>
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
          <h3 className="font-semibold text-gray-800 mb-2">
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
                  className="accent-[#FFAB40]"
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
          className="mt-4 w-full py-2 font-bold rounded-full text-[#1E1E1E] bg-[#FFAB40] hover:bg-[#E09933] transition-colors"
          onClick={generatePDF}
        >
          Generate Report
        </button>
        <button
          className="mt-2 w-full py-2 rounded-full bg-gray-200 text-gray-800 font-bold hover:bg-gray-300 transition-colors"
          onClick={onClose}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default Admin_EventReportGenerateReport;
