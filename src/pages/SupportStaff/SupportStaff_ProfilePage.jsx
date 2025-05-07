import React, { useState, useEffect } from "react";
import { VscAccount } from "react-icons/vsc";
import SupportStaff_ChangePasswordPopUp from "./SupportStaff_ChangePasswordPopUp";
import SupportStaff_EditDetailsPopUp from "./SupportStaff_EditDetailsPopUp";
import Header_SupportStaff from "../../components/SupportStaff/Header_SupportStaff";
import SideBar_SupportStaff from "../../components/SupportStaff/SideBar_SupportStaff";
import axios from "axios";

const Label = ({ label, value }) => {
  return (
    <div className="flex items-center w-full">
      <span className="w-1/4 text-left font-semibold text-gray-700">
        {label}
      </span>
      <div className="w-3/4 bg-gray-200 text-gray-900 text-left p-2 rounded-md shadow-md">
        {value}
      </div>
    </div>
  );
};

const SupportStaff_ProfilePage = () => {
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
  const [showEditDetailsPopup, setShowEditDetailsPopup] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

   // Fetch user details on component mount
   useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const API_BASE_URL = "http://localhost:5002/api";

        const response = await axios.get(`${API_BASE_URL}/users/me`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setUserDetails(response.data.data);
          setLoading(false);
        } else {
          throw new Error(
            response.data.message || "Failed to fetch user details"
          );
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const toggleChangePasswordPopup = () => {
    setShowChangePasswordPopup((prev) => !prev);
  };

  const toggleEditDetailsPopup = () => {
    setShowEditDetailsPopup((prev) => !prev);
  };

    // Render loading state
    if (loading) {
      return (
        <div className="flex flex-col min-h-screen bg-[#202020]">
          <Header_SupportStaff />
          <div className="flex justify-center items-center flex-grow">
            <p className="text-white">Loading profile...</p>
          </div>
        </div>
      );
    }
  
    // Render error state
    if (error) {
      console.error("Error fetching user details:", error); // Log the error for debugging
      return (
        <div className="flex flex-col min-h-screen bg-[#202020]">
          <Header_SupportStaff />
          <div className="flex justify-center items-center flex-grow">
            <p className="text-red-500">Error: {error}</p>
          </div>
        </div>
      );
    }

  return (
    <div className="flex flex-col bg-[#1E1E1E] min-h-screen text-white font-Poppins">
      {/* Header */}
      <Header_SupportStaff />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <SideBar_SupportStaff />

        {/* Profile Section */}
        <div className="flex flex-col items-center justify-center w-full min-h-screen bg-[#1E1E1E] p-6">
          {/* Profile Container */}
          <div className="relative w-[60%] max-w-[800px] bg-gradient-to-b from-gray-100 to-gray-300 p-8 rounded-lg shadow-lg">
            {/* Profile Icon */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-32 h-32 border-4 border-[#F09C32] bg-white rounded-full flex items-center justify-center shadow-lg">
              <VscAccount size={80} className="text-[#F09C32]" />
            </div>

            {/* Profile Details */}
            <div className="mt-16">
              <div className="border-b border-gray-400 pb-2 mb-4">
                <button className="px-4 py-1 bg-[#F09C32] text-white rounded-full font-semibold shadow-md">
                  Account Details
                </button>
              </div>

              <div className="space-y-4">
              <Label
                      label="Name:"
                      value={`${userDetails?.first_name} ${userDetails?.last_name}`}
                    />
                    <Label label="Email:" value={userDetails.email} />
                    <Label label="Username:" value={userDetails.username} />
                    <Label
                      label="Role:"
                      value={
                        userDetails.role.charAt(0).toUpperCase() +
                        userDetails.role.slice(1)
                      }
                    />
              </div>

              {/* Buttons */}
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  className="px-6 py-2 bg-[#333333] text-[#FFD7A5] rounded-full shadow-md hover:bg-[#FFAB40] hover:text-black transition duration-300"
                  onClick={toggleEditDetailsPopup}
                >
                  Edit Details
                </button>
                <button
                  className="px-6 py-2 bg-[#333333] text-[#FFD7A5] rounded-full shadow-md hover:bg-[#FFAB40] hover:text-black transition duration-300"
                  onClick={toggleChangePasswordPopup}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Details Popup */}
      <SupportStaff_EditDetailsPopUp
        showPopup={showEditDetailsPopup}
        togglePopup={toggleEditDetailsPopup}
      />

      {/* Change Password Popup */}
      <SupportStaff_ChangePasswordPopUp
        showPopup={showChangePasswordPopup}
        togglePopup={toggleChangePasswordPopup}
      />
    </div>
  );
};


export default SupportStaff_ProfilePage;
