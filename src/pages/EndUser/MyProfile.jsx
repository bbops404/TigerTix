import React, { useState, useEffect } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import { VscAccount } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Header_User from "../../components/Header_User";
import ChangePasswordPopup from "./ChangePasswordPopup"; // Assuming you have this component

// Label component for consistent styling with improved responsiveness
const Label = ({ label, value }) => {
  return (
    <div className="font-Poppins w-full flex flex-col sm:grid sm:grid-cols-[30%_70%] lg:grid-cols-[25%_75%] items-start py-3 gap-2 font-semibold">
      <label className="block text-gray-700 text-left font-semibold mb-1 text-sm sm:text-base">
        {label}
      </label>
      <div className="font-Poppins bg-gray-100 text-gray-900 text-left p-3 rounded-lg shadow-md w-full text-sm sm:text-base break-words">
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
        const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

        const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
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
          <p className="text-white text-center px-4">Loading profile...</p>
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
          <p className="text-red-500 text-center px-4">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#202020]">
      {/* Header */}
      <Header_User />

      {/* Back button - Improved positioning for mobile */}
      <button
        onClick={() => navigate("/home")}
        className="absolute top-[80px] sm:top-[100px] left-4 text-white font-Poppins font-bold z-20"
      >
        <IoChevronBackOutline className="text-2xl sm:text-3xl" />
      </button>

      {/* Main content area - Better padding and spacing */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 pt-16 sm:pt-20 pb-8 sm:pb-16">
        {/* Profile container with avatar - Improved responsive layout */}
        <div className="relative flex flex-col items-center mt-6 sm:mt-10">
          {/* Avatar circle - Better responsive sizing */}
          <div className="absolute -top-12 sm:-top-16 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 border-4 border-[#FFAB40] bg-white rounded-full flex items-center justify-center shadow-lg z-10">
            <VscAccount 
              className="text-[#FFAB40] w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24" 
            />
          </div>

          {/* Profile card - Improved responsive design */}
          <div className="w-full max-w-6xl mt-16 sm:mt-20 md:mt-24 lg:mt-32 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="pt-8 sm:pt-12 flex flex-col lg:flex-row">
              {/* Left sidebar - Stack on mobile, side-by-side on large screens */}
              <div className="w-full lg:w-[30%] px-4 sm:px-6 py-4 sm:py-6 border-b lg:border-b-0 lg:border-r border-gray-200">
                <div className="flex flex-row lg:flex-col gap-2 sm:gap-4 lg:gap-6">
                  <button className="font-Poppins flex-1 lg:w-full py-2 sm:py-3 px-3 sm:px-4 lg:px-5 justify-center cursor-pointer transition duration-300 flex rounded-full bg-[#FFAB40] shadow-md text-sm sm:text-base font-medium">
                    Account Details
                  </button>
                  <button
                    className="font-Poppins flex-1 lg:w-full py-2 sm:py-3 px-3 sm:px-4 lg:px-5 justify-center cursor-pointer hover:bg-[#FFAB40] transition duration-300 flex rounded-full bg-[#F1F1F1] shadow-md text-sm sm:text-base font-medium"
                    onClick={navigateToReservations}
                  >
                    My Reservations
                  </button>
                </div>
              </div>

              {/* Right content area - Better spacing and layout */}
              <div className="w-full lg:w-[70%] px-4 sm:px-6 py-4 sm:py-6">
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-3 sm:space-y-4">
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
                  {/* Change password button - Better mobile layout */}
                  <div className="flex justify-center sm:justify-end mt-6 sm:mt-8">
                    <button
                      className="font-Poppins w-full sm:w-auto py-2 sm:py-3 px-4 sm:px-5 cursor-pointer hover:bg-[#FFD7A5] hover:text-[#333333] transition duration-300 flex justify-center rounded-full bg-[#333333] text-[#FFD7A5] shadow-md text-sm sm:text-base font-medium"
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