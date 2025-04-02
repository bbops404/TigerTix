import React from "react";

const AdminUserGenerateReport = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-80 text-center">
        <h2 className="text-lg text-[25px] font-bold text-gray-800 mb-4">GENERATE REPORT</h2>
        <div className="text-left space-y-2">
          {[
            "Username",
            "Full Name",
            "Role",
            "Email",
            "Account Status",
            "Violation Count",
          ].map((label, index) => (
            <label key={index} className="flex items-center space-x-2 text-orange-500">
              <input type="checkbox" className="accent-orange-500" />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <button className="mt-4 w-full py-2 font-bold rounded-full text-white bg-gradient-to-r from-[#FFAB40] to-[#CD6905] transition-transform transform hover:scale-105">
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

export default AdminUserGenerateReport;
