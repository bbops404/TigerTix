import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArchive } from "react-icons/fa";
import Header from "../../components/Header";
import Sidebar_Admin from "../../components/SideBar_Admin";
import Footer from "../../components/Footer"; 

const Admin_Archive = () => {
    const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white">
      {/* Header */}
      <Header showSearch={false} showAuthButtons={false} />

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar_Admin />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Back Button */}
          <button className="bg-[#E9E9E9] text-black px-10 py-1 rounded-full mb-6 hover:bg-[#FFAB40] hover:text-black transition duration-300"
          onClick={() => navigate("/event-management")}>
            Back
          </button>

          {/* Archive Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <FaArchive size={20} />
              <h2 className="text-2xl font-semibold">ARCHIVES</h2>
            </div>
            {/* Divider Line */}
            <hr className="border-t border-gray-500 mt-2" />
          </div>

          {/* Archived Event Card */}
          <div className="bg-[#292929] p-4 rounded-lg w-64">
            <img
              src="src/assets/event_placeholder.jpg"
              alt="Event"
              className="rounded-lg mb-2"
            />
            <h3 className="text-lg font-bold text-center">
              UAAP SEASON 87 Women's Basketball
            </h3>
            <div className="flex gap-2 mt-3">
              <button className="text-[#F09C32] bg-black px-4 py-1 rounded-full hover:bg-[#FFAB40] hover:text-black transition duration-300">
                View Details
              </button>
              <button className="text-[#F09C32] bg-black px-4 py-1 rounded-full hover:bg-[#FFAB40] hover:text-black transition duration-300">
                Restore
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin_Archive;
