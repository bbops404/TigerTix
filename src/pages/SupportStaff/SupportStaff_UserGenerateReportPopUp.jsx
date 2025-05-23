import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // Import toast from react-toastify
import { handleApiError } from "../../utils/apiErrorHandler";
import { useNavigate } from "react-router-dom";

const SupportStaff_UserGenerateReportPopUp = ({
  isOpen,
  onClose,
  visibleRows,
}) => {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckboxChange = (label) => {
    setSelectedColumns((prev) =>
      prev.includes(label)
        ? prev.filter((col) => col !== label)
        : [...prev, label]
    );
  };

  const handleGenerateReport = async () => {
    try {
      const token = sessionStorage.getItem("authToken");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/generate-user-report`, // Updated URL
        {
          columns: selectedColumns,
          rows: visibleRows, // Pass visible rows to the backend
        }, // Request body
        {
          withCredentials: true, // Ensures cookies are sent (if applicable)
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "blob", // Ensures the response is treated as a binary file
        }
      );

      // Create a blob from the response and download the PDF
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "user_report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Show success toast and close the pop-up
      toast.success("Report generated successfully!");
      onClose();
    } catch (error) {
      if (!handleApiError(error, navigate)) {
        console.error("Error generating report:", error);
        toast.error("Failed to generate report. Please try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-80 text-center">
        <h2 className="text-lg text-[25px] font-bold text-gray-800 mb-4">
          GENERATE REPORT
        </h2>
        <div className="text-left space-y-2">
          {[
            "username",
            "full_name",
            "role",
            "email",
            "status",
            "violation_count",
          ].map((label, index) => (
            <label
              key={index}
              className="flex items-center space-x-2 text-orange-500"
            >
              <input
                type="checkbox"
                className="accent-orange-500"
                onChange={() => handleCheckboxChange(label)}
              />
              <span>{label.replace(/_/g, " ")}</span>
            </label>
          ))}
        </div>
        <button
          className="mt-4 w-full py-2 font-bold rounded-full text-white bg-gradient-to-r from-[#FFAB40] to-[#CD6905] transition-transform transform hover:scale-105"
          onClick={handleGenerateReport}
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

export default SupportStaff_UserGenerateReportPopUp;
