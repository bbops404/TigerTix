import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import Header from "../../components/Header";
import Reservation from "./Reservation";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";


// NEED TO ADD CODE FOR QR
// NEED TO ADD CODE FOR EVENT RESERVATION AND DATE
// NEED TO ADD CODE FOR RESERVATION ID


const Label = ({ label, value }) => (
    <div className="w-full grid grid-cols-[20%_70%] items-start text-sm py-1">
      <label className="font-Poppins block text-gray-700 text-left font-bold mb-1">
        {label}
      </label>
      <div className="font-Poppins text-gray-900 text-left rounded-lg font-semibold">
        {value}
      </div>
    </div>
  );

const ReservationReceipt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ticketType, ticketCount, ticketPrices, emails, timeSlot } = location.state || {};

  useEffect(() => {
    window.scrollTo(0, 0); 
    }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#202020]">

    {/*HEADER*/}
    <Header showSearch={false} showAuthButtons={false}/>

        {/*Main Container*/}
        <div className=" flex flex-col justify-center items-center flex-grow">
            {/*Gray Container*/}
            <div className= "font-Poppins w-[80vw] h-[70vh] bg-[#D9D9D9] flex flex-col justify-start text-center text-4xl font-bold p-5 gap-6">
                Reservation Receipt
                {/*White Container*/}
                <div className="w-[90%] h-[70%] bg-white self-center grid grid-cols-[40%_60%] p-4">

                    {/*QR Container*/}
                    <div className="font-Poppins text-center justify-start font-bold text-lg">
                        YOUR QR CODE:  
                        <div className="font-Poppins w-full h-[70%] justify-center">
                            {/*INSERT QR CODE HERE*/}
                        </div>
                        RESERVATION ID:
                    </div>

                    {/*Details Container*/}
                    <div>
                        <Label label="Name:" value={"FirstName LastName"} />
                        <Label label="Email:" value={"email@ust.edu.ph"} />
                        <Label label="Date Reserved:" value={"Date Reserved"} /> {/*EDIT THIS WHEN ONCE DATA IS AVAILABLE*/}
                        <Label label="Event:" value={"Basketball"} /> {/*EDIT THIS WHEN ONCE DATA IS AVAILABLE*/}
                        <Label label="Ticket Tier:" value={ticketType} />
                        <Label label="Reserved Tickets:" value={emails?.map((email, index) => (
                            <div key={index}>{email}</div>
                            ))} />
                        <Label label="Batch:" value={timeSlot} />
                        <Label label="Claiming Venue:" value={"UST IPEA"} />
                        <Label label="Total Amount:" value={`₱${ticketType ? (ticketPrices?.[ticketType] ?? 0) * ticketCount : 0}`} />
                        <Label label="Date of Event:" value={"Date of Event"} />  {/*EDIT THIS ONCE DATA IS AVAILABLE*/}
                    </div>
                </div>
                {/*Download and Back Buttons*/}
                <div className=" flex flex-col items-center gap-2 text-lg">
                    <button className="font-Poppins w-[30%] py-2 bg-[#000000] text-[#FFAB40] hover:bg-[#FFAB40] hover:text-[#000000] transition duration-300 font-bold rounded-md shadow-xl">
                        DOWNLOAD
                    </button>
                    <button className="font-Poppins w-[30%] py-2 bg-[#FFFFFF] text-[#000000] hover:bg-[#FFAB40] hover:text-[#000000] transition duration-300 font-bold rounded-md shadow-xl"
                    onClick={() => navigate("/reservation")}>
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ReservationReceipt;