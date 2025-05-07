import React, { useEffect, useRef, useState } from "react";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaExclamationCircle,
} from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const LoginPopup = ({ loginPopup, toggleLoginPopup }) => {
  const loginPopupRef = useRef(null);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [user, setUser] = useState(null);

  // Consolidated error handling
  const [error, setError] = useState({
    type: null,
    message: "",
  });

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

  const handleLogin = async () => {
    // Reset previous errors
    setError({ type: null, message: "" });

    // Validate inputs
    if (!email.trim()) {
      setError({
        type: "email",
        message: "Email or username is required",
      });
      return;
    }

    if (!password) {
      setError({
        type: "password",
        message: "Password is required",
      });
      return;
    }

    const trimmedInput = email.trim();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: trimmedInput.includes("@") ? trimmedInput : null,
            username: trimmedInput.includes("@") ? null : trimmedInput,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Clear any previous errors
        setError({ type: null, message: "" });

        // Store token securely in sessionStorage
        sessionStorage.setItem("authToken", data.token);
        sessionStorage.setItem("userRole", data.user.role);
        sessionStorage.setItem("username", data.user.username);
        sessionStorage.setItem("userId", data.user.user_id);

        // Store COMPLETE user object in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        // Store user details in state
        setUser({
          email: data.user.email,
          username: data.user.username,
          role: data.user.role,
        });

        toggleLoginPopup();
        // ✅ Redirect based on user role
        if (data.user.role === "admin") {
          navigate("/admin-dashboard", { replace: true });
        } else if (data.user.role === "support staff") {
          navigate("/support-staff-dashboard", { replace: true });
        } else if (["student", "employee", "alumni"].includes(data.user.role)) {
          navigate("/home", { replace: true });
        }

        // Redirect based on user role
        if (data.user.role === "admin") {
          navigate("/admin-dashboard", { replace: true });
        } else if (["student", "employee", "alumni"].includes(data.user.role)) {
          navigate("/home", { replace: true });
        }
      } else {
        // Handle specific error cases
        if (data.suspended) {
          setError({
            type: "account",
            message: "Your account has been suspended. Please contact support.",
          });
        } else {
          // Generic login error
          setError({
            type: "login",
            message: data.message || "Wrong username or password",
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError({
        type: "network",
        message: "Failed to log in. Please try again later.",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {loginPopup && (
        <div className="font-Poppins fixed top-0 left-0 w-full h-full z-50 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-sm">
          <div
            ref={loginPopupRef}
            className="relative flex flex-col justify-center items-center space-y-2 bg-custom_yellow p-6 rounded-lg shadow-lg w-1/3 min-h-[480px]"
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

            {/* Global Error Message */}
            {error.type === "account" ||
            error.type === "login" ||
            error.type === "network" ? (
              <div
                className="text-sm w-[300px] bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-2"
                role="alert"
              >
                <span className="block sm:inline">{error.message}</span>
              </div>
            ) : null}

            {/* Email Input */}
            <div className="text-left w-[300px]">
              <p className="text-custom_black mb-1 text-sm">Email</p>
              <div
                className={`bg-white flex px-2 py-3 gap-2 items-center rounded-lg border-2 
                ${
                  error.type === "email" ? "border-red-500" : "border-[#D8DADC]"
                } 
                h-10 w-full`}
              >
                <FaUser className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  className="focus:outline-none text-sm w-full text-gray-600"
                  placeholder="Enter your email or username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear email error when user starts typing
                    if (error.type === "email") {
                      setError({ type: null, message: "" });
                    }
                  }}
                />
                {error.type === "email" && (
                  <FaExclamationCircle className="text-red-500" />
                )}
              </div>
              {error.type === "email" && (
                <p className="text-red-500 text-xs mt-1">{error.message}</p>
              )}
            </div>

            {/* Password Input with Toggle */}
            <div className="text-left w-[300px]">
              <p className="text-custom_black mb-1 text-sm">Password</p>
              <div
                className={`bg-white flex px-2 py-3 gap-2 items-center rounded-lg border-2 
                ${
                  error.type === "password"
                    ? "border-red-500"
                    : "border-[#D8DADC]"
                } 
                h-10 w-full`}
              >
                <FaLock className="w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="focus:outline-none text-sm w-full text-gray-600"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // Clear password error when user starts typing
                    if (error.type === "password") {
                      setError({ type: null, message: "" });
                    }
                  }}
                />
                <button
                  onClick={togglePasswordVisibility}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-4 h-4" />
                  ) : (
                    <FaEye className="w-4 h-4" />
                  )}
                </button>
                {error.type === "password" && (
                  <FaExclamationCircle className="text-red-500" />
                )}
              </div>
              {error.type === "password" && (
                <p className="text-red-500 text-xs mt-1">{error.message}</p>
              )}
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
              <p className="mr-1 font-light">Don't have an account?</p>
              <button
                onClick={() => {
                  toggleLoginPopup();
                  navigate("/verify");
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
