import React, { useState } from "react";
import axios from "axios";

const ChangePasswordPopup = ({ showPopup, togglePopup }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password policy: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char
  const isPasswordValid = (password) => {
    const policy =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]).{8,}$/;
    return policy.test(password);
  };

  const handleChangePassword = async () => {
    // Clear previous errors
    setError("");
    
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match!");
      return;
    }

    // Enforce password policy on frontend
    if (!isPasswordValid(newPassword)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    setLoading(true);

    try {
      const userId = sessionStorage.getItem("userId"); // Retrieve user ID from sessionStorage
      const token = sessionStorage.getItem("authToken");
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/change-password`, // Updated endpoint
        {
          currentPassword,
          newPassword,
        },
        {
          withCredentials: true, // Ensures cookies are sent (if applicable)
          headers: {
            Authorization: `Bearer ${token}`, // Include token if required
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        alert("Password successfully changed!");
        // Reset form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        togglePopup();
      } else {
        setError(response.data.message || "Failed to change password.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Handle backdrop click to close popup
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      togglePopup();
    }
  };

  return (
    showPopup && (
      <div 
        className="font-Poppins fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-sm p-4"
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-[500px] bg-white rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
            <h2 className="font-Poppins text-lg sm:text-xl font-bold text-center text-gray-900">
              CHANGE PASSWORD
            </h2>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="space-y-4 sm:space-y-5">
              {/* Current Password */}
              <div className="text-left w-full">
                <label className="block text-gray-900 mb-2 text-sm sm:text-base font-medium">
                  Current Password
                </label>
                <div className="bg-white flex px-3 py-3 sm:py-3.5 gap-2 items-center rounded-lg border-2 border-[#D8DADC] w-full focus-within:border-[#FFAB40] transition-colors">
                  <input
                    type="password"
                    className="focus:outline-none text-sm sm:text-base w-full text-gray-600 placeholder-gray-400"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="text-left w-full">
                <label className="block text-gray-900 mb-2 text-sm sm:text-base font-medium">
                  New Password
                </label>
                <div className="bg-white flex px-3 py-3 sm:py-3.5 gap-2 items-center rounded-lg border-2 border-[#D8DADC] w-full focus-within:border-[#FFAB40] transition-colors">
                  <input
                    type="password"
                    className="focus:outline-none text-sm sm:text-base w-full text-gray-600 placeholder-gray-400"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                {/* Password requirements hint */}
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Must be 8+ characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              {/* Confirm New Password */}
              <div className="text-left w-full">
                <label className="block text-gray-900 mb-2 text-sm sm:text-base font-medium">
                  Confirm New Password
                </label>
                <div className="bg-white flex px-3 py-3 sm:py-3.5 gap-2 items-center rounded-lg border-2 border-[#D8DADC] w-full focus-within:border-[#FFAB40] transition-colors">
                  <input
                    type="password"
                    className="focus:outline-none text-sm sm:text-base w-full text-gray-600 placeholder-gray-400"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm sm:text-base">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer with buttons */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2">
              <button
                className="font-Poppins w-full sm:w-auto bg-gray-500 text-white hover:bg-gray-600 px-4 sm:px-6 py-2 sm:py-2.5 rounded-md transition-colors duration-200 text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                onClick={togglePopup}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="font-Poppins w-full sm:w-auto bg-[#333333] hover:bg-[#FFAB40] hover:text-[#333333] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-md transition-colors duration-200 text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "UPDATE"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default ChangePasswordPopup;