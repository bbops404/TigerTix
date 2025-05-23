import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/Header";
import sample_image from "../../assets/sample_image.png";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";

import LoginPopup from "./LoginPopup";
import SuccessModal from "../../components/SuccessModal";


const SignUp_UserDetails = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Select an option"); // Default text

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const dropdownRef = useRef(null);
 


  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [loginPopup, setLoginPopup] = useState(false);  
  const toggleLoginPopup = () => {
    setLoginPopup((prev) => !prev);
  };
  const navigate = useNavigate();


  const options = ["Student", "Employee", "Alumni"];
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userRole = role.toLowerCase();  


  const handleSubmit = async (e) => {
    e.preventDefault();
    const verifiedEmail = sessionStorage.getItem("verifiedEmail");

    if (!verifiedEmail) {
      alert("Email verification required. Please verify your email first.");
      navigate("/sign-up"); // Redirect if email is missing
      return;
    }
    
    // Validate form fields
    if (!username || !firstName || !lastName || !password || !confirmPassword || !role) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
  
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
  
    setErrorMessage(""); // Clear previous errors
  
    try {
      const response = await axios.post("http://localhost:5002/auth/signUp", {
        email: verifiedEmail,
        username,
        firstName,
        lastName,
        password,
        role: userRole,
      });
  
      if (response.status >= 200 && response.status < 300) {
        setIsSuccessModalOpen(true);
  
        setTimeout(() => {
          setIsSuccessModalOpen(false);
          // Save to local storage before redirect
          localStorage.setItem("showLoginPopup", "true");
          navigate("/"); // Redirect to landing page
        }, 3000);
      } else {
        setErrorMessage(response.data.message || "Failed to create account.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };
  
  return (
    <div>
      <Header showAuthButtons={false} showDropdown={false} />
      {loginPopup && (
        <LoginPopup
          loginPopup={loginPopup}
          toggleLoginPopup={toggleLoginPopup}
        />
      )}
      {loginPopup && <LoginPopup toggleLoginPopup={toggleLoginPopup} />}

      <div className="flex min-h-[90vh]">
        {/* Left Image Section - hidden on small screens */}
        <div className="w-1/2 relative h-[90vh] hidden md:block">
          <img
            src={sample_image}
            alt="UST IPEA"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(180deg,rgba(0,0,0,0.7),rgba(255,171,64,0.7))]"></div>
        </div>

        {/* Right Form Section - centered and responsive */}
        <div className="w-full md:w-1/2 bg-custom_black flex flex-col items-center justify-center font-Poppins h-[90vh]">
          <p className="font-bold text-4xl text-white pb-7">Sign Up</p>

          <div className="flex flex-col justify-center bg-custom_yellow p-6 rounded-lg shadow-lg w-[90vw] max-w-[500px] h-auto text-custom_black mx-auto">
            <div className="w-full ml-3 pr-4">
              <p className="text-custom_black/85 mb-2 text-lg font-semibold">
                Create your Tigertix Account!
              </p>
              <p className="text-custom_black/85 mb-4 text-[12px] font-light">
                Please enter your personal details to complete your profile
                setup.
              </p>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit}>

             
              <div className="flex">
                <div className="flex flex-col mr-2">
                  <p className="text-xs">Username</p>
                  <div className="bg-white flex px-2 py-3 gap-2 items-center rounded-md border-2 border-[#D8DADC] h-8 w-56">
                    <input
                      className="focus:outline-none text-xs w-full text-gray-600"
                      placeholder="Enter your desired username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <p className="text-xs">First Name</p>
                  <div className="bg-white flex px-2 py-3 gap-2 items-center rounded-md border-2 border-[#D8DADC] h-8 w-full sm:w-40 md:w-56">
                    <input
                      className="focus:outline-none text-xs w-full text-gray-600"
                      placeholder="Enter your First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="text-xs">Last Name</p>
                  <div className="bg-white flex px-2 py-3 gap-2 items-center rounded-md border-2 border-[#D8DADC] h-8 w-full sm:w-40 md:w-56">
                    <input
                      className="focus:outline-none text-xs w-full text-gray-600"
                      placeholder="Enter your Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
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
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && <p className="text-red-500 text-xs mt-2">{errorMessage}</p>}

              {/* Divider */}
              <hr className="border-t-2 border-custom_black my-4 opacity-50" />

              {/* Dropdown Menu */}
              <div className="flex items-center text-sm mb-4">
                <p className="text-xs mr-2">Account Type</p>
                <div ref={dropdownRef} className="relative w-56">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-2 py-1 bg-white text-gray-700 rounded-md border-2 border-gray-300 flex justify-between items-center"
                  >
                    {selectedOption}
                    <span className="ml-2">&#9662;</span>
                  </button>

                  {isOpen && (
                    <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      {options.map((option, index) => (
                        <li
                          key={index}
                          className="px-4 py-1 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedOption(option);
                            setRole(option); // Update the role when an option is selected
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

              {/* Submit Button */}
              <div className="flex justify-center w-full">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="bg-custom_black text-white px-4 py-2 mt-5 w-full sm:w-64 md:w-72 text-sm rounded-md font-semibold hover:text-custom_yellow transition-all duration-300 transform hover:scale-105"
                >
                  Make Account!
                </button>
              </div>

              <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                onRedirect={() => {
                  setIsSuccessModalOpen(false);
                  navigate("/");
                  setTimeout(() => setLoginPopup(true), 500);
                }}
                title="Success!"
                message="Your account has been created successfully. Please log in."
              />



            </form>
          </div>
        </div>
      </div>
    </div>
  );
};


export default SignUp_UserDetails;
