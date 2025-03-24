import React from "react";
import { useState } from "react";
import { GoArrowLeft } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { VscAccount } from "react-icons/vsc";
import ChangePasswordPopup from "./ChangePasswordPopup";
import Header_User from "../../components/Header_User";

//Need configuration from backend database
const Label = ({ label, value }) => {
  return (
    <div className="font-Poppins w-full grid grid-cols-[20%_80%]  items-start py-2 gap-2 font-semibold">
      <label className="block text-gray-700 text-left font-semibold mb-1 ">
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
      {/*Header*/}
      <Header_User/>
      <button
        className="absolute top-28 left-4 w-[100px] py-1 px-5 transition duration-300 flex items-center justify-center"
        onClick={() => navigate("/home")}
      >
        <GoArrowLeft
          size={40}
          className="text-white"
          style={{ strokeWidth: 2 }}
        />
      </button>

      {/*Main Container*/}
      <div className="flex flex-col justify-center items-center flex-grow">
        {/*Center Container*/}
        <div className="w-[90vw] max-w-[1200px] h-[600px] flex flex-col items-center  rounded-lg relative">
          {/*Circle Icon*/}
          <div className="w-60 h-60 border-4 border-[#FFAB40] bg-white rounded-full flex items-center justify-center absolute -top-12 z-10 shadow-lg">
            <VscAccount size={250} className="text-[#FFAB40]" />
          </div>

          {/* Profile Card */}
          <div className="w-full h-[75%] pt-12 md:pt-13 lg:pt-16 pl-3 pr-1 md:pl-9 md:pr-1 pb-9 bg-white flex flex-row rounded-lg shadow-lg text-center mt-auto">
            <div className="w-[30%] max-w-[300px] h-full flex flex-col justify-start items-center py-6 px-7 gap-6 text-lg font-semibold text-gray-900">
              <button className="font-Poppins w-full py-1 px-5 justify-center cursor-pointer transition duration-300 flex rounded-full bg-[#FFAB40] shadow-md">
                Account Details
              </button>
              <button
                className="font-Poppins w-full py-1 px-5 justify-center cursor-pointer hover:bg-[#FFAB40] transition duration-300 flex rounded-full bg-[#F1F1F1] shadow-md"
                onClick={() => navigate("/my-reservations")}
              >
                {" "}
                {/*navigate to my reservations page*/}
                My Reservations
              </button>
            </div>
            <div className="flex flex-col w-[70%] max-w-[1000px]">
              <div className=" px-11 h-full">
                <Label label="Name: " value="John Doe" />
                <Label label="Email: " value="john@ust.edu.ph" />
                <Label label="Password: " value="1234" />
                <Label label="Role: " value="User" />
              </div>
              <div>
                <button
                  className="font-Poppins w-50px py-1 px-5 cursor-pointer hover:bg-[#FFD7A5] hover:text-[#333333] transition duration-300 flex rounded-full ml-auto bg-[#333333] text-[#FFD7A5] shadow-md"
                  onClick={toggleChangePasswordPopup}
                >
                  {/*navigate to my changePasswordPopup page*/}
                  Change Password
                </button>
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
