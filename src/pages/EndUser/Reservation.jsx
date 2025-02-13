import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For back navigatio
import Header from "../../components/Header";
import { PiTagBold } from "react-icons/pi";

const Reservation = () => {
    const [ticketType, setTicketType] = useState("");
    const [ticketCount, setTicketCount] = useState(1);
    const [emails, setEmails] = useState([""]);
    const [timeSlot, setTimeSlot] = useState("");
    const [showSummary, setShowSummary] = useState(false);

    const ticketPrices = { "Gen Ad": 100, "Upper Box": 200, "Lower Box": 300, "Patron": 500 };

    const handleAddReservation = () => {
        console.log("Reservation Added", { ticketType, ticketCount, emails, timeSlot });
        setShowSummary(true);
    };

    const navigate = useNavigate();
    
    return (
        <div className="bg-[#121212] text-white min-h-screen">
            <Header showSearch={false} showAuthButtons={true} />
            
            {/* Back Button (Upper Left) */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-[100px] left-4 text-white font-Poppins font-bold"
            >
                <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
                >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            
            <div className="w-full flex px-20 py-8 font-Poppins">
                
                {/* Left Column 1 - IMAGE PLACEHOLDER*/}
                <div className="w-1/4 p-4">
                    <div className="bg-gray-300 w-full h-[600px] rounded-lg">
                    </div>
                </div>

                {/* Left Column 2 - EVENT DETAILS*/}
                <div className="w-1/4">
                    <h2 className="text-l font-bold mt-4">ABOUT</h2>
                    <p className="text-justify text-sm text-gray-300 mb-4">
                    Get ready to ignite the pride as we mark the beginning of another electrifying
                    season of the University Athletic Association of the Philippines! UAAP Season 87
                    Kickoff is here to celebrate the spirit of sportsmanship, excellence, and camaraderie
                    among the finest student-athletes from across the league.
                    </p>

                    <h1 className="text-3xl font-bold">
                        Tickets
                    </h1>

                    <div className="ticket">
                        {Object.entries(ticketPrices).map(([type, price]) => (
                            <div key={type} className="flex flex-col mt-2">
                                <div className="flex items-center">
                                    <PiTagBold className="text-white text-4xl mr-2" />
                                    <span className="text-white text-2xl font-bold">₱ {price}</span>
                                </div>
                                <span className="text-white text-xs mt-1 ml-10">
                                    1 ticket, {type}
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-4">
                        <p className="text-sm mb-2"><strong>Venue:</strong> Mall of Asia Arena</p>
                        <p className="text-sm mb-2"><strong>Time:</strong> 6:00 PM</p>
                        <p className="text-sm mb-2"><strong>Event Category:</strong> UAAP Game</p>
                        <p className="text-sm mb-2"><strong>Ticket Claiming Venue:</strong> UST IPEA</p>
                    </div>   
                </div>

                {/* Right Column */}
                <div className="w-1/2 p-4 ml-6">
                    <h1 className="text-2xl font-bold text-center">
                        RESERVE FOR THE BIG GAME!
                    </h1>

                    {/* Ticket Selection */}
                    <div className="mt-4">
                        <h2 className="font-semibold">
                            Choose a Ticket Tier
                        </h2>
                        <div className="flex gap-2 mt-2">
                            {Object.keys(ticketPrices).map((type) => (
                                <button
                                    key={type}
                                    className={`px-6 py-1 rounded-full font-Poppins bg-black text-[#F09C32] font-semibold ${ticketType === type ? "text-white" : "bg-black"}`}
                                    onClick={() => setTicketType(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="mt-4">
                        <label className="block font-semibold">
                            <u>How many tickets would you like to reserve?</u>
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="4"
                            placeholder="1-4"
                            value={ticketCount}
                            onChange={(e) => setTicketCount(e.target.value)}
                            className="w-1/4 p-2 border rounded-xl mt-2 text-black"
                        />
                    </div>

                    {/* Emails */}
                    <div className="mt-4">
                        <label className="block font-semibold">
                            <u>Enter the email/s of the people you want to reserve for</u>
                        </label>
                        {Array.from({ length: ticketCount }).map((_, index) => (
                            <input
                                key={index}
                                type="text"
                                placeholder={`Name ${index + 1}`}
                                className="w-full p-2 mt-2 text-black"
                                value={emails[index] || ""}
                                onChange={(e) => {
                                    const newNames = [...emails];
                                    newNames[index] = e.target.value;
                                    setEmails(newNames);
                                }}
                            />
                        ))}
                    </div>

                    {/* Claiming Time */}
                    <div className="mt-4">
                        <label className="block font-semibold">
                            <u>Time of Claiming of Tickets</u>
                        </label>
                        <select
                            value={timeSlot}
                            onChange={(e) => setTimeSlot(e.target.value)}
                            className="w-3/8 p-2 border rounded-xl mt-2 text-black"
                        >
                            <option>7:00 AM - 9:00 AM</option>
                            <option>9:00 AM - 11:00 AM</option>
                            <option>1:00 PM - 3:00 PM</option>
                            <option>3:00 PM - 5:00 PM</option>
                        </select>
                    </div>

                    {/* Add Button */}
                    <div className="flex justify-center mt-8">
                        <button onClick={handleAddReservation} className="w-1/2 bg-black text-[#F09C32] text-lg py-2 rounded-xl font-bold cursor-pointer transition-all transform hover:scale-105 hover:bg-black-600">
                            ADD
                        </button>
                    </div>
                </div>
            </div>

            {/* Reservation Summary (Shown Only After Clicking ADD) */}
            {showSummary && (
                <div className="">   
                    <hr className="w-[calc(100%-160px)] mx-auto mt-10"/>

                <div className="w-full flex px-20 py-8 font-Poppins">
                    
                    {/* Left Column */}
                    <div className="w-1/2 p-4 ml-6 mt-12">
                        <h2 className="text-2xl font-bold">NOTICE TO ALL ONLINE CUSTOMERS</h2>
                        <h3 className="text-xl font-semibold mt-6">Guidelines for Online Ticket Reservation</h3>
                        <ol className="list-decimal ml-5 mt-2 text-sm space-y-2">
                        <li>Sign up using your active UST email to access the reservation system.</li>
                        <li>Select the event and preferred ticket type.</li>
                        <li>Input the full names and UST emails of all ticket holders for verification.</li>
                        <li>Review your reservation details before confirming.</li>
                        <li>Check your email for the confirmation and QR code for claiming.</li>
                        <li>Present a valid UST ID and the confirmation email upon claiming.</li>
                        <li>Failure to claim the reserved ticket may result in account restrictions.</li>
                        <li>Contact support for any inquiries or issues regarding the reservation.</li>
                        </ol>
                    </div>

                    {/* Right Column */}
                    <div className="w-1/2 p-4 ml-6">
                        <h2 className="font-bold text-3xl text-center">RESERVATION SUMMARY</h2>
                        <div className="mt-6 m-8 p-4 border bg-gray-200 text-black text-center text-xl">
                        <h3>
                            <u>UAAP Season 87 Men's Basketball</u>
                        </h3>

                        {/* Table for the summary */}
                        <table className="w-full mt-10 border border-gray-200 text-center text-xs">
                            <tbody>
                                <tr>
                                    <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">Name:</td>
                                    <td className="bg-gray-300 border border-white">FirstName LastName</td>
                                </tr>

                                <tr>
                                    <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">Email:</td>
                                    <td className="bg-gray-300 border border-white">person0@ust.edu.ph</td>
                                </tr>

                                <tr>
                                    <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">Quantity:</td>
                                    <td className="bg-gray-300 border border-white">{ticketCount}</td>
                                </tr>

                                <tr>
                                    <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">Reserved For:</td>
                                    <td className="bg-gray-300 border border-white">
                                        {emails.map((email, index) => (
                                            <div key={index}>{email}</div>
                                        ))}
                                    </td>
                                </tr>

                                <tr>
                                    <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">Batch:</td>
                                    <td className="bg-gray-300 border border-white">{timeSlot}</td>
                                </tr>
                                
                                <tr>
                                    <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">Claiming Venue:</td>
                                    <td className="bg-gray-300 border border-white">UST IPEA</td>
                                </tr>

                                <tr>
                                    <td className="font-semibold bg-black text-white pt-2 border border-white w-1/3">Total Amount to be Paid:</td>
                                    <td className="bg-gray-300 border border-white">₱{ticketType ? ticketPrices[ticketType] * ticketCount : 0}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Confirm Button */}
                    <div className="mt-8 text-center">
                        <button className="font-Poppins bg-black text-[#F09C32] font-bold text-lg py-3 px-7 min-w-[300px] rounded-lg inline-block mb-4 uppercase cursor-pointer transition-all transform hover:scale-105 hover:bg-black-600"
                        onClick={() => navigate("/confirm ")} // Change to ticket details - this is for visualization only
                        >
                            CONFIRM
                        </button>
                    </div>

                </div>
            </div>
            </div>   
        )}
    </div>
    );
};

export default Reservation;