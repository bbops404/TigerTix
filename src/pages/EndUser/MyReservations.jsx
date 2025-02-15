import React from "react";
import Header from "../../components/Header"; //update header once signed in
import { useState } from "react";
import { GoArrowLeft } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { VscAccount } from "react-icons/vsc";

//Need configuration from backend database
const Reservation = ({ event,status }) => {
    return (
      <div className="w-full grid grid-cols-[65%_17%_18%]  items-start py-2 gap-4">
        <div className="block bg-gray-100 text-gray-700 text-center p-4 font-bold mb-1 shadow-lg">
          {event}
        </div>
        <div className="bg-gray-100 text-gray-900 text-center font-bold p-4 rounded-lg ">
          {status}
        </div>
        <div>
            <button className="w-full bg-[#FFAB40] hover:bg-[#E99A3A] rounded-[20px] text-center font-bold pt-4 pb-4 px-2 shadow-md">
                View Receipt
                {/*Need configuration to view receipt*/}
            </button>
        </div>
      </div>
    );
  };

const MyReservations = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col min-h-screen bg-[#202020]">
          {/*Header*/}
          <Header />
          <button
              className="absolute top-20 left-4 w-[100px] py-1 px-5 transition duration-300 flex items-center justify-center"
              onClick={() => navigate("/home")}
            >
            <GoArrowLeft size={100} className="text-white" style={{ strokeWidth: 2 }}/>
          </button>
    
          {/*Main Container*/}
          <div className="flex flex-col justify-center items-center flex-grow">   
            {/*Center Container*/}
            <div className="w-[90vw] max-w-[1200px] h-[600px] flex flex-col items-center  rounded-lg relative">
              {/*Circle Icon*/}
              <div className="w-60 h-60 border-4 border-[#FFAB40] bg-white rounded-full flex items-center justify-center absolute -top-12 z-10 shadow-lg">
              <VscAccount size={250} className="text-[#FFAB40]"  />
              </div>
    
              {/* Show Reservations */}
              <div className="w-full h-[75%] pt-12 md:pt-13 lg:pt-16 pl-3 pr-1 md:pl-9 md:pr-1 pb-9 bg-white flex flex-row rounded-lg shadow-lg text-center mt-auto">
                <div className="w-[30%] max-w-[300px] h-full flex flex-col justify-start items-center py-6 px-7 gap-6 text-lg font-semibold text-gray-900">
                  <button className="w-full py-1 px-5 justify-center cursor-pointer transition duration-300 flex rounded-full bg-[#F1F1F1] hover:bg-[#FFAB40] shadow-md"
                    onClick={() => navigate("/my-profile")}>
                    Account Details
                    
                    {/*navigate to my Account details page*/}
                  </button>
                  <button
                    className="w-full py-1 px-5 justify-center cursor-pointer bg-[#FFAB40] transition duration-300 flex rounded-full shadow-md" 
                  >
                    {" "}
                    My Reservations
                  </button>
                </div>
                <div className="flex flex-col w-[70%] max-w-[1000px] max-h-[500px] overflow-y-auto">
                  <div className=" px-11 h-full">
                    <Reservation event="UAAP SEASON 88 MEN’S BASKETBALL" status="PENDING" />
                    <Reservation event="UAAP SEASON 87 MEN’S BASKETBALL" status="CLAIMED" />
                    <Reservation event="UAAP SEASON 86 MEN’S BASKETBALL" status="CLAIMED" />
                    <Reservation event="UAAP SEASON 85 MEN’S BASKETBALL" status="EXPIRED" />
                    <Reservation event="UAAP SEASON 84 MEN’S BASKETBALL" status="CLAIMED" />
                    <Reservation event="UAAP SEASON 83 MEN’S BASKETBALL" status="CLAIMED" />
                    <Reservation event="UAAP SEASON 82 MEN’S BASKETBALL" status="CLAIMED" />
                    <Reservation event="UAAP SEASON 81 MEN’S BASKETBALL" status="CLAIMED" />
                  </div>
                </div>
              </div>
            </div>
        </div>
        </div>
    );
};

export default MyReservations;