import React, { useState } from "react";
import sample_image from "../../assets/sample_image.png";
import Header from "../../components/Header";
import { MdEmail } from "react-icons/md";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import OtpInput from "../../components/OtpInput";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios

import LoginPopup from "./LoginPopup";


const schema = yup
  .object({
    email: yup
      .string()
      .matches(
        /^[a-zA-Z0-9._%+-]+@ust\.edu\.ph$/,
        "Email must be a valid UST email address"
      )
      .required("Email is required"),
  })
  .required();

 
const SignUp = () => {
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [knownOtp] = useState("1234"); // ✅ Hardcoded OTP for testing
  const navigate = useNavigate();

 
   const {
     register,
     handleSubmit,
     formState: { errors },
   } = useForm({
     resolver: yupResolver(schema),
     
   });
   const [loginPopup, setLoginPopup] = useState(false);
   const toggleLoginPopup = () => {
     setLoginPopup((prev) => !prev);
   };
   
  const onSubmit = async (data) => {
    event.preventDefault(); // Prevent default form submission

    try {
      // Check if the email is already registered before sending OTP
      const checkResponse = await axios.post("http://localhost:5002/auth/check-user", { email: data.email });
  
        
      if (checkResponse.data.exists) { 
        alert("This email is already registered. Please log in instead.");

        // put code for the hyper link nung user if want mag log in instead sa ngayon alert pa lang 
        setLoginPopup(true); // ✅ Show the login pop-up
        return;
      }
          
  
      setEmail(data.email); // Store the email
      setShowOtpInput(true); // Show OTP input
      alert(`Verification code sent to: ${data.email}`);
  
      // ✅ Send email to backend for OTP generation
      const response = await axios.post("http://localhost:5002/auth/send-otp", { email: data.email });
  
      if (response.status === 200) {
        alert("OTP sent successfully! Please check your email.");
      }
  }
  catch (error) {
      console.error("Error processing request:", error);
  
      // 🔍 Check if error is from check-user or send-otp
      if (error.response) {
        console.log("Error response:", error.response);
        if (error.response.status === 400) {
          alert("This email is already registered. Please log in instead.");
          return;
        }
      }
      

      alert("Failed to send OTP. Please try again.");
    }
  };
  
  

  // Handler for confirming OTP via button click
  const handleConfirmOtp = async () => {
    if (otp.length === 6) {
      try {
        // Send OTP to backend for validation

        const response = await axios.post("http://localhost:5002/auth/validate-otp", { email, otp });
        
        if (response.status === 200) {
          alert("OTP confirmed successfully.");
          sessionStorage.setItem("verifiedEmail", email);
          navigate("/sign-up", { state: { email } });

        }
      } catch (error) {
        console.error("Error confirming OTP:", error);
        alert("Invalid OTP. Please try again.");
      }
    } else {
      alert("Please enter the complete OTP.");
    }
  };

  return (
    <div>
      <Header showSearch={false} showAuthButtons={false} />
      {loginPopup && (
        <LoginPopup
          loginPopup={loginPopup}
          toggleLoginPopup={toggleLoginPopup}
        />
      )}
      {loginPopup && <LoginPopup toggleLoginPopup={toggleLoginPopup} />}

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
            {!showOtpInput ? (
              <>
                <div className="w-full ml-3 pr-4">
                  <p className="text-custom_black/85 mb-2 text-lg font-semibold">
                    Enter your UST Email
                  </p>
                  <p className="text-custom_black/85 mb-4 text-[12px] font-light">
                    Enter your email address to receive a verification code and
                    confirm that you are a Thomasian.
                  </p>
                </div>

                {/* Email Form */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col items-center w-full"
                >
                  {/* Email Input Field */}
                  <div className="bg-white flex px-2 py-3 gap-2 items-center rounded-lg border-2 border-[#D8DADC] h-10 w-72">
                    <MdEmail className="w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      {...register("email")}
                      className="focus:outline-none text-sm w-full text-gray-600"
                      placeholder="Enter your UST Email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-[13px] mt-1">
                      {errors.email.message}
                    </p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="bg-custom_black text-white px-4 py-2 mt-5 w-72 text-sm rounded-md font-semibold hover:text-custom_yellow transition-all duration-300 transform hover:scale-105"
                  >
                    Verify
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="w-full ml-3 pr-4">
                  <p className="text-custom_black/85 mb-2 text-lg font-semibold">
                    Enter OTP
                  </p>
                  <p className="text-custom_black/85 mb-4 text-[12px] font-light">
                    A verification code has been sent to{" "}
                    <strong>{email}</strong>. Please enter the code below to
                    confirm your email.
                  </p>
                </div>

                <div className="flex justify-center">
                  <OtpInput length={6} setOtp={setOtp} />
                </div>

                {/* Confirm OTP Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleConfirmOtp}
                    className="bg-custom_black text-white px-4 py-2 mt-5 w-72 text-sm rounded-md font-semibold hover:text-custom_yellow transition-all duration-300 transform hover:scale-105"
                  >
                    Confirm OTP
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default SignUp;