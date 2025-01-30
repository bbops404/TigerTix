import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/Header";
import sample_image from "../../assets/sample_image.png";

const SignUp_UserDetails = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Select an option"); // Default text
  const dropdownRef = useRef(null);

  const options = ["Student", "Faculty", "Alumni"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <Header showSearch={false} showAuthButtons={false} />
      <div className="flex">
        {/* Left Image Section */}
        <div className="w-1/2 relative h-[90vh]">
          <img
            src={sample_image}
            alt="UST IPEA"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(180deg,rgba(0,0,0,0.7),rgba(255,171,64,0.7))]"></div>
        </div>

        {/* Right Form Section */}
        <div className="w-1/2 bg-custom_black flex flex-col items-center justify-center font-Poppins h-[90vh]">
          <p className="font-bold text-4xl text-white pb-7">Sign Up</p>

          <div className="flex flex-col justify-center bg-custom_yellow p-6 rounded-lg shadow-lg w-[500px] h-auto text-custom_black">
            <div className="w-full ml-3 pr-4">
              <p className="text-custom_black/85 mb-2 text-lg font-semibold">
                Create your Tigertix Account!
              </p>
              <p className="text-custom_black/85 mb-4 text-[12px] font-light">
                Please enter your personal details to complete your profile
                setup.
              </p>
            </div>

            <div className="flex">
              <div className="flex flex-col mr-2">
                <p className="text-xs">Username</p>
                <div className="bg-white flex px-2 py-3 gap-2 items-center rounded-md border-2 border-[#D8DADC] h-8 w-56">
                  <input
                    className="focus:outline-none text-xs w-full text-gray-600"
                    placeholder="Enter your desired username"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-xs">First Name</p>
                <div className="bg-white flex px-2 py-3 gap-2 items-center rounded-md border-2 border-[#D8DADC] h-8 w-56">
                  <input
                    className="focus:outline-none text-xs w-full text-gray-600"
                    placeholder="Enter your First Name"
                  />
                </div>
              </div>
            </div>

            <div className="flex">
              <div className="flex flex-col mr-2">
                <p className="text-xs">Password</p>
                <div className="bg-white flex px-2 py-3 gap-2 items-center rounded-md border-2 border-[#D8DADC] h-8 w-56">
                  <input
                    type="password"
                    className="focus:outline-none text-xs w-full text-gray-600"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-xs">Last Name</p>
                <div className="bg-white flex px-2 py-3 gap-2 items-center rounded-md border-2 border-[#D8DADC] h-8 w-56">
                  <input
                    className="focus:outline-none text-xs w-full text-gray-600"
                    placeholder="Enter your Last Name"
                  />
                </div>
              </div>
            </div>

            <div className="flex">
              <div className="flex flex-col mr-2">
                <p className="text-xs">Confirm Password</p>
                <div className="bg-white flex px-2 py-3 gap-2 items-center rounded-md border-2 border-[#D8DADC] h-8 w-56">
                  <input
                    type="password"
                    className="focus:outline-none text-xs w-full text-gray-600"
                    placeholder="Re-enter your password"
                  />
                </div>
              </div>
            </div>
            {/* Divider */}
            <hr className="border-t-2 border-custom_black my-4 opacity-50" />

            {/* Dropdown Menu */}
            <div className="flex items-center text-sm mb-4">
              <p className="text-xs mr-2">Account Type</p>
              <div ref={dropdownRef} className="relative w-56">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full px-2 py-1 bg-white text-gray-700 rounded-md border-2 border-gray-300 flex justify-between items-center" // Adjusted padding for smaller button height
                >
                  {selectedOption}
                  <span className="ml-2">&#9662;</span> {/* Down arrow */}
                </button>

                {isOpen && (
                  <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {options.map((option, index) => (
                      <li
                        key={index}
                        className="px-4 py-1 hover:bg-gray-100 cursor-pointer" // Reduced padding for smaller dropdown height
                        onClick={() => {
                          setSelectedOption(option);
                          setIsOpen(false);
                        }}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Center the Submit Button */}
            <button
              type="submit"
              className="bg-custom_black text-white px-4 py-2 mt-5 w-72 text-sm rounded-md font-semibold hover:text-custom_yellow transition-all duration-300 transform hover:scale-105 mx-auto" // Centered the button
            >
              Make Account!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp_UserDetails;
