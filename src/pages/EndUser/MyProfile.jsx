import React from "react";
import { useState } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { VscAccount } from "react-icons/vsc";
import ChangePasswordPopup from "./ChangePasswordPopup";
import Header_User from "../../components/Header_User";

//Need configuration from backend database
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

  const toggleChangePasswordPopup = () => {
    setShowChangePasswordPopup((prev) => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#202020]">
      {/* Header - removed sticky positioning */}
      <Header_User />

      {/* Back button */}
      <button
        onClick={() => navigate("/home")}
        className="absolute top-[100px] left-4 text-white font-Poppins font-bold"
      >
        <IoChevronBackOutline className="text-3xl" />
      </button>

      {/* Main content area with spacing from header */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        {/* Profile container with avatar */}
        <div className="relative flex flex-col items-center mt-10">
          {/* Avatar circle - positioned relative to this container */}
          <div className="absolute -top-16 w-60 h-60 border-4 border-[#FFAB40] bg-white rounded-full flex items-center justify-center shadow-lg z-10">
            <VscAccount size={200} className="text-[#FFAB40]" />
          </div>

          {/* Profile card with padding for avatar */}
          <div className="w-11/12 mt-32 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="pt-12 flex flex-col md:flex-row">
              {/* Left sidebar */}
              <div className="w-full md:w-[30%] px-6 py-6">
                <div className="flex flex-col gap-6">
                  <button className="font-Poppins w-full py-2 px-5 justify-center cursor-pointer transition duration-300 flex rounded-full bg-[#FFAB40] shadow-md">
                    Account Details
                  </button>
                  <button
                    className="font-Poppins w-full py-2 px-5 justify-center cursor-pointer hover:bg-[#FFAB40] transition duration-300 flex rounded-full bg-[#F1F1F1] shadow-md"
                    onClick={() => navigate("/my-reservations")}
                  >
                    My Reservations
                  </button>
                </div>
              </div>

              {/* Right content area */}
              <div className="w-full md:w-[70%] px-6 py-6">
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <Label label="Name: " value="John Doe" />
                    <Label label="Email: " value="john@ust.edu.ph" />
                    <Label label="Password: " value="1234" />
                    <Label label="Role: " value="User" />
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
      />
    </div>
  );
};

export default MyProfile;
