import React, { useState } from "react";
import sample_image from "../../assets/sample_image.png";
import Header from "../../components/Header";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import LoginPopup from "./LoginPopup";
import SuccessModal from "../../components/SuccessModal";

// Validation Schema for Password
const schema = yup
  .object({
    newPassword: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("New Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm Password is required"),
  })
  .required();

const UpdatePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // 🟢 Move the hooks inside the function component
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [loginPopup, setLoginPopup] = useState(false);
  const toggleLoginPopup = () => setLoginPopup((prev) => !prev);

  const onSubmit = async (data) => {
    const verifiedEmail = sessionStorage.getItem("verifiedEmail");

    console.log("Sending request with:", {
      email: verifiedEmail,
      newPassword: data.newPassword,
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        {
          email: verifiedEmail,
          newPassword: data.newPassword,
        }
      );

      console.log("Server response:", response.data);

      if (response.status >= 200 && response.status < 300) {
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          setIsSuccessModalOpen(false);
          localStorage.setItem("showLoginPopup", "true");
          navigate("/");
        }, 3000);
      } else {
        alert(response.data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error(
        "Error updating password:",
        error.response?.data || error.message
      );
      alert(
        error.response?.data?.message ||
          "An error occurred. Please try again later."
      );
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
          <p className="font-bold text-4xl text-white pb-7">
            Create New Password
          </p>

          <div className="flex flex-col justify-center bg-custom_yellow p-6 rounded-lg shadow-lg w-[500px] h-auto text-custom_black">
            <div className="w-full ml-3 pr-4">
              <p className="text-custom_black/85 mb-2 text-lg font-semibold text-center">
                Enter a New Password
              </p>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col items-center w-full"
            >
              {/* New Password Input Field */}
              <div className="bg-white flex px-2 py-3 gap-2 items-center rounded-lg border-2 border-[#D8DADC] h-10 w-72 mb-3">
                <input
                  type="password"
                  {...register("newPassword")}
                  className="focus:outline-none text-sm w-full text-gray-600"
                  placeholder="New Password"
                />
              </div>
              {errors.newPassword && (
                <p className="text-red-600 text-[13px]">
                  {errors.newPassword.message}
                </p>
              )}

              {/* Confirm Password Input Field */}
              <div className="bg-white flex px-2 py-3 gap-2 items-center rounded-lg border-2 border-[#D8DADC] h-10 w-72 mb-3">
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className="focus:outline-none text-sm w-full text-gray-600"
                  placeholder="Confirm Password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-[13px]">
                  {errors.confirmPassword.message}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-custom_black text-white px-4 py-2 mt-5 w-72 text-sm rounded-md font-semibold hover:text-custom_yellow transition-all duration-300 transform hover:scale-105"
              >
                UPDATE
              </button>
            </form>

            <SuccessModal
              isOpen={isSuccessModalOpen}
              onClose={() => setIsSuccessModalOpen(false)}
              onRedirect={() => {
                setIsSuccessModalOpen(false);
                navigate("/");
                setTimeout(() => setLoginPopup(true), 500);
              }}
              title="Success!"
              message="Your password has been reset successfully. Please log in."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
