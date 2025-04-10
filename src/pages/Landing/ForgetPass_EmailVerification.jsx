import React, { useState } from "react";
import sample_image from "../../assets/sample_image.png";
import Header from "../../components/Header";
import { MdEmail } from "react-icons/md";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import OtpInput from "../../components/OtpInput";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Validation Schema (Only Email)
const schema = yup
  .object({
    email: yup
      .string()
      .matches(
        /^[a-zA-Z0-9._%+-]+@ust\.edu\.ph$/,
        "Email must be a valid @ust.edu.ph address"
      )
      .required("Email is required"),
  })
  .required();

const ForgetPassword = () => {
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Handler for email submission (Request OTP)
  const onSubmit = async (data) => {
    try {
      setEmail(data.email); // Store email
      const response = await axios.post("http://localhost:5002/auth/request-password-reset", {
        email: data.email,
      });
      alert(response.data.message);
      setShowOtpInput(true); // Show OTP input
    } catch (error) {
      alert(error.response?.data?.message || "Error sending OTP.");
    }
  };

  // Handler for confirming OTP
  const handleConfirmOtp = async () => {
    if (otp.length === 6) {
      try {
        const response = await axios.post("http://localhost:5002/auth/validate-password-reset-otp", {
          email,
          otp,
        });
        alert(response.data.message);
        sessionStorage.setItem("verifiedEmail", email);
        navigate("/change-password");
      } catch (error) {
        alert(error.response?.data?.message || "Invalid OTP.");
      }
    } else {
      alert("Please enter the complete OTP.");
    }
  };

  return (
    <div>
      <Header showAuthButtons={false} showDropdown={false} />
      <div className="flex">
        <div className="w-1/2 relative h-[90vh]">
          <img
            src={sample_image}
            alt="UST IPEA"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(180deg,rgba(0,0,0,0.7),rgba(255,171,64,0.7))]"></div>
        </div>

        <div className="w-1/2 bg-custom_black flex flex-col items-center justify-center font-Poppins h-[90vh]">
          <p className="font-bold text-4xl text-white pb-7">Forget Password</p>

          <div className="flex flex-col justify-center bg-custom_yellow p-6 rounded-lg shadow-lg w-[500px] h-auto text-custom_black">
            {!showOtpInput ? (
              <>
                <div className="w-full ml-3 pr-4">
                  <p className="text-custom_black/85 mb-2 text-lg font-semibold">
                    Enter your UST Email
                  </p>
                  <p className="text-custom_black/85 mb-4 text-[12px] font-light">
                    Enter your email address to receive a verification code and confirm that your email exists.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col items-center w-full"
                >
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
                  <p className="text-custom_black/85 mb-2 text-lg font-semibold">Enter OTP</p>
                  <p className="text-custom_black/85 mb-4 text-[12px] font-light">
                    A verification code has been sent to <strong>{email}</strong>. Please enter the code below to confirm your email.
                  </p>
                </div>

                <div className="flex justify-center">
                  <OtpInput length={6} setOtp={setOtp} />
                </div>

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

export default ForgetPassword;
