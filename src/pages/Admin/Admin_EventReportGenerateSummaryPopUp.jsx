import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Admin_EventReportGenerateSummary = ({ isOpen, onClose }) => {
  const [selectedColumns, setSelectedColumns] = useState({
    name: true,
    event_date: true,
    venue: true,
    category: true,
    event_type: true,
    availability: true,
    reservation_count: true,
    revenue: true,
    remaining_tickets: true
  });

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Columns with their display names
  const columnOptions = {
    name: "Event Name",
    event_date: "Date",
    venue: "Venue",
    category: "Event Category",
    event_type: "Type",
    availability: "Availability",
    reservation_count: "Reservation Count",
    revenue: "Revenue",
    remaining_tickets: "Remaining Tickets"
  };

  // Fetch events data when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/events-summary`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setEvents(response.data.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to fetch events data");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

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
      doc.text("Events Summary Report", 14, 15);

      // Add generation info
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

      // Prepare table data
      const tableColumn = Object.keys(selectedColumns)
        .filter((col) => selectedColumns[col])
        .map((col) => columnOptions[col]);

      const tableRows = events.map((event) => {
        return Object.keys(selectedColumns)
          .filter((col) => selectedColumns[col])
          .map((col) => {
            let value = event[col];
            if (col === "revenue") {
              value = `₱${parseFloat(value || 0).toLocaleString()}`;
            }
            return value || "";
          });
      });

      // Add the table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
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
      doc.save("events-summary-report.pdf");
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
          <p>Loading events data...</p>
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
          <h2 className="text-lg text-[25px] font-bold text-gray-800">GENERATE EVENTS SUMMARY REPORT</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

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

export default Admin_EventReportGenerateSummary;