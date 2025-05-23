import React, { useState, useEffect } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import { VscAccount } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Header_User from "../../components/Header_User";
import ChangePasswordPopup from "./ChangePasswordPopup"; // Assuming you have this component

// Label component for consistent styling
const Label = ({ label, value }) => {
  return (
    <div className="font-Poppins w-full grid grid-cols-[20%_80%] items-start py-2 gap-2 font-semibold">
      <label className="block text-gray-700 text-left font-semibold mb-1">
        {label}
      </label>
      <div className="font-Poppins bg-gray-100 text-gray-900 text-left p-2 rounded-lg shadow-md">
        {value}
      </div>
    </div>
  );
};

const MyProfile = () => {
  const navigate = useNavigate();
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Toggle change password popup
  const toggleChangePasswordPopup = () => {
    setShowChangePasswordPopup((prev) => !prev);
  };

  // Handle navigation to reservations
  const navigateToReservations = () => {
    navigate("/my-reservations");
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#202020]">
        <Header_User />
        <div className="flex justify-center items-center flex-grow">
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#202020]">
        <Header_User />
        <div className="flex justify-center items-center flex-grow">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#202020]">
      {/* Header */}
      <Header_User />

      {/* Back button */}
      <button
        onClick={() => navigate("/home")}
        className="absolute top-[100px] left-4 text-white font-Poppins font-bold"
      >
        <IoChevronBackOutline className="text-3xl" />
      </button>

      {/* Main content area */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        {/* Profile container with avatar */}
        <div className="relative flex flex-col items-center mt-10">
            {/* Avatar circle */}
            <div className="absolute -top-16 w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 border-4 border-[#FFAB40] bg-white rounded-full flex items-center justify-center shadow-lg z-10">
              <VscAccount size={120} className="text-[#FFAB40] sm:size-[150px] md:size-[200px]" />
            </div>

          {/* Profile card */}
          <div className="w-full sm:w-11/12 mt-32 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="pt-12 flex flex-col md:flex-row">
              {/* Left sidebar */}
              <div className="w-full md:w-[30%] px-4 sm:px-6 py-4 sm:py-6">
                <div className="flex flex-col gap-4 sm:gap-6">
                  <button className="font-Poppins w-full py-2 px-4 sm:px-5 justify-center cursor-pointer transition duration-300 flex rounded-full bg-[#FFAB40] shadow-md">
                    Account Details
                  </button>
                  <button
                    className="font-Poppins w-full py-2 px-4 sm:px-5 justify-center cursor-pointer hover:bg-[#FFAB40] transition duration-300 flex rounded-full bg-[#F1F1F1] shadow-md"
                    onClick={navigateToReservations}
                  >
                    My Reservations
                  </button>
                </div>
              </div>

              {/* Right content area */}
              <div className="w-full md:w-[70%] px-6 py-6">
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <Label
                      label="Name:"
                      value={`${userDetails.first_name} ${userDetails.last_name}`}
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
                    <Label
                      label="Status:"
                      value={
                        userDetails.status.charAt(0).toUpperCase() +
                        userDetails.status.slice(1)
                      }
                    />
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      className="font-Poppins py-2 px-5 cursor-pointer hover:bg-[#FFD7A5] hover:text-[#333333] transition duration-300 flex rounded-full bg-[#333333] text-[#FFD7A5] shadow-md"
                      onClick={toggleChangePasswordPopup}
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Popup */}
      <ChangePasswordPopup
        showPopup={showChangePasswordPopup}
        togglePopup={toggleChangePasswordPopup}
        userId={userDetails.user_id} // Pass user ID to the popup
      />
    </div>
  );
};

export default MyProfile;
