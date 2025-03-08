import React, { useEffect, useRef, useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const predefinedUsers = [
  { email: "admin@ust.edu.ph", password: "admin123", role: "admin" },
  { email: "support@ust.edu.ph", password: "support123", role: "support" },
  { email: "user@ust.edu.ph", password: "user123", role: "user" },
];

const LoginPopup = ({ loginPopup, toggleLoginPopup }) => {
  const loginPopupRef = useRef(null);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (loginPopupRef.current && !loginPopupRef.current.contains(e.target)) {
        toggleLoginPopup();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [toggleLoginPopup]);

  const handleLogin = () => {
    const trimmedEmail = email.trim();
    const user = predefinedUsers.find(
      (u) => u.email === trimmedEmail && u.password === password
    );

    if (user) {
      alert(`Successfully logged in as ${user.role.toUpperCase()}!`);
      toggleLoginPopup();

      if (user.role === "admin") navigate("/dashboard");
      else navigate("/home");
    } else {
      alert("Invalid email or password. Please try again.");
    }
  };

  return (
    <>
      {loginPopup && (
        <div className="font-Poppins fixed top-0 left-0 w-full h-full z-50 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-sm">
          <div
            ref={loginPopupRef}
            className="relative flex flex-col justify-center items-center space-y-2 bg-custom_yellow p-6 rounded-lg shadow-lg w-1/3 h-[400px]"
          >
            <button
              onClick={toggleLoginPopup}
              className="absolute top-4 right-4 text-2xl text-custom_black"
            >
              <IoIosCloseCircleOutline />
            </button>

            <p className="font-extrabold text-3xl text-custom_black pb-3">
              Login
            </p>

            {/* Email Input */}
            <div className="text-left">
              <p className="text-custom_black mb-1 text-sm">Email</p>
              <div className="bg-white flex px-2 py-3 gap-2 items-center rounded-lg border-2 border-[#D8DADC] h-10 w-[300px]">
                <FaUser className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  className="focus:outline-none text-sm w-full text-gray-600"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="text-left">
              <p className="text-custom_black mb-1 text-sm">Password</p>
              <div className="bg-white flex px-2 py-3 gap-2 items-center rounded-lg border-2 border-[#D8DADC] h-10 w-[300px]">
                <FaLock className="w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  className="focus:outline-none text-sm w-full text-gray-600"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-left w-[300px] pb-3">
              <button
                className="text-xs text-custom_black hover:underline focus:outline-none"
                onClick={() => navigate("/forget-password")}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              className="bg-custom_black text-white px-4 py-2 w-[300px] rounded-md font-semibold hover:text-custom_yellow"
              onClick={handleLogin}
            >
              Login
            </button>

            {/* Sign Up */}
            <div className="flex text-xs text-white pt-2">
              <p className="mr-1 font-light">Don’t have an account?</p>
              <button
  onClick={() => {
    toggleLoginPopup(); // Isara muna yung pop-up
    navigate("/verify"); // Tapos saka mag-navigate
  }}
  className="font-bold hover:underline focus:outline-none"
>
  Sign Up!
</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPopup;
