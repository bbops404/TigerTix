import React from "react";
import { useState } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { VscAccount } from "react-icons/vsc";
import Header_User from "../../components/Header_User";

const Reservation = ({ event, status }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 font-Poppins m-2 justify-between">
      <div className="bg-gray-100 text-gray-700 text-left p-2 rounded-lg shadow-md w-1/2">
        {event}
      </div>
      <div className="bg-gray-100 text-gray-900 text-center p-1.5 rounded-lg shadow-md w-1/6">
        {status}
      </div>
      <button
        className="bg-[#FFAB40] hover:bg-[#E99A3A] rounded-lg text-center font-semibold p-1.5 shadow-md text-sm w-1/6"
        onClick={() => navigate("/reservation-receipt")}
      >
        View Receipt
      </button>
    </div>
  );
};

const MyReservations = () => {
  const navigate = useNavigate();

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

      {/* Main content area with spacing from header */}
      <div className="container mx-auto px-2 pt-20 pb-16">
        {/* Profile container with avatar */}
        <div className="relative flex flex-col items-center mt-10">
          {/* Avatar circle - positioned relative to this container */}
          <div className="absolute -top-16 w-60 h-60 border-4 border-[#FFAB40] bg-white rounded-full flex items-center justify-center shadow-lg z-10">
            <VscAccount size={200} className="text-[#FFAB40]" />
          </div>

          {/* Profile card with padding for avatar */}
          <div className="w-2/3 mt-32 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="pt-12 flex flex-col md:flex-row">
              {/* Left sidebar */}
              <div className="w-full md:w-[30%] px-3 py-4">
                <div className="flex flex-col gap-4">
                  <button
                    className="font-Poppins w-full py-2 px-3 justify-center cursor-pointer hover:bg-[#FFAB40] transition duration-300 flex rounded-full bg-[#F1F1F1] shadow-md"
                    onClick={() => navigate("/my-profile")}
                  >
                    Account Details
                  </button>
                  <button className="font-Poppins w-full py-2 px-3 justify-center cursor-pointer transition duration-300 flex rounded-full bg-[#FFAB40] shadow-md">
                    My Reservations
                  </button>
                </div>
              </div>

              {/* Right content area */}
              <div className="w-full md:w-[70%] px-3 py-4">
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    <Reservation
                      event="UAAP SEASON 88 MEN'S BASKETBALL"
                      status="PENDING"
                    />
                    <Reservation
                      event="UAAP SEASON 87 MEN'S BASKETBALL"
                      status="CLAIMED"
                    />
                    <Reservation
                      event="UAAP SEASON 86 MEN'S BASKETBALL"
                      status="CLAIMED"
                    />
                    <Reservation
                      event="UAAP SEASON 85 MEN'S BASKETBALL"
                      status="EXPIRED"
                    />
                    <Reservation
                      event="UAAP SEASON 84 MEN'S BASKETBALL"
                      status="CLAIMED"
                    />
                    <Reservation
                      event="UAAP SEASON 83 MEN'S BASKETBALL"
                      status="CLAIMED"
                    />
                    <Reservation
                      event="UAAP SEASON 82 MEN'S BASKETBALL"
                      status="CLAIMED"
                    />
                    <Reservation
                      event="UAAP SEASON 81 MEN'S BASKETBALL"
                      status="CLAIMED"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyReservations;
